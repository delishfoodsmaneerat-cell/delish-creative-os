/**
 * AI proxy for Delish Creative OS (optional — deploy only after cost approval).
 * - The Anthropic API key lives in Secret Manager (ANTHROPIC_API_KEY), never in the browser.
 * - Only signed-in members with role contributor/editor/owner may call it.
 * - Per-user daily cap (AI_DAILY_LIMIT) to bound spend.
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
admin.initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const AI_MODEL_DEFAULT = defineString("AI_MODEL_DEFAULT", { default: "claude-sonnet-4-5" });
const AI_MODEL_QUICK = defineString("AI_MODEL_QUICK", { default: "claude-haiku-4-5" });
const AI_DAILY_LIMIT = defineString("AI_DAILY_LIMIT", { default: "150" });
const OWNER_EMAILS = defineString("OWNER_EMAILS", { default: "digitalmarketing01@delishfoods.co.th" });

async function roleOf(email) {
  if (OWNER_EMAILS.value().split(",").map((s) => s.trim().toLowerCase()).includes(email)) return "owner";
  const s = await admin.firestore().doc(`members/${email}`).get();
  return s.exists ? s.data().role : null;
}

exports.ai = onCall(
  { region: "asia-southeast1", secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 300, memory: "256MiB", maxInstances: 5 },
  async (req) => {
    if (!req.auth || !req.auth.token.email) throw new HttpsError("unauthenticated", "ต้องล็อกอินก่อน");
    const email = String(req.auth.token.email).toLowerCase();
    const role = await roleOf(email);
    if (!["owner", "editor", "contributor"].includes(role)) throw new HttpsError("permission-denied", "บัญชีนี้ไม่มีสิทธิ์ใช้ AI");

    const { input, tier } = req.data || {};
    const messages = typeof input === "string"
      ? [{ role: "user", content: input }]
      : Array.isArray(input)
        ? input.filter((m) => m && (m.role === "user" || m.role === "assistant")).map((m) => ({ role: m.role, content: String(m.content ?? "") }))
        : [];
    if (!messages.length || messages[messages.length - 1].role !== "user") throw new HttpsError("invalid-argument", "input ต้องลงท้ายด้วยข้อความของผู้ใช้");
    if (JSON.stringify(messages).length > 256 * 1024) throw new HttpsError("invalid-argument", "ข้อความยาวเกิน 256 KB");

    const day = new Date().toISOString().slice(0, 10);
    const ref = admin.firestore().doc(`ai_usage/${req.auth.uid}_${day}`);
    const limit = Number(AI_DAILY_LIMIT.value()) || 150;
    const count = await admin.firestore().runTransaction(async (t) => {
      const s = await t.get(ref);
      const c = (s.exists ? s.data().count : 0) + 1;
      if (c > limit) throw new HttpsError("resource-exhausted", `ใช้ AI ครบ ${limit} ครั้งของวันนี้แล้ว`);
      t.set(ref, { count: c, email, day, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return c;
    });

    const quick = tier === "quick";
    const model = quick ? AI_MODEL_QUICK.value() : AI_MODEL_DEFAULT.value();
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_API_KEY.value(), "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: quick ? 1024 : 8192, messages }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (j && j.error && j.error.message) || `HTTP ${res.status}`;
      throw new HttpsError(res.status === 429 ? "resource-exhausted" : res.status === 401 ? "failed-precondition" : "internal", "AI ตอบกลับไม่สำเร็จ: " + msg);
    }
    const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    return { text, truncated: j.stop_reason === "max_tokens", model, usage: j.usage || null, usedToday: count, dailyLimit: limit };
  }
);

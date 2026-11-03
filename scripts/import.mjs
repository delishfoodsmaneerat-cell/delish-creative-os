// Import a Delish Creative OS export (JSON from "ส่งออกข้อมูลทั้งหมด") into Firestore.
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=service-account.json node scripts/import.mjs export.json [--skip-examples] [--overwrite] [--dry-run]
// Safe by default: existing documents are skipped (never overwritten) unless --overwrite is given.
import { readFileSync } from "node:fs";
import admin from "firebase-admin";

const [file, ...flags] = process.argv.slice(2);
if (!file) { console.error("usage: node scripts/import.mjs export.json [--skip-examples] [--overwrite] [--dry-run]"); process.exit(1); }
const skipExamples = flags.includes("--skip-examples"), overwrite = flags.includes("--overwrite"), dry = flags.includes("--dry-run");
const data = JSON.parse(readFileSync(file, "utf8"));
const cols = data.collections || {};
const BLOCKED = new Set(["members", "profiles", "ai_usage"]);

if (!dry) admin.initializeApp();
const db = dry ? null : admin.firestore();
let created = 0, skipped = 0, examples = 0;
for (const [col, docs] of Object.entries(cols)) {
  if (BLOCKED.has(col)) { console.log(`skip collection ${col} (managed by the app)`); continue; }
  for (const [id, body] of Object.entries(docs || {})) {
    if (!id || id.includes("/")) { console.warn(`bad id ${col}/${id}`); continue; }
    if (skipExamples && body && body.example === true) { examples++; continue; }
    if (dry) { console.log(`[dry-run] ${col}/${id}`); created++; continue; }
    const ref = db.collection(col).doc(id);
    if (!overwrite && (await ref.get()).exists) { skipped++; continue; }
    await ref.set(body);
    created++;
  }
}
console.log(`done: written ${created}, skipped existing ${skipped}, skipped examples ${examples}${dry ? " (dry run)" : ""}`);

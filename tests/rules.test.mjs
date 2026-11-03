// Firestore rules tests — run with the emulator:
//   cd tests && npm i && cd .. && npx firebase emulators:exec --only firestore "node tests/rules.test.mjs"
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";

const env = await initializeTestEnvironment({ projectId: "delish-rules-test", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
const ctx = (uid, email, provider = "google.com") => env.authenticatedContext(uid, { email, firebase: { sign_in_provider: provider } }).firestore();
await env.withSecurityRulesDisabled(async (c) => {
  const d = c.firestore();
  await d.doc("members/view@delishfoods.co.th").set({ role: "viewer" });
  await d.doc("members/contrib@delishfoods.co.th").set({ role: "contributor" });
  await d.doc("members/editor@delishfoods.co.th").set({ role: "editor" });
  await d.doc("tasks/t1").set({ title: "x" });
});
const owner = ctx("o", "digitalmarketing01@delishfoods.co.th"), editor = ctx("e", "editor@delishfoods.co.th"),
  contrib = ctx("c", "contrib@delishfoods.co.th", "microsoft.com"), viewer = ctx("v", "view@delishfoods.co.th"),
  stranger = ctx("s", "stranger@delishfoods.co.th"), anon = env.unauthenticatedContext().firestore();
const results = [];
async function t(name, p) { try { await p; results.push(["PASS", name]); } catch (e) { results.push(["FAIL", name, e.message]); } }

await t("anon cannot read tasks", assertFails(anon.doc("tasks/t1").get()));
await t("non-member cannot read tasks", assertFails(stranger.doc("tasks/t1").get()));
await t("non-member can read own member doc (missing)", assertSucceeds(stranger.doc("members/stranger@delishfoods.co.th").get()));
await t("viewer reads tasks", assertSucceeds(viewer.doc("tasks/t1").get()));
await t("viewer cannot write tasks", assertFails(viewer.doc("tasks/t2").set({ title: "y" })));
await t("contributor writes tasks", assertSucceeds(contrib.doc("tasks/t2").set({ title: "y" })));
await t("contributor cannot approve", assertFails(contrib.doc("approvals/t2").set({ decision: "approved" })));
await t("contributor cannot edit settings", assertFails(contrib.doc("settings/brand").set({ name: "x" })));
await t("contributor cannot edit team", assertFails(contrib.doc("team/a").set({ name: "x" })));
await t("contributor cannot add members", assertFails(contrib.doc("members/new@delishfoods.co.th").set({ role: "viewer" })));
await t("editor approves", assertSucceeds(editor.doc("approvals/t2").set({ decision: "approved" })));
await t("editor adds contributor", assertSucceeds(editor.doc("members/new@delishfoods.co.th").set({ role: "contributor" })));
await t("editor cannot add editor", assertFails(editor.doc("members/new2@delishfoods.co.th").set({ role: "editor" })));
await t("editor cannot demote editor", assertFails(editor.doc("members/editor@delishfoods.co.th").set({ role: "viewer" })));
await t("editor cannot add owner role", assertFails(editor.doc("members/x@delishfoods.co.th").set({ role: "owner" })));
await t("owner adds editor", assertSucceeds(owner.doc("members/boss@delishfoods.co.th").set({ role: "editor" })));
await t("owner writes settings", assertSucceeds(owner.doc("settings/brand").set({ name: "Delish Foods" })));
await t("nobody touches ai_usage", assertFails(owner.doc("ai_usage/x").get()));
await t("profile: own only", assertSucceeds(viewer.doc("profiles/v").set({ name: "V" })));
await t("profile: not others", assertFails(viewer.doc("profiles/c").set({ name: "hack" })));

for (const r of results) console.log(r.join("  "));
await env.cleanup();
process.exit(results.some((r) => r[0] === "FAIL") ? 1 : 0);

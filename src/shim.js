/* Delish Creative OS — standalone runtime.
 * Provides the same `window.claude.use(name)` capabilities the app uses on claude.ai,
 * backed by Firebase (Auth, Firestore, Storage, Cloud Functions) on the company's own project.
 * Security is enforced by firestore.rules / storage.rules / functions — this file is only UX.
 */
(function () {
  "use strict";
  var CFG = window.DELISH_CONFIG || {};
  window.__STANDALONE = true;
  var LEVEL = { viewer: 1, contributor: 2, editor: 3, owner: 4 };
  var ROLE_TH = { viewer: "Viewer (ดูอย่างเดียว)", contributor: "Contributor (เพิ่ม/แก้งาน)", editor: "Editor (อนุมัติ/ตั้งค่า)", owner: "Owner" };
  var owners = (CFG.ownerEmails || []).map(function (e) { return String(e).toLowerCase(); });
  var domains = (CFG.allowedDomains || []).map(function (d) { return String(d).toLowerCase(); });

  if (!window.firebase || !CFG.firebase || !CFG.firebase.apiKey || /REPLACE/.test(CFG.firebase.apiKey)) {
    document.addEventListener("DOMContentLoaded", function () {
      gate("<h1>ยังไม่ได้ตั้งค่า Firebase</h1><p>แก้ไฟล์ <code>public/config.js</code> ใส่ค่า firebaseConfig ของโปรเจกต์บริษัท แล้ว deploy ใหม่ (ดูคู่มือ README-TH.md)</p>");
    });
    window.claude = { use: function () { return new Promise(function () {}); } };
    return;
  }

  firebase.initializeApp(CFG.firebase);
  var auth = firebase.auth(), fs = firebase.firestore();
  var fnApp = firebase.app().functions(CFG.functionsRegion || "asia-southeast1");
  var stor = CFG.storageEnabled ? firebase.storage() : null;
  if (CFG.emulators) {
    var E = CFG.emulators;
    auth.useEmulator("http://" + E.host + ":" + E.auth, { disableWarnings: true });
    fs.useEmulator(E.host, E.firestore);
    if (stor && E.storage) stor.useEmulator(E.host, E.storage);
    if (E.functions) fnApp.useEmulator(E.host, E.functions);
  }
  window.__ASSET_URL = function (id) { return /^https?:\/\//.test(id) ? id : "#"; };

  // ---------------- login gate ----------------
  var U = null, readyResolve, ready = new Promise(function (r) { readyResolve = r; });
  function gate(html) {
    var g = document.getElementById("cosGate");
    if (!g) { g = document.createElement("div"); g.id = "cosGate"; document.body.appendChild(g); }
    g.innerHTML = '<div class="gcard">' + html + "</div>"; g.hidden = false; return g;
  }
  function closeGate() { var g = document.getElementById("cosGate"); if (g) g.hidden = true; }
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  function googleProvider() {
    var p = new firebase.auth.GoogleAuthProvider();
    if (CFG.searchConsole !== false) p.addScope("https://www.googleapis.com/auth/webmasters.readonly");
    if (domains[0]) p.setCustomParameters({ hd: domains[0], prompt: "select_account" });
    return p;
  }
  function msProvider() {
    var p = new firebase.auth.OAuthProvider("microsoft.com");
    p.setCustomParameters(Object.assign({ prompt: "select_account" }, CFG.microsoftTenant ? { tenant: CFG.microsoftTenant } : {}));
    return p;
  }
  function keepGoogleToken(res) {
    var tok = res && res.credential && res.credential.accessToken;
    if (tok && res.credential.providerId === "google.com") {
      try { sessionStorage.setItem("cos.gtok", JSON.stringify({ t: tok, exp: Date.now() + 55 * 60 * 1000 })); } catch (e) {}
    }
  }
  function signIn(kind) {
    var p = kind === "ms" ? msProvider() : googleProvider();
    return auth.signInWithPopup(p).then(keepGoogleToken).catch(function (e) {
      if (e && e.code === "auth/popup-blocked") return auth.signInWithRedirect(p);
      showLogin("เข้าสู่ระบบไม่สำเร็จ: " + (e && e.message ? e.message : e));
    });
  }
  window.__cosSignIn = signIn;
  window.__cosSignOut = function () { try { sessionStorage.removeItem("cos.gtok"); } catch (e) {} auth.signOut().then(function () { location.reload(); }); };
  window.__cosRelinkGoogle = function () {
    var u = auth.currentUser; if (!u) return;
    u.reauthenticateWithPopup(googleProvider()).then(function (r) { keepGoogleToken(r); toastShim("เชื่อม Google ใหม่แล้ว"); })
      .catch(function (e) { toastShim("เชื่อม Google ไม่สำเร็จ: " + (e.message || e.code)); });
  };
  function showLogin(err) {
    var methods = CFG.signInMethods || ["google", "microsoft"];
    gate('<div class="glogo">D</div><h1>' + esc(CFG.appName || "Delish Creative OS") + "</h1><p>เข้าสู่ระบบด้วยบัญชีบริษัท" + (domains.length ? " (@" + domains.map(esc).join(", @") + ")" : "") + "</p>" +
      (err ? '<p class="gerr">' + esc(err) + "</p>" : "") +
      (methods.indexOf("google") >= 0 ? '<button class="gbtn" onclick="__cosSignIn(\'google\')">เข้าสู่ระบบด้วย Google</button>' : "") +
      (methods.indexOf("microsoft") >= 0 ? '<button class="gbtn" onclick="__cosSignIn(\'ms\')">เข้าสู่ระบบด้วย Microsoft</button>' : "") +
      '<p class="gsm">ใช้ได้เฉพาะสมาชิกที่ผู้ดูแลเพิ่มสิทธิ์แล้ว</p>');
  }
  function toastShim(m) { var t = document.getElementById("toast"); if (t) { t.textContent = m; t.hidden = false; setTimeout(function () { t.hidden = true; }, 3500); } else alert(m); }

  auth.getRedirectResult().then(keepGoogleToken).catch(function () {});
  auth.onAuthStateChanged(function (fbUser) {
    if (U && (!fbUser || fbUser.uid !== U.uid)) { location.reload(); return; }
    if (!fbUser) { showLogin(); return; }
    var email = String(fbUser.email || "").toLowerCase();
    var dom = email.split("@")[1] || "";
    if (domains.length && domains.indexOf(dom) < 0 && owners.indexOf(email) < 0) {
      gate("<h1>บัญชีนี้ใช้ไม่ได้</h1><p>" + esc(email) + " ไม่ใช่อีเมลของบริษัท</p><button class=\"gbtn\" onclick=\"__cosSignOut()\">ออกจากระบบ</button>");
      return;
    }
    gate("<p>กำลังตรวจสิทธิ์…</p>");
    var isOwner = owners.indexOf(email) >= 0;
    (isOwner ? Promise.resolve(null) : fs.doc("members/" + email).get().then(function (s) { return s.exists ? s.data() : null; }).catch(function () { return null; }))
      .then(function (m) {
        var role = isOwner ? "owner" : (m && LEVEL[m.role] ? m.role : null);
        if (!role) {
          gate("<h1>รอผู้ดูแลเพิ่มสิทธิ์</h1><p>บัญชี <b>" + esc(email) + "</b> ยังไม่มีสิทธิ์ใช้งาน แจ้งผู้ดูแลให้เพิ่มในเมนู “จัดการสิทธิ์”</p><button class=\"gbtn\" onclick=\"location.reload()\">ตรวจอีกครั้ง</button><button class=\"gbtn ghost\" onclick=\"__cosSignOut()\">ออกจากระบบ</button>");
          return;
        }
        U = { uid: fbUser.uid, email: email, name: fbUser.displayName || email.split("@")[0], photo: fbUser.photoURL || "", role: role, lvl: LEVEL[role],
          provider: (fbUser.providerData[0] || {}).providerId || "" };
        fs.doc("profiles/" + U.uid).set({ name: U.name, email: email, photo: U.photo, role: role, lastSeen: new Date().toISOString() }, { merge: true }).catch(function () {});
        closeGate(); addUserMenu(); readyResolve(U);
      });
  });

  // ---------------- members (roles) admin ----------------
  function addUserMenu() {
    var foot = document.querySelector(".railfoot"); if (!foot || document.getElementById("cosMenu")) return;
    var d = document.createElement("div"); d.id = "cosMenu"; d.className = "cosmenu";
    d.innerHTML = (U.lvl >= 3 ? '<button class="btn sm" type="button" id="cosMembers">จัดการสิทธิ์</button>' : "") +
      (U.provider === "google.com" ? '<button class="btn sm" type="button" onclick="__cosRelinkGoogle()" title="ต่ออายุสิทธิ์ Search Console">เชื่อม Google ใหม่</button>' : "") +
      '<button class="btn sm" type="button" onclick="__cosSignOut()">ออกจากระบบ</button>';
    foot.appendChild(d);
    var b = document.getElementById("cosMembers"); if (b) b.onclick = openMembers;
  }
  function openMembers() {
    var dlg = document.getElementById("dlg"); if (!dlg) return;
    document.getElementById("dlgTitle").textContent = "จัดการสิทธิ์ผู้ใช้";
    var roles = U.lvl >= 4 ? ["viewer", "contributor", "editor"] : ["viewer", "contributor"];
    document.getElementById("dlgBody").innerHTML =
      '<div class="note">เพิ่มอีเมลบริษัทของสมาชิก ระบบตรวจสิทธิ์ที่ฐานข้อมูลทุกครั้ง · Owner: ' + owners.map(esc).join(", ") + (U.lvl < 4 ? " · Editor เพิ่มได้ถึงระดับ Contributor" : "") + "</div>" +
      '<form class="row" id="memForm"><input type="text" id="memEmail" placeholder="name@' + esc(domains[0] || "company.com") + '" style="flex:2 1 220px"><select id="memRole" style="flex:1 1 160px">' +
      roles.map(function (r) { return '<option value="' + r + '">' + ROLE_TH[r] + "</option>"; }).join("") + '</select><button class="btn primary" type="submit">เพิ่ม/อัปเดต</button></form><div id="memList" class="list"><div class="cnt">กำลังโหลด…</div></div>';
    document.getElementById("dlgFoot").innerHTML = '<span class="spacer"></span><button class="btn" type="button" onclick="document.getElementById(\'dlg\').close()">ปิด</button>';
    if (!dlg.open) dlg.showModal();
    var unsub = fs.collection("members").onSnapshot(function (qs) {
      var rows = qs.docs.map(function (s) { return Object.assign({ email: s.id }, s.data()); }).sort(function (a, b) { return a.email.localeCompare(b.email); });
      var el = document.getElementById("memList"); if (!el) return;
      el.innerHTML = rows.length ? rows.map(function (m) {
        var can = U.lvl >= 4 || LEVEL[m.role] < 3;
        return '<div class="item"><div class="top"><b>' + esc(m.email) + '</b><span class="st">' + esc(ROLE_TH[m.role] || m.role) + '</span><span class="r">' + (can ? '<button class="btn ghost sm" type="button" data-rm="' + esc(m.email) + '">ลบสิทธิ์</button>' : "") + "</span></div></div>";
      }).join("") : '<div class="empty">ยังไม่มีสมาชิก</div>';
      el.querySelectorAll("[data-rm]").forEach(function (btn) {
        btn.onclick = function () { fs.doc("members/" + btn.dataset.rm).delete().then(function () { toastShim("ลบสิทธิ์แล้ว"); }).catch(function (e) { toastShim("ลบไม่สำเร็จ: " + e.code); }); };
      });
    }, function (e) { var el = document.getElementById("memList"); if (el) el.innerHTML = '<div class="note bad">โหลดไม่ได้: ' + esc(e.code) + "</div>"; });
    dlg.addEventListener("close", function () { unsub(); }, { once: true });
    document.getElementById("memForm").onsubmit = function (ev) {
      ev.preventDefault();
      var em = document.getElementById("memEmail").value.trim().toLowerCase(), role = document.getElementById("memRole").value;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toastShim("อีเมลไม่ถูกต้อง"); return; }
      if (domains.length && domains.indexOf(em.split("@")[1]) < 0) { toastShim("ต้องเป็นอีเมลโดเมน " + domains.join(", ")); return; }
      fs.doc("members/" + em).set({ role: role, addedBy: U.email, addedAt: new Date().toISOString() })
        .then(function () { document.getElementById("memEmail").value = ""; toastShim("บันทึกสิทธิ์ " + em); })
        .catch(function (e) { toastShim("บันทึกไม่สำเร็จ: " + e.code); });
    };
  }

  // ---------------- db (Firestore) ----------------
  var FS_CODE = { "permission-denied": "permission_denied", "not-found": "not_found", "resource-exhausted": "resource_exhausted", "invalid-argument": "invalid_argument", unavailable: "unavailable", "failed-precondition": "invalid_argument" };
  function E(e) { return { code: FS_CODE[e && e.code] || (e && e.code) || "error", message: (e && e.message) || String(e) }; }
  function rej(e) { throw E(e); }
  function snapDoc(s) { return { id: s.id, exists: !!s.exists, data: function () { return s.exists ? s.data() : undefined; }, metadata: { fromCache: s.metadata.fromCache, hasPendingWrites: s.metadata.hasPendingWrites } }; }
  function snapQ(x) { return { docs: x.docs.map(snapDoc), size: x.size, empty: x.empty, docChanges: function () { return x.docChanges().map(function (c) { return { type: c.type, doc: snapDoc(c.doc), oldIndex: c.oldIndex, newIndex: c.newIndex }; }); } }; }
  function docW(ref) {
    return { id: ref.id, path: ref.path,
      get: function () { return ref.get().then(snapDoc, rej); },
      set: function (d) { return ref.set(d).catch(rej); },
      update: function (d) { return ref.update(d).catch(rej); },
      "delete": function () { return ref.delete().catch(rej); },
      onSnapshot: function (n, err) { return ref.onSnapshot(function (s) { n(snapDoc(s)); }, function (e) { if (err) err(E(e)); }); },
      collection: function (p) { return colW(ref.collection(p)); } };
  }
  function qW(q) {
    return { where: function (f, o, v) { return qW(q.where(f, o, v)); }, orderBy: function (f, d) { return qW(q.orderBy(f, d)); }, limit: function (n) { return qW(q.limit(n)); },
      get: function () { return q.get().then(snapQ, rej); },
      onSnapshot: function (n, err) { return q.onSnapshot(function (x) { n(snapQ(x)); }, function (e) { if (err) err(E(e)); }); } };
  }
  function colW(ref) { var w = qW(ref); w.doc = function (id) { return docW(id ? ref.doc(id) : ref.doc()); }; w.add = function (d) { return ref.add(d).then(docW, rej); }; return w; }
  var db = { collection: function (p) { return colW(fs.collection(p)); }, doc: function (p) { return docW(fs.doc(p)); } };

  // ---------------- user ----------------
  var profCache = {};
  var user = {
    me: function () { return Promise.resolve({ id: U.uid, name: U.name, avatarUrl: U.photo, color: "", email: U.email, isOwner: U.role === "owner", canEdit: U.lvl >= 3 }); },
    id: function () { return Promise.resolve(U.uid); }, name: function () { return Promise.resolve(U.name); }, email: function () { return Promise.resolve(U.email); },
    avatarUrl: function () { return Promise.resolve(U.photo || null); },
    isOwner: function () { return Promise.resolve(U.role === "owner"); }, canEdit: function () { return Promise.resolve(U.lvl >= 3); },
    can: function (c) { return Promise.resolve(c === "data.write" ? U.lvl >= 2 : null); },
    profiles: function (ids) {
      ids = [].concat(ids).filter(Boolean);
      return Promise.all(ids.map(function (id) {
        if (profCache[id]) return profCache[id];
        return fs.doc("profiles/" + id).get().then(function (s) { var d = s.exists ? s.data() : {}; profCache[id] = { id: id, name: d.name || "", avatarUrl: d.photo || "", color: "", email: d.email || null, isMe: id === U.uid, guest: false }; return profCache[id]; }).catch(function () { return { id: id, name: "", isMe: false, guest: false }; });
      })).then(function (arr) { var o = {}; arr.forEach(function (p) { o[p.id] = p; }); return o; });
    },
    search: function () { return Promise.resolve([]); }
  };

  // ---------------- sample (AI via Cloud Function) ----------------
  var sample = null;
  if (CFG.aiEnabled) {
    var call = fnApp.httpsCallable("ai", { timeout: 300000 });
    var FN = { unauthenticated: "not_granted", "permission-denied": "not_granted", "failed-precondition": "not_granted", "resource-exhausted": "rate_limited", "invalid-argument": "bad_request", "deadline-exceeded": "timeout" };
    sample = function (input, opts) {
      opts = opts || {};
      if (opts.signal && opts.signal.aborted) return Promise.reject({ code: "cancelled", message: "cancelled" });
      var p = call({ input: input, tier: opts.modelTier || "default" }).then(function (r) {
        var text = (r.data && r.data.text) || "";
        if (opts.onText) try { opts.onText({ text: text, delta: text }); } catch (e) {}
        return { text: text, truncated: !!(r.data && r.data.truncated) };
      }, function (e) { var c = String(e && e.code || "").replace(/^functions\//, ""); throw { code: FN[c] || "upstream_error", message: e && e.message }; });
      if (!opts.signal) return p;
      return new Promise(function (res, rejx) { opts.signal.addEventListener("abort", function () { rejx({ code: "cancelled", message: "cancelled" }); }, { once: true }); p.then(res, rejx); });
    };
    sample.json = function (input, opts) {
      return sample(input, opts).then(function (r) {
        var t = r.text, m = t.match(/```(?:json)?\s*([\s\S]*?)```/); var s = (m ? m[1] : t).trim();
        var i = s.search(/[\[{]/); if (i > 0) s = s.slice(i);
        var j = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]")); if (j >= 0) s = s.slice(0, j + 1);
        try { return JSON.parse(s); } catch (e) { throw { code: "invalid_json", message: "AI ตอบกลับไม่ใช่ JSON", text: r.text }; }
      });
    };
    sample.limits = function () { return Promise.resolve({ images: false }); };
  }

  // ---------------- assets (Cloud Storage) ----------------
  function assetsFor() {
    if (!stor || U.lvl < 2) return null;
    return { upload: function (blob) {
      var name = String(blob.name || "file").replace(/[^\w.\-]/g, "_").slice(-80);
      var ref = stor.ref("assets/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "-" + name);
      return ref.put(blob, { contentType: blob.type || "application/octet-stream" }).then(function () { return ref.getDownloadURL(); })
        .then(function (url) { return { id: url, url: url, sizeBytes: blob.size, contentType: blob.type }; }, function (e) { throw { code: e.code || "upload_failed", message: e.message }; });
    } };
  }

  // ---------------- downloads ----------------
  var downloads = { save: function (req) {
    var blob = req.data instanceof Blob ? req.data : new Blob([req.data], { type: /\.csv$/i.test(req.filename) ? "text/csv;charset=utf-8" : /\.json$/i.test(req.filename) ? "application/json" : /\.html?$/i.test(req.filename) ? "text/html;charset=utf-8" : "application/octet-stream" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = req.filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    return Promise.resolve({ status: "saved" });
  } };

  // ---------------- mcp: Search Console directly with the user's Google token ----------------
  var GSC = "https://www.googleapis.com/webmasters/v3";
  var mcp = { callTool: function (server, tool, input) {
    if (server !== "Delish Search Console") return Promise.reject({ code: "server_not_connected", server: server, message: "unknown server" });
    if (U.provider !== "google.com") return Promise.reject({ code: "server_not_connected", server: server, message: "not a Google account" });
    var tok = null; try { var o = JSON.parse(sessionStorage.getItem("cos.gtok") || "null"); if (o && o.exp > Date.now()) tok = o.t; } catch (e) {}
    if (!tok) return Promise.reject({ code: "needs_reauth", server: server, message: "Google token missing or expired" });
    var req;
    if (tool === "gsc_list_sites") req = fetch(GSC + "/sites", { headers: { Authorization: "Bearer " + tok } });
    else if (tool === "gsc_search_analytics") {
      var a = input || {};
      req = fetch(GSC + "/sites/" + encodeURIComponent(a.siteUrl) + "/searchAnalytics/query", { method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: a.startDate, endDate: a.endDate, dimensions: a.dimensions, rowLimit: a.rowLimit || 1000, startRow: a.startRow || 0, type: a.type || "web", dataState: a.dataState || "final" }) });
    } else return Promise.reject({ code: "not_in_manifest", message: tool });
    return req.then(function (r) { return r.text().then(function (t) {
      var j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) {}
      if (r.status === 401) { try { sessionStorage.removeItem("cos.gtok"); } catch (e) {} throw { code: "needs_reauth", server: server, message: "401" }; }
      if (!r.ok) throw { code: "tool_error", server: server, message: (j.error && j.error.message) || ("HTTP " + r.status) };
      var payload = tool === "gsc_list_sites"
        ? { sites: (j.siteEntry || []).map(function (s) { return { siteUrl: s.siteUrl, permissionLevel: s.permissionLevel }; }) }
        : { siteUrl: input.siteUrl, startDate: input.startDate, endDate: input.endDate, dimensions: input.dimensions, fetchedAt: new Date().toISOString(),
            rows: (j.rows || []).map(function (x) { return { keys: x.keys || [], clicks: x.clicks, impressions: x.impressions, ctr: x.ctr, position: x.position }; }) };
      return { content: [], payload: payload };
    }); }, function (e) { if (e && e.code) throw e; throw { code: "server_unavailable", retryable: true, message: String(e) }; });
  } };

  // ---------------- window.claude ----------------
  window.claude = { use: function (name) {
    return ready.then(function () {
      switch (name) {
        case "db": return db; case "user": return user; case "sample": return sample;
        case "assets": return assetsFor(); case "downloads": return downloads;
        case "mcp": return CFG.searchConsole === false ? null : mcp;
        case "permissions": return { state: function () { return Promise.resolve("granted"); }, request: function () { return Promise.resolve({}); } };
        default: return null;
      }
    });
  } };
})();

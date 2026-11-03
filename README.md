# Delish Creative OS

ระบบงานการตลาดออนไลน์ของ Delish Foods: ทะเบียนสินค้า → Launch Studio → บอร์ดงาน/อนุมัติ → Content Planner/ปฏิทิน → SEO/AEO/GEO → Ads Studio/ใบเบิก → Social Listening → Performance

- หน้าเว็บ (static) โฮสต์บน **GitHub Pages** — build อัตโนมัติจาก `app-src/` ทุกครั้งที่ push เข้า `main` (`.github/workflows/pages.yml`)
- ข้อมูล ล็อกอิน และสิทธิ์ อยู่บน **Firebase** ของบริษัท (Firestore + Authentication) — ต้องตั้งค่า `public/config.js` ก่อนใช้งาน
- คู่มือติดตั้งภาษาไทย: [README-TH.md](README-TH.md)

## โครงสร้าง
| โฟลเดอร์/ไฟล์ | ใช้ทำอะไร |
|---|---|
| `app-src/` | ซอร์สแอป (ชุดเดียวกับเวอร์ชันบน claude.ai) |
| `src/shim.js`, `src/shim.css` | เชื่อมแอปกับ Firebase + หน้าล็อกอิน + จัดการสิทธิ์ |
| `build.py` | รวมเป็น `public/index.html` |
| `public/config.js` | ค่าตั้ง Firebase ของบริษัท (ไม่มี secret) |
| `firestore.rules`, `storage.rules` | สิทธิ์ฝั่งเซิร์ฟเวอร์ |
| `functions/` | AI proxy (ไม่บังคับ มีค่าใช้จ่าย) |
| `scripts/import.mjs` | นำเข้าข้อมูลที่ส่งออกจากแอป |
| `tests/rules.test.mjs` | ทดสอบสิทธิ์ด้วย Firebase Emulator |

## ใช้ GitHub Pages กับ Firebase
1. Settings → Pages → Source: **GitHub Actions**
2. ใส่ค่า Firebase ใน `public/config.js` แล้ว push
3. Firebase Console → Authentication → Settings → Authorized domains → เพิ่ม `<ชื่อบัญชี>.github.io`
4. Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes`

> ห้าม commit ไฟล์ service account หรือ API key — มี `.gitignore` กันไว้แล้ว

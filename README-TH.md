# Delish Creative OS — ติดตั้งเป็นเว็บไซต์ของบริษัท (Firebase)

ชุดนี้คือแอปตัวเดียวกับเวอร์ชันบน claude.ai แต่รันบนโปรเจกต์ Firebase ของบริษัท มี URL ของบริษัทเอง และใช้ล็อกอินด้วยบัญชี Google หรือ Microsoft ของพนักงาน (ไม่ต้องมีบัญชี claude.ai)

| ส่วน | ใช้อะไร | แพ็กเกจ Firebase |
|---|---|---|
| หน้าเว็บ | Firebase Hosting (`https://<project>.web.app` หรือโดเมนบริษัท) | Spark (ฟรี) |
| ล็อกอิน | Firebase Authentication: Google / Microsoft | Spark (ฟรี) |
| ฐานข้อมูลและสิทธิ์ | Cloud Firestore + `firestore.rules` | Spark (ฟรีตามโควตา) |
| แนบไฟล์ AW และวิดีโอ | Cloud Storage + `storage.rules` | **Blaze** (จ่ายตามใช้ มีโควตาฟรี) |
| ปุ่ม AI (✦) | Cloud Function `ai` → Claude API | **Blaze + ค่า Claude API** |
| Search Console | เรียก API จากเบราว์เซอร์ ด้วยสิทธิ์ Google ของผู้ใช้เอง | ฟรี |

ถ้ายังไม่อนุมัติค่าใช้จ่าย ให้ deploy เฉพาะส่วนที่ฟรี (Hosting, Auth, Firestore) ได้เลย เว็บใช้งานได้ครบ ยกเว้นปุ่ม AI กับการแนบไฟล์ ซึ่งระบบจะปิดไว้เอง ตรวจราคาล่าสุดกับ Google และ Anthropic ก่อนเปิดใช้งานจริง

## สิ่งที่ต้องมี
- บัญชี Google ของบริษัทที่สร้าง Firebase project ได้
- Node.js 20 ขึ้นไป และ Firebase CLI: `npm i -g firebase-tools`
- (ถ้าใช้ Microsoft) สิทธิ์สร้าง App registration ใน Microsoft Entra ID (Azure)

## ติดตั้ง (ส่วนที่ฟรี)

1. **สร้างโปรเจกต์:** เข้า https://console.firebase.google.com → Add project → ตั้งชื่อ เช่น `delish-creative-os`
2. **เปิดฐานข้อมูล:** Build → Firestore Database → Create database → เลือก region `asia-southeast1` (สิงคโปร์) → Production mode
3. **เปิดล็อกอิน:** Build → Authentication → Sign-in method
   - **Google:** Enable
   - **Microsoft:** Enable แล้วใส่ Application (client) ID และ Secret จาก Azure App registration ตั้ง Redirect URI ใน Azure เป็นค่าที่ Firebase แสดง (`https://<project>.firebaseapp.com/__/auth/handler`)
   - ไปที่ Settings → Authorized domains แล้วเพิ่มโดเมนเว็บ (ถ้าจะใช้โดเมนบริษัท)
4. **สร้าง Web app:** Project settings → Your apps → Web (`</>`) → คัดลอก `firebaseConfig`
5. **แก้ไฟล์ตั้งค่า:**
   - `public/config.js`: วาง `firebaseConfig` ตรวจ `ownerEmails` และ `allowedDomains` ถ้าใช้ Microsoft ให้ใส่ `microsoftTenant` ด้วย เพื่อจำกัดเฉพาะบัญชีบริษัท
   - `.firebaserc`: ใส่ Project ID
   - ถ้าเปลี่ยนอีเมลเจ้าของ ต้องแก้ให้ตรงกันใน `firestore.rules`, `storage.rules` และ `functions/index.js` (OWNER_EMAILS)
6. **Deploy:**
   ```bash
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes,hosting
   ```
   เว็บจะอยู่ที่ `https://<project-id>.web.app`
7. **เปิดใช้ครั้งแรก:** เจ้าของ (`digitalmarketing01@delishfoods.co.th`) ล็อกอินก่อน แล้วกด **จัดการสิทธิ์** มุมล่างซ้าย เพื่อเพิ่มอีเมลทีมและเลือกระดับสิทธิ์ Viewer, Contributor หรือ Editor คนที่ยังไม่ถูกเพิ่มจะเห็นหน้า “รอผู้ดูแลเพิ่มสิทธิ์”

### ใช้โดเมนบริษัท (ไม่บังคับ)
Hosting → Add custom domain → เช่น `marketing.delishfoods.co.th` → เพิ่ม DNS record ตามที่ Firebase บอก → เพิ่มโดเมนนี้ใน Authentication → Authorized domains

## ย้ายข้อมูลจากเวอร์ชัน claude.ai
1. เปิดแอปบน claude.ai → **ตั้งค่า & สถานะ** → **ส่งออกข้อมูลทั้งหมด (JSON)**
2. Project settings → Service accounts → Generate new private key แล้วเก็บไฟล์ให้ปลอดภัย ห้าม commit ลง git
3. รันคำสั่ง:
   ```bash
   cd scripts && npm i && cd ..
   GOOGLE_APPLICATION_CREDENTIALS=key.json node scripts/import.mjs export.json --dry-run
   GOOGLE_APPLICATION_CREDENTIALS=key.json node scripts/import.mjs export.json --skip-examples
   ```
   ค่าเริ่มต้นจะไม่เขียนทับเอกสารที่มีอยู่แล้ว ถ้าต้องการเขียนทับให้ใส่ `--overwrite` ส่วน `--skip-examples` จะข้ามข้อมูลที่ติดป้าย “ตัวอย่าง”
4. ไฟล์ `data-export/initial-export.json` ในชุดนี้ส่งออกไว้แค่บางส่วน (posts, campaigns, workflows, settings, team) ให้ใช้ไฟล์ที่ส่งออกจากปุ่มในแอปแทน เพราะได้ข้อมูลครบ
5. ไฟล์แนบที่อยู่บน claude.ai ย้ายอัตโนมัติไม่ได้ ต้องอัปโหลดใหม่

## เปิดปุ่ม AI (มีค่าใช้จ่าย ต้องอนุมัติก่อน)
1. เปลี่ยนโปรเจกต์เป็นแพ็กเกจ **Blaze** แล้วตั้ง Budget alert ใน Google Cloud Billing
2. สร้าง API key ที่ https://console.anthropic.com และตั้งวงเงินรายเดือน
3. รันคำสั่ง:
   ```bash
   firebase functions:secrets:set ANTHROPIC_API_KEY
   cd functions && npm i && cd ..
   firebase deploy --only functions
   ```
4. แก้ `public/config.js` เป็น `aiEnabled: true` แล้วรัน `firebase deploy --only hosting`
- ใช้ AI ได้เฉพาะ Contributor ขึ้นไป จำกัดคนละ 150 ครั้งต่อวัน (เปลี่ยนได้ที่ param `AI_DAILY_LIMIT`)
- โมเดลเริ่มต้นคือ `claude-sonnet-4-5` และแบบเร็วคือ `claude-haiku-4-5` เปลี่ยนได้ที่ `AI_MODEL_DEFAULT` และ `AI_MODEL_QUICK` ควรตรวจชื่อโมเดลที่ใช้ได้ล่าสุดก่อน deploy
- API key อยู่ใน Secret Manager เท่านั้น หน้าเว็บไม่เห็น key

## เปิดแนบไฟล์ (Blaze)
1. Build → Storage → Get started (region เดียวกับ Firestore)
2. รัน `firebase deploy --only storage` ครั้งแรก CLI จะขอให้อนุญาตให้ Storage อ่านสิทธิ์จาก Firestore ให้ตอบ Yes
3. แก้ `public/config.js` เป็น `storageEnabled: true` แล้ว deploy hosting
- อัปโหลดได้เฉพาะ Contributor ขึ้นไป จำกัดไฟล์ละ 20 MB
- ลิงก์ดาวน์โหลดของไฟล์มี token อยู่ในตัว ใครได้ลิงก์ไปก็เปิดดูได้ อย่าส่งลิงก์ไฟล์ลับออกนอกทีม

## Search Console
- เปิด **Google Search Console API** ใน Google Cloud Console ของโปรเจกต์เดียวกัน (APIs & Services → Library)
- ถ้า OAuth consent screen เป็นแบบ External ต้องเพิ่ม scope `webmasters.readonly` ถ้าเป็น Internal (Google Workspace) จะใช้ได้ทันที
- ผู้ใช้ต้องล็อกอินด้วย Google ที่มีสิทธิ์ใน Property นั้น แล้วไปที่เมนู SEO กด **ทดสอบการเชื่อมต่อ** สิทธิ์ Google หมดอายุทุกประมาณ 1 ชั่วโมง ให้กด **เชื่อม Google ใหม่** มุมล่างซ้าย
- ผู้ใช้ที่ล็อกอินด้วย Microsoft ดึงข้อมูล Search Console ไม่ได้

## ระดับสิทธิ์ (บังคับที่ฐานข้อมูล ไม่ใช่แค่ซ่อนปุ่ม)
| ระดับ | ทำได้ |
|---|---|
| Viewer | ดูทุกหน้า |
| Contributor | เพิ่มและแก้ สินค้า, Launch, งาน, คอนเทนต์, SEO, รายงาน, ใบเบิก, Social Listening, ใช้ AI, แนบไฟล์ |
| Editor | ทั้งหมดของ Contributor + อนุมัติงาน, แก้ข้อมูลแบรนด์และการเชื่อมต่อ, แก้รายชื่อทีม, เพิ่มหรือลบ Viewer และ Contributor |
| Owner | ทั้งหมด + เพิ่มหรือลบ Editor (กำหนดในไฟล์ rules) |

## ทดสอบ rules ก่อนใช้งานจริง (แนะนำ)
```bash
cd tests && npm i && cd ..
npx firebase emulators:exec --only firestore "node tests/rules.test.mjs"
```
มี 20 กรณีทดสอบ เช่น คนนอกอ่านไม่ได้, Viewer เขียนไม่ได้, Contributor อนุมัติงานไม่ได้, Editor แต่งตั้ง Editor ไม่ได้ ทุกกรณีต้องขึ้น PASS

## อัปเดตเว็บเมื่อแก้แอป
ซอร์สแอปใช้ชุดเดียวกับเวอร์ชันบน claude.ai (โฟลเดอร์ `app-src/`) ถ้าแก้ซอร์ส ให้รัน `APP_SRC=app-src python3 build.py` แล้วตามด้วย `firebase deploy --only hosting`

## ข้อจำกัด
- ยังไม่ได้ deploy หรือทดสอบบน Firebase จริง เพราะต้องใช้บัญชีของบริษัท ส่วนที่ทดสอบแล้วคือการทำงานของหน้าเว็บกับ Firebase จำลอง ได้แก่ หน้าล็อกอิน, คนที่ไม่มีสิทธิ์, คนนอกโดเมน, จัดการสิทธิ์, บันทึกข้อมูล, AI, Search Console, ส่งออกไฟล์ และข้อความแจ้งเมื่อไม่มีสิทธิ์
- `firestore.rules` ยังไม่ได้รันกับ emulator เพราะเครื่องที่ใช้สร้างชุดนี้ดาวน์โหลด emulator ไม่ได้ ต้องรันชุดทดสอบด้านบนก่อนเปิดใช้งาน
- การแจ้งเตือนยังอยู่ในเว็บเท่านั้น ยังไม่มีอีเมลหรือ Push

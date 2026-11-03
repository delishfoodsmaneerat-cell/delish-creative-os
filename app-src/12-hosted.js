
// ================= Standalone-only overrides (no effect on claude.ai) =================
if(HOSTED){
  ACT.gscHelp=()=>openDlg({title:"เชื่อม Search Console (เว็บของบริษัท)",body:`<ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:14px">
    <li>ล็อกอินเว็บนี้ด้วย <b>บัญชี Google</b> ที่มีสิทธิ์ใน Property ของ Search Console (ระบบขอสิทธิ์อ่านอย่างเดียว <code>webmasters.readonly</code> ตอนล็อกอิน)</li>
    <li>ผู้ดูแลต้องเปิด Google Search Console API ในโปรเจกต์ Google Cloud ของ Firebase (ดูคู่มือติดตั้ง)</li>
    <li>กด “ทดสอบการเชื่อมต่อ” → เลือก Property → Editor กดบันทึก</li>
    <li>สิทธิ์ Google หมดอายุทุกประมาณ 1 ชั่วโมง ถ้าขึ้นข้อความหมดอายุ ให้กด “เชื่อม Google ใหม่” มุมล่างซ้าย</li></ol>
    <div class="note">เว็บเรียก Search Console API โดยตรงจากเบราว์เซอร์ด้วยสิทธิ์ของผู้ใช้แต่ละคน ไม่มี token เก็บบนเซิร์ฟเวอร์</div>`,foot:["|",{label:"ปิด"}]});
}

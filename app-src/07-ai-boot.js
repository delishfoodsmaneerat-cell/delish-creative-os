
// ================= AI CONTENT STUDIO (from v1) =================
function brandCtx(){const b=S.brand||{};return`ข้อมูลแบรนด์:\n- ชื่อแบรนด์: ${b.name||"Delish Foods"} (จำหน่ายผักผลไม้พรีเมียม วัตถุดิบหายาก สมุนไพร ไมโครกรีน ดอกไม้กินได้ และสินค้าจากฟาร์มในไทย)\n- กลุ่มลูกค้า: ${b.audience||"B2B โรงแรม/ร้านอาหาร/คาเฟ่/Catering, B2C ผู้บริโภค/หน้าร้าน, B2M Shopee/Lazada/TikTok Shop"}\n- สินค้า/จุดเด่น: ${b.products||"-"}\n- น้ำเสียงแบรนด์: ${b.voice||"อบอุ่น จริงใจ"}\n- แฮชแท็ก: ${b.tags||"-"}\n- คำที่ห้ามใช้: ${b.ban||"-"}\nกฎ: ห้ามอ้างสรรพคุณทางยา ห้ามแต่งราคา ตัวเลข หรือรีวิว ถ้าไม่มีข้อมูลให้เขียน [ต้องยืนยัน]`}
const chGuide=`แนวทางช่องทาง: Facebook เล่าเรื่องได้; Instagram กระชับ แฮชแท็ก 5-10; TikTok สคริปต์ 15-30 วินาที hook 3 วินาทีแรก; LINE OA สั้น ชัด มี CTA; YouTube ไอเดียคลิป/คำอธิบาย; Shopee/Lazada คำอธิบายสินค้า`;
let aiCtl=null;
VIEWS.studio=()=>{if($("#v-studio").dataset.built)return;$("#v-studio").dataset.built="1";
  $("#v-studio").innerHTML=`<div class="vhead"><div><h1>AI คอนเทนต์</h1><p>เขียนแคปชัน Ad copy ชุดตอบคอมเมนต์ หรือไอเดียคอนเทนต์ด้วย Claude ตามข้อมูลแบรนด์ แล้วบันทึกลงปฏิทิน</p></div></div>
  <div class="note">ใช้ Claude ผ่านบัญชีของผู้กด (นับในโควตาแพ็กเกจ Claude ของผู้ใช้ ไม่มีค่า API แยก ไม่มี secret ในหน้าเว็บ) ครั้งแรกระบบจะขออนุญาต</div>
  <div class="side l"><form class="panel form" id="genForm">
    ${sel("โหมด","gMode",{post:"เขียนโพสต์โซเชียล",ad:"ข้อความโฆษณา (Ad copy)",reply:"ชุดตอบคอมเมนต์/แชต",ideas:"ไอเดียคอนเทนต์ 10 หัวข้อ"},"post")}
    ${sel("สินค้า (ดึงข้อมูลจากทะเบียน)","gProd",{"":"— ไม่เลือก —",...Object.fromEntries(S.products.map(p=>[p.id,p.name]))},"")}
    ${area("บรีฟ / หัวข้อ","gBrief","",4,"required placeholder='เช่น ไมโครกรีนทานตะวัน แพ็กใหม่สำหรับคาเฟ่'")}
    <div class="f" style="font-size:13px;color:var(--muted);font-weight:500">ช่องทาง<div class="chips">${Object.entries(CH).filter(([k])=>k!=="google"&&k!=="web").map(([k,v])=>`<label class="chk"><input type="checkbox" name="gch" value="${k}" ${["facebook","instagram","tiktok"].includes(k)?"checked":""}><span>${v.n}</span></label>`).join("")}</div></div>
    <div class="row">${sel("กลุ่มลูกค้า","gSeg",{B2C:"B2C",B2B:"B2B",B2M:"B2M"},"B2C")}${sel("โทน","gTone",{"อบอุ่น เป็นกันเอง":"อบอุ่น เป็นกันเอง","พรีเมียม น่าเชื่อถือ":"พรีเมียม น่าเชื่อถือ","สนุก ขี้เล่น":"สนุก ขี้เล่น","ให้ความรู้":"ให้ความรู้","เร่งด่วน กระตุ้นการซื้อ":"เร่งด่วน กระตุ้นการซื้อ"},"อบอุ่น เป็นกันเอง")}</div>
    <div class="row">${sel("ภาษา","gLang",{th:"ไทย",en:"อังกฤษ","th+en":"ไทย + อังกฤษ"},"th")}${sel("เวอร์ชัน/ช่องทาง","gN",{1:"1",2:"2",3:"3"},"2")}</div>
    <div class="row"><button class="btn primary" type="submit" id="btnGen" ${sample?"":"disabled"}>✦ สร้างคอนเทนต์</button><button class="btn" type="button" id="btnStop" hidden>หยุด</button></div>
    ${sample?"":`<div class="note">${HOSTED?"ฟีเจอร์ AI ยังไม่เปิดใช้ในเว็บนี้ (ผู้ดูแลต้องตั้งค่า API key ก่อน)":"Claude ใช้ไม่ได้ในมุมมองนี้ (ต้องเปิดใน claude.ai ขณะลงชื่อเข้าใช้)"}</div>`}</form>
    <div class="list" id="variants"><div class="empty">ผลลัพธ์จาก AI จะแสดงที่นี่</div></div></div>`;
  $("#gProd").onchange=()=>{const p=S.products.find(x=>x.id===V("gProd"));if(p&&!$("#gBrief").value.trim())$("#gBrief").value=`${p.name}${p.unit?" ("+p.unit+")":""}${p.origin?" จาก"+p.origin:""}\nจุดขาย: ${p.usp||"[ต้องยืนยัน]"}\nวิธีใช้: ${p.usage||"-"}${p.price!=null&&p.verify?.price?"\nราคา: "+baht(p.price):""}`};
  $("#genForm").onsubmit=genContent;$("#btnStop").onclick=()=>aiCtl?.abort()};
async function genContent(e){e.preventDefault();if(!sample)return;const mode=V("gMode"),chans=$$('input[name="gch"]:checked').map(i=>i.value),brief=V("gBrief");if(!brief){toast("กรุณาใส่บรีฟ");return}
  if(mode!=="ideas"&&!chans.length){toast("เลือกอย่างน้อย 1 ช่องทาง");return}
  const out=$("#variants");out.innerHTML=`<div class="panel thinking"><div class="spin"></div>Claude กำลังเขียน… (20–60 วินาที)</div>`;$("#btnGen").disabled=true;$("#btnStop").hidden=false;aiCtl=new AbortController();
  const n=+V("gN"),seg=V("gSeg"),tone=V("gTone"),lang=V("gLang");const schema=`{"items":[{"channel":"<${Object.keys(CH).join("|")}>","angle":"","hook":"","caption":"","hashtags":["#..."],"cta":"","visual":"","bestTime":"HH:MM"}]}`;
  const task=mode==="reply"?`สร้างชุดข้อความตอบคอมเมนต์/แชตลูกค้าที่พบบ่อย 6-8 ข้อ (ราคา จัดส่ง วิธีเก็บ ซื้อที่ไหน ติชม ร้องเรียน) ใส่คำถามลูกค้าใน hook และคำตอบใน caption`
    :mode==="ideas"?`เสนอไอเดียคอนเทนต์ 10 หัวข้อ หลากหลายรูปแบบ (สูตรอาหาร เบื้องหลังฟาร์ม UGC เทรนด์ โปร) ใส่ชื่อไอเดียใน hook รายละเอียดใน caption`
    :`เขียน${mode==="ad"?"ข้อความโฆษณา (primary text + headline ≤40 ตัวอักษรใน hook)":"โพสต์โซเชียล"} ช่องทาง ${chans.map(c=>CH[c].n).join(", ")} ช่องทางละ ${n} เวอร์ชันที่มุมต่างกัน`;
  try{const r=await sample.json(`คุณคือนักการตลาดออนไลน์มืออาชีพ\n${brandCtx()}\nกลุ่มลูกค้า: ${SEG[seg]} | โทน: ${tone} | ภาษา: ${lang}\n${chGuide}\nบรีฟ: ${brief}\nงาน: ${task}\nตอบเป็น JSON เท่านั้น: ${schema}`,{signal:aiCtl.signal,modelTier:"default"});
    S.lastGen=(r?.items||[]).map(it=>({...it,channel:CH[it.channel]?it.channel:(chans[0]||"facebook")}));renderVariants(mode)}
  catch(err){out.innerHTML=`<div class="note bad">${esc(aiErr(err))}</div>`}finally{$("#btnGen").disabled=false;$("#btnStop").hidden=true}}
function renderVariants(mode){const items=S.lastGen||[];const out=$("#variants");if(!items.length){out.innerHTML=`<div class="empty">ไม่มีผลลัพธ์ ลองปรับบรีฟ</div>`;return}const d0=addDays(today(),1);
  out.innerHTML=items.map((it,i)=>`<article class="variant"><div class="row">${chip(it.channel)}<span class="meta">${esc(it.angle||"")}</span></div>${it.hook?`<div class="hook">${esc(it.hook)}</div>`:""}<p class="cap">${esc(it.caption)}${it.cta?"\n\n"+esc(it.cta):""}</p>${it.hashtags?.length?`<div class="tags">${esc(it.hashtags.join(" "))}</div>`:""}${it.visual?`<div class="meta">ไอเดียภาพ: ${esc(it.visual)}</div>`:""}
    <div class="acts"><button class="btn sm" data-act="vCopy" data-i="${i}">คัดลอก</button>${mode==="reply"?"":`<button class="btn sm" data-act="vDraft" data-i="${i}">บันทึกเป็นดราฟต์</button><input type="date" id="vd${i}" value="${d0}" aria-label="วันที่"><input type="time" id="vt${i}" value="${/^\d\d:\d\d$/.test(it.bestTime||"")?it.bestTime:"19:00"}" aria-label="เวลา"><button class="btn sm primary" data-act="vSched" data-i="${i}">ตั้งเวลาโพสต์</button><button class="btn sm" data-act="vTask" data-i="${i}">ส่งเป็นงาน</button>`}</div></article>`).join("")}
ACT.vCopy=el=>{const it=S.lastGen[+el.dataset.i];copyText([it.hook,it.caption,it.cta,(it.hashtags||[]).join(" ")].filter(Boolean).join("\n\n"))};
async function saveGen(el,sched){const i=+el.dataset.i,it=S.lastGen[i];try{await dbAdd(COL.posts,{channel:it.channel,hook:it.hook||"",caption:[it.caption,it.cta].filter(Boolean).join("\n\n"),tags:(it.hashtags||[]).join(" "),visual:it.visual||"",date:sched?V("vd"+i):"",time:sched?V("vt"+i):"",status:sched?"scheduled":"draft",source:"AI คอนเทนต์"});el.disabled=true;el.textContent="บันทึกแล้ว ✓"}catch(e){toast(dbErr(e))}}
ACT.vDraft=el=>saveGen(el,false);ACT.vSched=el=>saveGen(el,true);
ACT.vTask=async el=>{const it=S.lastGen[+el.dataset.i];try{await dbAdd(COL.tasks,{title:(it.hook||"คอนเทนต์ AI").slice(0,80)+" · "+(CH[it.channel]?.n||""),kind:"content",segment:V("gSeg"),productId:V("gProd"),body:[it.hook,it.caption,it.cta,(it.hashtags||[]).join(" "),it.visual?"ไอเดียภาพ: "+it.visual:""].filter(Boolean).join("\n\n"),status:"review",rev:0,attachments:[],statusLog:[{s:"review",at:nowISO(),by:S.me?.id||null,note:"ร่างจาก AI"}]});el.disabled=true;el.textContent="ส่งเข้าบอร์ดแล้ว ✓"}catch(e){toast(dbErr(e))}};

// ================= AUTOMATION (from v1) =================
VIEWS.auto=()=>{$("#v-auto").innerHTML=`<div class="vhead"><div><h1>ออโตเมชันเวิร์กโฟลว์</h1><p>สูตรงานซ้ำ กดรันพร้อมบรีฟ แล้ว Claude เขียนโพสต์ทุกช่องทางและจัดลงปฏิทินให้ (รันเมื่อกดเท่านั้น ไม่มีการทำงานเบื้องหลังตามเวลา)</p></div><button class="btn primary" data-act="newWf">＋ เวิร์กโฟลว์ใหม่</button></div>
  <div class="list">${S.wfs.map(w=>`<div class="panel"><div class="row"><h2 style="font-size:17px">${esc(w.name)}${w.example?'<span class="ex">ตัวอย่าง</span>':""}</h2><span class="spacer"></span><button class="btn sm" data-act="editWf" data-id="${w.id}">แก้ไข</button><button class="btn sm primary" data-act="runWf" data-id="${w.id}" ${sample?"":"disabled"}>▶ รัน</button></div>
    <div class="flow"><span class="node trig">⚡ ${esc(w.trigger||"กดรันเอง")}</span><span class="arr">→</span><span class="node ai">✦ AI เขียน ${w.per||1} โพสต์ × ${(w.channels||[]).length} ช่องทาง</span><span class="arr">→</span><span class="node">กระจาย ${w.days||7} วัน · ${esc(w.time||"19:00")}</span><span class="arr">→</span><span class="node out">ลงปฏิทินเป็น${w.status==="scheduled"?"ตั้งเวลาแล้ว":"ดราฟต์"}</span></div>
    <div class="row" style="margin-top:8px">${(w.channels||[]).map(chip).join("")}</div><div class="cnt" style="margin-top:6px">${w.lastRun?`รันล่าสุด ${thDT(w.lastRun)} · ${w.runs||0} ครั้ง · สร้างโพสต์รวม ${w.made||0}`:"ยังไม่เคยรัน"}</div></div>`).join("")||`<div class="empty">ยังไม่มีเวิร์กโฟลว์</div>`}</div>`};
ACT.newWf=()=>openWf(null);ACT.editWf=el=>openWf(S.wfs.find(w=>w.id===el.dataset.id));
function openWf(w){const x=w||{channels:["facebook","instagram","line"],per:3,days:7,time:"19:00",tone:"อบอุ่น เป็นกันเอง",status:"draft"};
  openDlg({title:w?"แก้ไขเวิร์กโฟลว์":"เวิร์กโฟลว์ใหม่",body:`${fld("ชื่อ","wName",x.name)}${fld("ใช้เมื่อ (ทริกเกอร์)","wTrig",x.trigger)}<div class="chips">${Object.entries(CH).map(([k,v])=>`<label class="chk"><input type="checkbox" name="wch" value="${k}" ${(x.channels||[]).includes(k)?"checked":""}><span>${v.n}</span></label>`).join("")}</div>
  <div class="row">${fld("โพสต์/ช่องทาง","wPer",x.per,"number","min='1' max='7'")}${fld("กระจาย (วัน)","wDays",x.days,"number","min='1' max='30'")}${fld("เวลา","wTime",x.time,"time")}</div>
  <div class="row">${fld("โทน","wTone",x.tone)}${sel("สถานะโพสต์ที่สร้าง","wSt",{draft:"ดราฟต์",scheduled:"ตั้งเวลาเลย"},x.status)}</div>${area("คำสั่งเพิ่มเติม","wExtra",x.extra,2)}`,
  foot:[...(w?[{label:"ลบ",cls:"danger",confirm:"ยืนยันลบ?",act:async()=>{await dbDel(COL.wfs,w.id);toast("ลบแล้ว")}}]:[]),"|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{if(!V("wName"))return false;
    const d={...(w||{}),name:V("wName"),trigger:V("wTrig"),channels:$$('input[name="wch"]:checked').map(i=>i.value),per:N(V("wPer"))||1,days:N(V("wDays"))||7,time:V("wTime"),tone:V("wTone"),status:V("wSt"),extra:$("#wExtra").value.trim(),example:false};
    if(w)await safeSave(COL.wfs,w.id,d,w.updatedAt||null);else await dbAdd(COL.wfs,d);toast("บันทึกแล้ว")}}]})}
ACT.runWf=el=>{const w=S.wfs.find(x=>x.id===el.dataset.id);openDlg({title:"รัน: "+w.name,body:`${area("บรีฟรอบนี้","rBrief","",4)}${fld("เริ่มวันที่","rStart",addDays(today(),1),"date")}<div id="rOut"></div>`,
  foot:["|",{label:"ปิด"},{label:"✦ รัน",cls:"primary",act:async()=>{const brief=V("rBrief");if(!brief)return false;const runKey="R-"+hash(w.id+"|"+brief+"|"+V("rStart"));
    if(S.posts.some(p=>p.runKey===runKey)){$("#rOut").innerHTML=`<div class="note warn">รันบรีฟนี้ในวันเริ่มเดียวกันไปแล้ว ระบบไม่สร้างซ้ำ</div>`;return false}
    $("#rOut").innerHTML=`<div class="thinking"><div class="spin"></div>Claude กำลังเขียนซีรีส์โพสต์… (30–90 วินาที)</div>`;
    try{const r=await sample.json(`คุณคือนักการตลาดออนไลน์\n${brandCtx()}\nบรีฟ: ${brief}\nวางซีรีส์โพสต์ ${(w.channels||[]).map(c=>CH[c]?.n).join(", ")} ช่องทางละ ${w.per} โพสต์ กระจาย ${w.days} วัน (dayOffset 0-${w.days-1}) เนื้อหาไม่ซ้ำ โทน ${w.tone}. ${w.extra||""}\n${chGuide}\nตอบ JSON เท่านั้น: {"items":[{"channel":"<${(w.channels||[]).join("|")}>","dayOffset":0,"hook":"","caption":"","hashtags":[],"cta":"","visual":""}]}`,{modelTier:"default"});
      const items=r?.items||[];const st=V("rStart");for(const it of items){const off=Math.max(0,Math.min(w.days-1,parseInt(it.dayOffset)||0));
        await dbAdd(COL.posts,{channel:CH[it.channel]?it.channel:w.channels[0],hook:it.hook||"",caption:[it.caption,it.cta].filter(Boolean).join("\n\n"),tags:(it.hashtags||[]).join(" "),visual:it.visual||"",date:addDays(st,off),time:w.time,status:w.status,source:"ออโตเมชัน: "+w.name,runKey})}
      await dbUpd(COL.wfs,w.id,{lastRun:nowISO(),runs:(w.runs||0)+1,made:(w.made||0)+items.length});toast(`สร้าง ${items.length} โพสต์ลงปฏิทินแล้ว`);S.ui.cal=new Date(st+"T00:00");S.ui.cal.setDate(1);S.ui.selDay=st;show("cal")}
    catch(e){$("#rOut").innerHTML=`<div class="note bad">${esc(aiErr(e))}</div>`;return false}}}]})};

// ================= SETTINGS & SYSTEM STATUS =================
function statusRows(){return[
  ["on","ฐานข้อมูลออนไลน์",db?"เชื่อมต่อแล้ว: สินค้า Launch งาน ปฏิทิน SEO รายงานโฆษณา แผน ใบเบิก เทรนด์ บันทึกออนไลน์ใช้ร่วมกันทั้งทีม":"ยังเชื่อมต่อไม่ได้ในมุมมองนี้",db?"on":"off"],
  ["","ล็อกอินและสิทธิ์",S.me?.id?`ล็อกอินผ่าน ${HOST_LOGIN} · ${esc(S.me.name||"")} · ${S.me.isOwner?"Owner":S.canEdit?"Editor":"Contributor/Viewer"} · ตรวจสิทธิ์ที่ฐานข้อมูล`:"ยังระบุผู้ใช้ไม่ได้",S.me?.id?"on":"warn"],
  ["","Claude (AI)",sample?"พร้อม: บรีฟ Launch, AI คอนเทนต์, แยกรายงาน Radar, ออโตเมชัน · ใช้โควตาผู้กด":"ไม่พร้อมในมุมมองนี้",sample?"on":"warn"],
  ["","ไฟล์ AW / วิดีโอ",assets?"อัปโหลดได้ ≤ 20 MB/ไฟล์ เก็บกับแอปนี้":"อัปโหลดได้เฉพาะผู้มีสิทธิ์",assets?"on":"warn"],
  (()=>{const g=gscState();return["","Search Console",g.s==="off"?"ยังไม่เชื่อมต่อ (เตรียมช่องเชื่อมผ่าน Connector แล้ว รอ IT ติดตั้ง) · ใช้การนำเข้า CSV ไปก่อน":g.d,g.s]})(),
  ["","GA4","ยังไม่เชื่อมต่อ","warn"],
  ["","Meta / TikTok Ads","ยังไม่เชื่อมต่อ ไม่ยิงแอด ใช้การนำเข้า CSV","warn"],
  ["","Social Listening","ยังไม่ดึงอัตโนมัติจากแพลตฟอร์ม ใช้การวางคอมเมนต์/นำเข้า CSV · AI จัดอารมณ์และร่างคำตอบได้","warn"],
  ["","Daily Radar (ChatGPT)","ยังไม่ซิงก์อัตโนมัติ วางรายงานเอง","warn"],
  ["","แจ้งเตือน","ในเว็บเท่านั้น (Dashboard และตัวเลขบนเมนู) · ไม่มีอีเมลหรือ Push","warn"],
  ["","ระบบกราฟิก","เปิดเป็นลิงก์ภายนอก ไม่ได้รวมฐานข้อมูล","warn"],
  ["","ระบบเดิม (chatgpt.site)","เข้าถึงซอร์สและข้อมูลไม่ได้ ยังไม่ได้ย้ายข้อมูล","off"]]}
const statusCell=([,t,d,s])=>`<div><span class="dot ${s}" style="margin-top:6px"></span><span><b>${t}</b>${d}</span></div>`;
VIEWS.settings=()=>{const b=S.brand||{};const ro=!S.canEdit;
  $("#v-settings").innerHTML=`<div class="vhead"><div><h1>ตั้งค่าและสถานะระบบ</h1><p>สิ่งที่เชื่อมต่อจริงแล้ว และสิ่งที่ยังไม่ได้เชื่อม</p></div></div>
  <div class="panel"><h2>สถานะการเชื่อมต่อ</h2><div class="statusgrid">${statusRows().map(statusCell).join("")}</div></div>
  <div class="g2"><div class="panel"><h2>สิทธิ์ในทีม</h2><div class="tablewrap"><table><thead><tr><th>ระดับ (${HOSTED?"จัดการสิทธิ์":"เมนู Share"})</th><th>ทำได้</th></tr></thead><tbody>
    <tr><td>Viewer / Commenter</td><td>ดูข้อมูลทั้งหมด แก้ไขไม่ได้</td></tr><tr><td>Contributor</td><td>เพิ่ม/แก้ สินค้า งาน บรีฟ SEO รายงาน ใบเบิก · อนุมัติงานไม่ได้ · แก้ข้อมูลแบรนด์ไม่ได้</td></tr>
    <tr><td>Editor ขึ้นไป</td><td>ทั้งหมด + อนุมัติงาน + แก้ข้อมูลแบรนด์ + อัปโหลดไฟล์</td></tr></tbody></table></div>
    <div class="cnt" style="margin-top:8px">ทุกคนต้องล็อกอิน ${HOST_LOGIN} และได้รับสิทธิ์จาก${SHARE_WHERE} ระบบตรวจสิทธิ์ที่ฐานข้อมูล ไม่ใช่แค่ซ่อนปุ่ม · ${HOSTED?"ออกจากระบบได้ที่ปุ่ม “ออกจากระบบ” มุมล่างซ้าย":"ออกจากระบบได้จากเมนูบัญชีของ claude.ai"}</div>
    <div class="row" style="margin-top:10px"><button class="btn" type="button" data-act="exportAll">ส่งออกข้อมูลทั้งหมด (JSON)</button><span class="cnt">สำรองข้อมูล หรือใช้ย้ายไประบบอื่น</span></div></div>
    <form class="panel form" id="brandForm"><h2>ข้อมูลแบรนด์ (ใช้ในทุก prompt)</h2>${ro?`<div class="note">อ่านอย่างเดียว ต้องเป็น Editor จึงแก้ได้</div>`:""}
      <div class="row">${fld("ชื่อแบรนด์","bName",b.name)}${fld("แฮชแท็ก","bTags",b.tags)}</div>${area("กลุ่มลูกค้า","bAud",b.audience,2)}${area("สินค้า/จุดเด่น","bProd",b.products,2)}${area("น้ำเสียงแบรนด์","bVoice",b.voice,2)}${fld("คำที่ห้ามใช้","bBan",b.ban)}
      <button class="btn primary" type="submit" ${ro?"disabled":""}>บันทึก</button></form></div>`;
  $("#brandForm").onsubmit=async e=>{e.preventDefault();try{await db.doc("settings/brand").set(clean(stampUpd({name:V("bName"),tags:V("bTags"),audience:$("#bAud").value.trim(),products:$("#bProd").value.trim(),voice:$("#bVoice").value.trim(),ban:V("bBan")})));toast("บันทึกข้อมูลแบรนด์แล้ว")}catch(err){toast(dbErr(err))}}};

ACT.exportAll=async()=>{const out={exportedAt:nowISO(),source:HOSTED?"standalone":"claude-artifact",collections:{}};
  for(const[k,c]of Object.entries(COL))out.collections[c]=Object.fromEntries((S[k]||[]).map(r=>{const{id,...d}=r;return[id,d]}));
  out.collections.approvals=S.approvals||{};out.collections.settings={brand:S.brand||{},...(S.integ&&Object.keys(S.integ).length?{integrations:S.integ}:{})};
  const n=Object.values(out.collections).reduce((a,c)=>a+Object.keys(c).length,0);await saveFile(`delish-creative-os-export-${today()}.json`,JSON.stringify(out,null,1));toast(`ส่งออก ${n} รายการ`)};
// ================= theme =================
const THEMES=["system","light","dark"],TH_L={system:"ตามระบบ",light:"สว่าง",dark:"มืด"};
function applyTheme(t){if(t==="system")delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t;$("#themeLbl").textContent=TH_L[t];try{localStorage.setItem("cos.theme",t)}catch(e){}}
let theme="system";try{theme=localStorage.getItem("cos.theme")||"system"}catch(e){}applyTheme(theme);
$("#themeBtn").onclick=()=>{theme=THEMES[(THEMES.indexOf(theme)+1)%3];applyTheme(theme)};

// ================= boot =================
let initView="dash";try{initView=localStorage.getItem("cos.view")||"dash"}catch(e){}
const h0=location.hash.slice(1);if(VIEWS[h0])initView=h0;
show(initView);
async function resolveNames(){if(!user)return;const ids=new Set();const add=x=>x&&!S.names[x]&&ids.add(x);
  for(const k of["products","launches","tasks","intel","seo","ads","adplans","vouchers","mentions","lqueries"])for(const r of S[k]){add(r.createdBy);add(r.updatedBy);if(r.verify)for(const v of Object.values(r.verify))add(v?.by);if(r.statusLog)r.statusLog.forEach(l=>add(l.by))}
  for(const a of Object.values(S.approvals))add(a.by);add(S.integ?.gsc?.lastOkBy);if(!ids.size)return;
  try{const ps=await user.profiles([...ids].slice(0,200));for(const[id,p]of Object.entries(ps))S.names[id]=p.name||"สมาชิก";render()}catch(e){}}
let nameT=null;const queueNames=()=>{clearTimeout(nameT);nameT=setTimeout(resolveNames,400)};
(async()=>{const C=window.claude;if(!C){$("#dbState").textContent="ออฟไลน์";$("#meState").textContent="ไม่ได้อยู่ใน claude.ai";$("#dbDot").classList.add("off");return}
  C.use("sample").then(s=>{sample=s;if(["studio","launch","auto"].includes(S.view)){$("#v-studio").dataset.built="";render()}});
  C.use("assets").then(a=>{assets=a});C.use("mcp").then(m=>{mcp=m;if(S.view==="seo")render()});C.use("downloads").then(d=>{downloads=d});
  user=await C.use("user");if(user){const me=await user.me();S.me={id:me.id,name:me.name,isOwner:me.isOwner};S.canEdit=!!me.canEdit;if(me.id)S.names[me.id]=me.name||"ฉัน";
    $("#meDot").classList.add("on");$("#meState").textContent=(me.name||"ผู้ใช้")+" · "+(me.isOwner?"Owner":me.canEdit?"Editor":"สมาชิก")}else{$("#meDot").classList.add("warn");$("#meState").textContent="ไม่ระบุผู้ใช้"}
  db=await C.use("db");if(!db){$("#dbDot").classList.add("off");$("#dbState").textContent="ไม่ได้เชื่อมฐานข้อมูล";render();return}
  $("#dbDot").classList.add("on");$("#dbState").textContent="บันทึกออนไลน์ · ซิงก์ทีม";
  const sub=(col,key)=>db.collection(col).onSnapshot(qs=>{S[key]=qs.docs.map(d=>({...d.data(),id:d.id}));S.loaded.add(key);render();queueNames()},err=>toast("โหลด "+col+" ไม่สำเร็จ ("+(err?.code||"")+")"));
  for(const[k,c]of Object.entries(COL))sub(c,k);
  db.collection("approvals").onSnapshot(qs=>{const m={};for(const d of qs.docs)m[d.id]=d.data();S.approvals=m;render();queueNames()});
  db.doc("settings/integrations").onSnapshot(s=>{S.integ=s.exists?s.data():{};queueNames();render()});
  db.doc("settings/brand").onSnapshot(s=>{S.brand=s.exists?s.data():{};if(S.view!=="settings")render()});
})();

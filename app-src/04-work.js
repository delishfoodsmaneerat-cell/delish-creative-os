
// ================= approvals =================
/** An approval only counts if it was given to the task's current revision. */
function approvalOf(t){const a=S.approvals[t.id];if(!a)return null;return{...a,valid:a.decision==="approved"&&(a.rev||0)===(t.rev||0)}}
function apprBadge(t){const a=approvalOf(t);if(!a)return t.status==="review"?`<span class="st warn">รอตรวจ</span>`:"";
  if(a.valid)return`<span class="st ok">อนุมัติ ✓</span>`;if(a.decision==="changes")return`<span class="st bad">ขอแก้</span>`;return`<span class="st warn">อนุมัติเวอร์ชันเก่า</span>`}
function overdue(t){return t.due&&t.due<today()&&!DONE_ST.has(t.status)}

// ================= DASHBOARD =================
VIEWS.dash=()=>{const t=today(),tasks=S.tasks;
  const open=tasks.filter(x=>x.status!=="published");
  const late=tasks.filter(overdue),dueToday=tasks.filter(x=>x.due===t&&!DONE_ST.has(x.status));
  const review=tasks.filter(x=>x.status==="review");
  const activeL=S.launches.filter(l=>!launchDone(l));
  const m=t.slice(0,7),adsM=S.ads.filter(r=>r.month===m),sp=agg(adsM,"spend");
  const unver=S.products.filter(p=>VERIFY.some(([k])=>!p.verify?.[k]));
  const posts7=S.posts.filter(p=>p.date>=t&&p.date<=addDays(t,7)&&p.status!=="posted");
  const lt=S.launches.map(launchTimes).filter(x=>x.toSent!=null);
  const avgSent=lt.length?lt.reduce((a,x)=>a+x.toSent,0)/lt.length:null;
  const hi=new Date().getHours();const greet=hi<12?"สวัสดีตอนเช้า":hi<17?"สวัสดีตอนบ่าย":"สวัสดีตอนเย็น";
  const byStatus=TST.map(([k,n])=>({k,n,c:tasks.filter(x=>x.status===k).length}));const maxS=Math.max(1,...byStatus.map(x=>x.c));
  $("#v-dash").innerHTML=`<div class="vhead"><div><h1>${greet}${S.me?.name?", "+esc(S.me.name.split(" ")[0]):""}</h1><p>${new Date().toLocaleDateString("th-TH",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · ภาพรวมงานการตลาด Delish Foods ตั้งแต่สินค้าเข้าจนถึงผลลัพธ์</p></div>
    <div class="row"><button class="btn" data-act="go" data-v="launch">＋ Launch สินค้าใหม่</button><button class="btn primary" data-act="newTask">＋ งานใหม่</button></div></div>
  <div class="kpis">
    <div class="kpi"><small>งานที่เปิดอยู่</small><b>${open.length}</b><em>จากทั้งหมด ${tasks.length} งาน</em></div>
    <div class="kpi ${late.length?"alert":""}"><small>เลยกำหนด</small><b>${late.length}</b><em>ครบกำหนดวันนี้ ${dueToday.length}</em></div>
    <div class="kpi"><small>รอตรวจอนุมัติ</small><b>${review.length}</b><em>${S.canEdit?"คุณอนุมัติได้":"ต้องให้ Editor อนุมัติ"}</em></div>
    <div class="kpi"><small>Launch ที่กำลังทำ</small><b>${activeL.length}</b><em>เวลาเฉลี่ยถึงส่งงาน ${avgSent==null?"–":fmtMin(avgSent)}</em></div>
    <div class="kpi"><small>ค่าโฆษณา ${thMonth(m)}</small><b>${sp.sum==null?"–":baht(sp.sum)}</b><em>${adsM.length?`จาก ${adsM.length} แถวรายงาน${missNote(sp)}`:"ยังไม่มีข้อมูลเดือนนี้"}</em></div>
    <div class="kpi"><small>โพสต์ 7 วันข้างหน้า</small><b>${posts7.length}</b><em>ในปฏิทินคอนเทนต์</em></div>
  </div>
  <div class="g2">
    <div class="panel"><div class="ph"><h2>โฟกัสวันนี้</h2><span class="cnt">แจ้งเตือนในเว็บเท่านั้น</span></div>
      <div class="list">${focusItems(late,dueToday,review,unver)}</div></div>
    <div class="panel"><div class="ph"><h2>Launch ที่กำลังดำเนินการ</h2><button class="btn sm" data-act="go" data-v="launch">ดูทั้งหมด</button></div>
      <div class="list">${activeL.length?activeL.slice(0,5).map(launchMini).join(""):`<div class="empty">ยังไม่มี Launch ที่ค้าง เริ่มจากเลือกสินค้าในทะเบียนแล้วกด “เริ่ม Launch”</div>`}</div></div>
  </div>
  <div class="g2">
    <div class="panel"><h2>งานตามสถานะ</h2><div class="bars">${byStatus.map(x=>`<div class="bar"><span class="lab">${x.n}</span><div class="track"><div class="fill ${x.k==="review"?"b":""}" style="width:${x.c/maxS*100}%"></div></div><span class="v">${x.c}</span></div>`).join("")}</div></div>
    <div class="panel"><div class="ph"><h2>สถานะการเชื่อมต่อ</h2><button class="btn sm" data-act="go" data-v="settings">รายละเอียด</button></div><div class="statusgrid">${statusRows().slice(0,6).map(statusCell).join("")}</div></div>
  </div>`};
function fmtMin(m){if(m==null)return"–";if(m<60)return Math.round(m)+" นาที";const h=m/60;if(h<48)return h.toFixed(1)+" ชม.";return(h/24).toFixed(1)+" วัน"}
function focusItems(late,dueToday,review,unver){const out=[];
  for(const t of late.slice(0,5))out.push(`<div class="item"><div class="top"><span class="st bad">เลยกำหนด ${thDate(t.due)}</span>${kchip(t.kind)}<span class="r">${esc(t.assignee||"ยังไม่มอบหมาย")}</span></div><a href="#" data-act="openTask" data-id="${t.id}">${esc(t.title)}</a></div>`);
  for(const t of dueToday.slice(0,5))out.push(`<div class="item"><div class="top"><span class="st warn">ครบกำหนดวันนี้</span>${kchip(t.kind)}<span class="r">${esc(t.assignee||"")}</span></div><a href="#" data-act="openTask" data-id="${t.id}">${esc(t.title)}</a></div>`);
  for(const t of review.slice(0,4))out.push(`<div class="item"><div class="top"><span class="st info">รอตรวจ</span>${kchip(t.kind)}</div><a href="#" data-act="openTask" data-id="${t.id}">${esc(t.title)}</a></div>`);
  for(const p of unver.slice(0,3))out.push(`<div class="item"><div class="top"><span class="st warn">สินค้ารอยืนยันข้อมูล</span></div><a href="#" data-act="editProduct" data-id="${p.id}">${esc(p.name)} — ยังไม่ยืนยัน ${VERIFY.filter(([k])=>!p.verify?.[k]).map(x=>x[1]).join(", ")}</a></div>`);
  return out.length?out.join(""):`<div class="empty">ไม่มีงานเร่งด่วนวันนี้</div>`}
ACT.go=el=>show(el.dataset.v);

// ================= BOARD =================
function taskFilter(){const f=S.ui.bf;return S.tasks.filter(t=>(!f.seg||t.segment===f.seg)&&(!f.kind||t.kind===f.kind)&&(!f.launch||t.launchId===f.launch)&&(!f.q||(t.title+" "+(t.assignee||"")).toLowerCase().includes(f.q.toLowerCase())))}
VIEWS.board=()=>{const f=S.ui.bf,list=taskFilter();
  const lOpts={"":"ทุก Launch",...Object.fromEntries(S.launches.map(l=>[l.id,prodName(l.productId)]))};
  let body;
  if(S.ui.board==="board")body=`<div class="board">${TST.map(([k,n])=>{const ts=list.filter(t=>t.status===k).sort((a,b)=>(a.due||"9").localeCompare(b.due||"9"));
    return`<div class="col" data-col="${k}"><h3><span>${n}</span><span>${ts.length}</span></h3>${ts.map(taskCard).join("")||`<div class="cnt" style="text-align:center;padding:10px 0">—</div>`}</div>`}).join("")}</div>`;
  else body=`<div class="panel" style="padding:0"><div class="tablewrap"><table><thead><tr><th>งาน</th><th>ประเภท</th><th>กลุ่ม</th><th>ผู้รับผิดชอบ</th><th>กำหนดส่ง</th><th>สถานะ</th><th>อนุมัติ</th><th>ไฟล์</th></tr></thead><tbody>${list.sort((a,b)=>(a.due||"9").localeCompare(b.due||"9")).map(t=>`<tr class="clickable" data-act="openTask" data-id="${t.id}"><td>${esc(t.title)}${t.example?'<span class="ex">ตัวอย่าง</span>':""}</td><td>${kchip(t.kind)}</td><td>${seg(t.segment)}</td><td>${esc(t.assignee||"-")}</td><td class="${overdue(t)?"num":""}" style="${overdue(t)?"color:var(--chili)":""}">${thDate(t.due)||"-"}</td><td>${TST_N[t.status]||t.status}</td><td>${apprBadge(t)}</td><td class="num">${t.attachments?.length||""}</td></tr>`).join("")||`<tr><td colspan="8"><div class="empty">ไม่มีงานตามตัวกรอง</div></td></tr>`}</tbody></table></div></div>`;
  $("#v-board").innerHTML=`<div class="vhead"><div><h1>บอร์ดงานและคอนเทนต์</h1><p>ลากการ์ดเพื่อเปลี่ยนสถานะ (มือถือ: เปิดการ์ดแล้วเลือกสถานะ) งานต้องผ่านการอนุมัติจาก Editor ก่อนไปถึง “อนุมัติแล้ว / พร้อมเผยแพร่”</p></div>
    <div class="row"><div class="tabs" role="tablist"><button role="tab" aria-selected="${S.ui.board==="board"}" data-act="boardMode" data-m="board">บอร์ด</button><button role="tab" aria-selected="${S.ui.board==="list"}" data-act="boardMode" data-m="list">รายการ</button></div><button class="btn primary" data-act="newTask">＋ งานใหม่</button></div></div>
  <div class="row"><input type="search" id="bfQ" placeholder="ค้นหางาน / ผู้รับผิดชอบ" value="${esc(f.q||"")}" style="max-width:240px" data-live="1">
    <select id="bfSeg" data-chg="bf" data-k="seg" style="width:auto"><option value="">ทุกกลุ่มลูกค้า</option>${opt({B2B:"B2B",B2C:"B2C",B2M:"B2M"},f.seg)}</select>
    <select data-chg="bf" data-k="kind" style="width:auto"><option value="">ทุกประเภท</option>${opt(KIND,f.kind)}</select>
    <select data-chg="bf" data-k="launch" style="width:auto">${opt(lOpts,f.launch||"")}</select></div>
  ${body}`;
  const q=$("#bfQ");q.oninput=()=>{S.ui.bf.q=q.value;clearTimeout(q.t);q.t=setTimeout(()=>{const pos=q.selectionStart;forceRender();const n=$("#bfQ");n.focus();n.setSelectionRange(pos,pos)},250)};
  wireDnD()};
ACT.bf=el=>{S.ui.bf[el.dataset.k]=el.value;forceRender()};
ACT.boardMode=el=>{S.ui.board=el.dataset.m;forceRender()};
function taskCard(t){const a=t.attachments||[];const img=a.find(x=>/^image\//.test(x.type));
  return`<div class="card" draggable="true" data-act="openTask" data-id="${t.id}" tabindex="0">${img?`<img src="${assetUrl(img.id)}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px" loading="lazy">`:""}
    <b>${esc(t.title)}${t.example?'<span class="ex">ตัวอย่าง</span>':""}</b>
    <div class="meta">${kchip(t.kind)}${seg(t.segment)}${apprBadge(t)}</div>
    <div class="meta"><span class="due ${overdue(t)?"over":""}">${t.due?"ส่ง "+thDate(t.due):"ไม่มีกำหนด"}</span>${t.assignee?`· ${esc(t.assignee)}`:""}${a.length?` · 📎${a.length}`:""}</div></div>`}
function wireDnD(){let dragId=null;$$("#v-board .card").forEach(c=>{c.ondragstart=e=>{dragId=c.dataset.id;e.dataTransfer.setData("text/plain",dragId)}});
  $$("#v-board .col").forEach(col=>{col.ondragover=e=>{e.preventDefault();col.classList.add("drop")};col.ondragleave=()=>col.classList.remove("drop");
    col.ondrop=e=>{e.preventDefault();col.classList.remove("drop");const id=e.dataTransfer.getData("text/plain")||dragId;const t=S.tasks.find(x=>x.id===id);if(t&&t.status!==col.dataset.col)setStatus(t,col.dataset.col)}})}
async function setStatus(t,s){if(s===t.status)return true;
  if(GATED.has(s)&&!approvalOf(t)?.valid){toast(s==="approved"?"ย้ายเป็น “อนุมัติแล้ว” ได้จากปุ่มอนุมัติของ Editor เท่านั้น":"ต้องได้รับการอนุมัติเวอร์ชันล่าสุดก่อน");return false}
  const log=[...(t.statusLog||[]),{s,at:nowISO(),by:S.me?.id||null}].slice(-40);
  const patch={status:s,statusLog:log};if(s==="doing"&&!t.startedAt)patch.startedAt=nowISO();if(DONE_ST.has(s)&&!t.doneAt)patch.doneAt=nowISO();
  try{await dbUpd(COL.tasks,t.id,patch);toast("ย้ายไป “"+TST_N[s]+"”");return true}catch(e){toast(dbErr(e));return false}}

// ================= TASK DIALOG =================
let TD=null;// task draft
ACT.newTask=()=>openTask(null);
ACT.openTask=el=>openTask(S.tasks.find(t=>t.id===el.dataset.id));
function openTask(t,preset={}){TD={...(t||{kind:"content",status:"todo",attachments:[],...preset})};TD.attachments=[...(TD.attachments||[])];const base=t?.updatedAt||null;const isNew=!t;
  const a=t?approvalOf(t):null;const prodOpts={"":"— ไม่ระบุ —",...Object.fromEntries(S.products.map(p=>[p.id,p.name+(p.sku?" ("+p.sku+")":"")]))};
  const stOpts=Object.fromEntries(TST.filter(([k])=>!GATED.has(k)||a?.valid||k===TD.status));
  openDlg({title:isNew?"งานใหม่":"รายละเอียดงาน",wide:true,body:`
    ${t?.launchId?`<div class="note">งานนี้มาจาก Launch: <a href="#" data-act="openLaunch" data-id="${t.launchId}">${esc(prodName(S.launches.find(l=>l.id===t.launchId)?.productId))}</a> · บรีฟ “${esc(BRIEFS.find(b=>b[0]===t.briefKey)?.[1]||"")}”</div>`:""}
    ${fld("ชื่องาน","tTitle",TD.title,"text","required")}
    <div class="row">${sel("ประเภท","tKind",KIND,TD.kind)}${sel("กลุ่มลูกค้า","tSeg",{"":"ทุกกลุ่ม",B2B:"B2B",B2C:"B2C",B2M:"B2M"},TD.segment||"")}${sel("สถานะ","tStatus",stOpts,TD.status)}</div>
    <div class="row">${sel("สินค้า","tProd",prodOpts,TD.productId||"")}${fld("ผู้รับผิดชอบ","tAssignee",TD.assignee)}${fld("กำหนดส่ง","tDue",TD.due,"date")}</div>
    ${area("รายละเอียด / บรีฟ","tBody",TD.body,10)}
    <div><div class="ph"><h2 style="font-size:14px;margin:0">ไฟล์ AW / วิดีโอ / PDF</h2><button class="btn sm" type="button" data-act="taskUpload" ${assets?"":"disabled title='ต้องเป็น Editor จึงอัปโหลดได้'"}>＋ แนบไฟล์</button></div><div id="tAtt" style="margin-top:8px">${attHtml(TD.attachments,true)}</div><div class="cnt" style="margin-top:4px">รองรับภาพ วิดีโอ และ PDF ไม่เกิน 20 MB ต่อไฟล์ วิดีโอขนาดใหญ่ให้ใส่ลิงก์ในรายละเอียด</div></div>
    ${t?approvalBlock(t,a):""}
    ${t?.statusLog?.length?`<details><summary class="cnt" style="cursor:pointer">ประวัติสถานะ (${t.statusLog.length})</summary><div class="timeline">${t.statusLog.slice().reverse().map(l=>`<div><span>${thDT(l.at)}</span><span>${esc(who(l.by))}</span><b>${TST_N[l.s]||l.s}</b></div>`).join("")}</div></details>`:""}
    ${t?`<div class="cnt">สร้าง ${thDT(t.createdAt)} โดย ${esc(who(t.createdBy))} · แก้ล่าสุด ${thDT(t.updatedAt)} โดย ${esc(who(t.updatedBy))} · เวอร์ชัน ${t.rev||0}</div>`:""}`,
  foot:[...(t?[{label:"ลบงาน",cls:"danger",confirm:"ยืนยันลบ?",act:async()=>{await dbDel(COL.tasks,t.id);toast("ลบงานแล้ว")}}]:[]),"|",{label:"ยกเลิก"},
    {label:"บันทึก",cls:"primary",act:async()=>{const title=V("tTitle");if(!title){toast("กรุณาใส่ชื่องาน");return false}
      const d={...TD,title,kind:V("tKind"),segment:V("tSeg"),productId:V("tProd"),assignee:V("tAssignee"),due:V("tDue"),body:$("#tBody").value};
      const newSt=V("tStatus");
      if(isNew){d.status=newSt;d.rev=0;d.statusLog=[{s:newSt,at:nowISO(),by:S.me?.id||null}];await dbAdd(COL.tasks,d);toast("สร้างงานแล้ว");return}
      const contentChanged=d.title!==t.title||(d.body||"")!==(t.body||"")||JSON.stringify(d.attachments)!==JSON.stringify(t.attachments||[]);
      if(contentChanged)d.rev=(t.rev||0)+1;
      if(newSt!==t.status){if(GATED.has(newSt)&&!(a?.valid&&!contentChanged)){toast("ต้องได้รับการอนุมัติเวอร์ชันล่าสุดก่อน");return false}
        d.status=newSt;d.statusLog=[...(t.statusLog||[]),{s:newSt,at:nowISO(),by:S.me?.id||null}].slice(-40);if(newSt==="doing"&&!t.startedAt)d.startedAt=nowISO();if(DONE_ST.has(newSt)&&!t.doneAt)d.doneAt=nowISO()}
      if(contentChanged&&GATED.has(d.status)){d.status="review";d.statusLog=[...(d.statusLog||t.statusLog||[]),{s:"review",at:nowISO(),by:S.me?.id||null,note:"แก้เนื้อหาหลังอนุมัติ"}]}
      await safeSave(COL.tasks,t.id,d,base);toast(contentChanged&&a?.valid?"บันทึกแล้ว · เนื้อหาเปลี่ยน ต้องอนุมัติใหม่":"บันทึกแล้ว")}}]})}
function approvalBlock(t,a){const hist=a?`<div class="cnt">ล่าสุด: ${a.decision==="approved"?"อนุมัติ":"ขอแก้ไข"} โดย ${esc(who(a.by))} ${thDT(a.at)} (เวอร์ชัน ${a.rev||0})${a.note?` — “${esc(a.note)}”`:""}${a.decision==="approved"&&!a.valid?" · เนื้อหาถูกแก้หลังอนุมัติ":""}</div>`:"";
  if(!S.canEdit)return`<div class="panel" style="padding:12px"><b style="font-size:14px">การอนุมัติ</b> ${apprBadge(t)}<div class="cnt">ต้องให้ผู้มีสิทธิ์ Editor ขึ้นไปเป็นผู้อนุมัติ (ระบบตรวจสิทธิ์ที่ฐานข้อมูล)</div>${hist}</div>`;
  return`<div class="panel" style="padding:12px;display:flex;flex-direction:column;gap:8px"><div class="row"><b style="font-size:14px">การอนุมัติ</b>${apprBadge(t)}</div>${hist}
    <input type="text" id="apNote" placeholder="หมายเหตุถึงทีม (ถ้ามี)"><div class="row"><button class="btn primary sm" type="button" data-act="approve" data-id="${t.id}" data-d="approved">✓ อนุมัติเวอร์ชันนี้</button><button class="btn sm" type="button" data-act="approve" data-id="${t.id}" data-d="changes">ขอแก้ไข</button></div>
    <div class="cnt">อนุมัติจะอ้างอิงเวอร์ชันที่บันทึกล่าสุด หากมีการแก้ไขที่ยังไม่บันทึก ให้บันทึกก่อน</div></div>`}
ACT.approve=async el=>{const t=S.tasks.find(x=>x.id===el.dataset.id);if(!t)return;const d=el.dataset.d;
  try{await db.collection("approvals").doc(t.id).set({decision:d,rev:t.rev||0,note:V("apNote"),by:S.me?.id||null,at:nowISO()});
    const s=d==="approved"?"approved":"doing";await dbUpd(COL.tasks,t.id,{status:s,statusLog:[...(t.statusLog||[]),{s,at:nowISO(),by:S.me?.id||null,note:d==="approved"?"อนุมัติ":"ขอแก้ไข"}].slice(-40)});
    toast(d==="approved"?"อนุมัติแล้ว":"ส่งกลับให้แก้ไขแล้ว");closeDlg()}catch(e){toast(dbErr(e))}};
ACT.taskUpload=async()=>{const f=await pickFile("image/*,video/*,application/pdf");if(!f)return;const box=$("#tAtt");box.insertAdjacentHTML("afterbegin",`<div class="thinking" id="upSpin"><div class="spin"></div>กำลังอัปโหลด ${esc(f.name)}…</div>`);
  try{const a=await uploadFile(f);TD.attachments.push(a);box.innerHTML=attHtml(TD.attachments,true);toast("แนบไฟล์แล้ว (กดบันทึกเพื่อยืนยัน)")}catch(e){$("#upSpin")?.remove();toast(e.message||"อัปโหลดไม่สำเร็จ ("+(e.code||"error")+")")}};
$("#dlgBody").addEventListener("click",e=>{const b=e.target.closest("[data-rmatt]");if(!b||!TD)return;TD.attachments.splice(+b.dataset.rmatt,1);$("#tAtt").innerHTML=attHtml(TD.attachments,true)});

// ================= CALENDAR =================
VIEWS.cal=()=>{const m=S.ui.cal||(S.ui.cal=new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const start=new Date(m);start.setDate(1-((m.getDay()+6)%7));
  let h=["จ.","อ.","พ.","พฤ.","ศ.","ส.","อา."].map(d=>`<div class="dh">${d}</div>`).join("");
  for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const s=ymd(d);
    const ps=S.posts.filter(p=>p.date===s),ts=S.tasks.filter(t=>t.due===s);
    const items=[...ps.map(p=>`<div class="pi" style="--c:${CH[p.channel]?.c}">${esc((p.time||"")+" "+(p.hook||p.caption||"").slice(0,40))}</div>`),...ts.map(t=>`<div class="pi task" style="--c:${KIND_C[t.kind]}">⏱ ${esc(t.title.slice(0,40))}</div>`)];
    h+=`<div class="day ${d.getMonth()!==m.getMonth()?"out":""} ${s===today()?"today":""} ${s===S.ui.selDay?"sel":""}" data-act="calDay" data-d="${s}" tabindex="0"><span class="dn">${d.getDate()}</span>${items.slice(0,3).join("")}${items.length>3?`<span class="more">+${items.length-3}</span>`:""}</div>`}
  const s=S.ui.selDay;let side;
  if(s){const ps=S.posts.filter(p=>p.date===s).sort((a,b)=>(a.time||"").localeCompare(b.time||""));const ts=S.tasks.filter(t=>t.due===s);
    side=`<h2>${thDate(s)}</h2><div class="list">${ps.map(postCard).join("")}${ts.map(t=>`<div class="item"><div class="top"><span class="st info">ครบกำหนดงาน</span>${kchip(t.kind)}<span class="r">${TST_N[t.status]}</span></div><a href="#" data-act="openTask" data-id="${t.id}">${esc(t.title)}</a></div>`).join("")}${!ps.length&&!ts.length?`<div class="empty">ไม่มีโพสต์หรืองานวันนี้</div>`:""}<button class="btn" data-act="newPost" data-d="${s}">＋ เพิ่มโพสต์วันนี้</button></div>`}
  else{const drafts=S.posts.filter(p=>!p.date);side=`<h2>ดราฟต์ที่ยังไม่กำหนดวัน (${drafts.length})</h2><div class="list">${drafts.map(postCard).join("")||`<div class="empty">คลิกวันที่ในปฏิทินเพื่อดูรายละเอียด</div>`}</div>`}
  $("#v-cal").innerHTML=`<div class="vhead"><div><h1>ปฏิทินคอนเทนต์และแคมเปญ</h1><p>โพสต์ที่วางแผนไว้ (แถบทึบ) และกำหนดส่งงานในบอร์ด (แถบประ) อยู่ในปฏิทินเดียวกัน</p></div>
    <div class="row"><button class="btn" data-act="calNav" data-n="-1" aria-label="เดือนก่อน">‹</button><b style="font-family:var(--display);min-width:140px;text-align:center">${TH_M[m.getMonth()]} ${m.getFullYear()+543}</b><button class="btn" data-act="calNav" data-n="1" aria-label="เดือนถัดไป">›</button><button class="btn" data-act="calNav" data-n="0">วันนี้</button><button class="btn primary" data-act="newPost" data-d="${s||today()}">＋ โพสต์</button></div></div>
  <div class="side r"><div class="panel" style="padding:0;overflow:hidden"><div class="cal">${h}</div></div><div class="panel">${side}</div></div>
  <div class="note">“ตั้งเวลา” คือแผนของทีม ระบบยังไม่โพสต์ไปยังแพลตฟอร์มให้ เมื่อโพสต์จริงแล้วให้กด “โพสต์แล้ว”</div>`};
ACT.calDay=el=>{S.ui.selDay=S.ui.selDay===el.dataset.d?null:el.dataset.d;forceRender()};
ACT.calNav=el=>{const n=+el.dataset.n;if(!n){S.ui.cal=null;S.ui.selDay=today()}else{const m=S.ui.cal;S.ui.cal=new Date(m.getFullYear(),m.getMonth()+n,1)}forceRender()};
const PST={draft:["ดราฟต์",""],scheduled:["ตั้งเวลาแล้ว","warn"],posted:["โพสต์แล้ว","ok"]};
function postCard(p){return`<div class="item"><div class="top">${chip(p.channel)}<span class="st ${PST[p.status]?.[1]||""}">${PST[p.status]?.[0]||p.status}</span>${p.example?'<span class="ex">ตัวอย่าง</span>':""}<span class="r">${p.date?thDate(p.date)+" "+(p.time||""):"ไม่กำหนดวัน"}</span></div>
  ${p.hook?`<b>${esc(p.hook)}</b>`:""}<p>${esc((p.caption||"").slice(0,200))}${(p.caption||"").length>200?"…":""}</p>
  <div class="row"><button class="btn sm" data-act="editPost" data-id="${p.id}">แก้ไข</button><button class="btn sm" data-act="copyPost" data-id="${p.id}">คัดลอก</button>${p.status!=="posted"?`<button class="btn sm" data-act="postedPost" data-id="${p.id}">โพสต์แล้ว ✓</button>`:""}</div></div>`}
ACT.newPost=el=>openPost(null,el.dataset.d);
ACT.editPost=el=>openPost(S.posts.find(p=>p.id===el.dataset.id));
ACT.copyPost=el=>{const p=S.posts.find(x=>x.id===el.dataset.id);copyText([p.hook,p.caption,p.tags].filter(Boolean).join("\n\n"))};
ACT.postedPost=async el=>{try{await dbUpd(COL.posts,el.dataset.id,{status:"posted"});toast("อัปเดตเป็นโพสต์แล้ว")}catch(e){toast(dbErr(e))}};
function openPost(p,date){const base=p?.updatedAt||null;openDlg({title:p?"แก้ไขโพสต์":"โพสต์ใหม่",body:`
  <div class="row">${sel("ช่องทาง","pCh",CH,p?.channel||"facebook")}${sel("สถานะ","pSt",{draft:"ดราฟต์",scheduled:"ตั้งเวลาแล้ว",posted:"โพสต์แล้ว"},p?.status||(date?"scheduled":"draft"))}</div>
  <div class="row">${fld("วันที่","pDate",p?.date??date??"","date")}${fld("เวลา","pTime",p?.time||"19:00","time")}</div>
  <div class="row">${sel("ขั้นตอน","pStage",STAGE_N,p?.stage||stageFromStatus(p?.status||(date?"scheduled":"draft")))}<label class="f">Pillar<input type="text" id="pPillar" list="pillarList" value="${esc(p?.pillar||"")}"></label><datalist id="pillarList">${PILLARS.map(x=>`<option value="${esc(x)}">`).join("")}</datalist>${sel("เป้าหมาย","pGoal",GOALS,p?.goal||"engagement")}</div>
  <div class="row">${fld("ผู้รับผิดชอบ","pOwner",p?.owner,"text","list='teamList'")}<datalist id="teamList">${S.team.map(t=>`<option value="${esc(t.name)}">`).join("")}</datalist>${fld("Reach <span class='hint'>หลังโพสต์ เว้นว่างถ้ายังไม่มี</span>","pReach",p?.reach??"","number","min='0'")}${fld("Engagement","pEng",p?.engagement??"","number","min='0'")}</div>
  <label class="f">หัวข้อ / Hook<div class="row" style="flex-wrap:nowrap"><input type="text" id="pHook" value="${esc(p?.hook||"")}"><button class="btn sm" type="button" data-act="aiHook" ${sample?"":"disabled"}>✦ คิด Hook</button></div></label><div id="hookOut"></div>${area("แคปชัน","pCap",p?.caption,7)}${fld("แฮชแท็ก","pTags",p?.tags)}${fld("ไอเดียภาพ/วิดีโอ","pVis",p?.visual)}`,
  foot:[...(p?[{label:"ลบ",cls:"danger",confirm:"ยืนยันลบ?",act:async()=>{await dbDel(COL.posts,p.id);toast("ลบแล้ว")}}]:[]),"|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{
    const stg=V("pStage");let st=V("pSt");if(p?.stage!==stg||!p)st=statusFromStage(stg,st);const d={...(p||{}),stage:stg,pillar:V("pPillar"),goal:V("pGoal"),owner:V("pOwner"),reach:N(V("pReach")),engagement:N(V("pEng")),channel:V("pCh"),status:st,date:V("pDate"),time:V("pTime"),hook:V("pHook"),caption:$("#pCap").value,tags:V("pTags"),visual:V("pVis"),source:p?.source||"เพิ่มเอง"};
    if(p&&stg===(p.stage||stageFromStatus(p.status))&&st!==p.status)d.stage=stageFromStatus(st);if(p)await safeSave(COL.posts,p.id,d,base);else await dbAdd(COL.posts,d);toast("บันทึกโพสต์แล้ว")}}]})}

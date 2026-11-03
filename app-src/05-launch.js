
// ================= PRODUCTS =================
const prodName=id=>S.products.find(p=>p.id===id)?.name||"(สินค้าถูกลบ)";
const isBlank=v=>v==null||v==="";
function missingFields(p){return PROD_REQ.filter(([k])=>isBlank(p?.[k]))}
function verChips(p){return VERIFY.map(([k,n])=>p.verify?.[k]?`<span class="st ok" title="ยืนยันโดย ${esc(who(p.verify[k].by))} ${thDT(p.verify[k].at)}">${n} ✓</span>`:`<span class="st warn">${n} ?</span>`).join(" ")}
function thumb(p){return`<div class="pthumb">${p?.imageId?`<img src="${assetUrl(p.imageId)}" alt="">`:"ไม่มีรูป"}</div>`}
VIEWS.products=()=>{const q=(S.ui.pq||"").toLowerCase();const list=S.products.filter(p=>!q||(p.name+" "+(p.sku||"")+" "+(p.origin||"")).toLowerCase().includes(q)).sort((a,b)=>(a.name||"").localeCompare(b.name||"","th"));
  $("#v-products").innerHTML=`<div class="vhead"><div><h1>ทะเบียนสินค้า</h1><p>ข้อมูลกลางของสินค้า ใช้ซ้ำใน Launch Studio บรีฟ และงานทุกชิ้น แก้ที่นี่ที่เดียว ราคา สต๊อก และจุดขายต้องมีผู้ยืนยันแยกกัน</p></div>
    <div class="row"><input type="search" id="pQ" placeholder="ค้นหาชื่อ / SKU / แหล่งผลิต" value="${esc(S.ui.pq||"")}" style="width:220px" data-live="1"><button class="btn primary" data-act="newProduct">＋ เพิ่มสินค้า</button></div></div>
  <div class="panel" style="padding:0"><div class="tablewrap"><table><thead><tr><th></th><th>สินค้า</th><th>หน่วยขาย</th><th>แหล่งผลิต</th><th class="r">ราคา</th><th class="r">สต๊อก</th><th>การยืนยัน</th><th>ข้อมูลขาด</th><th></th></tr></thead><tbody>
  ${list.map(p=>{const miss=missingFields(p);return`<tr><td>${thumb(p)}</td><td><b>${esc(p.name)}</b>${p.example?'<span class="ex">ตัวอย่าง</span>':""}<div class="cnt">${esc(p.sku||"ไม่มี SKU")}</div></td><td>${esc(p.unit||"–")}</td><td>${esc(p.origin||"–")}</td><td class="r num">${baht(p.price)}</td><td class="r num">${fmtN(p.stock)}</td><td>${verChips(p)}</td><td>${miss.length?`<span class="st bad" title="${esc(miss.map(x=>x[1]).join(", "))}">${miss.length} รายการ</span>`:`<span class="st ok">ครบ</span>`}</td>
    <td style="white-space:nowrap"><button class="btn sm" data-act="editProduct" data-id="${p.id}">แก้ไข</button> <button class="btn sm primary" data-act="launchProduct" data-id="${p.id}">เริ่ม Launch</button></td></tr>`}).join("")||`<tr><td colspan="9"><div class="empty">ยังไม่มีสินค้าในทะเบียน กด “＋ เพิ่มสินค้า” เพื่อเริ่ม</div></td></tr>`}</tbody></table></div></div>`;
  const q2=$("#pQ");q2.oninput=()=>{S.ui.pq=q2.value;clearTimeout(q2.t);q2.t=setTimeout(()=>{const pos=q2.selectionStart;forceRender();const n=$("#pQ");n.focus();n.setSelectionRange(pos,pos)},250)}};
ACT.newProduct=()=>openProduct(null);
ACT.editProduct=el=>openProduct(S.products.find(p=>p.id===el.dataset.id));
let PD=null;
function openProduct(p,after){PD={imageId:p?.imageId||"",verify:{...(p?.verify||{})}};const base=p?.updatedAt||null;
  openDlg({title:p?"แก้ไขสินค้า":"เพิ่มสินค้า",wide:true,body:`
  <div class="row" style="align-items:flex-start"><div id="pImg" style="width:120px">${prodImg()}</div><div class="form" style="flex:1;min-width:220px">
    <div class="row">${fld("ชื่อสินค้า *","pName",p?.name,"text","required")}${fld("SKU","pSku",p?.sku)}</div>
    <div class="row">${fld("หน่วยขาย","pUnit",p?.unit,"text","placeholder='เช่น แพ็ก 100 กรัม / กิโลกรัม'")}${fld("แหล่งผลิต","pOrigin",p?.origin,"text","placeholder='ฟาร์ม / จังหวัด'")}</div></div></div>
  ${area("จุดขาย (USP)","pUsp",p?.usp,3)}${area("วิธีใช้ / เมนูแนะนำ","pUsage",p?.usage,3)}
  <div class="row">${fld("ราคา (บาท) <span class='hint'>เว้นว่างถ้ายังไม่รู้ อย่าใส่ 0</span>","pPrice",p?.price??"","number","min='0' step='0.01'")}${fld("ราคา B2B (บาท)","pPriceB2B",p?.priceB2B??"","number","min='0' step='0.01'")}${fld("สต๊อก","pStock",p?.stock??"","number","min='0'")}</div>
  <div class="row">${fld("รอบส่ง","pRound",p?.round,"text","placeholder='เช่น ส่งทุกอังคาร/ศุกร์'")}${fld("ผู้รับผิดชอบ","pOwner",p?.owner)}${fld("กำหนดส่งงาน","pDue",p?.due,"date")}</div>
  <div class="panel" style="padding:12px"><b style="font-size:14px">การยืนยันข้อมูล</b><div class="cnt">ติ๊กเมื่อได้ตรวจกับฝ่ายจัดซื้อ/คลังแล้ว ระบบบันทึกชื่อผู้ยืนยันและเวลา ถ้าแก้ค่าภายหลัง การยืนยันของช่องนั้นจะถูกล้าง</div>
    <div class="chips" style="margin-top:8px">${VERIFY.map(([k,n])=>`<label class="chk"><input type="checkbox" id="pv_${k}" ${PD.verify[k]?"checked":""}><span>${n}ถูกต้อง${PD.verify[k]?` · ${esc(who(PD.verify[k].by))}`:""}</span></label>`).join("")}</div></div>`,
  foot:[...(p?[{label:"ลบสินค้า",cls:"danger",confirm:"ยืนยันลบ?",act:async()=>{if(S.launches.some(l=>l.productId===p.id)){toast("มี Launch ใช้สินค้านี้อยู่ ลบไม่ได้");return false}await dbDel(COL.products,p.id);toast("ลบแล้ว")}}]:[]),"|",{label:"ยกเลิก"},
   {label:"บันทึก",cls:"primary",act:async()=>{const name=V("pName");if(!name){toast("กรุณาใส่ชื่อสินค้า");return false}
    const d={...(p||{}),name,sku:V("pSku"),unit:V("pUnit"),origin:V("pOrigin"),usp:$("#pUsp").value.trim(),usage:$("#pUsage").value.trim(),price:N(V("pPrice")),priceB2B:N(V("pPriceB2B")),stock:N(V("pStock")),round:V("pRound"),owner:V("pOwner"),due:V("pDue"),imageId:PD.imageId||""};
    if(d.sku){const dup=S.products.find(x=>x.sku&&x.sku.toLowerCase()===d.sku.toLowerCase()&&x.id!==p?.id);if(dup){toast("SKU นี้มีอยู่แล้ว: "+dup.name);return false}}
    const v={};for(const[k]of VERIFY){const was=PD.verify[k];const changed=p&&String(p[k]??"")!==String(d[k]??"");
      if($("#pv_"+k).checked){v[k]=(was&&!changed)?was:{by:S.me?.id||null,at:nowISO()}}}
    for(const[k]of VERIFY){if(v[k]&&isBlank(d[k])){toast("ยืนยัน"+VERIFY.find(x=>x[0]===k)[1]+"ไม่ได้ เพราะยังว่าง");return false}}
    d.verify=v;let id=p?.id;
    if(p)await safeSave(COL.products,p.id,d,base);else{const r=await dbAdd(COL.products,d);id=r.id}
    toast("บันทึกสินค้าแล้ว");after?.(id)}}]})}
function prodImg(){return`${PD.imageId?`<img src="${assetUrl(PD.imageId)}" alt="รูปสินค้า" style="width:120px;height:120px;object-fit:cover;border-radius:10px">`:`<div class="pthumb" style="width:120px;height:120px">ไม่มีรูป</div>`}<button class="btn sm" type="button" data-act="prodUpload" style="margin-top:6px;width:100%;justify-content:center" ${assets?"":"disabled"}>${PD.imageId?"เปลี่ยนรูป":"อัปโหลดรูป"}</button>`}
ACT.prodUpload=async()=>{const f=await pickFile("image/*");if(!f)return;try{const a=await uploadFile(f);PD.imageId=a.id;$("#pImg").innerHTML=prodImg()}catch(e){toast(e.message||"อัปโหลดไม่สำเร็จ")}};

// ================= LAUNCH STUDIO =================
const launchTasks=l=>S.tasks.filter(t=>t.launchId===l.id);
function launchDone(l){const ts=launchTasks(l);return ts.length>0&&ts.every(t=>DONE_ST.has(t.status))}
function launchReady(p){return p&&!missingFields(p).length&&VERIFY.every(([k])=>p.verify?.[k])}
function launchTimes(l){const c=l.createdAt?new Date(l.createdAt):null;const m=x=>x&&c?(new Date(x)-c)/60000:null;
  const ts=launchTasks(l);const allDone=ts.length&&ts.every(t=>DONE_ST.has(t.status))?ts.map(t=>t.doneAt).filter(Boolean).sort().pop():null;
  return{toReady:m(l.t?.ready),toBrief:m(l.t?.briefed),toSent:m(l.t?.sent),toDone:m(allDone),doneAt:allDone}}
function launchMini(l){const ts=launchTasks(l),d=ts.filter(t=>DONE_ST.has(t.status)).length;const p=S.products.find(x=>x.id===l.productId);
  return`<div class="item"><div class="top">${thumb(p)}<div style="min-width:0"><a href="#" data-act="openLaunch" data-id="${l.id}"><b>${esc(p?.name||"สินค้าถูกลบ")}</b></a><div class="cnt">${launchReady(p)?"ข้อมูลพร้อม":"ข้อมูลยังไม่พร้อม"} · บรีฟ ${BRIEFS.filter(b=>l["brief_"+b[0]]).length}/7 · งานเสร็จ ${d}/${ts.length}</div></div><span class="r">${thDate(p?.due)}</span></div>
  <div class="bar" style="grid-template-columns:1fr 50px"><div class="track"><div class="fill" style="width:${ts.length?d/ts.length*100:0}%"></div></div><span class="v">${ts.length?Math.round(d/ts.length*100)+"%":"–"}</span></div></div>`}
ACT.openLaunch=el=>{S.ui.launch=el.dataset.id;closeDlg();show("launch")};
ACT.launchProduct=el=>startLaunch(el.dataset.id);
async function startLaunch(pid){const ex=S.launches.find(l=>l.productId===pid&&!launchDone(l));if(ex){S.ui.launch=ex.id;show("launch");toast("สินค้านี้มี Launch ที่ยังไม่เสร็จอยู่แล้ว เปิดอันเดิมให้");return}
  try{const r=await dbAdd(COL.launches,{productId:pid,t:{}});S.ui.launch=r.id;show("launch");toast("เริ่ม Launch แล้ว")}catch(e){toast(dbErr(e))}}
ACT.newLaunch=()=>{const opts=Object.fromEntries(S.products.map(p=>[p.id,p.name+(p.sku?" ("+p.sku+")":"")]));
  openDlg({title:"เริ่ม Launch สินค้า",body:`${S.products.length?sel("เลือกสินค้าจากทะเบียน","nlProd",opts,""):`<div class="empty">ยังไม่มีสินค้าในทะเบียน</div>`}<div class="cnt">หรือเพิ่มสินค้าใหม่ ระบบจะบันทึกลงทะเบียนแล้วเปิด Launch ให้ทันที</div>`,
    foot:[{label:"＋ สินค้าใหม่",act:()=>{setTimeout(()=>openProduct(null,id=>id&&setTimeout(()=>startLaunch(id),300)),50)}},"|",{label:"ยกเลิก"},...(S.products.length?[{label:"เริ่ม Launch",cls:"primary",act:()=>startLaunch(V("nlProd"))}]:[])]})};
VIEWS.launch=()=>{const l=S.launches.find(x=>x.id===S.ui.launch);if(!l)return launchList();launchDetail(l)};
function launchList(){const act=S.launches.filter(l=>!launchDone(l)),done=S.launches.filter(launchDone);
  $("#v-launch").innerHTML=`<div class="vhead"><div><h1>Delish Launch Studio</h1><p>สินค้าเข้าใหม่ → ชุดแคมเปญพร้อมตรวจ เลือกสินค้า ตรวจความพร้อม สร้างบรีฟ 7 ชุด ส่งเข้าบอร์ด และติดตามจนเสร็จ พร้อมจับเวลาทำงานจริง</p></div><button class="btn primary" data-act="newLaunch">＋ เริ่ม Launch</button></div>
  <div class="steps">${["ข้อมูลสินค้า","ตรวจความพร้อม","สร้างบรีฟ 7 ชุด","ส่งเข้าบอร์ด","ติดตามสถานะ"].map((s,i)=>`<span class="step"><i>${i+1}</i>${s}</span>`).join("")}</div>
  <div class="g2"><div class="panel"><h2>กำลังดำเนินการ (${act.length})</h2><div class="list">${act.map(launchMini).join("")||`<div class="empty">ยังไม่มี Launch กด “＋ เริ่ม Launch”</div>`}</div></div>
  <div class="panel"><h2>เสร็จแล้ว (${done.length})</h2><div class="list">${done.map(launchMini).join("")||`<div class="empty">ยังไม่มี Launch ที่ทุกงานพร้อมเผยแพร่</div>`}</div></div></div>`}
function launchDetail(l){const p=S.products.find(x=>x.id===l.productId);
  if(!p){$("#v-launch").innerHTML=`<div class="vhead"><div><button class="btn sm" data-act="launchBack">‹ กลับ</button><h1>ไม่พบสินค้า</h1></div></div><div class="note bad">สินค้าของ Launch นี้ถูกลบจากทะเบียน</div>`;return}
  const miss=missingFields(p),ready=launchReady(p);
  if(ready&&!l.t?.ready)dbUpd(COL.launches,l.id,{"t":{...(l.t||{}),ready:nowISO()}}).catch(()=>{});
  const nb=BRIEFS.filter(b=>l["brief_"+b[0]]).length;const ts=launchTasks(l);const sent=BRIEFS.filter(b=>S.tasks.some(t=>t.id===taskIdFor(l,b[0])));
  const stepDone=[true,ready,nb===7,sent.length>0,launchDone(l)];const cur=stepDone.indexOf(false);
  const tm=launchTimes(l);
  $("#v-launch").innerHTML=`<div class="vhead"><div><button class="btn sm ghost" data-act="launchBack">‹ ทุก Launch</button><h1>${esc(p.name)}</h1><p>เริ่ม ${thDT(l.createdAt)} โดย ${esc(who(l.createdBy))} · กำหนดส่งงาน ${thDate(p.due)||"ยังไม่กำหนด"} · ผู้รับผิดชอบ ${esc(p.owner||"ยังไม่ระบุ")}</p></div>
    <div class="row"><button class="btn" data-act="editProduct" data-id="${p.id}">แก้ข้อมูลสินค้า</button><button class="btn danger" data-act="delLaunch" data-id="${l.id}">ลบ Launch</button></div></div>
  <div class="steps">${["ข้อมูลสินค้า","ตรวจความพร้อม","สร้างบรีฟ 7 ชุด","ส่งเข้าบอร์ด","ติดตามสถานะ"].map((s,i)=>`<span class="step ${stepDone[i]?"done":""} ${i===cur?"cur":""}"><i>${stepDone[i]?"✓":i+1}</i>${s}</span>`).join("")}</div>
  <div class="g2">
    <div class="panel"><div class="ph"><h2>1 · ข้อมูลสินค้า</h2><span class="cnt">จากทะเบียนสินค้า (แก้ที่เดียว)</span></div>
      <div class="row" style="align-items:flex-start">${p.imageId?`<img src="${assetUrl(p.imageId)}" alt="" style="width:110px;height:110px;object-fit:cover;border-radius:10px">`:thumb(p)}
      <div style="flex:1;min-width:200px;font-size:14px;display:grid;grid-template-columns:auto 1fr;gap:2px 12px">
        ${[["SKU",p.sku],["หน่วยขาย",p.unit],["แหล่งผลิต",p.origin],["ราคา",p.price==null?"":baht(p.price)+(p.priceB2B!=null?` · B2B ${baht(p.priceB2B)}`:"")],["สต๊อก",p.stock==null?"":fmtN(p.stock)],["รอบส่ง",p.round]].map(([k,v])=>`<span class="cnt">${k}</span><span>${v?esc(v):'<span style="color:var(--chili)">ยังไม่กรอก</span>'}</span>`).join("")}</div></div>
      <div style="margin-top:10px;font-size:14px"><span class="cnt">จุดขาย</span><p style="margin:2px 0 8px;white-space:pre-wrap">${esc(p.usp||"—")}</p><span class="cnt">วิธีใช้</span><p style="margin:2px 0;white-space:pre-wrap">${esc(p.usage||"—")}</p></div></div>
    <div class="panel"><div class="ph"><h2>2 · ตรวจความพร้อม</h2>${ready?`<span class="st ok">พร้อมส่งงาน</span>`:`<span class="st warn">ยังไม่พร้อม</span>`}</div>
      <div class="check"><span class="ic ${miss.length?"no":"ok"}">${miss.length?"!":"✓"}</span><div class="grow"><b>ข้อมูลครบ ${PROD_REQ.length-miss.length}/${PROD_REQ.length}</b>${miss.length?`<div class="cnt">ยังขาด: ${miss.map(x=>x[1]).join(", ")}</div>`:""}</div>${miss.length?`<button class="btn sm" data-act="editProduct" data-id="${p.id}">กรอกเพิ่ม</button>`:""}</div>
      ${VERIFY.map(([k,n])=>{const v=p.verify?.[k];return`<div class="check"><span class="ic ${v?"ok":"wait"}">${v?"✓":"?"}</span><div class="grow"><b>ยืนยัน${n}</b><div class="cnt">${v?`โดย ${esc(who(v.by))} · ${thDT(v.at)}`:isBlank(p[k])?"ต้องกรอกก่อนจึงยืนยันได้":"ยังไม่มีผู้ยืนยัน"}</div></div>${!v&&!isBlank(p[k])?`<button class="btn sm" data-act="verify" data-id="${p.id}" data-k="${k}">ยืนยัน</button>`:""}</div>`}).join("")}
      <div class="cnt" style="margin-top:6px">สร้างบรีฟได้ทันทีเพื่อเริ่มร่าง แต่การส่งเข้าบอร์ดต้องผ่านทุกข้อ</div></div>
  </div>
  <div class="panel"><div class="ph"><h2>3 · บรีฟ 7 ชุด <span class="cnt">(${nb}/7)</span></h2><div class="row"><button class="btn" data-act="genBriefs" data-mode="template" data-id="${l.id}">สร้างจากเทมเพลต</button><button class="btn primary" data-act="genBriefs" data-mode="ai" data-id="${l.id}" ${sample?"":"disabled title='Claude ใช้ไม่ได้ในมุมมองนี้'"}>✦ สร้างด้วย AI (Claude)</button></div></div>
    <div class="note" style="margin-bottom:10px">เทมเพลต: เติมข้อมูลจากทะเบียนลงโครงบรีฟมาตรฐาน ไม่ใช้ AI · AI: Claude เขียนบรีฟจากข้อมูลเดียวกัน ใช้โควตา Claude ของผู้กด ไม่มีค่า API แยกและไม่มี secret ในหน้าเว็บ ข้อมูลที่ไม่มีจะเขียนเป็น [ต้องยืนยัน] ไม่แต่งเพิ่ม · สร้างซ้ำจะไม่เขียนทับบรีฟที่ทีมแก้แล้วหรือที่ส่งเข้าบอร์ดแล้ว แต่จะเก็บเป็น “เวอร์ชันใหม่รอเลือก”</div>
    <div id="genStatus"></div><div class="list">${BRIEFS.map(b=>briefBox(l,b)).join("")}</div></div>
  <div class="g2">
    <div class="panel"><div class="ph"><h2>4 · ส่งเข้าบอร์ดงาน</h2>${ready?"":`<span class="st warn">รอตรวจความพร้อม</span>`}</div>
      <div class="list" style="gap:4px">${BRIEFS.map(([k,n])=>{const tid=taskIdFor(l,k),t=S.tasks.find(x=>x.id===tid),has=!!l["brief_"+k];
        return`<label class="check" style="cursor:pointer"><input type="checkbox" class="sendk" value="${k}" ${!t&&has?"checked":""} ${t||!has?"disabled":""}><span class="grow">${n}</span>${t?`<a href="#" data-act="openTask" data-id="${t.id}" class="st ok">อยู่ในบอร์ดแล้ว</a>`:has?"":`<span class="st">ยังไม่มีบรีฟ</span>`}</label>`}).join("")}</div>
      <div class="row" style="margin-top:10px">${fld("มอบหมายให้","sendAs",p.owner)}${fld("กำหนดส่ง","sendDue",p.due,"date")}</div>
      <button class="btn primary" style="margin-top:10px" data-act="sendBriefs" data-id="${l.id}" ${ready?"":"disabled"}>ส่งบรีฟที่เลือกเข้าบอร์ด</button>
      <div class="cnt" style="margin-top:6px">แต่ละบรีฟสร้างงานได้ครั้งเดียว (รหัสงานผูกกับ Launch + บรีฟ) กดซ้ำจะไม่เกิดงานซ้ำ</div></div>
    <div class="panel"><h2>5 · ติดตามสถานะและเวลาทำงาน</h2>
      ${ts.length?`<div class="tablewrap"><table><thead><tr><th>งาน</th><th>สถานะ</th><th>อนุมัติ</th><th>ส่ง</th></tr></thead><tbody>${ts.map(t=>`<tr class="clickable" data-act="openTask" data-id="${t.id}"><td>${esc(BRIEFS.find(b=>b[0]===t.briefKey)?.[1]||t.title)}</td><td>${TST_N[t.status]}</td><td>${apprBadge(t)}</td><td class="${overdue(t)?"num":""}" style="${overdue(t)?"color:var(--chili)":""}">${thDate(t.due)||"-"}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">ยังไม่มีงานจาก Launch นี้</div>`}
      <div class="timeline" style="margin-top:12px">
        <div><span>เริ่ม Launch</span><span>${thDT(l.createdAt)}</span><b>0</b></div>
        <div><span>ข้อมูลพร้อม</span><span>${thDT(l.t?.ready)||"-"}</span><b>${fmtMin(tm.toReady)}</b></div>
        <div><span>บรีฟครบ 7 ชุด</span><span>${thDT(l.t?.briefed)||"-"}</span><b>${fmtMin(tm.toBrief)}</b></div>
        <div><span>ส่งเข้าบอร์ด</span><span>${thDT(l.t?.sent)||"-"}</span><b>${fmtMin(tm.toSent)}</b></div>
        <div><span>ทุกงานพร้อมเผยแพร่</span><span>${thDT(tm.doneAt)||"-"}</span><b>${fmtMin(tm.toDone)}</b></div></div>
      <div class="row" style="margin-top:12px;align-items:flex-end">${fld("เวลาที่เคยใช้แบบเดิม: สินค้าเข้า → ส่งบรีฟครบ (นาที)","baseMin",l.baselineMin??"","number","min='0'")}<button class="btn sm" data-act="saveBase" data-id="${l.id}">บันทึก</button></div>
      ${l.baselineMin!=null&&tm.toSent!=null?`<div class="note ${tm.toSent<l.baselineMin?"":"warn"}" style="margin-top:8px">ก่อน: ${fmtMin(l.baselineMin)} · หลัง: ${fmtMin(tm.toSent)} · ${tm.toSent<l.baselineMin?"เร็วขึ้น "+Math.round((1-tm.toSent/l.baselineMin)*100)+"%":"ยังไม่เร็วกว่าเดิม"} (วัดจากเวลาบันทึกจริงในระบบ)</div>`:`<div class="cnt" style="margin-top:6px">กรอกเวลาเดิมจากการจับเวลาจริง เพื่อเทียบก่อน–หลัง ระบบไม่ประมาณค่าให้</div>`}
    </div></div>`}
const taskIdFor=(l,k)=>"L-"+l.id+"-"+k;
ACT.launchBack=()=>{S.ui.launch=null;forceRender()};
ACT.delLaunch=el=>openDlg({title:"ลบ Launch นี้?",body:`<p>ลบเฉพาะร่างบรีฟของ Launch นี้ งานที่ส่งเข้าบอร์ดแล้วและข้อมูลสินค้ายังอยู่</p>`,foot:["|",{label:"ยกเลิก"},{label:"ลบ Launch",cls:"danger",act:async()=>{await dbDel(COL.launches,el.dataset.id);S.ui.launch=null;toast("ลบ Launch แล้ว")}}]});
ACT.verify=async el=>{const p=S.products.find(x=>x.id===el.dataset.id);try{await dbUpd(COL.products,p.id,{verify:{...(p.verify||{}),[el.dataset.k]:{by:S.me?.id||null,at:nowISO()}}});toast("ยืนยันแล้ว")}catch(e){toast(dbErr(e))}};
ACT.saveBase=async el=>{try{await dbUpd(COL.launches,el.dataset.id,{baselineMin:N(V("baseMin"))});toast("บันทึกเวลาเดิมแล้ว")}catch(e){toast(dbErr(e))}};
function briefBox(l,[k,n]){const b=l["brief_"+k];const t=S.tasks.find(x=>x.id===taskIdFor(l,k));
  if(!b)return`<details class="brief"><summary>${n}<span class="st">ยังไม่สร้าง</span></summary></details>`;
  return`<details class="brief" ${b.pending?"open":""}><summary>${n}<span class="st ${b.src==="ai"?"info":""}">${b.src==="ai"?"AI":"เทมเพลต"} · ${thDT(b.genAt)}</span>${b.editedAt?`<span class="st ok">ทีมแก้แล้ว</span>`:""}${t?`<span class="st ok">ส่งเข้าบอร์ดแล้ว</span>`:""}${b.pending?`<span class="st warn">มีเวอร์ชันใหม่รอเลือก</span>`:""}</summary>
  <div class="bbody">${b.pending?`<div class="note warn"><b>เวอร์ชันใหม่ (${b.pending.src==="ai"?"AI":"เทมเพลต"} · ${thDT(b.pending.genAt)})</b> ไม่ได้เขียนทับเพราะ${t?"บรีฟนี้ส่งเข้าบอร์ดแล้ว":"ทีมแก้ไขแล้ว"}<pre style="white-space:pre-wrap;font-family:var(--body);font-size:13px;max-height:200px;overflow:auto">${esc(b.pending.text)}</pre><div class="row"><button class="btn sm" data-act="briefPending" data-id="${l.id}" data-k="${k}" data-do="use">ใช้เวอร์ชันใหม่</button><button class="btn sm" data-act="briefPending" data-id="${l.id}" data-k="${k}" data-do="drop">ทิ้ง</button></div>${t?`<div class="cnt">ใช้เวอร์ชันใหม่จะเปลี่ยนเฉพาะร่างใน Launch งานในบอร์ดไม่ถูกแก้</div>`:""}</div>`:""}
    <textarea id="bt_${k}" aria-label="${esc(n)}">${esc(b.text)}</textarea>
    <div class="row"><button class="btn sm primary" data-act="saveBrief" data-id="${l.id}" data-k="${k}">บันทึกการแก้ไข</button><button class="btn sm" data-act="copyBrief" data-k="${k}">คัดลอก</button><span class="cnt">${b.editedAt?`แก้ล่าสุดโดย ${esc(who(b.editedBy))} ${thDT(b.editedAt)}`:"ยังไม่มีการแก้ไข"}</span></div></div></details>`}
ACT.copyBrief=el=>copyText($("#bt_"+el.dataset.k).value);
ACT.saveBrief=async el=>{const l=S.launches.find(x=>x.id===el.dataset.id),k=el.dataset.k,cur=l["brief_"+k];const text=$("#bt_"+k).value;
  try{const fresh=await dbExists(COL.launches,l.id);const fb=fresh?.["brief_"+k];if((fb?.editedAt||fb?.genAt)!==(cur?.editedAt||cur?.genAt))throw{code:"conflict"};
    await dbUpd(COL.launches,l.id,{["brief_"+k]:{...cur,text,editedAt:nowISO(),editedBy:S.me?.id||null}});document.activeElement?.blur();toast("บันทึกบรีฟแล้ว")}catch(e){toast(dbErr(e))}};
ACT.briefPending=async el=>{const l=S.launches.find(x=>x.id===el.dataset.id),k=el.dataset.k,b=l["brief_"+k];if(!b?.pending)return;
  const nb=el.dataset.do==="use"?{text:b.pending.text,src:b.pending.src,genAt:b.pending.genAt,prevText:b.text}:{...b};delete nb.pending;
  try{await dbUpd(COL.launches,l.id,{["brief_"+k]:nb});toast(el.dataset.do==="use"?"ใช้เวอร์ชันใหม่แล้ว":"ทิ้งเวอร์ชันใหม่แล้ว")}catch(e){toast(dbErr(e))}};
ACT.genBriefs=async el=>{const l=S.launches.find(x=>x.id===el.dataset.id),p=S.products.find(x=>x.id===l.productId);const mode=el.dataset.mode;
  const st=$("#genStatus");let texts;
  if(mode==="template")texts=tplBriefs(p);
  else{if(!sample)return;st.innerHTML=`<div class="thinking" style="margin-bottom:10px"><div class="spin"></div>Claude กำลังเขียนบรีฟ 7 ชุด… (ประมาณ 30–90 วินาที)</div>`;$$("[data-act=genBriefs]").forEach(b=>b.disabled=true);
    try{texts=await aiBriefs(p)}catch(e){st.innerHTML=`<div class="note bad" style="margin-bottom:10px">${esc(aiErr(e))} — ไม่มีการเปลี่ยนแปลงบรีฟ</div>`;$$("[data-act=genBriefs]").forEach(b=>b.disabled=false);return}}
  const patch={},t=nowISO();let kept=0,made=0;
  for(const[k]of BRIEFS){const txt=texts[k];if(!txt)continue;const cur=l["brief_"+k];const nb={text:txt,src:mode,genAt:t,fromProductAt:p.updatedAt||null};
    if(cur&&(cur.editedAt||S.tasks.some(x=>x.id===taskIdFor(l,k)))){patch["brief_"+k]={...cur,pending:nb};kept++}else{patch["brief_"+k]=nb;made++}}
  if(!l.t?.briefed&&BRIEFS.every(([k])=>patch["brief_"+k]||l["brief_"+k]))patch.t={...(l.t||{}),briefed:t};
  try{await dbUpd(COL.launches,l.id,patch);st.innerHTML=`<div class="note" style="margin-bottom:10px">สร้างใหม่ ${made} ชุด${kept?` · เก็บเป็นเวอร์ชันรอเลือก ${kept} ชุด (ไม่เขียนทับงานที่ทีมแก้/ส่งแล้ว)`:""}</div>`}catch(e){st.innerHTML=`<div class="note bad">${esc(dbErr(e))}</div>`}
  $$("[data-act=genBriefs]").forEach(b=>b.disabled=false)};
ACT.sendBriefs=async el=>{const l=S.launches.find(x=>x.id===el.dataset.id),p=S.products.find(x=>x.id===l.productId);if(!launchReady(p)){toast("ข้อมูลสินค้ายังไม่พร้อม");return}
  const keys=$$(".sendk:checked").map(i=>i.value);if(!keys.length){toast("เลือกบรีฟอย่างน้อย 1 ชุด");return}
  el.disabled=true;let made=0,skip=0;const as=V("sendAs"),due=V("sendDue");
  for(const k of keys){const b=BRIEFS.find(x=>x[0]===k),id=taskIdFor(l,k);
    try{if(await dbExists(COL.tasks,id)){skip++;continue}
      await dbSetNew(COL.tasks,id,{title:`${b[1]} — ${p.name}`,kind:b[2],segment:b[3],productId:p.id,launchId:l.id,briefKey:k,body:l["brief_"+k].text,assignee:as,due,status:"todo",rev:0,attachments:[],statusLog:[{s:"todo",at:nowISO(),by:S.me?.id||null,note:"จาก Launch Studio"}]});made++}catch(e){toast(dbErr(e))}}
  if(made&&!l.t?.sent)await dbUpd(COL.launches,l.id,{t:{...(l.t||{}),sent:nowISO()}}).catch(()=>{});
  toast(`ส่งเข้าบอร์ด ${made} งาน${skip?` · ข้าม ${skip} งานที่มีอยู่แล้ว`:""}`);el.disabled=false};

// ---------- brief templates (no AI) ----------
function tplBriefs(p){const v=(x,l)=>isBlank(x)?`[ต้องกรอก: ${l}]`:x;const price=p.price==null?"[ต้องยืนยัน: ราคา]":baht(p.price);const pB=p.priceB2B==null?"[ต้องยืนยัน: ราคา B2B]":baht(p.priceB2B);
  const ver=k=>p.verify?.[k]?"":" (ยังไม่ยืนยัน)";const brand=S.brand?.name||"Delish Foods";const tags=S.brand?.tags||"#DelishFoods";
  const head=`สินค้า: ${p.name} | SKU: ${v(p.sku,"SKU")} | หน่วยขาย: ${v(p.unit,"หน่วยขาย")}\nแหล่งผลิต: ${v(p.origin,"แหล่งผลิต")} | รอบส่ง: ${v(p.round,"รอบส่ง")}\nจุดขาย${ver("usp")}: ${v(p.usp,"จุดขาย")}\nวิธีใช้: ${v(p.usage,"วิธีใช้")}\n`;
  return{
  b2b:`${head}\nกลุ่มเป้าหมาย: เชฟ ฝ่ายจัดซื้อ โรงแรม ร้านอาหาร คาเฟ่ Catering\nเป้าหมาย: นัดส่งตัวอย่าง / ขอใบเสนอราคา\nข้อความหลัก: วัตถุดิบคุณภาพสม่ำเสมอจาก ${v(p.origin,"แหล่งผลิต")} ส่งตามรอบ ${v(p.round,"รอบส่ง")}\nประเด็นที่ต้องสื่อ:\n- คุณภาพและความสม่ำเสมอของล็อต\n- การนำไปใช้ในเมนู: ${v(p.usage,"วิธีใช้")}\n- ราคา B2B${ver("price")}: ${pB} / ${v(p.unit,"หน่วย")} (ระบุ \"สอบถามราคาตามปริมาณ\" หากยังไม่ยืนยัน)\n- สต๊อกพร้อมส่ง${ver("stock")}: ${p.stock==null?"[ต้องยืนยัน]":fmtN(p.stock)}\nช่องทาง: LINE OA สำหรับลูกค้าธุรกิจ, อีเมลถึงเชฟ, LinkedIn/Facebook Page\nCTA: ขอตัวอย่างสินค้า / ทักแอดมินฝ่ายขาย B2B\nสิ่งที่ต้องแนบ: ภาพสินค้าจริงในครัวมืออาชีพ, ใบสเปก`,
  b2c:`${head}\nกลุ่มเป้าหมาย: ผู้บริโภคที่ใส่ใจสุขภาพ ชอบทำอาหาร และลูกค้าหน้าร้าน\nเป้าหมาย: สร้างการรับรู้และกระตุ้นซื้อ\nมุมเล่าเรื่อง:\n1) จากฟาร์ม ${v(p.origin,"แหล่งผลิต")} ถึงจาน\n2) เมนูง่ายที่บ้าน: ${v(p.usage,"วิธีใช้")}\n3) รีวิวสัมผัส/รสชาติจากทีมงาน (ใช้คำบรรยายจริง ไม่อ้างสรรพคุณทางยา)\nราคา${ver("price")}: ${price} / ${v(p.unit,"หน่วย")}\nช่องทาง: Facebook, Instagram, TikTok, LINE OA\nCTA: สั่งผ่าน LINE / ซื้อที่หน้าร้าน\nแฮชแท็ก: ${tags}\nข้อห้าม: ${S.brand?.ban||"ห้ามอ้างสรรพคุณรักษาโรค"}`,
  mkt:`ชื่อสินค้า (≤ 60 ตัวอักษร): ${p.name}${p.unit?" "+p.unit:""}${p.origin?" จาก"+p.origin:""} | ${brand}\nหมวดหมู่: [เลือกหมวด Shopee/Lazada/TikTok Shop]\nราคา${ver("price")}: ${price}\nสต๊อกที่ลงร้าน${ver("stock")}: ${p.stock==null?"[ต้องยืนยัน]":fmtN(p.stock)}\n\nรายละเอียดสินค้า:\n• ${v(p.usp,"จุดขาย")}\n• แหล่งผลิต: ${v(p.origin,"แหล่งผลิต")}\n• ขนาด/หน่วย: ${v(p.unit,"หน่วยขาย")}\n• วิธีใช้: ${v(p.usage,"วิธีใช้")}\n• การเก็บรักษา: [ต้องกรอก]\n• รอบจัดส่ง: ${v(p.round,"รอบส่ง")}\n\nรูปที่ต้องใช้: ภาพหลักพื้นขาว 1:1, ภาพขนาดเทียบมือ, ภาพเมนู, ภาพแพ็กเกจ\nคีย์เวิร์ดในชื่อ/รายละเอียด: [จากบรีฟ SEO]\nหมายเหตุ: ตรวจเงื่อนไขหมวดอาหารสดของแต่ละแพลตฟอร์มก่อนลง`,
  aw:`งาน: ชุดกราฟิกเปิดตัว ${p.name}\nขนาด: 1080×1080 (Feed), 1080×1350 (IG), 1080×1920 (Story/Reels cover), 1200×628 (Ads), ภาพสินค้าพื้นขาว 1:1 (Marketplace)\nข้อความบนภาพ:\n- หัวเรื่อง: ${p.name}\n- รอง: ${v(p.usp,"จุดขาย").split("\n")[0]}\n- ราคา${ver("price")}: ${price} (ใส่เมื่อยืนยันแล้วเท่านั้น)\nภาพที่ใช้: รูปสินค้าจริงจากทะเบียน${p.imageId?" (มีแล้ว)":" [ยังไม่มีรูป]"} + ภาพฟาร์ม ${v(p.origin,"แหล่งผลิต")}\nโทน: ตาม CI ${brand} สะอาด สดใหม่ เน้นวัตถุดิบ\nส่งงานที่: ระบบกราฟิก (incomparable-pavlova-5e34b3.netlify.app) แล้วแนบไฟล์กลับในงานนี้\nกำหนดส่ง: ${p.due?thDate(p.due):"[ต้องกรอก]"}`,
  video:`คลิปสั้น 30 วินาที (Reels/TikTok) — ${p.name}\n\nHook 3 วินาทีแรก (เลือก 1):\nA) "${p.name} ที่เชฟเลือกใช้ หน้าตาเป็นแบบนี้"\nB) "จากฟาร์ม ${v(p.origin,"แหล่งผลิต")} ถึงจานใน 1 วัน?" (ใช้เมื่อยืนยันรอบส่งแล้ว)\nC) "ลองแบบนี้กับ ${p.name}"\n\nสคริปต์:\n0–3s Hook + ภาพใกล้สินค้า\n3–10s ที่มา: ${v(p.origin,"แหล่งผลิต")}\n10–22s วิธีใช้: ${v(p.usage,"วิธีใช้")}\n22–27s จุดขาย: ${v(p.usp,"จุดขาย").split("\n")[0]}\n27–30s CTA: สั่งผ่าน LINE OA / ร้านค้าออนไลน์\n\nสตอรี่บอร์ด:\n1. Close-up สินค้าบนพื้นไม้ แสงธรรมชาติ\n2. มือหยิบสินค้าจากกล่อง/ฟาร์ม\n3. ขั้นตอนใช้งานในครัว 2–3 ช็อต\n4. จานเสร็จ มุมบน\n5. โลโก้ + CTA\n\nShot list:\n[ ] Close-up สินค้า 3 มุม\n[ ] B-roll ฟาร์ม/แพ็กสินค้า\n[ ] มือใช้งาน 3 ช็อต\n[ ] จานเสร็จ มุมบน + มุม 45°\n[ ] ภาพแนวตั้ง 9:16 ทั้งหมด`,
  seo:`คีย์เวิร์ดหลัก: [ตรวจจากข้อมูล Search Console ในเมนู SEO — ห้ามเดา Search Volume]\nคีย์เวิร์ดรอง: ${p.name}, ${p.name} ราคา, ${p.name} ซื้อที่ไหน, ${p.name} วิธีใช้\nหน้าเป้าหมาย: [URL หน้าสินค้า]\nMeta Title (≤ 60): ${p.name}${p.origin?" จาก"+p.origin:""} | ${brand}\nMeta Description (≤ 155): ${(v(p.usp,"จุดขาย").split("\n")[0]).slice(0,110)} สั่งออนไลน์ได้ที่ ${brand}\n\nAEO — คำถามที่ควรตอบในหน้า:\nQ: ${p.name} คืออะไร ใช้ทำอะไร\nQ: ${p.name} เก็บรักษาอย่างไร\nQ: ${p.name} ซื้อได้ที่ไหน ส่งรอบไหน\n\nGEO — ให้ AI search อ้างอิงได้:\n- ระบุข้อเท็จจริงที่ตรวจสอบได้ (แหล่งผลิต, หน่วยขาย, รอบส่ง) เป็นข้อความชัดเจน\n- ใส่ structured data (Product, FAQ)\n- อ้างอิงแหล่งที่มา: [ต้องกรอก]`,
  ads:`วัตถุประสงค์: [Awareness / Traffic / Sales]\nแพลตฟอร์ม: Meta (FB/IG), TikTok, Shopee Ads\nกลุ่มเป้าหมาย:\n- B2C: คนรักสุขภาพ ทำอาหารเอง อายุ 25–45 กรุงเทพฯ และปริมณฑล\n- B2B: Retarget ผู้เข้าชมหน้าธุรกิจ / Lookalike ลูกค้าร้านอาหาร\nข้อความโฆษณา: ${p.name} — ${v(p.usp,"จุดขาย").split("\n")[0]}\nราคาในโฆษณา${ver("price")}: ${price} (ห้ามใส่หากยังไม่ยืนยัน)\nงบที่เสนอ: [ต้องกรอก — รออนุมัติ]\nระยะเวลา: [วันเริ่ม–วันจบ]\nUTM: utm_source=[แพลตฟอร์ม]&utm_medium=paid&utm_campaign=launch-${(p.sku||p.name).toString().toLowerCase().replace(/\s+/g,"-")}\nKPI: CPC, CPL, ROAS (แยกยอดตามแพลตฟอร์ม กับยอดที่การเงินตรวจรับรอง)\nหมายเหตุ: ระบบไม่ยิงแอดเอง ต้องตั้งค่าใน Ads Manager และขออนุมัติงบตามขั้นตอน`}}
async function aiBriefs(p){const data={ชื่อ:p.name,SKU:p.sku||null,หน่วยขาย:p.unit||null,แหล่งผลิต:p.origin||null,จุดขาย:p.usp||null,ยืนยันจุดขาย:!!p.verify?.usp,วิธีใช้:p.usage||null,ราคา:p.price,ยืนยันราคา:!!p.verify?.price,ราคาB2B:p.priceB2B??null,สต๊อก:p.stock,ยืนยันสต๊อก:!!p.verify?.stock,รอบส่ง:p.round||null,กำหนดส่ง:p.due||null};
  const prompt=`คุณคือหัวหน้าทีมการตลาดของ ${S.brand?.name||"Delish Foods"} บริษัทจำหน่ายผักผลไม้พรีเมียม วัตถุดิบหายาก สมุนไพร ไมโครกรีน ดอกไม้กินได้ และสินค้าจากฟาร์มในไทย ลูกค้า: B2B (โรงแรม ร้านอาหาร คาเฟ่ Catering), B2C (ผู้บริโภค หน้าร้าน), B2M (Shopee, Lazada, TikTok Shop)
น้ำเสียงแบรนด์: ${S.brand?.voice||"อบอุ่น จริงใจ"} | คำห้ามใช้: ${S.brand?.ban||"-"} | แฮชแท็ก: ${S.brand?.tags||"-"}
ข้อมูลสินค้า (JSON, null = ไม่มีข้อมูล): ${JSON.stringify(data)}
กฎสำคัญ: ใช้เฉพาะข้อมูลข้างบน ห้ามแต่งราคา สต๊อก ใบรับรอง สรรพคุณทางยา ยอดขาย Search Volume หรืออันดับ ถ้าข้อมูลเป็น null หรือยังไม่ยืนยัน ให้เขียน [ต้องยืนยัน: ...] แทน เขียนภาษาไทย เป็นข้อความธรรมดา (ไม่ใช้ markdown) พร้อมใช้งาน
สร้างบรีฟ 7 ชุด ตอบเป็น JSON เท่านั้น: {"b2b":"บรีฟคอนเทนต์ B2B (กลุ่มเป้าหมาย ข้อความหลัก ประเด็น ช่องทาง CTA)","b2c":"บรีฟคอนเทนต์ B2C พร้อมตัวอย่างแคปชัน 2 แบบ","mkt":"ชื่อสินค้า ≤60 ตัวอักษร + รายละเอียดสินค้า Marketplace แบบ bullet","aw":"บรีฟกราฟิก: ขนาด ข้อความบนภาพ ภาพที่ใช้ โทน","video":"Hook 3 แบบ สคริปต์ 30 วินาทีแบ่งช่วงเวลา สตอรี่บอร์ด และ shot list","seo":"บรีฟ SEO/AEO/GEO: คีย์เวิร์ดที่ควรตรวจ (ไม่ใส่ตัวเลข volume) Meta Title ≤60 Meta Description ≤155 คำถาม-คำตอบ 3 ข้อ แนวทาง GEO","ads":"บรีฟโฆษณา: วัตถุประสงค์ แพลตฟอร์ม กลุ่มเป้าหมาย ข้อความ 2 แบบ UTM KPI (ไม่ระบุงบเป็นตัวเลขถ้าไม่มีข้อมูล)"}`;
  const r=await sample.json(prompt,{modelTier:"default"});const out={};for(const[k]of BRIEFS)if(typeof r?.[k]==="string"&&r[k].trim())out[k]=r[k].trim();return out}

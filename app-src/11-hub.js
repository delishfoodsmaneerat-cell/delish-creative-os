
// ================= MARKETING HUB MODULES (merged from Apps Script preview) =================
// Content Planner · Performance · Idea Vault · Team — real data only; the preview's mock rows are not imported.
const STAGES=[["idea","Idea"],["scripting","Scripting"],["producing","Producing"],["scheduled","Scheduled"],["published","Published"]];
const STAGE_N=Object.fromEntries(STAGES);
const STAGE_C={idea:"var(--line)",scripting:"var(--mango)",producing:"var(--sky)",scheduled:"var(--plum)",published:"var(--accent)"};
const stageFromStatus=s=>s==="posted"?"published":s==="scheduled"?"scheduled":"idea";
const statusFromStage=(stg,cur)=>stg==="published"?"posted":stg==="scheduled"?"scheduled":"draft";
const stageOf=p=>p.stage||stageFromStatus(p.status);
const PILLARS=["เมนู/สูตรอาหาร","สินค้า/วัตถุดิบ","โปรโมชัน","เบื้องหลังฟาร์ม","สุขภาพ/ความรู้","B2B/เชฟ"];
const GOALS={awareness:"Awareness",engagement:"Engagement",traffic:"Traffic",sales:"Sales",trust:"Trust",leads:"Leads (B2B)"};
const stagePill=k=>`<span class="ch" style="--c:${STAGE_C[k]||"var(--muted)"}">${STAGE_N[k]||k}</span>`;
S.team=[];S.ideas=[];S.followers=[];S.fgoals=[];
COL.team="team";COL.ideas="ideas";COL.followers="followers";COL.fgoals="follower_goals";

ACT.aiHook=async()=>{if(!sample)return;const out=$("#hookOut");const topic=V("pHook")||V("pCap").slice(0,120);if(!topic){toast("ใส่หัวข้อก่อน");return}
  out.innerHTML=`<div class="thinking"><div class="spin"></div>กำลังคิด Hook…</div>`;
  try{const r=await sample.json(`คิด Hook ภาษาไทย 5 แบบ สำหรับโพสต์ ${CH[V("pCh")]?.n||""} ของ ${S.brand?.name||"Delish Foods"} (ผักผลไม้พรีเมียม วัตถุดิบหายาก ไมโครกรีน ดอกไม้กินได้) หัวข้อ: ${topic}
Pillar: ${V("pPillar")||"-"} เป้าหมาย: ${GOALS[V("pGoal")]||"-"} · สั้นไม่เกิน 60 ตัวอักษร ห้ามอ้างสรรพคุณทางยา ห้ามแต่งตัวเลข/ราคา · ตอบ JSON: {"hooks":["..."]}`,{modelTier:"quick",cache:false});
    const hs=(r?.hooks||[]).filter(x=>typeof x==="string").slice(0,5);out.innerHTML=hs.length?`<div class="chips">${hs.map(h=>`<button type="button" class="btn sm" data-act="useHook">${esc(h)}</button>`).join("")}</div>`:`<div class="cnt">ไม่มีผลลัพธ์</div>`}
  catch(e){out.innerHTML=`<div class="note bad">${esc(aiErr(e))}</div>`}};
ACT.useHook=el=>{$("#pHook").value=el.textContent;$("#hookOut").innerHTML=""};

// ---------- CONTENT PLANNER ----------
VIEWS.planner=()=>{const f=S.ui.pf||(S.ui.pf={});let rows=S.posts.filter(p=>(!f.stage||stageOf(p)===f.stage)&&(!f.ch||p.channel===f.ch)&&(!f.pillar||p.pillar===f.pillar)&&(!f.owner||p.owner===f.owner));
  rows.sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"));const pillars=[...new Set([...PILLARS,...S.posts.map(p=>p.pillar).filter(Boolean)])];const owners=[...new Set(S.posts.map(p=>p.owner).filter(Boolean))];
  const cnt=k=>S.posts.filter(p=>stageOf(p)===k).length;
  $("#v-planner").innerHTML=`<div class="vhead"><div><h1>Content Planner</h1><p>${S.posts.length} คอนเทนต์ · คลิกที่ขั้นตอนเพื่อเลื่อนไปขั้นถัดไป · ข้อมูลชุดเดียวกับปฏิทินและ AI คอนเทนต์</p></div><button class="btn primary" data-act="newPost" data-d="">＋ เพิ่มคอนเทนต์</button></div>
  <div class="panel"><div style="display:flex;height:12px;border-radius:6px;overflow:hidden;background:var(--sunk)">${STAGES.map(([k])=>cnt(k)?`<div style="flex:${cnt(k)};background:${STAGE_C[k]}"></div>`:"").join("")}</div>
    <div class="row" style="margin-top:10px">${STAGES.map(([k,n])=>`<button class="btn sm ${f.stage===k?"primary":""}" data-act="pfStage" data-k="${k}">${n} <b>${cnt(k)}</b></button>`).join("")}${f.stage?`<button class="btn sm ghost" data-act="pfStage" data-k="">ล้างตัวกรอง</button>`:""}</div></div>
  <div class="row"><select data-chg="pf" data-k="ch" style="width:auto"><option value="">ทุกแพลตฟอร์ม</option>${opt(CH,f.ch)}</select><select data-chg="pf" data-k="pillar" style="width:auto"><option value="">ทุก Pillar</option>${pillars.map(x=>`<option ${x===f.pillar?"selected":""}>${esc(x)}</option>`).join("")}</select><select data-chg="pf" data-k="owner" style="width:auto"><option value="">ทุกคน</option>${owners.map(x=>`<option ${x===f.owner?"selected":""}>${esc(x)}</option>`).join("")}</select><span class="spacer"></span><span class="cnt">แสดง ${rows.length} จาก ${S.posts.length}</span></div>
  <div class="panel" style="padding:0"><div class="tablewrap"><table><thead><tr><th>หัวข้อ / Hook</th><th>Pillar</th><th>แพลตฟอร์ม</th><th>เป้าหมาย</th><th>วันโพสต์</th><th>ผู้รับผิดชอบ</th><th>ขั้นตอน</th><th class="r">Reach</th></tr></thead><tbody>
  ${rows.map(p=>`<tr><td style="max-width:300px"><a href="#" data-act="editPost" data-id="${p.id}"><b>${esc(p.hook||String(p.caption||"").slice(0,60)||"(ไม่มีหัวข้อ)")}</b></a>${p.example?'<span class="ex">ตัวอย่าง</span>':""}<div class="cnt">${esc(p.source||"")}</div></td><td>${p.pillar?`<span class="tag">${esc(p.pillar)}</span>`:"-"}</td><td>${chip(p.channel)}</td><td class="cnt">${esc(GOALS[p.goal]||"-")}</td><td class="num">${p.date?thDate(p.date):"-"}</td><td>${esc(p.owner||"-")}</td>
    <td><button class="btn ghost sm" data-act="nextStage" data-id="${p.id}" title="เลื่อนไปขั้นถัดไป">${stagePill(stageOf(p))} ›</button></td><td class="r num">${fmtN(N(p.reach))}</td></tr>`).join("")||`<tr><td colspan="8"><div class="empty">ยังไม่มีคอนเทนต์ตามตัวกรอง</div></td></tr>`}</tbody></table></div></div>`};
ACT.pf=el=>{S.ui.pf[el.dataset.k]=el.value;forceRender()};ACT.pfStage=el=>{S.ui.pf.stage=el.dataset.k;forceRender()};
ACT.nextStage=async el=>{const p=S.posts.find(x=>x.id===el.dataset.id);const i=STAGES.findIndex(s=>s[0]===stageOf(p));const nx=STAGES[(i+1)%STAGES.length][0];
  if(nx==="scheduled"&&!p.date){toast("ใส่วันโพสต์ก่อนจึงตั้งเวลาได้");openPost(p);return}
  try{await dbUpd(COL.posts,p.id,{stage:nx,status:statusFromStage(nx)});toast("ย้ายไป "+STAGE_N[nx])}catch(e){toast(dbErr(e))}};

// ---------- PERFORMANCE ----------
const FPLAT=["facebook","instagram","tiktok","youtube","line"];
VIEWS.perf=()=>{const months=[...new Set(S.followers.map(r=>r.month))].sort().slice(-6);
  const byM=months.map(m=>{const rs=S.followers.filter(r=>r.month===m);const a=agg(rs,"followers");return{m,sum:a.sum,n:a.n,miss:FPLAT.length-rs.filter(r=>r.followers!=null).length}});const mx=Math.max(1,...byM.map(x=>x.sum||0));
  const latest=p=>S.followers.filter(r=>r.platform===p&&r.followers!=null).sort((a,b)=>b.month.localeCompare(a.month))[0];
  const goals=FPLAT.map(p=>({p,g:S.fgoals.find(x=>x.platform===p),l:latest(p)})).filter(x=>x.g||x.l);
  const reach=FPLAT.concat(["shopee"]).map(p=>{const a=agg(S.posts.filter(x=>x.channel===p),"reach");return{p,...a}}).filter(x=>x.n);const rmx=Math.max(1,...reach.map(x=>x.sum||0));
  const top=S.posts.filter(p=>N(p.reach)!=null).sort((a,b)=>N(b.reach)-N(a.reach)).slice(0,5);
  $("#v-perf").innerHTML=`<div class="vhead"><div><h1>Performance</h1><p>การเติบโตของผู้ติดตามทุกช่องทาง เทียบเป้ากับผลจริง และคอนเทนต์ที่ทำ Reach ได้ดีที่สุด</p></div><div class="row"><button class="btn" data-act="editGoals">ตั้งเป้าผู้ติดตาม</button><button class="btn primary" data-act="addFollowers">＋ บันทึกยอดผู้ติดตาม</button></div></div>
  <div class="note">ยอดผู้ติดตามและ Reach กรอกจากหน้า Insights ของแต่ละแพลตฟอร์ม (ยังไม่ได้เชื่อม API) ช่องที่ไม่กรอกไม่นับเป็น 0</div>
  <div class="g2"><div class="panel"><h2>ผู้ติดตามรวม · ${months.length||0} เดือนล่าสุด</h2>${byM.length?`<div class="vbars">${byM.map(x=>`<div class="vgrp" title="${thMonth(x.m)}: ${fmtN(x.sum)}${x.miss?` (ไม่มีข้อมูล ${x.miss} ช่องทาง)`:""}"><div class="pair"><div class="rev" style="height:${(x.sum||0)/mx*100}%;width:min(34px,70%)"></div></div></div>`).join("")}</div><div class="vlabels">${byM.map(x=>`<span>${TH_M[+x.m.slice(5)-1].slice(0,3)}<br><b class="num">${fmtK(x.sum)}</b>${x.miss?`<br><span style="color:var(--mango)">ขาด ${x.miss}</span>`:""}</span>`).join("")}</div>`:`<div class="empty">ยังไม่มียอดผู้ติดตาม กด “บันทึกยอดผู้ติดตาม”</div>`}</div>
    <div class="panel"><h2>เป้าผู้ติดตาม vs ผลจริง</h2>${goals.length?`<div class="bars">${goals.map(({p,g,l})=>{const pc=g&&l?l.followers/g.target*100:null;return`<div><div class="row" style="justify-content:space-between;font-size:13px"><span>${chip(p)}</span><span class="num">${l?fmtN(l.followers):"–"} / ${g?fmtN(g.target):"ยังไม่ตั้งเป้า"} ${pc!=null?`<b style="color:${pc>=90?"var(--accent)":"var(--mango)"}">(${Math.round(pc)}%)</b>`:""}</span></div><div class="track" style="height:10px;background:var(--sunk);border-radius:5px;overflow:hidden;margin-top:4px"><div style="height:100%;width:${Math.min(pc||0,100)}%;background:${pc>=90?"var(--accent)":"var(--mango)"}"></div></div><div class="cnt">${l?"ข้อมูลเดือน "+thMonth(l.month):""}${g?.deadline?" · เป้าภายใน "+thDate(g.deadline):""}</div></div>`}).join("")}</div>`:`<div class="empty">ยังไม่มีเป้าหรือยอดผู้ติดตาม</div>`}</div></div>
  <div class="g2"><div class="panel"><h2>Reach แยกตามแพลตฟอร์ม (จากคอนเทนต์ที่กรอก Reach)</h2>${reach.length?`<div class="bars">${reach.sort((a,b)=>b.sum-a.sum).map(x=>`<div class="bar"><span class="lab">${CH[x.p]?.n||x.p}</span><div class="track"><div class="fill" style="width:${x.sum/rmx*100}%"></div></div><span class="v">${fmtK(x.sum)}</span></div>`).join("")}</div>`:`<div class="empty">ยังไม่มีคอนเทนต์ที่กรอก Reach</div>`}</div>
    <div class="panel"><h2>คอนเทนต์ที่ทำ Reach สูงสุด</h2>${top.length?`<table><thead><tr><th>#</th><th>หัวข้อ</th><th>แพลตฟอร์ม</th><th class="r">Reach</th></tr></thead><tbody>${top.map((p,i)=>`<tr class="clickable" data-act="editPost" data-id="${p.id}"><td class="num">${i+1}</td><td>${esc(p.hook||String(p.caption||"").slice(0,50))}${p.pillar?` <span class="tag">${esc(p.pillar)}</span>`:""}</td><td>${chip(p.channel)}</td><td class="r num">${fmtN(N(p.reach))}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">ยังไม่มีข้อมูล</div>`}</div></div>`};
ACT.addFollowers=()=>{const m0=today().slice(0,7);openDlg({title:"บันทึกยอดผู้ติดตาม",body:`${fld("เดือน","flM",m0,"month")}<div class="cnt">ใส่เฉพาะช่องทางที่ดูยอดมาแล้ว ช่องว่าง = ไม่บันทึก</div>${FPLAT.map(p=>{const ex=S.followers.find(r=>r.platform===p&&r.month===m0);return fld(CH[p].n,"fl_"+p,ex?.followers??"","number","min='0'")}).join("")}${fld("แหล่งข้อมูล","flSrc","Insights ของแต่ละแพลตฟอร์ม")}`,
  foot:["|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{const m=V("flM");if(!m)return false;let n=0;for(const p of FPLAT){const v=N(V("fl_"+p));if(v==null)continue;const id=p+"-"+m;
    const ex=S.followers.find(r=>r.id===id);if(ex)await dbUpd(COL.followers,id,{followers:v,source:V("flSrc")});else await dbSetNew(COL.followers,id,{platform:p,month:m,followers:v,source:V("flSrc")});n++}toast(`บันทึก ${n} ช่องทาง`)}}]})};
ACT.editGoals=()=>openDlg({title:"เป้าผู้ติดตาม",body:FPLAT.map(p=>{const g=S.fgoals.find(x=>x.platform===p);return`<div class="row">${fld(CH[p].n+" — เป้า","fg_"+p,g?.target??"","number","min='0'")}${fld("ภายในวันที่","fgd_"+p,g?.deadline||"","date")}</div>`}).join(""),
  foot:["|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{for(const p of FPLAT){const t=N(V("fg_"+p));const g=S.fgoals.find(x=>x.platform===p);if(t==null){if(g)await dbDel(COL.fgoals,g.id);continue}
    if(g)await dbUpd(COL.fgoals,g.id,{target:t,deadline:V("fgd_"+p)});else await dbSetNew(COL.fgoals,p,{platform:p,target:t,deadline:V("fgd_"+p)})}toast("บันทึกเป้าแล้ว")}}]});

// ---------- IDEA VAULT ----------
VIEWS.ideas=()=>{const q=S.ui.iq||"";const list=S.ideas.slice().sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
  $("#v-ideas").innerHTML=`<div class="vhead"><div><h1>Idea Vault</h1><p>เก็บทุกไอเดียก่อนลืม แล้วส่งไปวางแผนใน Content Planner ได้ในคลิกเดียว</p></div></div>
  <form class="panel row" id="ideaForm"><input type="text" id="idT" placeholder="พิมพ์ไอเดียคอนเทนต์ใหม่…" style="flex:2 1 260px"><input type="text" id="idP" list="pillarList2" placeholder="Pillar" style="flex:1 1 140px"><datalist id="pillarList2">${PILLARS.map(x=>`<option value="${esc(x)}">`).join("")}</datalist><input type="text" id="idN" placeholder="โน้ต (ถ้ามี)" style="flex:2 1 200px"><button class="btn primary" type="submit">＋ เพิ่ม</button></form>
  <div class="g3">${list.map(x=>{const used=x.usedPostId&&S.posts.find(p=>p.id===x.usedPostId);return`<div class="panel" style="display:flex;flex-direction:column;gap:8px"><div class="row">${x.pillar?`<span class="tag">${esc(x.pillar)}</span>`:""}${used?`<span class="st ok">วางแผนแล้ว</span>`:""}<span class="spacer"></span><button class="btn ghost sm" data-act="delIdea" data-id="${x.id}" aria-label="ลบไอเดีย">✕</button></div>
    <b style="font-size:15px;line-height:1.4">${esc(x.title)}</b>${x.note?`<div class="cnt">${esc(x.note)}</div>`:""}<div class="cnt">${esc(who(x.createdBy))} · ${thDT(x.createdAt)}</div>
    ${used?`<a href="#" data-act="editPost" data-id="${used.id}" class="cnt">เปิดคอนเทนต์ (${STAGE_N[stageOf(used)]})</a>`:`<button class="btn sm" data-act="ideaPlan" data-id="${x.id}">→ ส่งไปวางแผน</button>`}</div>`}).join("")||`<div class="empty" style="grid-column:1/-1">ยังไม่มีไอเดีย</div>`}</div>`;
  $("#ideaForm").onsubmit=async e=>{e.preventDefault();const t=V("idT");if(!t)return;if(S.ideas.some(i=>i.title.trim().toLowerCase()===t.toLowerCase())){toast("มีไอเดียนี้แล้ว");return}
    try{await dbAdd(COL.ideas,{title:t,pillar:V("idP"),note:V("idN")});$("#idT").value="";$("#idN").value="";toast("เพิ่มไอเดียแล้ว")}catch(err){toast(dbErr(err))}}};
ACT.delIdea=el=>openDlg({title:"ลบไอเดียนี้?",body:`<p>${esc(S.ideas.find(i=>i.id===el.dataset.id)?.title)}</p>`,foot:["|",{label:"ยกเลิก"},{label:"ลบ",cls:"danger",act:async()=>{await dbDel(COL.ideas,el.dataset.id);toast("ลบแล้ว")}}]});
ACT.ideaPlan=async el=>{const x=S.ideas.find(i=>i.id===el.dataset.id);if(!x||x.usedPostId)return;
  try{const r=await dbAdd(COL.posts,{hook:x.title,caption:x.note||"",pillar:x.pillar||"",stage:"idea",status:"draft",channel:"facebook",goal:"engagement",date:"",time:"",source:"Idea Vault"});await dbUpd(COL.ideas,x.id,{usedPostId:r.id});toast("ส่งเข้า Content Planner แล้ว");S.ui.pf={};show("planner")}catch(e){toast(dbErr(e))}};

// ---------- TEAM ----------
const TACC={admin:"Admin (Editor ขึ้นไป)",editor:"Editor/Contributor",viewer:"Viewer"};
VIEWS.team=()=>{const t=today();const load=n=>{const ts=S.tasks.filter(x=>(x.assignee||"").trim()===n&&!DONE_ST.has(x.status));return{open:ts.length,late:ts.filter(x=>x.due&&x.due<t).length,posts:S.posts.filter(p=>p.owner===n&&stageOf(p)!=="published").length}};
  $("#v-team").innerHTML=`<div class="vhead"><div><h1>ทีม</h1><p>รายชื่อทีม บทบาท และภาระงานจริงจากบอร์ดงานและ Content Planner</p></div>${S.canEdit?`<button class="btn primary" data-act="editMember">＋ เพิ่มสมาชิก</button>`:""}</div>
  <div class="note"><b>สิทธิ์จริงกำหนดจาก${SHARE_WHERE}</b> (Viewer / Contributor / Editor) และตรวจที่ฐานข้อมูล ช่อง “สิทธิ์” ในรายชื่อนี้เป็นข้อมูลอ้างอิงของทีม ไม่ได้เปิดหรือปิดสิทธิ์ให้ใคร · ชื่อในรายชื่อต้องตรงกับช่อง “ผู้รับผิดชอบ” จึงนับภาระงานได้</div>
  <div class="kpis"><div class="kpi"><small>สมาชิก</small><b>${S.team.length}</b></div>${Object.entries(TACC).map(([k,v])=>`<div class="kpi"><small>${v}</small><b>${S.team.filter(m=>m.access===k).length}</b></div>`).join("")}</div>
  <div class="g3">${S.team.map(m=>{const l=load(m.name);return`<div class="panel" style="display:flex;flex-direction:column;gap:10px"><div class="row" style="flex-wrap:nowrap"><div style="width:44px;height:44px;border-radius:50%;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:700;flex:none">${esc((m.name||"?").slice(0,2).toUpperCase())}</div><div style="min-width:0;flex:1"><b>${esc(m.name)}</b><div class="cnt">${esc(m.role||"")}</div></div>${S.canEdit?`<button class="btn ghost sm" data-act="editMember" data-id="${m.id}">แก้ไข</button>`:""}</div>
    <div class="row"><span class="st ${m.access==="admin"?"ok":m.access==="viewer"?"":"info"}">${TACC[m.access]||"-"}</span><span class="cnt" style="margin-left:auto;word-break:break-all">${esc(m.email||"")}</span></div>
    <div class="row" style="font-size:13px"><span>งานเปิด <b>${l.open}</b></span><span style="color:${l.late?"var(--chili)":"inherit"}">เลยกำหนด <b>${l.late}</b></span><span>คอนเทนต์ค้าง <b>${l.posts}</b></span></div></div>`}).join("")||`<div class="empty" style="grid-column:1/-1">ยังไม่มีรายชื่อทีม${S.canEdit?" กด “＋ เพิ่มสมาชิก”":""}</div>`}</div>`};
ACT.editMember=el=>{const m=S.team.find(x=>x.id===el.dataset.id);openDlg({title:m?"แก้ไขสมาชิก":"เพิ่มสมาชิก",body:`<div class="row">${fld("ชื่อ (ใช้ตรงกับผู้รับผิดชอบ)","tmN",m?.name)}${fld("บทบาท","tmR",m?.role,"text","placeholder='เช่น Content Creator'")}</div><div class="row">${fld("อีเมล","tmE",m?.email)}${sel("สิทธิ์ (อ้างอิง)","tmA",TACC,m?.access||"editor")}</div>`,
  foot:[...(m?[{label:"ลบ",cls:"danger",confirm:"ยืนยันลบ?",act:async()=>{await dbDel(COL.team,m.id);toast("ลบแล้ว")}}]:[]),"|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{const name=V("tmN");if(!name){toast("ใส่ชื่อ");return false}
    if(S.team.some(x=>x.name===name&&x.id!==m?.id)){toast("มีชื่อนี้แล้ว");return false}const d={name,role:V("tmR"),email:V("tmE"),access:V("tmA")};
    if(m)await dbUpd(COL.team,m.id,d);else await dbAdd(COL.team,d);toast("บันทึกแล้ว")}}]})};

// ---------- Dashboard additions: content pipeline + reach by platform ----------
const _dashBase=VIEWS.dash;VIEWS.dash=()=>{_dashBase();const k=$("#v-dash .kpis");if(!k)return;const cnt=s=>S.posts.filter(p=>stageOf(p)===s).length;const tot=S.posts.length||1;
  const reach=FPLAT.concat(["shopee"]).map(p=>({p,...agg(S.posts.filter(x=>x.channel===p),"reach")})).filter(x=>x.n);const rmx=Math.max(1,...reach.map(x=>x.sum||0));
  k.insertAdjacentHTML("afterend",`<div class="g2"><div class="panel"><div class="ph"><h2>สถานะคอนเทนต์</h2><button class="btn sm" data-act="go" data-v="planner">Content Planner</button></div><div class="bars">${STAGES.map(([s,n])=>`<div class="bar"><span class="lab">${n}</span><div class="track"><div class="fill" style="width:${cnt(s)/tot*100}%;background:${STAGE_C[s]}"></div></div><span class="v">${cnt(s)}</span></div>`).join("")}</div></div>
    <div class="panel"><div class="ph"><h2>Reach แยกตามแพลตฟอร์ม</h2><button class="btn sm" data-act="go" data-v="perf">Performance</button></div>${reach.length?`<div class="bars">${reach.sort((a,b)=>b.sum-a.sum).map(x=>`<div class="bar"><span class="lab">${CH[x.p]?.n}</span><div class="track"><div class="fill" style="width:${x.sum/rmx*100}%"></div></div><span class="v">${fmtK(x.sum)}</span></div>`).join("")}</div><div class="cnt" style="margin-top:6px">รวมจาก ${reach.reduce((a,x)=>a+x.n,0)} คอนเทนต์ที่กรอก Reach</div>`:`<div class="empty">ยังไม่มีคอนเทนต์ที่กรอก Reach</div>`}</div></div>`)};

// ================= GOOGLE TRENDS (marketing) =================
// Google has no public official Trends API, so this tool does not fetch or invent numbers.
// It builds Explore links, then reads the CSV the user exports from trends.google.com (values are relative 0–100, not search volume).
S.trends=[];COL.trends="trend_sets";
const TR_TIME={"now 7-d":"7 วันที่ผ่านมา","today 1-m":"30 วันที่ผ่านมา","today 3-m":"90 วันที่ผ่านมา","today 12-m":"12 เดือนที่ผ่านมา","today 5-y":"5 ปีที่ผ่านมา"};
const TR_GEO={TH:"ประเทศไทย","TH-10":"กรุงเทพมหานคร","":"ทั่วโลก"};
const TR_CAT={"0":"ทุกหมวด","71":"อาหารและเครื่องดื่ม (Food & Drink)","908":"อาหารและเครื่องดื่ม › ทำอาหาร/สูตร","18":"ช้อปปิ้ง (Shopping)"};
const TR_PROP={"":"Web Search","youtube":"YouTube Search","froogle":"Google Shopping","images":"Image Search","news":"News Search"};
const TR_C=["var(--accent)","var(--mango)","var(--sky)","var(--plum)","var(--chili)"];
const trKws=s=>(s.keywords||[]).filter(Boolean).slice(0,5);
const trUrl=(s,kws)=>{const e=encodeURIComponent;const p=["date="+e(s.time||"today 12-m")];if(s.geo)p.push("geo="+e(s.geo));p.push("q="+(kws||trKws(s)).map(e).join(","));if(s.cat&&s.cat!=="0")p.push("cat="+e(s.cat));if(s.gprop)p.push("gprop="+e(s.gprop));p.push("hl=th");return"https://trends.google.com/trends/explore?"+p.join("&")};
const TR_NOW="https://trends.google.com/trending?geo=TH&hl=th";

// ---- CSV parsers (Google Trends export formats) ----
function trVal(v){v=String(v??"").trim();if(v==="")return null;if(/^<\s*1$/.test(v))return 0.5;const n=Number(v.replace(/,/g,""));return Number.isFinite(n)?n:null}
function trDateLike(s){s=String(s||"").trim();return /^\d{4}-\d{2}(-\d{2})?/.test(s)||/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s)||!isNaN(Date.parse(s))&&/\d{4}/.test(s)}
function parseTimeline(text){const rows=parseCSV(text).map(r=>r.map(c=>String(c??"").trim()));let h=-1;
  for(let i=0;i<rows.length-1;i++){if(rows[i].length>=2&&rows[i+1].length>=2&&!trDateLike(rows[i][0])&&trDateLike(rows[i+1][0])){h=i;break}}
  if(h<0)return null;const hdr=rows[h];const cols=hdr.slice(1).map(x=>{const m=x.match(/^(.*?):\s*\((.*)\)\s*$/);return{kw:(m?m[1]:x).trim(),geo:m?m[2]:""}}).filter(c=>c.kw);
  const labels=[];const vals=cols.map(()=>[]);let partial=false;
  for(let i=h+1;i<rows.length;i++){const r=rows[i];if(!r[0]||!trDateLike(r[0]))break;const d=normDate(r[0])||r[0].slice(0,10);labels.push(d);cols.forEach((c,j)=>{const raw=r[j+1]||"";if(/\*|partial/i.test(raw))partial=true;vals[j].push(trVal(raw.replace(/\*/g,"")))})}
  if(!labels.length||!cols.length)return null;
  return{unit:/day|วัน/i.test(hdr[0])?"day":/month|เดือน/i.test(hdr[0])?"month":/week|สัปดาห์/i.test(hdr[0])?"week":"time",labels,series:cols.map((c,j)=>({kw:c.kw,geo:c.geo,vals:vals[j]})),partial}}
function parseRelated(text){const rows=parseCSV(text).map(r=>r.map(c=>String(c??"").trim()));let sec=null;const out=[];
  for(const r of rows){const a=(r[0]||"");if(/^(top|ยอดนิยม|อันดับต้น)/i.test(a)&&r.length<=2&&!r[1]){sec="top";continue}if(/^(rising|กำลังมาแรง|เพิ่มขึ้น)/i.test(a)&&r.length<=2&&!r[1]){sec="rising";continue}
    if(!sec||!a||r.length<2)continue;const v=r[1];out.push({type:sec,query:a,value:v,score:/breakout|พุ่งสูง|ทะยาน/i.test(v)?1e6:(N(String(v).replace(/[+%]/g,""))??0)})}
  return out.length?out:null}

// ---- stats ----
function trStats(lbl,vals,unit){const ok=vals.map((v,i)=>({v,i})).filter(x=>x.v!=null);if(!ok.length)return null;
  const avg=ok.reduce((a,x)=>a+x.v,0)/ok.length;const peak=ok.reduce((a,x)=>x.v>a.v?x:a,ok[0]);const last=ok[ok.length-1];
  const w=unit==="day"?28:unit==="month"?3:4;const tail=ok.slice(-w),prev=ok.slice(-2*w,-w);const am=a=>a.length?a.reduce((s,x)=>s+x.v,0)/a.length:null;
  const a1=am(tail),a0=am(prev);const chg=a0?((a1-a0)/a0):null;
  const span=lbl.length>1?(new Date(lbl[lbl.length-1])-new Date(lbl[0]))/864e5:0;let season=null;
  if(span>=330&&unit!=="day"){const by={};ok.forEach(x=>{const m=+String(lbl[x.i]).slice(5,7);if(m){(by[m]=by[m]||[]).push(x.v)}});const ms=Object.entries(by).map(([m,a])=>[+m,a.reduce((s,v)=>s+v,0)/a.length]).sort((a,b)=>b[1]-a[1]);if(ms.length>=6)season=ms.slice(0,2).map(x=>x[0])}
  return{avg,peak:{v:peak.v,l:lbl[peak.i]},last:{v:last.v,l:lbl[last.i]},chg,season,w}}
const trFmt=v=>v==null?"–":v===0.5?"<1":fmtN(v,v%1?1:0);
const trChg=c=>c==null?`<span class="cnt">–</span>`:`<b style="color:${c>0.05?"var(--accent)":c<-0.05?"var(--chili)":"inherit"}">${c>0?"▲":c<0?"▼":""} ${Math.abs(c*100).toFixed(0)}%</b>`;

function trChart(tl){const W=760,H=240,L=34,R=10,T=10,B=28;const n=tl.labels.length;const x=i=>L+(n<2?0:i*(W-L-R)/(n-1));const y=v=>T+(100-v)*(H-T-B)/100;
  const grid=[0,25,50,75,100].map(g=>`<line x1="${L}" x2="${W-R}" y1="${y(g)}" y2="${y(g)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${y(g)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${g}</text>`).join("");
  const ticks=[0,Math.floor((n-1)/2),n-1].filter((v,i,a)=>a.indexOf(v)===i).map(i=>`<text x="${x(i)}" y="${H-8}" text-anchor="${i===0?"start":i===n-1?"end":"middle"}" font-size="11" fill="var(--muted)">${esc(thDate(tl.labels[i])||tl.labels[i])}</text>`).join("");
  const lines=tl.series.map((s,j)=>{let d="",pen=false;s.vals.forEach((v,i)=>{if(v==null){pen=false;return}d+=(pen?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1);pen=true});return`<path d="${d}" fill="none" stroke="${TR_C[j%5]}" stroke-width="2" stroke-linejoin="round"><title>${esc(s.kw)}</title></path>`}).join("");
  return`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="กราฟความสนใจตามช่วงเวลา (ค่า 0–100 เทียบกัน)" style="display:block;max-width:100%;height:auto">${grid}${ticks}${lines}</svg>
  <div class="legend">${tl.series.map((s,j)=>`<span><i style="display:inline-block;width:14px;height:3px;background:${TR_C[j%5]};vertical-align:middle;margin-right:6px"></i>${esc(s.kw)}</span>`).join("")}</div>`}

// ---- view ----
VIEWS.trends=()=>{const sets=S.trends.slice().sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));let cur=sets.find(s=>s.id===S.ui.trSel)||sets[0];
  $("#v-trends").innerHTML=`<div class="vhead"><div><h1>Google Trends</h1><p>ตั้งชุดคีย์เวิร์ดการตลาด เปิดดูใน Google Trends แล้วนำไฟล์ CSV กลับมาวิเคราะห์ เทียบช่วงพีค และส่งคำค้นที่กำลังมาแรงไปทำคอนเทนต์</p></div><div class="row"><a class="btn" href="${TR_NOW}" target="_blank" rel="noopener">Trending now (TH) ↗</a><button class="btn primary" data-act="trEdit">＋ ชุดคีย์เวิร์ด</button></div></div>
  <div class="note"><b>ตัวเลขใน Google Trends เป็นค่าเทียบ 0–100 ไม่ใช่จำนวนการค้นหา</b> 100 คือจุดที่คนสนใจสูงสุดในช่วงและพื้นที่ที่เลือก ค่าจะเปลี่ยนเมื่อเปลี่ยนชุดคำหรือช่วงเวลา จึงเทียบกันได้เฉพาะคำในไฟล์เดียวกัน · Google ไม่มี API สาธารณะอย่างเป็นทางการ ระบบนี้จึงไม่ดึงหรือสร้างตัวเลขเอง ข้อมูลทั้งหมดมาจากไฟล์ที่ทีมดาวน์โหลดจาก trends.google.com (ปุ่ม ⤓ บนกราฟ)</div>
  ${sets.length?`<div class="tabs" role="tablist">${sets.map(s=>`<button role="tab" aria-selected="${s.id===cur.id}" data-act="trSel" data-id="${s.id}">${esc(s.name)}</button>`).join("")}</div>${trDetail(cur)}`:`<div class="panel"><div class="empty">ยังไม่มีชุดคีย์เวิร์ด กด “＋ ชุดคีย์เวิร์ด” เพื่อเริ่ม เช่น ไมโครกรีน · ดอกไม้กินได้ · ผักสลัด · ผักออร์แกนิค</div></div>`}
  <div class="panel"><h2>วิธีใช้</h2><ol style="margin:0;padding-left:20px;line-height:1.8"><li>สร้างชุดคีย์เวิร์ด (ไม่เกิน 5 คำต่อชุด) เลือกพื้นที่ ช่วงเวลา หมวด และประเภทการค้นหา</li><li>กด <b>เปิดใน Google Trends ↗</b> ระบบตั้งค่าให้ครบตามชุด</li><li>ที่กราฟ “ความสนใจตามช่วงเวลา” กดไอคอนดาวน์โหลด จะได้ <code>multiTimeline.csv</code> · ที่ “คำค้นหาที่เกี่ยวข้อง” ได้ <code>relatedQueries.csv</code> (ทีละคีย์เวิร์ด)</li><li>กด <b>นำเข้า CSV</b> แล้วเลือกไฟล์หรือวางข้อความ ระบบแยกประเภทไฟล์ให้เอง</li><li>ดูช่วงพีค การเปลี่ยนแปลงล่าสุด และเดือนที่คนสนใจสูง แล้วส่งคำค้นที่มาแรงไป Idea Vault, SEO หรือเทรนด์ & คู่แข่ง</li></ol></div>`};

function trDetail(s){const tl=s.timeline;const rel=s.related||[];const kws=trKws(s);
  const stats=tl?tl.series.map((x,j)=>({kw:x.kw,j,st:trStats(tl.labels,x.vals,tl.unit)})):[];
  const relBy={};rel.forEach(r=>{(relBy[r.kw||"-"]=relBy[r.kw||"-"]||{top:[],rising:[]})[r.type].push(r)});
  return`<div class="panel"><div class="ph"><div><h2 style="margin:0">${esc(s.name)}</h2><div class="cnt">${esc(TR_GEO[s.geo]??s.geo)} · ${esc(TR_TIME[s.time]||s.time)} · ${esc(TR_CAT[s.cat||"0"]||"หมวด "+s.cat)} · ${esc(TR_PROP[s.gprop||""])}${s.note?` · ${esc(s.note)}`:""}</div></div>
    <div class="row"><a class="btn primary" href="${trUrl(s)}" target="_blank" rel="noopener">เปิดใน Google Trends ↗</a><button class="btn" data-act="trImport" data-id="${s.id}">⤒ นำเข้า CSV</button><button class="btn ghost" data-act="trEdit" data-id="${s.id}">แก้ไข</button></div></div>
    ${s.stale?`<div class="note" style="margin-top:8px;border-color:var(--chili)">ชุดนี้เปลี่ยนคีย์เวิร์ด พื้นที่ หรือช่วงเวลา หลังนำเข้ากราฟล่าสุด ข้อมูลด้านล่างอาจไม่ตรงกับการตั้งค่าปัจจุบัน ควรนำเข้า CSV ใหม่</div>`:""}<div class="chips" style="margin-top:6px">${kws.map((k,j)=>`<a class="tag" href="${trUrl(s,[k])}" target="_blank" rel="noopener" title="เปิดคำนี้คำเดียว (ดูคำค้นที่เกี่ยวข้อง)" style="text-decoration:none;border-left:3px solid ${TR_C[j%5]}">${esc(k)} ↗</a>`).join("")}</div></div>
  ${tl?`<div class="panel"><div class="ph"><h2>ความสนใจตามช่วงเวลา</h2><span class="cnt">${tl.labels.length} จุด (${esc({week:"รายสัปดาห์",day:"รายวัน",month:"รายเดือน"}[tl.unit]||"")}) · ${thDate(tl.labels[0])} – ${thDate(tl.labels[tl.labels.length-1])} · นำเข้า ${thDT(s.timelineAt)}${tl.file?` · ${esc(tl.file)}`:""}</span></div>${trChart(tl)}
    ${tl.partial?`<div class="cnt" style="margin-top:6px">* จุดสุดท้ายเป็นข้อมูลบางส่วน (ช่วงที่ยังไม่จบ) อาจต่ำกว่าความจริง</div>`:""}
    <div style="overflow-x:auto;margin-top:12px"><table style="min-width:680px"><thead><tr><th>คีย์เวิร์ด</th><th class="r">ล่าสุด</th><th class="r">เฉลี่ยทั้งช่วง</th><th class="r">${stats[0]?.st?.w||4} ${tl.unit==="day"?"วัน":tl.unit==="month"?"เดือน":"สัปดาห์"}ล่าสุด เทียบก่อนหน้า</th><th>จุดพีค</th><th>เดือนที่สนใจสูง</th></tr></thead><tbody>
    ${stats.map(x=>x.st?`<tr><td><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${TR_C[x.j%5]};margin-right:6px"></i>${esc(x.kw)}</td><td class="r num">${trFmt(x.st.last.v)}</td><td class="r num">${fmtN(x.st.avg,1)}</td><td class="r">${trChg(x.st.chg)}</td><td>${trFmt(x.st.peak.v)} · ${thDate(x.st.peak.l)}</td><td>${x.st.season?x.st.season.map(m=>TH_M[m-1]).join(", "):`<span class="cnt">ต้องมีข้อมูล ≥ 12 เดือน</span>`}</td></tr>`:`<tr><td>${esc(x.kw)}</td><td colspan="5" class="cnt">ไม่มีค่า</td></tr>`).join("")}</tbody></table></div>
    <div class="row" style="margin-top:10px"><span class="cnt">“&lt;1” นับเป็น 0.5 · ค่าเทียบได้เฉพาะคำในไฟล์นี้</span><span class="spacer"></span><button class="btn sm" data-act="trAI" data-id="${s.id}">✦ สรุปด้วย AI</button></div>
    ${s.ai?`<div class="note" style="margin-top:10px"><b>สรุปโดย AI</b> (${thDT(s.ai.at)}) — อ่านจากตัวเลขในตารางนี้เท่านั้น ควรตรวจก่อนนำไปใช้<div style="white-space:pre-wrap;margin-top:6px">${esc(s.ai.text)}</div></div>`:""}</div>`
  :`<div class="panel"><div class="empty">ยังไม่มีข้อมูลกราฟ กด “เปิดใน Google Trends ↗” ดาวน์โหลด <code>multiTimeline.csv</code> แล้วกด “⤒ นำเข้า CSV”</div></div>`}
  <div class="panel"><div class="ph"><h2>คำค้นหาที่เกี่ยวข้อง</h2><span class="cnt">จาก relatedQueries.csv · Breakout = เพิ่มขึ้นมากกว่า 5,000%</span></div>
  ${Object.keys(relBy).length?Object.entries(relBy).map(([kw,g])=>`<h3 style="font-size:14px;margin:12px 0 6px">${esc(kw)} <span class="cnt">นำเข้า ${thDT((rel.find(r=>(r.kw||"-")===kw)||{}).at)}</span></h3><div class="g2">${["rising","top"].map(t=>`<div><div class="cnt" style="margin-bottom:4px">${t==="rising"?"กำลังมาแรง (Rising)":"ยอดนิยม (Top)"}</div>${g[t].length?`<table><tbody>${g[t].slice().sort((a,b)=>b.score-a.score).slice(0,15).map(r=>{const i=rel.indexOf(r);return`<tr><td>${esc(r.query)}</td><td class="r num">${esc(r.value)}</td><td class="r" style="white-space:nowrap">${r.sent?`<span class="st ok">${esc(r.sent)}</span>`:`<button class="btn ghost sm" data-act="trSend" data-id="${s.id}" data-i="${i}" data-to="idea" title="ส่งไป Idea Vault">💡</button><button class="btn ghost sm" data-act="trSend" data-id="${s.id}" data-i="${i}" data-to="seo" title="เพิ่มเป็นคีย์เวิร์ด SEO">SEO</button><button class="btn ghost sm" data-act="trSend" data-id="${s.id}" data-i="${i}" data-to="intel" title="บันทึกในเทรนด์ & คู่แข่ง">เทรนด์</button>`}</td></tr>`}).join("")}</tbody></table>`:`<div class="cnt">ไม่มี</div>`}</div>`).join("")}</div>`).join("")
  :`<div class="empty">ยังไม่มีข้อมูล เปิดคีย์เวิร์ดทีละคำ (กดชิปด้านบน) ดาวน์โหลด <code>relatedQueries.csv</code> แล้วนำเข้า</div>`}</div>`}

ACT.trSel=el=>{S.ui.trSel=el.dataset.id;forceRender()};
ACT.trEdit=el=>{const s=S.trends.find(x=>x.id===el.dataset.id);const x=s||{geo:"TH",time:"today 12-m",cat:"71",gprop:"",keywords:[]};
  openDlg({title:s?"แก้ไขชุดคีย์เวิร์ด":"ชุดคีย์เวิร์ดใหม่",body:`${fld("ชื่อชุด","trN",x.name,"text","placeholder='เช่น ผักพรีเมียม vs ผักทั่วไป'")}
    ${area("คีย์เวิร์ด (บรรทัดละคำ สูงสุด 5 คำ)","trK",(x.keywords||[]).join("\n"),5,"placeholder='ไมโครกรีน&#10;ดอกไม้กินได้&#10;ผักสลัด'")}
    <div class="row">${sel("พื้นที่","trG",TR_GEO,x.geo)}${sel("ช่วงเวลา","trT",TR_TIME,x.time)}</div><div class="row">${sel("หมวด","trC",TR_CAT,x.cat||"0")}${sel("ประเภทการค้นหา","trP",TR_PROP,x.gprop||"")}</div>
    ${fld("หมายเหตุ / เป้าหมาย","trNote",x.note,"text","placeholder='เช่น หาช่วงพีคก่อนวางแคมเปญปีใหม่'")}
    <div class="cnt">ถ้าเปลี่ยนคีย์เวิร์ดหรือช่วงเวลา ข้อมูลกราฟเดิมจะไม่ตรงกับชุดใหม่ ต้องนำเข้า CSV ใหม่</div>`,
    foot:[...(s?[{label:"ลบ",cls:"danger",confirm:"ยืนยันลบชุดนี้และข้อมูลที่นำเข้า?",act:async()=>{await dbDel(COL.trends,s.id);S.ui.trSel=null;toast("ลบแล้ว")}}]:[]),"|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{
      const kws=[...new Set($("#trK").value.split(/\n|,/).map(k=>k.trim()).filter(Boolean))];const name=V("trN")||kws.slice(0,3).join(" · ");
      if(!kws.length){toast("ใส่คีย์เวิร์ดอย่างน้อย 1 คำ");return false}if(kws.length>5){toast("Google Trends เทียบได้สูงสุด 5 คำต่อครั้ง");return false}
      if(S.trends.some(t=>t.name===name&&t.id!==s?.id)){toast("มีชื่อชุดนี้แล้ว");return false}
      const d={name,keywords:kws,geo:V("trG"),time:V("trT"),cat:V("trC"),gprop:V("trP"),note:V("trNote")};
      try{if(s){if(s.timeline&&(s.keywords.join("|")!==kws.join("|")||s.time!==d.time||s.geo!==d.geo))d.stale=true;await dbUpd(COL.trends,s.id,d)}else{const r=await dbAdd(COL.trends,d);S.ui.trSel=r.id}toast("บันทึกแล้ว")}catch(e){toast(dbErr(e));return false}}}]})};

ACT.trImport=el=>{const s=S.trends.find(x=>x.id===el.dataset.id);if(!s)return;let fname="";
  openDlg({title:"นำเข้า CSV จาก Google Trends",wide:true,body:`<div class="row"><button class="btn" id="trPick" type="button">เลือกไฟล์ .csv</button><span class="cnt" id="trFn"></span></div>
    ${area("หรือวางข้อความจากไฟล์","trTx","",8,"placeholder='Category: All categories&#10;&#10;Week,ไมโครกรีน: (Thailand),...'")}
    <label class="f">คีย์เวิร์ดของไฟล์คำค้นที่เกี่ยวข้อง (relatedQueries)<select id="trKw">${trKws(s).map(k=>`<option>${esc(k)}</option>`).join("")}</select></label>
    <div id="trPrev" class="cnt">ยังไม่มีข้อมูล</div>`,
    onOpen:()=>{const prev=()=>{const t=$("#trTx").value;const tl=t&&parseTimeline(t);const rl=!tl&&t&&parseRelated(t);
        $("#trPrev").innerHTML=tl?`พบไฟล์ <b>ความสนใจตามช่วงเวลา</b>: ${tl.series.length} คีย์เวิร์ด (${tl.series.map(x=>esc(x.kw)).join(", ")}) · ${tl.labels.length} จุด · ${esc(tl.labels[0])} ถึง ${esc(tl.labels[tl.labels.length-1])}${tl.series.some(x=>!trKws(s).includes(x.kw))?`<br><span style="color:var(--chili)">คีย์เวิร์ดในไฟล์ไม่ตรงกับชุดนี้ทั้งหมด ระบบจะเก็บตามไฟล์</span>`:""}`
        :rl?`พบไฟล์ <b>คำค้นหาที่เกี่ยวข้อง</b>: Top ${rl.filter(r=>r.type==="top").length} · Rising ${rl.filter(r=>r.type==="rising").length} รายการ (จะผูกกับคีย์เวิร์ดที่เลือกด้านบน)`:t?`<span style="color:var(--chili)">อ่านรูปแบบไฟล์ไม่ออก ต้องเป็น multiTimeline.csv หรือ relatedQueries.csv จาก Google Trends</span>`:"ยังไม่มีข้อมูล"};
      $("#trTx").oninput=prev;$("#trPick").onclick=async()=>{const f=await pickFile(".csv,text/csv,text/plain");if(!f)return;fname=f.name;$("#trFn").textContent=f.name;$("#trTx").value=await f.text();prev()}},
    foot:["|",{label:"ยกเลิก"},{label:"นำเข้า",cls:"primary",act:async()=>{const t=$("#trTx").value;const tl=t&&parseTimeline(t);
      try{if(tl){tl.file=fname;await dbUpd(COL.trends,s.id,{timeline:tl,timelineAt:nowISO(),stale:false,ai:null});toast(`นำเข้า ${tl.labels.length} จุดแล้ว`);return}
        const rl=t&&parseRelated(t);if(!rl){toast("อ่านรูปแบบไฟล์ไม่ออก");return false}const kw=V("trKw");const at=nowISO();
        const keep=(s.related||[]).filter(r=>r.kw!==kw);const old=new Map((s.related||[]).filter(r=>r.kw===kw).map(r=>[r.type+"|"+r.query,r.sent]));
        await dbUpd(COL.trends,s.id,{related:keep.concat(rl.map(r=>({...r,kw,at,sent:old.get(r.type+"|"+r.query)||null})))});toast(`นำเข้าคำค้น ${rl.length} รายการ (${kw})`)}catch(e){toast(dbErr(e));return false}}}]})};

ACT.trSend=async el=>{const s=S.trends.find(x=>x.id===el.dataset.id);const i=+el.dataset.i;const r=s?.related?.[i];if(!r)return;const to=el.dataset.to;
  const src=`Google Trends · ${TR_GEO[s.geo]??s.geo} · ${TR_TIME[s.time]||s.time} · คำค้นที่เกี่ยวข้องกับ “${r.kw}” (${r.type==="rising"?"Rising":"Top"} ${r.value})`;let label="";
  try{if(to==="idea"){if(S.ideas.some(x=>x.title.trim().toLowerCase()===r.query.toLowerCase())){toast("มีไอเดียนี้แล้วใน Idea Vault");label="Idea"}else{await dbAdd(COL.ideas,{title:r.query,pillar:"",note:src});toast("ส่งไป Idea Vault แล้ว");label="Idea"}}
    else if(to==="seo"){const d={keyword:r.query,url:"",month:"",country:s.geo==="TH"?"tha":"",device:"",stype:"SEO",intent:"informational",kstatus:"new",target:"",volume:null,volumeSource:"",clicks:null,impressions:null,position:null,source:src,plan:"",qa:"",refs:""};
      const key=seoKey(d);if(S.seo.some(x=>(x.keyword||"").toLowerCase().trim()===r.query.toLowerCase().trim())){toast("มีคีย์เวิร์ดนี้ใน SEO แล้ว");label="SEO"}else{await dbSetNew(COL.seo,"K-"+hash(key),d);toast("เพิ่มใน SEO แล้ว (ยังไม่มี Volume — Trends ไม่ใช่จำนวนการค้นหา)");label="SEO"}}
    else{const url=trUrl(s,[r.query]);if(S.intel.some(x=>x.url===url)){toast("บันทึกไว้แล้วในเทรนด์ & คู่แข่ง");label="เทรนด์"}else{await dbAdd(COL.intel,{type:"trend",title:r.query,url,publishedAt:today(),angles:[],facts:src,proposal:"",products:"",source:"Google Trends",verified:false,checkedAt:null});toast("บันทึกในเทรนด์ & คู่แข่งแล้ว");label="เทรนด์"}}
    const rel=s.related.slice();rel[i]={...r,sent:label};await dbUpd(COL.trends,s.id,{related:rel})}catch(e){toast(dbErr(e))}};

ACT.trAI=async el=>{const s=S.trends.find(x=>x.id===el.dataset.id);const tl=s?.timeline;if(!tl)return;if(!sample){toast("ยังไม่ได้เปิดใช้ AI ในเว็บนี้");return}
  const rows=tl.series.map(x=>{const st=trStats(tl.labels,x.vals,tl.unit);return st?`${x.kw}: ล่าสุด ${trFmt(st.last.v)} (${st.last.l}), เฉลี่ย ${st.avg.toFixed(1)}, เปลี่ยน ${st.w} ช่วงล่าสุด ${st.chg==null?"-":(st.chg*100).toFixed(0)+"%"}, พีค ${st.peak.v} (${st.peak.l}), เดือนสูง ${st.season?st.season.map(m=>TH_M[m-1]).join("/"):"-"}`:`${x.kw}: ไม่มีค่า`}).join("\n");
  const rising=(s.related||[]).filter(r=>r.type==="rising").slice(0,15).map(r=>`${r.kw} → ${r.query} (${r.value})`).join("\n");
  el.disabled=true;el.textContent="กำลังสรุป…";
  try{const r=await sample.json(`คุณคือนักการตลาดออนไลน์ของ ${S.brand?.name||"Delish Foods"} (ผักผลไม้พรีเมียม วัตถุดิบหายาก ลูกค้า B2B/B2C/B2M)
ข้อมูล Google Trends (${TR_GEO[s.geo]??s.geo}, ${TR_TIME[s.time]||s.time}) ค่าเป็นดัชนีเทียบ 0-100 ไม่ใช่จำนวนการค้นหา ห้ามแปลงเป็นจำนวนคนค้นหา ห้ามเติมตัวเลขที่ไม่มีในข้อมูล
${rows}
คำค้นที่กำลังมาแรง:
${rising||"-"}
สรุปสั้นเป็นภาษาไทย: 1) คำไหนแรงขึ้น/ลดลง 2) ช่วงเวลาที่ควรวางคอนเทนต์หรือแคมเปญ 3) ไอเดียคอนเทนต์ 3 ข้อจากข้อมูลนี้
ตอบ JSON เท่านั้น: {"text":"..."}`,{modelTier:"default"});
    const text=String(r?.text||"").trim();if(!text){toast("AI ไม่ได้ส่งข้อความกลับ");return}await dbUpd(COL.trends,s.id,{ai:{text,at:nowISO()}});toast("สรุปแล้ว")}
  catch(e){toast(aiErr(e))}finally{el.disabled=false;el.textContent="✦ สรุปด้วย AI"}};

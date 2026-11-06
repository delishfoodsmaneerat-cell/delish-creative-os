
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
  try{const r=await dbAdd(COL.posts,{hook:x.title,caption:[x.note,x.url?"ตัวอย่าง: "+x.url:""].filter(Boolean).join("\n"),pillar:x.pillar||"",stage:"idea",status:"draft",channel:"facebook",goal:"engagement",date:"",time:"",source:"Idea Vault"});await dbUpd(COL.ideas,x.id,{usedPostId:r.id});toast("ส่งเข้า Content Planner แล้ว");S.ui.pf={};show("planner")}catch(e){toast(dbErr(e))}};

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

// ================= INSTAGRAM COMPETITOR ANALYSIS =================
// Reads the dataset the team exports from Apify (Instagram Scraper / Instagram Profile Scraper). The app never logs in to
// Instagram, stores no Apify token, and never invents a number: every metric is computed from imported posts.
S.igPosts=[];S.igAcc=[];COL.igPosts="ig_posts";COL.igAcc="ig_accounts";
const IG_TYPE={reel:"Reel",carousel:"Carousel",image:"Image",video:"Video"};
const IG_TC={reel:"var(--plum)",carousel:"var(--sky)",image:"var(--accent)",video:"var(--mango)"};
const IG_CAT=["สินค้า/โปรโมชัน","เมนู/สูตรอาหาร","ความรู้/สุขภาพ","ไลฟ์สไตล์","เบื้องหลัง/ฟาร์ม","รีวิว/ลูกค้า","อีเวนต์/แคมเปญ","อื่นๆ"];
const IG_RULE=[["สินค้า/โปรโมชัน",/โปร|ลด|ส่วนลด|ราคา|sale|promo|discount|ฟรี|free|โค้ด|code|สั่งซื้อ|order|shop/i],["เมนู/สูตรอาหาร",/สูตร|เมนู|recipe|menu|ทำอาหาร|cook|ปรุง|จาน|salad|สลัด/i],["ความรู้/สุขภาพ",/ประโยชน์|วิตามิน|สุขภาพ|health|nutri|รู้หรือไม่|tips|เคล็ดลับ|วิธี/i],["รีวิว/ลูกค้า",/รีวิว|review|ลูกค้า|customer|ขอบคุณ|feedback/i],["อีเวนต์/แคมเปญ",/event|อีเวนต์|งาน|workshop|campaign|แคมเปญ|เทศกาล|ปีใหม่|คริสต์มาส|สงกรานต์/i],["เบื้องหลัง/ฟาร์ม",/ฟาร์ม|farm|เบื้องหลัง|behind|ปลูก|เก็บเกี่ยว|harvest|grow/i]];
const IG_C=["var(--accent)","var(--mango)","var(--sky)","var(--plum)","var(--chili)","var(--ig)"];
const igN=v=>{const n=N(v);return n==null||n<0?null:n};
const igType=p=>{const pt=String(p.productType||"").toLowerCase(),t=String(p.type||"").toLowerCase();return pt==="clips"||pt==="reels"?"reel":t==="sidecar"||pt.includes("carousel")?"carousel":t==="video"?(pt==="igtv"?"video":"reel"):"image"};
function igNorm(p,acc){const sc=p.shortCode||p.shortcode||(String(p.url||"").match(/\/(?:p|reel|tv)\/([^/?#]+)/)||[])[1];const user=String(p.ownerUsername||acc?.username||p.username||"").replace(/^@/,"").toLowerCase();
  if(!sc||!user)return null;const ts=p.timestamp||p.takenAtTimestamp||p.taken_at;const d=typeof ts==="number"?new Date(ts*(ts<1e12?1000:1)):new Date(ts||"");
  let tags=p.hashtags;if(!Array.isArray(tags))tags=Object.keys(p).filter(k=>/^hashtags\/\d+$/.test(k)).map(k=>p[k]).filter(Boolean);
  return{id:"IG-"+sc,shortCode:sc,username:user,url:p.url||`https://www.instagram.com/p/${sc}/`,type:igType(p),caption:String(p.caption||"").slice(0,800),hashtags:(tags||[]).slice(0,30).map(String),
    likes:igN(p.likesCount??p.likes),comments:igN(p.commentsCount??p.comments),views:igN(p.videoViewCount??p.videoPlayCount??p.playCount),postedAt:isNaN(d)?"":d.toISOString(),sponsored:!!p.isSponsored}}
function igParse(text){text=text.replace(/^﻿/,"").trim();let rows;
  if(/^[\[{]/.test(text)){let j;try{j=JSON.parse(text)}catch(e){return{err:"JSON ไม่ถูกต้อง"}}rows=Array.isArray(j)?j:[j]}
  else{const c=parseCSV(text);if(c.length<2)return{err:"ไม่พบข้อมูล"};const h=c[0].map(x=>x.trim());rows=c.slice(1).filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])))}
  const posts=[],accs={};const addAcc=(o)=>{const u=String(o.username||"").replace(/^@/,"").toLowerCase();if(!u)return null;accs[u]={username:u,name:o.fullName||o.full_name||"",followers:igN(o.followersCount??o.followers),postsCount:igN(o.postsCount)};return accs[u]};
  for(const r of rows){if(!r||typeof r!=="object")continue;
    if(Array.isArray(r.latestPosts)||r.followersCount!=null&&!r.shortCode){const a=addAcc(r);for(const p of r.latestPosts||[]){const x=igNorm(p,a);if(x)posts.push(x)}continue}
    const x=igNorm(r);if(x)posts.push(x)}
  const seen=new Set();const uniq=posts.filter(p=>!seen.has(p.id)&&seen.add(p.id));
  return uniq.length||Object.keys(accs).length?{posts:uniq,accs:Object.values(accs)}:{err:"ไม่พบโพสต์ Instagram ในไฟล์ (ต้องมี shortCode หรือ url และ ownerUsername)"}}
const igEng=p=>p.likes==null&&p.comments==null?null:(p.likes||0)+(p.comments||0);
const igAccOf=u=>S.igAcc.find(a=>a.username===u);
const igER=p=>{const f=igAccOf(p.username)?.followers;const e=igEng(p);return f&&e!=null?e/f:null};
const igCatOf=p=>p.category||null;
const avgOf=a=>{const v=a.filter(x=>x!=null);return v.length?v.reduce((s,x)=>s+x,0)/v.length:null};
function igRuleCat(cap){for(const[c,re]of IG_RULE)if(re.test(cap||""))return c;return"อื่นๆ"}
const igColor=u=>{const us=igUsers();return IG_C[Math.max(0,us.indexOf(u))%IG_C.length]};
const igUsers=()=>[...new Set(S.igAcc.filter(a=>!a.hidden).map(a=>a.username).concat(S.igPosts.map(p=>p.username)))].sort((a,b)=>(igAccOf(b)?.own?1:0)-(igAccOf(a)?.own?1:0)||a.localeCompare(b));
function igFiltered(){const f=S.ui.igF||{};const days=+(f.days??90);const from=days?new Date(Date.now()-days*864e5).toISOString():"";const off=new Set(f.off||[]);
  return S.igPosts.filter(p=>(!from||p.postedAt>=from)&&!off.has(p.username))}

function igGroupBars(groups,keys,val,fmt){// groups:[{label}] keys: series users
  const W=520,H=210,L=40,B=26,T=8;const all=groups.flatMap(g=>keys.map(k=>val(g,k))).filter(v=>v!=null);const mx=Math.max(1,...all);const gw=(W-L)/Math.max(1,groups.length);const bw=Math.min(22,(gw-12)/Math.max(1,keys.length));
  const y=v=>T+(1-v/mx)*(H-T-B);
  return`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;height:auto" role="img" aria-label="กราฟแท่งเปรียบเทียบ">${[0,.5,1].map(g=>`<line x1="${L}" x2="${W}" y1="${y(mx*g)}" y2="${y(mx*g)}" stroke="var(--line)"/><text x="${L-6}" y="${y(mx*g)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${fmtK(Math.round(mx*g))}</text>`).join("")}
  ${groups.map((g,gi)=>{const x0=L+gi*gw+(gw-bw*keys.length)/2;return keys.map((k,ki)=>{const v=val(g,k);if(v==null)return"";return`<rect x="${x0+ki*bw+1}" y="${y(v)}" width="${bw-2}" height="${H-B-y(v)}" rx="2" fill="${igColor(k)}"><title>@${esc(k)} · ${esc(g.label)}: ${fmt(v)}</title></rect>`}).join("")+`<text x="${L+gi*gw+gw/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(g.label)}</text>`}).join("")}</svg>`}
function igLine(labels,series){const W=520,H=210,L=30,R=8,T=8,B=26;const n=labels.length;const mx=Math.max(1,...series.flatMap(s=>s.vals));const x=i=>L+(n<2?0:i*(W-L-R)/(n-1));const y=v=>T+(1-v/mx)*(H-T-B);
  return`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;height:auto" role="img" aria-label="กราฟความถี่การโพสต์รายสัปดาห์">${[0,.5,1].map(g=>`<line x1="${L}" x2="${W-R}" y1="${y(mx*g)}" y2="${y(mx*g)}" stroke="var(--line)"/><text x="${L-6}" y="${y(mx*g)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${+(mx*g).toFixed(1)}</text>`).join("")}
  ${[0,n-1].filter((v,i,a)=>a.indexOf(v)===i).map(i=>`<text x="${x(i)}" y="${H-8}" text-anchor="${i?"end":"start"}" font-size="11" fill="var(--muted)">${esc(thDate(labels[i]))}</text>`).join("")}
  ${series.map(s=>`<path d="${s.vals.map((v,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)).join("")}" fill="none" stroke="${igColor(s.u)}" stroke-width="2"><title>@${esc(s.u)}</title></path>`).join("")}</svg>`}
const igLegend=us=>`<div class="legend">${us.map(u=>`<span><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${igColor(u)};margin-right:6px;vertical-align:middle"></i>@${esc(u)}${igAccOf(u)?.own?" (เรา)":""}</span>`).join("")}</div>`;
const weekStart=iso=>{const d=new Date(iso);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return ymd(d)};

VIEWS.igcomp=()=>{const posts=igFiltered();const us=igUsers().filter(u=>posts.some(p=>p.username===u));const f=S.ui.igF||{};const days=f.days??90;
  const head=`<div class="vhead"><div><h1>Instagram คู่แข่ง</h1><p>นำเข้าโพสต์จาก Apify แล้วดูว่าแต่ละแบรนด์ทำคอนเทนต์แบบไหน อะไรได้ Engagement สูง โพสต์บ่อยแค่ไหน และมีโอกาสอะไรให้เราต่อยอด</p></div><div class="row"><button class="btn" data-act="igHelp">วิธีดึงข้อมูลด้วย Apify</button><button class="btn" data-act="igAccounts">บัญชี (${igUsers().length})</button><button class="btn primary" data-act="igImport">⤒ นำเข้าข้อมูล</button></div></div>
  <div class="note">ตัวเลขทั้งหมดคำนวณจากโพสต์ที่นำเข้าเท่านั้น ระบบไม่ล็อกอิน Instagram และไม่เก็บ Apify token · Engagement = Like + Comment (บัญชีที่ซ่อนยอด Like จะนับเฉพาะ Comment) · Engagement Rate ใช้ยอดผู้ติดตามจากไฟล์หรือที่กรอกในเมนู “บัญชี” ถ้าไม่มียอดผู้ติดตามจะแสดง –</div>
  <div class="row"><div class="chips">${[[30,"30 วัน"],[90,"90 วัน"],[180,"180 วัน"],[0,"ทั้งหมด"]].map(([d,n])=>`<button class="btn sm ${+days===d?"primary":""}" data-act="igDays" data-d="${d}">${n}</button>`).join("")}</div><span class="spacer"></span><div class="chips">${igUsers().map(u=>`<label class="chk"><input type="checkbox" data-chg="igTog" value="${esc(u)}" ${(f.off||[]).includes(u)?"":"checked"}><span>@${esc(u)}</span></label>`).join("")}</div></div>`;
  if(!posts.length){$("#v-igcomp").innerHTML=head+`<div class="panel"><div class="empty">${S.igPosts.length?"ไม่มีโพสต์ในช่วงหรือบัญชีที่เลือก":"ยังไม่มีข้อมูล กด “วิธีดึงข้อมูลด้วย Apify” แล้ว “⤒ นำเข้าข้อมูล”"}</div></div>`;return}
  const by=u=>posts.filter(p=>p.username===u);
  const kp=us.map(u=>{const ps=by(u);const a=igAccOf(u)||{};const ts=ps.map(p=>p.postedAt).filter(Boolean).sort();const wk=ts.length>1?Math.max(1,(new Date(ts[ts.length-1])-new Date(ts[0]))/(7*864e5)):null;
    return{u,a,n:ps.length,likes:avgOf(ps.map(p=>p.likes)),com:avgOf(ps.map(p=>p.comments)),er:avgOf(ps.map(igER)),pw:wk?ps.length/wk:null,hidden:ps.filter(p=>p.likes==null).length}});
  const types=Object.keys(IG_TYPE).filter(t=>posts.some(p=>p.type===t));
  const cats=IG_CAT.filter(c=>posts.some(p=>igCatOf(p)===c));const unc=posts.filter(p=>!igCatOf(p)).length;
  const catRows=cats.map(c=>{const ps=posts.filter(p=>igCatOf(p)===c);return{c,n:ps.length,e:avgOf(ps.map(igEng))}}).sort((a,b)=>(b.e||0)-(a.e||0));const cmx=Math.max(1,...catRows.map(r=>r.e||0));
  const wks=[];if(posts.some(p=>p.postedAt)){const ts=posts.map(p=>p.postedAt).filter(Boolean).sort();let w=weekStart(ts[0]);const end=weekStart(ts[ts.length-1]);while(w<=end&&wks.length<60){wks.push(w);w=addDays(w,7)}}
  const freq=us.map(u=>({u,vals:wks.map(w=>by(u).filter(p=>p.postedAt&&weekStart(p.postedAt)===w).length)}));
  const top=posts.filter(p=>igEng(p)!=null).sort((a,b)=>igEng(b)-igEng(a)).slice(0,10);
  const ai=S.igAcc.find(a=>a.username==="__insight")?.ai;
  $("#v-igcomp").innerHTML=head+`
  <div class="g3">${kp.map(k=>`<div class="panel" style="border-top:3px solid ${igColor(k.u)}"><div class="row" style="flex-wrap:nowrap"><b style="min-width:0;overflow:hidden;text-overflow:ellipsis">@${esc(k.u)}</b>${k.a.own?`<span class="st ok">เรา</span>`:""}<span class="spacer"></span><a class="cnt" href="https://www.instagram.com/${encodeURIComponent(k.u)}/" target="_blank" rel="noopener">เปิด ↗</a></div><div class="cnt">${esc(k.a.name||"")}${k.a.followers!=null?` · ผู้ติดตาม ${fmtK(k.a.followers)}`:""}</div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 10px;margin-top:12px"><div><div class="cnt">โพสต์</div><b style="font-family:var(--display);font-size:20px;font-variant-numeric:tabular-nums">${k.n}</b></div><div><div class="cnt">Like เฉลี่ย</div><b style="font-family:var(--display);font-size:20px;font-variant-numeric:tabular-nums">${k.likes==null?"–":fmtK(Math.round(k.likes))}</b>${k.hidden?`<div class="cnt">ซ่อนยอด ${k.hidden}</div>`:""}</div><div><div class="cnt">Comment เฉลี่ย</div><b style="font-family:var(--display);font-size:20px;font-variant-numeric:tabular-nums">${k.com==null?"–":fmtK(Math.round(k.com))}</b></div><div><div class="cnt">Eng. Rate</div><b style="font-family:var(--display);font-size:20px;font-variant-numeric:tabular-nums">${k.er==null?"–":pct(k.er)}</b></div><div><div class="cnt">โพสต์/สัปดาห์</div><b style="font-family:var(--display);font-size:20px;font-variant-numeric:tabular-nums">${k.pw==null?"–":k.pw.toFixed(1)}</b></div></div></div>`).join("")}</div>
  <div class="g2"><div class="panel"><h2>Engagement เฉลี่ยตามประเภทคอนเทนต์</h2>${igGroupBars(types.map(t=>({label:IG_TYPE[t],t})),us,(g,u)=>avgOf(by(u).filter(p=>p.type===g.t).map(igEng)),v=>fmtN(Math.round(v)))}${igLegend(us)}
      <div class="cnt" style="margin-top:6px">${types.map(t=>`${IG_TYPE[t]} ${posts.filter(p=>p.type===t).length} โพสต์`).join(" · ")}</div></div>
    <div class="panel"><div class="ph"><h2>หมวดคอนเทนต์ที่ได้ Engagement สูง</h2><div class="row"><button class="btn sm" data-act="igCatAI">✦ จัดหมวดด้วย AI</button><button class="btn sm ghost" data-act="igCatRule" title="จัดหมวดจากคำสำคัญใน caption">จัดหมวดจากคำสำคัญ</button></div></div>
      ${catRows.length?`<div class="bars">${catRows.map(r=>`<div class="bar"><span class="lab">${esc(r.c)}</span><div class="track"><div class="fill" style="width:${(r.e||0)/cmx*100}%"></div></div><span class="v">${r.e==null?"–":fmtK(Math.round(r.e))}</span></div>`).join("")}</div><div class="cnt" style="margin-top:6px">ค่าเฉลี่ย Engagement ต่อโพสต์ · ${catRows.map(r=>`${esc(r.c)} ${r.n}`).join(" · ")}</div>`:""}
      ${unc?`<div class="cnt" style="margin-top:8px">ยังไม่จัดหมวด ${unc} โพสต์</div>`:""}</div></div>
  <div class="g2"><div class="panel"><h2>ความถี่การโพสต์ (ต่อสัปดาห์)</h2>${wks.length>1?igLine(wks,freq)+igLegend(us):`<div class="empty">ต้องมีโพสต์มากกว่า 1 สัปดาห์</div>`}</div>
    <div class="panel"><div class="ph"><h2>Key Insights & โอกาสคอนเทนต์</h2><button class="btn sm" data-act="igAI">✦ วิเคราะห์ด้วย AI</button></div>
      ${ai?`<div class="cnt">สรุปโดย AI เมื่อ ${thDT(ai.at)} จาก ${ai.n} โพสต์ — อ่านจากตัวเลขในหน้านี้ ควรตรวจก่อนใช้</div><h3 style="font-size:14px;margin:10px 0 4px">Key Insights</h3><ol style="margin:0;padding-left:20px;line-height:1.7">${(ai.insights||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ol><h3 style="font-size:14px;margin:10px 0 4px">Content Opportunities</h3><ul style="margin:0;padding-left:20px;line-height:1.7">${(ai.opps||[]).map((x,i)=>`<li>${esc(x)} <button class="btn ghost sm" data-act="igOppIdea" data-i="${i}" title="ส่งไป Idea Vault">💡</button></li>`).join("")}</ul>`:`<div class="empty">กด “✦ วิเคราะห์ด้วย AI” เพื่อสรุปจุดเด่นของคู่แข่งและโอกาสของเรา${HOSTED?" (บนเว็บบริษัทต้องเปิดใช้ AI ก่อน)":""}</div>`}</div></div>
  <div class="panel"><h2>Top 10 โพสต์ (Engagement สูงสุด)</h2><div style="overflow-x:auto"><table style="min-width:760px"><thead><tr><th>#</th><th>บัญชี</th><th>วันที่</th><th>ประเภท</th><th>หมวด</th><th>Caption</th><th class="r">Like</th><th class="r">Comment</th><th class="r">ER</th></tr></thead><tbody>
    ${top.map((p,i)=>`<tr><td class="num">${i+1}</td><td style="white-space:nowrap"><span style="color:${igColor(p.username)}">●</span> @${esc(p.username)}</td><td style="white-space:nowrap">${thDate(p.postedAt)}</td><td><span class="ch" style="--c:${IG_TC[p.type]}">${IG_TYPE[p.type]}</span></td><td><select data-chg="igSetCat" data-id="${p.id}" aria-label="หมวด" style="max-width:140px"><option value="">–</option>${IG_CAT.map(c=>`<option ${igCatOf(p)===c?"selected":""}>${esc(c)}</option>`).join("")}</select></td><td style="max-width:320px"><a href="${esc(p.url)}" target="_blank" rel="noopener" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.caption.slice(0,90)||"(ไม่มี caption)")}</a></td><td class="r num">${p.likes==null?"ซ่อน":fmtN(p.likes)}</td><td class="r num">${fmtN(p.comments)}</td><td class="r num">${pct(igER(p))}</td></tr>`).join("")}</tbody></table></div>
    <div class="row" style="margin-top:8px"><span class="cnt">${posts.length} โพสต์ในช่วงที่เลือก · นำเข้าทั้งหมด ${S.igPosts.length} โพสต์</span><span class="spacer"></span><button class="btn sm" data-act="igCSV">⤓ ส่งออก CSV</button></div></div>`};

ACT.igDays=el=>{S.ui.igF={...(S.ui.igF||{}),days:+el.dataset.d};forceRender()};
ACT.igTog=el=>{const f=S.ui.igF||{};const off=new Set(f.off||[]);el.checked?off.delete(el.value):off.add(el.value);S.ui.igF={...f,off:[...off]};forceRender()};
ACT.igSetCat=async el=>{try{await dbUpd(COL.igPosts,el.dataset.id,{category:el.value||null,catBy:el.value?"manual":null})}catch(e){toast(dbErr(e))}};
ACT.igHelp=()=>openDlg({title:"ดึงโพสต์ Instagram ด้วย Apify",wide:true,body:`<ol style="margin:0;padding-left:20px;line-height:1.8">
  <li>สมัคร/ล็อกอิน <a href="https://console.apify.com" target="_blank" rel="noopener">console.apify.com</a> แล้วเปิด Actor <a href="https://apify.com/apify/instagram-scraper" target="_blank" rel="noopener"><b>Instagram Scraper</b> (apify/instagram-scraper)</a></li>
  <li>ช่อง <b>Instagram URLs</b> ใส่ลิงก์โปรไฟล์คู่แข่งและของเรา เช่น <code>https://www.instagram.com/ชื่อบัญชี/</code></li>
  <li><b>What do you want to scrape</b> = Posts · <b>Max posts per profile</b> เริ่มที่ 30–50 · ตั้งวันเริ่มได้ที่ “Posts newer than” (ถ้ามี)</li>
  <li>กด <b>Start</b> เมื่อเสร็จ ไปที่ <b>Export</b> เลือก <b>JSON</b> แล้วดาวน์โหลด</li>
  <li>กลับมาหน้านี้ กด <b>⤒ นำเข้าข้อมูล</b> แล้วเลือกไฟล์ ระบบรวมโพสต์ซ้ำให้อัตโนมัติ (นำเข้าซ้ำได้ ตัวเลขจะอัปเดตเป็นล่าสุด)</li>
  <li>ถ้าต้องการยอดผู้ติดตามสำหรับ Engagement Rate ใช้ Actor <b>Instagram Profile Scraper</b> แล้วนำเข้าไฟล์เดียวกันนี้ได้ หรือกรอกเองที่เมนู “บัญชี”</li></ol>
  <div class="note" style="margin-top:12px"><b>ก่อนใช้งาน:</b> Apify คิดค่าบริการตามการใช้งาน (มีเครดิตฟรีรายเดือนในแพ็กเกจฟรี) ควรตรวจราคาล่าสุดและขออนุมัติก่อนตั้งรันอัตโนมัติ · ดึงเฉพาะข้อมูลสาธารณะของบัญชีแบรนด์ และปฏิบัติตามข้อกำหนดของ Instagram/Apify · ระบบเก็บเฉพาะข้อมูลโพสต์ (caption, ประเภท, Like, Comment, วันที่) ไม่เก็บคอมเมนต์หรือข้อมูลส่วนตัวของผู้ใช้ทั่วไป</div>
  <div class="cnt" style="margin-top:8px"><b>อยากให้รันเอง:</b> ใน Apify ตั้ง <b>Schedule</b> ให้ Actor รันทุกสัปดาห์ได้ แต่การส่งข้อมูลเข้าแอปยังต้องกดนำเข้า การดึงเข้าแอปอัตโนมัติต้องเก็บ Apify token ฝั่งเซิร์ฟเวอร์ (Cloud Function บนแพ็กเกจ Blaze) ซึ่งยังไม่ได้เปิดใช้ ต้องอนุมัติค่าใช้จ่ายก่อน</div>`,foot:["|",{label:"ปิด"}]});

ACT.igImport=()=>{let fname="";openDlg({title:"นำเข้าโพสต์ Instagram (Apify export)",wide:true,body:`<div class="row"><button class="btn" id="igPick" type="button">เลือกไฟล์ .json / .csv</button><span class="cnt" id="igFn"></span></div>${area("หรือวางข้อความ JSON/CSV","igTx","",7)}<div class="cnt">ระบุว่าบัญชีไหนเป็นของเราได้ที่ปุ่ม “บัญชี” หลังนำเข้า</div><div id="igPrev" class="cnt">ยังไม่มีข้อมูล</div>`,
  onOpen:()=>{const prev=()=>{const t=$("#igTx").value;if(!t.trim()){$("#igPrev").textContent="ยังไม่มีข้อมูล";return}const r=igParse(t);if(r.err){$("#igPrev").innerHTML=`<span style="color:var(--chili)">${esc(r.err)}</span>`;return}
      const us=[...new Set(r.posts.map(p=>p.username))];const nw=r.posts.filter(p=>!S.igPosts.some(x=>x.id===p.id)).length;
      $("#igPrev").innerHTML=`พบ <b>${r.posts.length}</b> โพสต์ (ใหม่ ${nw} · อัปเดต ${r.posts.length-nw}) จาก ${us.length} บัญชี: ${us.map(u=>"@"+esc(u)).join(", ")}${r.accs.length?` · ข้อมูลโปรไฟล์ ${r.accs.length} บัญชี`:""}${r.posts.some(p=>p.likes==null)?` · ซ่อนยอด Like ${r.posts.filter(p=>p.likes==null).length} โพสต์`:""}`};
    $("#igTx").oninput=prev;$("#igPick").onclick=async()=>{const f=await pickFile(".json,.csv,application/json,text/csv");if(!f)return;fname=f.name;$("#igFn").textContent=f.name;$("#igTx").value=await f.text();prev()}},
  foot:["|",{label:"ยกเลิก"},{label:"นำเข้า",cls:"primary",act:async()=>{const r=igParse($("#igTx").value);if(r.err){toast(r.err);return false}let add=0,up=0;
    try{const us=new Set(r.posts.map(p=>p.username));for(const a of r.accs)us.add(a.username);
      for(const u of us){const a=r.accs.find(x=>x.username===u)||{};const ex=igAccOf(u);const d={username:u,...(a.name?{name:a.name}:{}),...(a.followers!=null?{followers:a.followers,followersAt:nowISO(),followersSrc:"Apify"}:{})};
        if(ex)await dbUpd(COL.igAcc,ex.id,d);else await dbSetNew(COL.igAcc,"A-"+u.replace(/[^a-z0-9._]/g,"_"),{own:false,...d})}
      for(const p of r.posts){const{id,...d}=p;const ex=S.igPosts.find(x=>x.id===id);const src={source:"Apify"+(fname?" · "+fname:""),fetchedAt:nowISO()};
        if(ex){await dbUpd(COL.igPosts,id,{likes:d.likes,comments:d.comments,views:d.views,caption:d.caption,hashtags:d.hashtags,type:d.type,...src});up++}else{await dbSetNew(COL.igPosts,id,{...d,category:null,...src});add++}}
      toast(`นำเข้าใหม่ ${add} · อัปเดต ${up} โพสต์`)}catch(e){toast(dbErr(e));return false}}}]})};

ACT.igAccounts=()=>{const us=igUsers();openDlg({title:"บัญชีที่ติดตาม",wide:true,body:us.length?`<div class="cnt">ยอดผู้ติดตามใช้คำนวณ Engagement Rate ช่องว่าง = ไม่ทราบ</div>${us.map(u=>{const a=igAccOf(u)||{};const k=u.replace(/[^a-z0-9]/g,"_");return`<div class="row" style="align-items:flex-end"><b style="flex:1 1 140px">@${esc(u)}</b>${fld("ผู้ติดตาม","igF_"+k,a.followers??"","number","min='0'")}<label class="chk"><input type="checkbox" id="igO_${k}" ${a.own?"checked":""}><span>บัญชีเรา</span></label><button class="btn ghost sm" data-act="igDelAcc" data-u="${esc(u)}">ลบข้อมูล</button></div>${a.followersSrc?`<div class="cnt">ผู้ติดตามจาก ${esc(a.followersSrc)} ${thDT(a.followersAt)}</div>`:""}`}).join("")}`:`<div class="empty">ยังไม่มีบัญชี นำเข้าข้อมูลก่อน</div>`,
  foot:["|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{try{for(const u of us){const k=u.replace(/[^a-z0-9]/g,"_");const fo=N(V("igF_"+k));const own=$("#igO_"+k).checked;const a=igAccOf(u);
      const d={username:u,followers:fo,own,...(fo!==(a?.followers??null)?{followersSrc:"กรอกเอง",followersAt:nowISO()}:{})};if(a)await dbUpd(COL.igAcc,a.id,d);else await dbSetNew(COL.igAcc,"A-"+u.replace(/[^a-z0-9._]/g,"_"),d)}toast("บันทึกแล้ว")}catch(e){toast(dbErr(e));return false}}}]})};
ACT.igDelAcc=el=>{const u=el.dataset.u;const ps=S.igPosts.filter(p=>p.username===u);openDlg({title:`ลบข้อมูล @${u}?`,body:`<p>ลบโพสต์ที่นำเข้า ${ps.length} โพสต์ และข้อมูลบัญชีนี้ ไม่กระทบ Instagram</p>`,foot:["|",{label:"ยกเลิก"},{label:"ลบ",cls:"danger",act:async()=>{try{for(const p of ps)await dbDel(COL.igPosts,p.id);const a=igAccOf(u);if(a)await dbDel(COL.igAcc,a.id);toast("ลบแล้ว")}catch(e){toast(dbErr(e))}}}]})};

ACT.igCatRule=()=>{const ps=igFiltered().filter(p=>!p.category);if(!ps.length){toast("ทุกโพสต์ในช่วงนี้มีหมวดแล้ว");return}
  openDlg({title:"จัดหมวดจากคำสำคัญ",body:`<p>จัดหมวด ${ps.length} โพสต์ที่ยังไม่มีหมวด โดยดูคำใน caption (เช่น “โปร”, “สูตร”, “ฟาร์ม”) ผลเป็นการเดาแบบง่าย แก้ทีละโพสต์ได้ในตาราง</p>`,foot:["|",{label:"ยกเลิก"},{label:"จัดหมวด",cls:"primary",act:async()=>{try{for(const p of ps)await dbUpd(COL.igPosts,p.id,{category:igRuleCat(p.caption),catBy:"rule"});toast(`จัดหมวด ${ps.length} โพสต์`)}catch(e){toast(dbErr(e))}}}]})};
ACT.igCatAI=async el=>{if(!sample){toast("ยังไม่ได้เปิดใช้ AI ในเว็บนี้ ใช้ “จัดหมวดจากคำสำคัญ” แทนได้");return}const ps=igFiltered().filter(p=>p.catBy!=="manual").slice(0,120);if(!ps.length){toast("ไม่มีโพสต์ให้จัดหมวด");return}
  el.disabled=true;let done=0;try{for(let i=0;i<ps.length;i+=40){const ch=ps.slice(i,i+40);el.textContent=`กำลังจัดหมวด ${i}/${ps.length}…`;
      const r=await sample.json(`จัดหมวดโพสต์ Instagram ของแบรนด์อาหาร/ผักผลไม้ ตามหมวดที่กำหนดเท่านั้น: ${IG_CAT.join(" | ")}\nดูจาก caption และประเภทโพสต์ ถ้าไม่ชัดให้ใช้ "อื่นๆ"\n${ch.map(p=>`${p.id} [${IG_TYPE[p.type]}] ${p.caption.replace(/\s+/g," ").slice(0,300)}`).join("\n")}\nตอบ JSON เท่านั้น: {"items":[{"id":"...","category":"..."}]}`,{modelTier:"quick"});
      for(const it of r?.items||[]){if(!IG_CAT.includes(it.category)||!ch.some(p=>p.id===it.id))continue;await dbUpd(COL.igPosts,it.id,{category:it.category,catBy:"ai"});done++}}toast(`AI จัดหมวด ${done} โพสต์ (แก้ได้ในตาราง)`)}
  catch(e){toast(aiErr(e))}finally{el.disabled=false;el.textContent="✦ จัดหมวดด้วย AI"}};

ACT.igAI=async el=>{if(!sample){toast("ยังไม่ได้เปิดใช้ AI ในเว็บนี้");return}const posts=igFiltered();if(!posts.length)return;const us=igUsers().filter(u=>posts.some(p=>p.username===u));
  const lines=us.map(u=>{const ps=posts.filter(p=>p.username===u);const t=Object.keys(IG_TYPE).map(k=>{const x=ps.filter(p=>p.type===k);return x.length?`${IG_TYPE[k]} ${x.length} โพสต์ eng เฉลี่ย ${Math.round(avgOf(x.map(igEng))||0)}`:""}).filter(Boolean).join(", ");
    const c=IG_CAT.map(k=>{const x=ps.filter(p=>p.category===k);return x.length?`${k} ${x.length} (eng ${Math.round(avgOf(x.map(igEng))||0)})`:""}).filter(Boolean).join(", ");
    const er=avgOf(ps.map(igER));return`@${u}${igAccOf(u)?.own?" (แบรนด์เรา)":""}: ${ps.length} โพสต์, like เฉลี่ย ${Math.round(avgOf(ps.map(p=>p.likes))||0)}, comment เฉลี่ย ${Math.round(avgOf(ps.map(p=>p.comments))||0)}, ER ${er==null?"ไม่ทราบ":(er*100).toFixed(2)+"%"}; ประเภท: ${t}; หมวด: ${c||"ยังไม่จัด"}`}).join("\n");
  const top=posts.filter(p=>igEng(p)!=null).sort((a,b)=>igEng(b)-igEng(a)).slice(0,10).map(p=>`@${p.username} [${IG_TYPE[p.type]}${p.category?"/"+p.category:""}] eng ${igEng(p)}: ${p.caption.replace(/\s+/g," ").slice(0,160)}`).join("\n");
  el.disabled=true;el.textContent="กำลังวิเคราะห์…";
  try{const r=await sample.json(`คุณคือนักวางกลยุทธ์คอนเทนต์ของ ${S.brand?.name||"Delish Foods"} (ผักผลไม้พรีเมียม วัตถุดิบหายาก ไมโครกรีน ดอกไม้กินได้ ลูกค้า B2B/B2C/B2M)\nข้อมูล Instagram ที่นำเข้า (คำนวณจริง ห้ามเติมตัวเลขที่ไม่มี):\n${lines}\nTop posts:\n${top}\nสรุปเป็นภาษาไทย 1) Key Insights 4-5 ข้อ (คู่แข่งเน้นอะไร คอนเทนต์ไหนได้ engagement สูง ความถี่การโพสต์ pattern) อ้างตัวเลขจากข้อมูล 2) Content Opportunities 3-5 ข้อที่แบรนด์เรานำไปทำได้จริง\nตอบ JSON เท่านั้น: {"insights":["..."],"opps":["..."]}`,{modelTier:"default"});
    const ins=(r?.insights||[]).map(String).filter(Boolean),opps=(r?.opps||[]).map(String).filter(Boolean);if(!ins.length&&!opps.length){toast("AI ไม่ได้ส่งผลลัพธ์กลับ");return}
    const a=igAccOf("__insight");const d={username:"__insight",hidden:true,ai:{insights:ins,opps,at:nowISO(),n:posts.length}};if(a)await dbUpd(COL.igAcc,a.id,d);else await dbSetNew(COL.igAcc,"A-__insight",d);toast("วิเคราะห์แล้ว")}
  catch(e){toast(aiErr(e))}finally{el.disabled=false;el.textContent="✦ วิเคราะห์ด้วย AI"}};
ACT.igOppIdea=async el=>{const t=igAccOf("__insight")?.ai?.opps?.[+el.dataset.i];if(!t)return;if(S.ideas.some(x=>x.title.trim().toLowerCase()===t.trim().toLowerCase())){toast("มีไอเดียนี้แล้ว");return}
  try{await dbAdd(COL.ideas,{title:t.slice(0,200),pillar:"",note:"จากการวิเคราะห์ Instagram คู่แข่ง (AI)"});toast("ส่งไป Idea Vault แล้ว")}catch(e){toast(dbErr(e))}};
ACT.igCSV=()=>{const ps=igFiltered();saveFile(`instagram-competitors-${today()}.csv`,"﻿"+toCSV([["username","postedAt","type","category","likes","comments","views","engagement","er","url","caption"],...ps.map(p=>[p.username,p.postedAt,IG_TYPE[p.type],p.category||"",p.likes,p.comments,p.views,igEng(p),igER(p)==null?"":(igER(p)*100).toFixed(2)+"%",p.url,p.caption])]))};

// ================= ADS: import from the Ad Report tool (index.html snapshot or its CSV export) =================
// The Ad Report tool stores daily rows spread from each exported period. Here they are summed per month × platform × campaign.
const AR_MET=["spend","impressions","views","clicks","engagement","messages","followers","leads","orders","revenue","reach"];
const AR_OBJ={msg:"ข้อความ",lead:"ลีด",sal:"ยอดขาย",eng:"Engagement",fol:"ผู้ติดตาม",trf:"Traffic",awa:"Awareness"};
function arParse(text){text=String(text||"").replace(/^\uFEFF/,"");let rows=[];
  if(/^\s*\[/.test(text)){try{const j=JSON.parse(text);const docs=j.filter(x=>x&&/^A-[a-z0-9]+$/.test(x.id||"")&&x.data&&/^\d{4}-\d{2}$/.test(x.data.month||"")&&x.data.campaign);if(docs.length)return{docs}}catch(e){}return{err:"ไฟล์ JSON ไม่ใช่รูปแบบข้อมูลโฆษณาของแอปนี้"}}
  const i=text.indexOf("window.SNAPSHOT");
  if(i>=0){const s=text.indexOf("{",i),e=text.indexOf("<\/script>",s);let j;try{j=JSON.parse(text.slice(s,e).trim().replace(/;\s*$/,""))}catch(err){return{err:"อ่านข้อมูลในไฟล์ HTML ไม่ได้"}}
    rows=(j.rows||[]).filter(a=>Array.isArray(a)&&a.length>=15).map(a=>({d:a[0],ch:a[1],cp:a[2],ob:a[3],v:a.slice(4,15).map(Number)}));
    return rows.length?{rows,signups:j.settings?.extra?.byMonth||{},webCamps:j.settings?.extra?.webCamps||[],at:j.at}:{err:"ไม่พบแถวข้อมูลในไฟล์"}}
  const c=parseCSV(text);if(c.length<2)return{err:"ไม่พบข้อมูล ต้องเป็นไฟล์ index.html หรือ CSV ที่ส่งออกจากระบบรายงานโฆษณา"};
  const h=c[0].map(x=>x.trim().toLowerCase());const ix=k=>h.indexOf(k);
  if(ix("date")<0||ix("campaign")<0||ix("spend")<0)return{err:"CSV ต้องมีคอลัมน์ date, channel, campaign, spend (รูปแบบส่งออกของระบบรายงานโฆษณา)"};
  const keys=["spend","impressions","views","clicks","engagement","messages","followers","leads","orders","sales","reach"];
  rows=c.slice(1).filter(r=>r.some(Boolean)).map(r=>({d:normDate(r[ix("date")]),ch:r[ix("channel")]||"",cp:r[ix("campaign")]||"",ob:r[ix("objective")]||"",v:keys.map(k=>ix(k)<0?0:Number(r[ix(k)])||0)})).filter(r=>r.d&&r.cp);
  return rows.length?{rows,signups:{}}:{err:"ไม่พบแถวที่มีวันที่และแคมเปญ"}}
function arMonthly(rows,fname){const g=new Map();
  for(const r of rows){const m=r.d.slice(0,7),p=normPlat(r.ch)||"other",k=m+"|"+p+"|"+r.cp.trim();let x=g.get(k);
    if(!x){x={month:m,platform:p,campaign:r.cp.trim(),channel:r.ch,objective:r.ob,from:r.d,to:r.d,days:0,t:AR_MET.map(()=>0)};g.set(k,x)}
    x.days++;if(r.d<x.from)x.from=r.d;if(r.d>x.to)x.to=r.d;r.v.forEach((v,i)=>x.t[i]+=v||0)}
  return[...g.values()].map(x=>{const d={date:"",month:x.month,platform:x.platform,campaign:x.campaign,objective:x.objective,channelName:x.channel,rangeFrom:x.from,rangeTo:x.to,days:x.days,
      source:`รายงานโฆษณา${fname?" · "+fname:""} · รวมรายเดือน`};
    AR_MET.forEach((k,i)=>{const v=Math.round(x.t[i]*100)/100;d[k]=k==="spend"?v:(v?v:null)});return{id:"A-"+hash(adKey(d)),data:d}})}
let arExtra={signups:{},webCamps:[]};
ACT.adsReportImport=()=>{let fname="",parsed=null;arExtra={signups:{},webCamps:[]};
  openDlg({title:"นำเข้าจากระบบรายงานโฆษณา",wide:true,body:`<div class="row"><button class="btn" id="arPick" type="button">เลือกไฟล์ index.html, .csv หรือ .json</button><span class="cnt" id="arFn"></span></div>
    <div class="cnt" style="margin-top:6px">ใช้ไฟล์ index.html ที่ดาวน์โหลดจากระบบรายงานโฆษณา หรือ CSV ที่ส่งออกจากระบบนั้น ระบบจะรวมเป็นรายเดือนต่อแคมเปญ นำเข้าซ้ำได้ เดือนที่มีอยู่แล้วจะถูกอัปเดตเป็นตัวเลขล่าสุด ไม่สร้างแถวซ้ำ</div><div id="arPrev" style="margin-top:10px"></div>`,
    onOpen:()=>{$("#arPick").onclick=async()=>{const f=await pickFile(".html,.htm,.csv,.json,text/html,text/csv,application/json");if(!f)return;fname=f.name;$("#arFn").textContent=f.name;const r=arParse(await f.text());
      if(r.err){parsed=null;$("#arPrev").innerHTML=`<div class="note bad">${esc(r.err)}</div>`;return}
      arExtra={signups:r.signups||{},webCamps:(r.webCamps||[]).map(s=>s.trim())};parsed=r.docs?r.docs.map(({id,data})=>{const{createdAt,updatedAt,createdBy,updatedBy,...d}=data;return{id,data:d}}):arMonthly(r.rows,fname);const nw=parsed.filter(x=>!S.ads.some(a=>a.id===x.id)).length;const tot=parsed.reduce((a,x)=>a+(x.data.spend||0),0);
      $("#arPrev").innerHTML=`<div class="note">พบ ${r.rows?r.rows.length+" แถวรายวัน →":""} ${parsed.length} แถวรายเดือน (ใหม่ ${nw} · อัปเดต ${parsed.length-nw}) · Spend รวม ${baht(tot)}</div>
      <div class="tablewrap"><table><thead><tr><th>เดือน</th><th>แพลตฟอร์ม</th><th>แคมเปญ</th><th>เป้าหมาย</th><th class="r">Spend</th><th class="r">ข้อความ</th><th class="r">Leads</th><th class="r">ยอดขาย</th></tr></thead><tbody>${parsed.map(({data:d})=>`<tr><td>${thMonth(d.month)}</td><td>${esc(PLAT[d.platform]||d.platform)}</td><td>${esc(d.campaign)}</td><td>${esc(AR_OBJ[d.objective]||d.objective||"-")}</td><td class="r num">${baht(d.spend)}</td><td class="r num">${fmtN(d.messages)}</td><td class="r num">${fmtN(d.leads)}</td><td class="r num">${baht(d.revenue)}</td></tr>`).join("")}</tbody></table></div>`}},
    foot:["|",{label:"ยกเลิก"},{label:"นำเข้า",cls:"primary",act:async()=>{if(!parsed){toast("เลือกไฟล์ก่อน");return false}let add=0,up=0,skip=0;
      try{for(const{id,data}of parsed){const ex=S.ads.find(a=>a.id===id);if(ex?.manual&&!data.manual){skip++;continue}if(arExtra.webCamps.length)data.web=arExtra.webCamps.includes(String(data.campaign).trim());if(ex){const{verified,...rest}=data;await dbUpd(COL.ads,id,rest);up++}else{await dbSetNew(COL.ads,id,data);add++}}
        for(const[m,v]of Object.entries(arExtra.signups)){if(!/^\d{4}-\d{2}$/.test(m)||N(v)==null)continue;const ex=S.admonths.find(x=>x.id===m);if(ex?.manual)continue;if(ex)await dbUpd(COL.admonths,m,{signups:N(v),source:"รายงานโฆษณา"});else await dbSetNew(COL.admonths,m,{month:m,signups:N(v),source:"รายงานโฆษณา"})}toast(`นำเข้าใหม่ ${add} · อัปเดต ${up} แถว${skip?` · ข้ามแถวที่ทีมแก้ตัวเลขเอง ${skip}`:""}`)}catch(e){toast(dbErr(e));return false}}}]})};
const _adsReportBase=adsReport;
adsReport=function(){_adsReportBase();const b=$('#adsBody [data-act="adsImport"]');if(b)b.insertAdjacentHTML("beforebegin",`<button class="btn" data-act="adsReportImport">นำเข้าจากระบบรายงานโฆษณา</button>`);
  const rows=adsRows();const has=k=>rows.some(r=>r[k]!=null);if(!["messages","views","engagement","followers","orders","reach","salesLeads","storeSales"].some(has))return;
  const k=$("#adsBody .kpis");const a=x=>agg(rows,x);const sp=a("spend").sum;const msg=a("messages"),ld=a("leads"),vw=a("views"),eg=a("engagement"),fo=a("followers"),od=a("orders"),rc=a("reach"),sl=a("salesLeads");const notes=rows.filter(r=>r.note||r.storeSales!=null);
  const byObj={};for(const r of rows){const o=r.objective||"-";(byObj[o]=byObj[o]||[]).push(r)}
  k.insertAdjacentHTML("afterend",`<div class="panel"><div class="ph"><h2>ผลลัพธ์ตามเป้าหมายโฆษณา</h2><span class="cnt">จากแถวที่นำเข้าจากระบบรายงานโฆษณา</span></div>
   <div class="kpis"><div class="kpi"><small>ข้อความ (Messages)</small><b>${fmtN(msg.sum)}</b><em>ต้นทุน/ข้อความ ${baht(ratio(agg(rows.filter(r=>r.messages!=null),"spend").sum,msg.sum))}</em></div><div class="kpi"><small>Views</small><b>${fmtK(vw.sum)}</b></div><div class="kpi"><small>Engagement</small><b>${fmtK(eg.sum)}</b></div><div class="kpi"><small>ผู้ติดตามใหม่</small><b>${fmtN(fo.sum)}</b></div><div class="kpi"><small>คำสั่งซื้อ</small><b>${fmtN(od.sum)}</b></div><div class="kpi"><small>Reach (รวมแต่ละแคมเปญ)</small><b>${fmtK(rc.sum)}</b><em>${rc.n} แคมเปญ-เดือนที่มีข้อมูล</em></div><div class="kpi"><small>รายชื่อส่งให้เซล</small><b>${fmtN(sl.sum)}</b><em>${sl.n?`จากลีด ${fmtN(agg(rows.filter(r=>r.salesLeads!=null),"leads").sum)} ราย · ต้นทุน/รายชื่อ ${baht(ratio(agg(rows.filter(r=>r.salesLeads!=null),"spend").sum,sl.sum))}`:"ยังไม่มีข้อมูล"}</em></div></div>
   <div class="tablewrap" style="margin-top:10px"><table><thead><tr><th>เป้าหมาย</th><th class="r">แคมเปญ-เดือน</th><th class="r">Spend</th><th class="r">ข้อความ</th><th class="r">Leads</th><th class="r">ส่งเซล</th><th class="r">Engagement</th><th class="r">ยอดขาย</th></tr></thead><tbody>${Object.entries(byObj).sort((x,y)=>(agg(y[1],"spend").sum||0)-(agg(x[1],"spend").sum||0)).map(([o,rs])=>`<tr><td>${esc(AR_OBJ[o]||o)}</td><td class="r num">${rs.length}</td><td class="r num">${baht(agg(rs,"spend").sum)}</td><td class="r num">${fmtN(agg(rs,"messages").sum)}</td><td class="r num">${fmtN(agg(rs,"leads").sum)}</td><td class="r num">${fmtN(agg(rs,"salesLeads").sum)}</td><td class="r num">${fmtK(agg(rs,"engagement").sum)}</td><td class="r num">${baht(agg(rs,"revenue").sum)}</td></tr>`).join("")}</tbody></table></div>${notes.length?`<div class="note" style="margin-top:10px">${notes.map(r=>`<div><b>${esc(r.campaign)}</b> (${thMonth(r.month)})${r.storeSales!=null?` · ยอดขายรวมร้าน ${baht(r.storeSales)} — แยกส่วนที่มาจากโฆษณาไม่ได้ จึงไม่นับใน Revenue/ROAS`:""}${r.note?` · ${esc(r.note)}`:""}</div>`).join("")}</div>`:""}</div>`)};
// Cost ratios use only the spend of rows that report that metric (a row without clicks must not inflate CPC).
adsSum=function(rows){const a=k=>agg(rows,k);const sp=a("spend"),cl=a("clicks"),ld=a("leads"),rv=a("revenue"),vr=a("verified");const spOf=k=>agg(rows.filter(r=>r[k]!=null&&r[k]!==""),"spend").sum;
  return{sp,cl,ld,rv,vr,cpc:ratio(spOf("clicks"),cl.sum),cpl:ratio(spOf("leads"),ld.sum),roas:ratio(rv.sum,spOf("revenue")),roasV:ratio(vr.sum,spOf("verified"))}};

// ================= ADS: visual insights (website funnel · sales & ROAS · cost vs rate) =================
S.admonths=[];COL.admonths="ad_months";
const AD_PAL=["var(--accent)","var(--mango)","var(--sky)","var(--plum)","var(--chili)","var(--ig)","var(--muted)"];
const fmtB=v=>v==null?"–":"฿"+fmtN(v,v<100?2:0);
function niceMax(v){if(!(v>0))return 1;const p=10**Math.floor(Math.log10(v));const n=v/p;return(n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p}
function adWebChart(){const rows=S.ads.filter(r=>!S.ui.adsPlat||r.platform===S.ui.adsPlat);
  const months=[...new Set(rows.map(r=>r.month).concat(S.admonths.map(x=>x.month)))].filter(Boolean).sort();if(!months.length)return"";
  const webN=rows.filter(r=>r.web).length;
  const D=months.map(m=>{const w=rows.filter(r=>r.month===m&&r.web),o=rows.filter(r=>r.month===m&&!r.web);const sp=agg(w,"spend").sum;
    const ld=w.some(r=>r.salesLeads!=null||r.leads!=null)?w.reduce((a,r)=>a+(r.salesLeads??r.leads??0),0):null;const su=N(S.admonths.find(x=>x.month===m)?.signups);
    return{m,ld,su,sp,cpl:ratio(sp,ld),cps:ratio(sp,su),b2c:agg(o,"spend").sum}});
  const W=640,H=250,L=40,R=52,T=16,B=30,n=D.length,gw=(W-L-R)/n,bw=Math.min(34,gw/3);
  const yM=niceMax(Math.max(1,...D.map(d=>Math.max(d.ld||0,d.su||0)))),cM=niceMax(Math.max(1,...D.map(d=>Math.max(d.cpl||0,d.cps||0))));
  const y=v=>T+(1-v/yM)*(H-T-B),yc=v=>T+(1-v/cM)*(H-T-B),cx=i=>L+gw*i+gw/2;
  const line=(k,c,dash)=>{const pts=D.map((d,i)=>d[k]==null?null:[cx(i),yc(d[k])]).filter(Boolean);return pts.length?`<path d="M${pts.map(p=>p.join(" ")).join(" L")}" fill="none" stroke="${c}" stroke-width="2.5" ${dash?'stroke-dasharray="6 5"':""}/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${c}" stroke="var(--surface)" stroke-width="2"/>`).join("")}`:""};
  const svg=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;height:auto" role="img" aria-label="รายชื่อและสมัครสมาชิกจากแคมเปญเว็บไซต์ พร้อมต้นทุนต่อหน่วย">
   ${[0,.2,.4,.6,.8,1].map(g=>`<line x1="${L}" x2="${W-R}" y1="${y(yM*g)}" y2="${y(yM*g)}" stroke="var(--line)"/><text x="${L-8}" y="${y(yM*g)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmtN(yM*g)}</text><text x="${W-R+8}" y="${yc(cM*g)+4}" font-size="11" fill="var(--muted)">฿${fmtN(cM*g)}</text>`).join("")}
   ${D.map((d,i)=>`${d.ld!=null?`<rect x="${cx(i)-bw-2}" y="${y(d.ld)}" width="${bw}" height="${H-B-y(d.ld)}" rx="4" fill="var(--mango)"><title>${thMonth(d.m)} รายชื่อ ${d.ld}</title></rect><text x="${cx(i)-bw/2-2}" y="${y(d.ld)-5}" text-anchor="middle" font-size="11" fill="var(--ink)">${fmtN(d.ld)}</text>`:""}${d.su!=null?`<rect x="${cx(i)+2}" y="${y(d.su)}" width="${bw}" height="${H-B-y(d.su)}" rx="4" fill="var(--accent)"><title>${thMonth(d.m)} สมัครสมาชิก ${d.su}</title></rect><text x="${cx(i)+bw/2+2}" y="${y(d.su)-5}" text-anchor="middle" font-size="11" fill="var(--ink)">${fmtN(d.su)}</text>`:""}<text x="${cx(i)}" y="${H-10}" text-anchor="middle" font-size="12" fill="var(--muted)">${["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."][+d.m.slice(5)-1]} ${String(+d.m.slice(0,4)+543).slice(2)}</text>`).join("")}
   ${line("cpl","var(--chili)",true)}${line("cps","var(--sky)")}</svg>`;
  const tot={ld:D.reduce((a,d)=>a+(d.ld||0),0),su:D.reduce((a,d)=>a+(d.su||0),0),sp:D.reduce((a,d)=>a+(d.sp||0),0),b2c:D.reduce((a,d)=>a+(d.b2c||0),0)};
  return`<div class="panel"><div class="ph"><div><h2>Website: รายชื่อส่งทีมขาย & สมัครสมาชิก</h2><div class="cnt">ต้นทุนคิดจากงบแคมเปญที่ยิงเข้าเว็บไซต์เท่านั้น${webN?`: ${[...new Set(rows.filter(r=>r.web).map(r=>r.campaign))].map(esc).join(", ")}`:""} · แคมเปญอื่นนับเป็น B2C</div></div><button class="btn sm" data-act="adWebSet">ตั้งค่าแคมเปญเว็บ & สมัครสมาชิก</button></div>
   ${webN||S.admonths.length?`${svg}<div class="legend"><span><span class="dot" style="background:var(--mango);border-radius:2px"></span>รายชื่อส่งทีมขาย</span><span><span class="dot" style="background:var(--accent);border-radius:2px"></span>สมัครสมาชิก</span><span><span class="dot" style="background:var(--chili)"></span>ต้นทุน/รายชื่อ (เส้นประ)</span><span><span class="dot" style="background:var(--sky)"></span>ต้นทุน/สมาชิก</span></div>
   <div class="tablewrap" style="margin-top:10px"><table><thead><tr><th>เดือน</th><th class="r">รายชื่อส่งทีมขาย</th><th class="r">สมัครสมาชิก</th><th class="r">งบแคมเปญ Website</th><th class="r">ต้นทุน/รายชื่อ</th><th class="r">ต้นทุน/สมาชิก</th><th class="r">งบ B2C</th></tr></thead><tbody>
   ${D.map(d=>`<tr><td>${thMonth(d.m)}</td><td class="r num">${d.ld==null?"–":fmtN(d.ld)}</td><td class="r num">${d.su==null?"–":fmtN(d.su)}</td><td class="r num">${d.sp==null?"–":fmtB(d.sp)}</td><td class="r num">${fmtB(d.cpl)}</td><td class="r num">${fmtB(d.cps)}</td><td class="r num">${d.b2c==null?"–":fmtB(d.b2c)}</td></tr>`).join("")}
   <tr style="font-weight:700"><td>รวม</td><td class="r num">${fmtN(tot.ld)}</td><td class="r num">${fmtN(tot.su)}</td><td class="r num">${fmtB(tot.sp)}</td><td class="r num">${fmtB(ratio(tot.sp,tot.ld))}</td><td class="r num">${fmtB(ratio(tot.sp,tot.su))}</td><td class="r num">${fmtB(tot.b2c)}</td></tr></tbody></table></div>
   <div class="cnt" style="margin-top:6px">รายชื่อส่งทีมขาย = ช่อง “ส่งเซล” ถ้ามี ไม่มีจึงใช้ Leads · สมัครสมาชิกมาจากไฟล์รายงานโฆษณาหรือที่กรอกเอง</div>`
   :`<div class="empty">ยังไม่ได้ระบุว่าแคมเปญไหนยิงเข้าเว็บไซต์ กด “ตั้งค่าแคมเปญเว็บ & สมัครสมาชิก”</div>`}</div>`}

function adRoasChart(rows){const g={};for(const r of rows){(g[r.campaign]=g[r.campaign]||[]).push(r)}
  const C=Object.entries(g).map(([c,rs])=>{const sp=agg(rs,"spend").sum,rv=agg(rs,"revenue").sum,spR=agg(rs.filter(r=>r.revenue!=null),"spend").sum;return{c,sp,rv,roas:ratio(rv,spR),store:agg(rs,"storeSales").sum}}).filter(x=>x.sp!=null).sort((a,b)=>(b.rv||0)-(a.rv||0)||(b.sp||0)-(a.sp||0));
  if(!C.length)return"";const W=640,L=180,R=20,T=34,rh=44,H=T+C.length*rh+26,xM=niceMax(Math.max(1,...C.map(x=>Math.max(x.rv||0,x.sp||0)))),rM=niceMax(Math.max(1,...C.map(x=>x.roas||0)));
  const x=v=>L+v/xM*(W-L-R),xr=v=>L+v/rM*(W-L-R),xr2=v=>v.toFixed(2)+"x";
  const svg=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;height:auto" role="img" aria-label="ยอดขาย ค่าใช้จ่าย และ ROAS ตามแคมเปญ">
   ${[0,.25,.5,.75,1].map(g=>`<line x1="${x(xM*g)}" x2="${x(xM*g)}" y1="${T-6}" y2="${H-24}" stroke="var(--line)"/><text x="${x(xM*g)}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--muted)">฿${fmtK(xM*g)}</text><text x="${xr(rM*g)}" y="${T-12}" text-anchor="middle" font-size="11" fill="var(--chili)">${+(rM*g).toFixed(1)}x</text>`).join("")}
   ${C.map((d,i)=>{const y0=T+i*rh;return`<text x="${L-10}" y="${y0+20}" text-anchor="end" font-size="12" fill="var(--ink)">${esc(d.c.length>24?d.c.slice(0,23)+"…":d.c)}<title>${esc(d.c)}</title></text>
     ${d.rv!=null?`<rect x="${L}" y="${y0+4}" width="${x(d.rv)-L}" height="16" rx="3" fill="var(--accent)"><title>ยอดขาย ${baht(d.rv)}</title></rect>`:""}<rect x="${L}" y="${y0+22}" width="${Math.max(1,x(d.sp)-L)}" height="12" rx="3" fill="var(--muted)" opacity=".55"><title>ค่าใช้จ่าย ${baht(d.sp)}</title></rect>
     ${d.roas!=null?`<rect x="${xr(d.roas)-7}" y="${y0+12-7}" width="14" height="14" fill="var(--chili)" stroke="var(--surface)" stroke-width="2" transform="rotate(45 ${xr(d.roas)} ${y0+12})"><title>ROAS ${xr2(d.roas)}</title></rect>`:""}`}).join("")}</svg>`;
  const tot={sp:agg(rows,"spend").sum,rv:agg(rows,"revenue").sum,spR:agg(rows.filter(r=>r.revenue!=null),"spend").sum};
  return`<div class="panel"><h2>ยอดขายและ ROAS ตามแคมเปญ</h2><div class="g2" style="align-items:start">
   <div>${svg}<div class="legend"><span><span class="dot" style="background:var(--chili);border-radius:1px;transform:rotate(45deg)"></span>ROAS (แกนบน)</span><span><span class="dot" style="background:var(--accent);border-radius:2px"></span>ยอดขาย</span><span><span class="dot" style="background:var(--muted);opacity:.55;border-radius:2px"></span>ค่าใช้จ่าย</span></div></div>
   <div class="tablewrap"><table><thead><tr><th>แคมเปญ</th><th class="r">ยอดขาย</th><th class="r">งบ</th><th class="r">ROAS</th></tr></thead><tbody>${C.map(d=>`<tr><td>${esc(d.c)}${d.store!=null?`<div class="cnt">ยอดขายรวมร้าน ${baht(d.store)} (ไม่นับ)</div>`:""}</td><td class="r num">${d.rv==null?"–":fmtB(d.rv)}</td><td class="r num">${fmtB(d.sp)}</td><td class="r num">${d.roas==null?"–":d.roas.toFixed(2)+"x"}</td></tr>`).join("")}
   <tr style="font-weight:700"><td>รวม</td><td class="r num">${fmtB(tot.rv)}</td><td class="r num">${fmtB(tot.sp)}</td><td class="r num">${ratio(tot.rv,tot.spR)==null?"–":ratio(tot.rv,tot.spR).toFixed(2)+"x"}</td></tr></tbody></table></div></div>
   <div class="cnt" style="margin-top:6px">ROAS คิดจากแคมเปญที่มียอดขายเท่านั้น · แคมเปญที่ไม่มียอดขาย (เช่น ลีด B2B) จะไม่มีจุด ROAS</div></div>`}

const AD_RES=[["msg","ข้อความ","messages","ต้นทุน/ข้อความ","ข้อความต่อยอดวิว","views"],["lead","ลีด","leads","ต้นทุน/ลีด","ลีดต่อยอดวิว","views"],["awa","ยอดวิว/การรับรู้","views","ต้นทุน/วิว","Engagement ต่อยอดวิว","views","engagement"],["trf","การเข้าชม","clicks","ต้นทุน/คลิก","คลิกต่อการแสดงผล","impressions"],["sal","ยอดขาย","orders","ต้นทุน/ออร์เดอร์","ออร์เดอร์ต่อการแสดงผล","impressions"]];
function adBubbles(rows){const g={};for(const r of rows){const k=r.objective||"-";(g[k]=g[k]||[]).push(r)}
  const cells=AD_RES.map(([ob,title,res,yl,xl,base,num])=>{const cs={};for(const r of g[ob]||[]){(cs[r.campaign]=cs[r.campaign]||[]).push(r)}
    const P=Object.entries(cs).map(([c,rs])=>{const sp=agg(rs,"spend").sum,rv=agg(rs,res).sum,bs=agg(rs,base).sum??(base==="impressions"?agg(rs,"views").sum:agg(rs,"impressions").sum),nm=num?agg(rs,num).sum:rv;
      return{c,sp,cost:ratio(sp,rv),rate:ratio(nm,bs)}}).filter(p=>p.cost!=null&&p.rate!=null);
    if(!(g[ob]||[]).length)return"";
    const W=300,H=200,L=52,B=34,T=10,R=24;const xM=niceMax(Math.max(...P.map(p=>p.rate),0)*1.15||0.01),yM=niceMax(Math.max(...P.map(p=>p.cost),0)*1.15||1),sM=Math.max(1,...P.map(p=>p.sp||0));
    const x=v=>L+v/xM*(W-L-R),y=v=>T+(1-v/yM)*(H-T-B);
    return`<div class="panel" style="padding:14px"><h3 style="font-size:15px;text-align:center;color:var(--accent);margin-bottom:4px">${title}</h3>${P.length?`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;height:auto" role="img" aria-label="${title}: ${yl} เทียบ ${xl}">
      ${[0,.5,1].map(t=>`<line x1="${L}" x2="${W-R}" y1="${y(yM*t)}" y2="${y(yM*t)}" stroke="var(--line)"/><text x="${L-6}" y="${y(yM*t)+4}" text-anchor="end" font-size="10" fill="var(--muted)">฿${yM*t<1?(yM*t).toFixed(2):fmtN(yM*t)}</text><line x1="${x(xM*t)}" x2="${x(xM*t)}" y1="${T}" y2="${H-B}" stroke="var(--line)"/><text x="${x(xM*t)}" y="${H-B+14}" text-anchor="middle" font-size="10" fill="var(--muted)">${(xM*t*100).toFixed(xM*100<1?2:1)}%</text>`).join("")}
      <text x="${(L+W-R)/2}" y="${H-4}" text-anchor="middle" font-size="10" fill="var(--muted)">${xl}</text><text x="12" y="${(T+H-B)/2}" text-anchor="middle" font-size="10" fill="var(--muted)" transform="rotate(-90 12 ${(T+H-B)/2})">${yl}</text>
      ${P.map((p,i)=>`<circle cx="${x(p.rate)}" cy="${y(p.cost)}" r="${8+16*Math.sqrt((p.sp||0)/sM)}" fill="${AD_PAL[i%AD_PAL.length]}" fill-opacity=".55" stroke="${AD_PAL[i%AD_PAL.length]}" stroke-width="1.5"><title>${esc(p.c)} · ${yl} ${fmtB(p.cost)} · ${xl} ${(p.rate*100).toFixed(2)}% · งบ ${baht(p.sp)}</title></circle>`).join("")}</svg>
      <div style="display:flex;flex-direction:column;gap:3px;font-size:12px">${P.map((p,i)=>`<span><span class="dot" style="background:${AD_PAL[i%AD_PAL.length]}"></span>${esc(p.c)} · ${fmtB(p.cost)} · ${baht(p.sp)}</span>`).join("")}</div>`
      :`<div class="empty" style="font-size:12px">มีแคมเปญ แต่ขาดตัวเลขผลลัพธ์หรือฐาน (${res}/${base}) จึงพล็อตไม่ได้</div>`}</div>`}).filter(Boolean);
  return cells.length?`<div class="panel"><div class="ph"><h2>แคมเปญเด่น: ต้นทุนต่อผลลัพธ์ เทียบอัตราผลลัพธ์</h2><span class="cnt">ขนาดวงกลม = งบ · มุมขวาล่างดีที่สุด (ถูกและได้ผลมาก)</span></div><div class="g3">${cells.join("")}</div></div>`:""}

ACT.adWebSet=()=>{const camps=[...new Set(S.ads.map(r=>r.campaign))].sort();const months=[...new Set(S.ads.map(r=>r.month).concat(S.admonths.map(x=>x.month)))].filter(Boolean).sort();
  openDlg({title:"แคมเปญเว็บไซต์ & ยอดสมัครสมาชิก",wide:true,body:`<label class="f">แคมเปญที่ยิงเข้าเว็บไซต์ (ใช้คิดต้นทุนต่อรายชื่อ/สมาชิก)</label><div class="chips">${camps.map((c,i)=>`<label class="chk"><input type="checkbox" name="adWeb" value="${i}" ${S.ads.some(r=>r.campaign===c&&r.web)?"checked":""}><span>${esc(c)}</span></label>`).join("")}</div>
    <div class="row" style="margin-top:12px">${months.map(m=>fld("สมัครสมาชิก "+thMonth(m),"su_"+m.replace("-","_"),S.admonths.find(x=>x.month===m)?.signups??"","number","min='0'")).join("")}</div><div class="cnt">ช่องว่าง = ไม่มีข้อมูล ไม่ใช่ 0</div>`,
    foot:["|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{try{const on=new Set($$('input[name="adWeb"]:checked').map(i=>camps[+i.value]));
      for(const r of S.ads){const w=on.has(r.campaign);if(!!r.web!==w)await dbUpd(COL.ads,r.id,{web:w})}
      for(const m of months){const v=N(V("su_"+m.replace("-","_")));const ex=S.admonths.find(x=>x.month===m);if(v==null){if(ex)await dbDel(COL.admonths,m);continue}
        if(ex){if(N(ex.signups)!==v)await dbUpd(COL.admonths,m,{signups:v,source:"กรอกเอง",manual:true})}else await dbSetNew(COL.admonths,m,{month:m,signups:v,source:"กรอกเอง",manual:true})}toast("บันทึกแล้ว")}catch(e){toast(dbErr(e));return false}}}]})};

const _adsReportV2=adsReport;
adsReport=function(){_adsReportV2();if(!S.ads.length)return;const rows=adsRows();const host=$("#adsBody .kpis");if(!host)return;
  const anchor=[...$$("#adsBody > .panel")].find(p=>/ผลลัพธ์ตามเป้าหมาย/.test(p.querySelector("h2")?.textContent||""))||host;
  anchor.insertAdjacentHTML("afterend",adWebChart()+adRoasChart(rows)+adBubbles(rows))};

// ================= IDEA VAULT v2: reference link + picture preview =================
// Preview rules (no server, nothing invented): pasted/picked picture → stored small JPEG; YouTube → official thumbnail;
// direct image URL → the image; any other link → a link card (platform + domain) because the browser cannot read other sites' preview images.
const IDEA_PLAT=[[/youtu\.?be/i,"YouTube","var(--yt)"],[/tiktok/i,"TikTok","var(--tt)"],[/instagram/i,"Instagram","var(--ig)"],[/facebook|fb\.watch/i,"Facebook","var(--fb)"],[/pinterest|pin\.it/i,"Pinterest","var(--chili)"],[/lemon8/i,"Lemon8","var(--mango)"],[/line\.me/i,"LINE","var(--line-oa)"],[/shopee|lazada/i,"Marketplace","var(--mango)"]];
const ytId=u=>{const m=String(u||"").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/);return m?m[1]:null};
const isImgUrl=u=>/^https?:\/\/\S+\.(?:png|jpe?g|gif|webp|avif)(?:[?#]\S*)?$/i.test(u||"");
const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return""}};
function ideaPreview(x){const u=x.url||"";const plat=IDEA_PLAT.find(([re])=>re.test(u));const pn=plat?plat[1]:hostOf(u)||"ลิงก์";const pc=plat?plat[2]:"var(--sky)";
  const box=inner=>u?`<a href="${esc(u)}" target="_blank" rel="noopener" class="ideaPv" title="เปิดลิงก์">${inner}</a>`:`<div class="ideaPv">${inner}</div>`;
  const card=`<div class="ideaCard" style="--c:${pc}"><b>${esc(pn)}</b><span>${esc(hostOf(u))}</span><em>เปิดดูตัวอย่าง ↗</em></div>`;
  if(x.thumb)return box(`<img src="${esc(x.thumb)}" alt="ภาพตัวอย่างของไอเดีย" loading="lazy">${u?`<span class="ideaTag" style="background:${pc}">${esc(pn)}</span>`:""}`);
  const yt=ytId(u);if(yt)return box(`<img src="https://i.ytimg.com/vi/${yt}/hqdefault.jpg" alt="ภาพปกวิดีโอ YouTube" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ideaFallback',textContent:'YouTube'}))"><span class="ideaTag" style="background:var(--yt)">▶ YouTube</span>`);
  if(isImgUrl(u))return box(`<img src="${esc(u)}" alt="ภาพตัวอย่าง" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ideaFallback',textContent:'โหลดภาพไม่ได้'}))">`);
  return u?box(card):""}
async function shrinkImage(file,max=720,q=0.72){const url=URL.createObjectURL(file);try{const im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
  const s=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  let d=c.toDataURL("image/jpeg",q);if(d.length>350000)d=c.toDataURL("image/jpeg",0.5);return d.length>450000?null:d}finally{URL.revokeObjectURL(url)}}
if(!document.getElementById("ideaCss")){const st=document.createElement("style");st.id="ideaCss";st.textContent=`
.ideaPv{display:block;position:relative;border-radius:10px;overflow:hidden;background:var(--sunk);aspect-ratio:16/10;margin:-4px 0 4px;text-decoration:none;color:inherit}
.ideaPv img{width:100%;height:100%;object-fit:cover;display:block}
.ideaTag{position:absolute;left:8px;top:8px;color:#fff;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px}
.ideaCard{height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:4px;padding:16px 18px;border-left:6px solid var(--c);background:linear-gradient(135deg,var(--surface),var(--sunk))}
.ideaCard b{font-family:var(--display);font-size:22px;color:var(--c)}.ideaCard span{font-size:12px;color:var(--muted);word-break:break-all}.ideaCard em{font-style:normal;font-size:12px;margin-top:6px;color:var(--ink)}
.ideaFallback{height:100%;display:grid;place-items:center;color:var(--muted);font-size:13px}
.ideaThumbPrev{max-width:180px;max-height:110px;border-radius:8px;display:block;margin-top:6px}
#ideaForm.drag{outline:2px dashed var(--accent)}`;document.head.appendChild(st)}

let ideaThumb=null;
VIEWS.ideas=()=>{const list=S.ideas.slice().sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
  $("#v-ideas").innerHTML=`<div class="vhead"><div><h1>Idea Vault</h1><p>เก็บทุกไอเดียก่อนลืม พร้อมลิงก์และภาพตัวอย่าง แล้วส่งไปวางแผนใน Content Planner ได้ในคลิกเดียว</p></div></div>
  <form class="panel" id="ideaForm" style="display:flex;flex-direction:column;gap:10px">
    <div class="row"><input type="text" id="idT" placeholder="พิมพ์ไอเดียคอนเทนต์ใหม่…" style="flex:2 1 260px"><input type="text" id="idP" list="pillarList2" placeholder="Pillar" style="flex:1 1 140px"><datalist id="pillarList2">${PILLARS.map(x=>`<option value="${esc(x)}">`).join("")}</datalist><input type="text" id="idN" placeholder="โน้ต (ถ้ามี)" style="flex:2 1 200px"></div>
    <div class="row"><input type="url" id="idU" placeholder="ลิงก์ตัวอย่าง เช่น YouTube, TikTok, IG, Facebook หรือเว็บ (ถ้ามี)" style="flex:3 1 280px"><button class="btn" type="button" id="idImgBtn">🖼 เพิ่มภาพ</button><button class="btn primary" type="submit">＋ เพิ่ม</button></div>
    <div class="cnt">ลิงก์ YouTube และลิงก์รูปภาพจะแสดงภาพให้อัตโนมัติ ลิงก์อื่นแสดงเป็นการ์ดลิงก์ ถ้าอยากได้ภาพ ให้แคปหน้าจอแล้วกด Ctrl+V ในกล่องนี้ หรือกด “เพิ่มภาพ”</div><div id="idThumbBox"></div></form>
  <div class="g3">${list.map(x=>{const used=x.usedPostId&&S.posts.find(p=>p.id===x.usedPostId);return`<div class="panel" style="display:flex;flex-direction:column;gap:8px">${ideaPreview(x)}<div class="row">${x.pillar?`<span class="tag">${esc(x.pillar)}</span>`:""}${used?`<span class="st ok">วางแผนแล้ว</span>`:""}<span class="spacer"></span><button class="btn ghost sm" data-act="ideaEdit" data-id="${x.id}" aria-label="แก้ไขลิงก์และภาพ">✎</button><button class="btn ghost sm" data-act="delIdea" data-id="${x.id}" aria-label="ลบไอเดีย">✕</button></div>
    <b style="font-size:15px;line-height:1.4">${esc(x.title)}</b>${x.note?`<div class="cnt">${esc(x.note)}</div>`:""}<div class="cnt">${esc(who(x.createdBy))} · ${thDT(x.createdAt)}</div>
    ${used?`<a href="#" data-act="editPost" data-id="${used.id}" class="cnt">เปิดคอนเทนต์ (${STAGE_N[stageOf(used)]})</a>`:`<button class="btn sm" data-act="ideaPlan" data-id="${x.id}">→ ส่งไปวางแผน</button>`}</div>`}).join("")||`<div class="empty" style="grid-column:1/-1">ยังไม่มีไอเดีย</div>`}</div>`;
  const form=$("#ideaForm");const showThumb=()=>{$("#idThumbBox").innerHTML=ideaThumb?`<div class="row" style="align-items:flex-end"><img class="ideaThumbPrev" src="${ideaThumb}" alt="ภาพที่จะบันทึก"><button class="btn ghost sm" type="button" id="idThumbDel">ลบภาพ</button></div>`:"";const d=$("#idThumbDel");if(d)d.onclick=()=>{ideaThumb=null;showThumb()}};showThumb();
  const take=async f=>{if(!f||!/^image\//.test(f.type)){toast("ต้องเป็นไฟล์รูปภาพ");return}const d=await shrinkImage(f).catch(()=>null);if(!d){toast("ภาพใหญ่เกินไป ลองแคปให้เล็กลง");return}ideaThumb=d;showThumb()};
  $("#idImgBtn").onclick=async()=>take(await pickFile("image/*"));
  form.addEventListener("paste",e=>{const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith("image/"));if(it){e.preventDefault();take(it.getAsFile())}});
  form.addEventListener("dragover",e=>{e.preventDefault();form.classList.add("drag")});form.addEventListener("dragleave",()=>form.classList.remove("drag"));
  form.addEventListener("drop",e=>{e.preventDefault();form.classList.remove("drag");take(e.dataTransfer.files[0])});
  form.onsubmit=async e=>{e.preventDefault();const t=V("idT");const u=V("idU");if(!t){toast("พิมพ์ไอเดียก่อน");return}if(u&&!/^https?:\/\//i.test(u)){toast("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");return}
    if(S.ideas.some(i=>i.title.trim().toLowerCase()===t.toLowerCase())){toast("มีไอเดียนี้แล้ว");return}
    try{await dbAdd(COL.ideas,{title:t,pillar:V("idP"),note:V("idN"),url:u,thumb:ideaThumb||null});ideaThumb=null;["idT","idN","idU"].forEach(i=>$("#"+i).value="");showThumb();toast("เพิ่มไอเดียแล้ว")}catch(err){toast(dbErr(err))}}};
ACT.ideaEdit=el=>{const x=S.ideas.find(i=>i.id===el.dataset.id);if(!x)return;let th=x.thumb||null;
  openDlg({title:"แก้ไขไอเดีย",body:`${fld("ไอเดีย","ieT",x.title)}<div class="row">${fld("Pillar","ieP",x.pillar,"text","list='pillarList2'")}${fld("โน้ต","ieN",x.note)}</div>${fld("ลิงก์ตัวอย่าง","ieU",x.url,"url","placeholder='https://'")}
    <div class="row"><button class="btn" type="button" id="ieImg">🖼 เปลี่ยนภาพ</button><button class="btn ghost" type="button" id="ieDel">ลบภาพ</button></div><div id="ieBox"></div><div class="cnt">วางภาพด้วย Ctrl+V ในหน้าต่างนี้ได้</div>`,
    onOpen:()=>{const sh=()=>$("#ieBox").innerHTML=th?`<img class="ideaThumbPrev" src="${th}" alt="ภาพไอเดีย">`:`<div class="cnt">ไม่มีภาพ (จะใช้ภาพจากลิงก์ถ้ามี)</div>`;sh();
      const take=async f=>{if(!f||!/^image\//.test(f.type))return;const d=await shrinkImage(f).catch(()=>null);if(!d){toast("ภาพใหญ่เกินไป");return}th=d;sh()};
      $("#ieImg").onclick=async()=>take(await pickFile("image/*"));$("#ieDel").onclick=()=>{th=null;sh()};
      $("#dlgBody").onpaste=e=>{const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith("image/"));if(it){e.preventDefault();take(it.getAsFile())}}},
    foot:["|",{label:"ยกเลิก"},{label:"บันทึก",cls:"primary",act:async()=>{const u=V("ieU");if(!V("ieT")){toast("ใส่ไอเดีย");return false}if(u&&!/^https?:\/\//i.test(u)){toast("ลิงก์ต้องขึ้นต้นด้วย http(s)://");return false}
      try{await dbUpd(COL.ideas,x.id,{title:V("ieT"),pillar:V("ieP"),note:V("ieN"),url:u,thumb:th})}catch(e){toast(dbErr(e));return false}toast("บันทึกแล้ว")}}]})};

// ================= ATTACHMENTS without Cloud Storage =================
// When file storage is available (claude.ai, or the company site with Storage on) files upload as before.
// Without it, pictures are shrunk and stored inside the record, and videos/PDFs are attached as links (Drive, YouTube, TikTok…).
{const prevUrl=window.__ASSET_URL;window.__ASSET_URL=id=>/^(data:|https?:)/.test(String(id||""))?id:(prevUrl?prevUrl(id):"/_blob/"+encodeURIComponent(id))}
const INLINE_MAX=700000;
uploadFile=async function(file){
  if(assets){if(file.size>20*1024*1024)throw{code:"too_large",message:"ไฟล์ใหญ่เกิน 20 MB (วิดีโอยาวให้แนบลิงก์ไดรฟ์แทน)"};const r=await assets.upload(file);return{id:r.id,type:r.contentType||file.type,name:file.name,size:r.sizeBytes||file.size}}
  if(/^image\//.test(file.type)){const d=await shrinkImage(file,1280,0.78).catch(()=>null);if(!d)throw{code:"too_large",message:"ภาพใหญ่เกินไป ลองย่อหรือแคปให้เล็กลง"};return{id:d,type:"image/jpeg",name:file.name,size:Math.round(d.length*.75),inline:true}}
  throw{code:"no_storage",message:"เว็บนี้ยังไม่ได้เปิดพื้นที่เก็บไฟล์ วิดีโอและ PDF ให้กด “🔗 แนบลิงก์” แล้ววางลิงก์ Google Drive, YouTube หรือ TikTok แทน"}};
const inlineSize=list=>(list||[]).filter(a=>a.inline).reduce((s,a)=>s+String(a.id).length,0);
function linkAtt(url){const plat=IDEA_PLAT.find(([re])=>re.test(url));return{id:url,url,type:"link",name:plat?plat[1]:hostOf(url)||"ลิงก์"}}
attHtml=function(list,removable){if(!list?.length)return`<div class="cnt">ยังไม่มีไฟล์แนบ</div>`;
  return`<div class="att">${list.map((a,i)=>{const u=a.type==="link"?a.url:assetUrl(a.id);let media;
    if(a.type==="link"){media=`<a href="${esc(u)}" target="_blank" rel="noopener" class="ideaPv" style="margin:0;aspect-ratio:4/3">${ytId(u)?`<img src="https://i.ytimg.com/vi/${ytId(u)}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="ideaTag" style="background:var(--yt)">▶ YouTube</span>`:(()=>{const p=IDEA_PLAT.find(([re])=>re.test(u));return`<div class="ideaCard" style="--c:${p?p[2]:"var(--sky)"};padding:10px 12px"><b style="font-size:16px">${esc(p?p[1]:"ลิงก์")}</b><span>${esc(hostOf(u))}</span></div>`})()}</a>`}
    else media=/^image\//.test(a.type)?`<img src="${u}" alt="${esc(a.name)}" loading="lazy">`:/^video\//.test(a.type)?`<video src="${u}" controls preload="metadata"></video>`:`<div style="aspect-ratio:4/3;display:grid;place-items:center;font-size:12px;color:var(--muted)">${esc((a.type||"file").split("/").pop().toUpperCase())}</div>`;
    return`<figure>${media}<figcaption><a href="${esc(u)}" target="_blank" rel="noopener"><span>${esc(a.name)}</span></a>${removable?`<button class="btn ghost sm" type="button" data-rmatt="${i}" aria-label="ลบไฟล์">✕</button>`:""}</figcaption></figure>`}).join("")}</div>`};
const attTools=(id)=>`<div class="row" style="margin-top:6px"><input type="url" id="${id}Url" placeholder="วางลิงก์วิดีโอ/ไฟล์ เช่น Google Drive, YouTube, TikTok" style="flex:1 1 220px"><button class="btn sm" type="button" id="${id}LinkBtn">🔗 แนบลิงก์</button></div>
  <div class="cnt" style="margin-top:4px">${assets?"อัปโหลดภาพ วิดีโอ และ PDF ได้ไม่เกิน 20 MB ต่อไฟล์":"เว็บนี้เก็บภาพในระบบได้โดยตรง (ย่อขนาดให้อัตโนมัติ) ส่วนวิดีโอและ PDF ให้แนบเป็นลิงก์"} · วางภาพด้วย Ctrl+V ได้</div>`;
function wireAtt(id,list,box,onChange){const add=a=>{if(a.inline&&inlineSize(list)+String(a.id).length>INLINE_MAX){toast("ภาพในรายการนี้เต็มแล้ว แนบเป็นลิงก์แทน หรือลบภาพเดิมบางภาพ");return}list.push(a);box.innerHTML=attHtml(list,true);onChange&&onChange()};
  const lb=$("#"+id+"LinkBtn");if(lb)lb.onclick=()=>{const u=V(id+"Url");if(!/^https?:\/\//i.test(u)){toast("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");return}add(linkAtt(u));$("#"+id+"Url").value="";toast("แนบลิงก์แล้ว (กดบันทึกเพื่อยืนยัน)")};
  $("#dlgBody").onpaste=async e=>{const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith("image/"));if(!it||!$("#"+id+"LinkBtn"))return;e.preventDefault();try{add(await uploadFile(it.getAsFile()))}catch(err){toast(err.message||"แนบภาพไม่สำเร็จ")}};
  return add}

// Task dialog: enable upload when storage is off (pictures go inline), add link + paste.
const _openDlgA=openDlg;openDlg=function(o){$("#dlgBody").onpaste=null;_openDlgA(o);const pu=$('#dlgBody [data-act="prodUpload"]');if(pu&&pu.disabled&&S.me?.id){pu.disabled=false;pu.textContent="เพิ่มรูป"}const up=$('#dlgBody [data-act="taskUpload"]');if(!up)return;
  if(up.disabled&&S.me?.id){up.disabled=false;up.removeAttribute("title");up.textContent="＋ แนบภาพ/ไฟล์"}
  const box=$("#tAtt");if(box&&!$("#tAttLinkBtn")){box.parentElement.insertAdjacentHTML("beforeend",attTools("tAtt"));wireAtt("tAtt",TD.attachments,box)}};
ACT.taskUpload=async()=>{const f=await pickFile(assets?"image/*,video/*,application/pdf":"image/*");if(!f)return;const box=$("#tAtt");box.insertAdjacentHTML("afterbegin",`<div class="thinking" id="upSpin"><div class="spin"></div>กำลังแนบ ${esc(f.name)}…</div>`);
  try{const a=await uploadFile(f);if(a.inline&&inlineSize(TD.attachments)+String(a.id).length>INLINE_MAX){$("#upSpin")?.remove();toast("ภาพในงานนี้เต็มแล้ว แนบเป็นลิงก์แทน");return}TD.attachments.push(a);box.innerHTML=attHtml(TD.attachments,true);toast("แนบแล้ว (กดบันทึกเพื่อยืนยัน)")}catch(e){$("#upSpin")?.remove();toast(e.message||"แนบไม่สำเร็จ ("+(e.code||"error")+")")}};

// Board card: fall back to the product picture when the task has no picture of its own.
const _taskCardA=taskCard;taskCard=function(t){let h=_taskCardA(t);const head=h.split("<b>")[0];if(/<img/.test(head))return h;
  const vids=(t.attachments||[]).filter(a=>/^video\//.test(a.type)||a.type==="link").length;const p=S.products.find(x=>x.id===t.productId);
  if(p?.imageId)h=h.replace('tabindex="0">',`tabindex="0"><img src="${assetUrl(p.imageId)}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;opacity:.9" loading="lazy">`);
  if(vids)h=h.replace("<b>",`<span class="cnt">🎬 ${vids} วิดีโอ/ลิงก์</span><b>`);return h};

// Content Planner post: pictures + video links.
let PA=null;
const _openPostA=openPost;openPost=function(p,date){PA=(p?.attachments||[]).map(a=>({...a}));_openPostA(p,date);
  const anchor=$("#pVis")?.closest("label")||$("#pCap")?.closest("label");if(!anchor)return;
  anchor.insertAdjacentHTML("afterend",`<div><div class="ph"><h2 style="font-size:14px;margin:0">ภาพ / วิดีโอของโพสต์</h2><button class="btn sm" type="button" id="paUp">🖼 แนบภาพ${assets?" / วิดีโอ":""}</button></div><div id="paBox" style="margin-top:8px">${attHtml(PA,true)}</div>${attTools("pa")}</div>`);
  const box=$("#paBox");const add=wireAtt("pa",PA,box);
  $("#paUp").onclick=async()=>{const f=await pickFile(assets?"image/*,video/*":"image/*");if(!f)return;box.insertAdjacentHTML("afterbegin",`<div class="thinking" id="paSpin"><div class="spin"></div>กำลังแนบ ${esc(f.name)}…</div>`);try{add(await uploadFile(f))}catch(e){toast(e.message||"แนบไม่สำเร็จ")}finally{$("#paSpin")?.remove()}};
  box.addEventListener("click",e=>{const b=e.target.closest("[data-rmatt]");if(!b)return;e.stopPropagation();PA.splice(+b.dataset.rmatt,1);box.innerHTML=attHtml(PA,true)},true)};
dlg.addEventListener("close",()=>{setTimeout(()=>{PA=null},0)});
const _dbAddA=dbAdd;dbAdd=function(col,data){if(col===COL.posts&&PA&&dlg.open&&$("#paBox"))data={...data,attachments:PA};return _dbAddA(col,data)};
const _safeSaveA=safeSave;safeSave=function(col,id,data,base){if(col===COL.posts&&PA&&dlg.open&&$("#paBox"))data={...data,attachments:PA};return _safeSaveA(col,id,data,base)};
// Keep nested "id" fields (attachments need them); only the record's own id is removed before saving.
clean=function(o,depth=0){if(Array.isArray(o))return o.map(x=>clean(x,depth+1));if(o&&typeof o==="object"){const r={};for(const k in o)if(o[k]!==undefined&&!(k==="id"&&depth===0))r[k]=clean(o[k],depth+1);return r}return o};

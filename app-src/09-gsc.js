
// ================= SEARCH CONSOLE via claude.ai connector =================
// Contract (defined by Delish's own MCP server, see IT guide):
//   gsc_list_sites {} -> {sites:[{siteUrl, permissionLevel}]}
//   gsc_search_analytics {siteUrl,startDate,endDate,dimensions[],rowLimit,startRow,type,dataState}
//     -> {siteUrl,startDate,endDate,dimensions,rows:[{keys[],clicks,impressions,ctr,position}],fetchedAt}
const GSC_SERVER="Delish Search Console";
let mcp=null;S.integ={};
const GSC_ERR_HOSTED={server_not_connected:"บัญชีที่ล็อกอินอยู่ไม่ใช่บัญชี Google จึงดึง Search Console ไม่ได้ — ออกจากระบบแล้วล็อกอินด้วย Google",needs_reauth:"สิทธิ์ Google หมดอายุ (ประมาณ 1 ชั่วโมง) — กด “เชื่อม Google ใหม่” มุมล่างซ้าย แล้วลองอีกครั้ง"};
const GSC_ERR={server_not_connected:`ยังไม่มี Connector ชื่อ “${GSC_SERVER}” ในบัญชี claude.ai ของคุณ — ให้ IT ติดตั้งตามคู่มือ แล้วเพิ่มที่ Settings → Connectors`,
  needs_reauth:`สิทธิ์ Google หมดอายุ — เชื่อมต่อ “${GSC_SERVER}” ใหม่ที่ claude.ai Settings → Connectors`,
  not_in_manifest:"คุณปิดหรือไม่อนุญาต Connector นี้สำหรับหน้านี้ เปิดได้จากเมนู Permissions ของหน้า",
  approval_required:"ต้องกดอนุญาตให้หน้านี้ใช้ Connector ก่อน (กดปุ่มอีกครั้งแล้วเลือก Allow)",
  blocked_by_policy:"นโยบายองค์กรบล็อก Connector นี้สำหรับบัญชีของคุณ ติดต่อผู้ดูแล claude.ai",
  selection_required:`มี Connector ชื่อ “${GSC_SERVER}” มากกว่า 1 ตัว เลือกตัวที่ใช้ในหน้าต่างที่ claude.ai แสดง`,
  server_unavailable:"เซิร์ฟเวอร์ Connector ไม่ตอบ (ชั่วคราว) ลองใหม่อีกครั้งในไม่กี่นาที",
  not_granted:"มุมมองนี้ใช้ Connector ไม่ได้ (ต้องเปิดใน claude.ai ขณะล็อกอิน)",capability_disabled:"มุมมองนี้ใช้ Connector ไม่ได้ (ต้องเปิดใน claude.ai ขณะล็อกอิน)"};
const gscErr=e=>HOSTED&&GSC_ERR_HOSTED[e?.code]?GSC_ERR_HOSTED[e.code]:e?.code==="tool_error"?"Search Console ตอบกลับข้อผิดพลาด: "+String(e.message||"").slice(0,300):(GSC_ERR[e?.code]||`เชื่อมต่อไม่สำเร็จ (${e?.code||"error"})`);
function gscState(){const g=S.integ?.gsc;if(!g?.lastOk)return{s:"off",t:"ยังไม่เชื่อมต่อ",d:"ยังไม่เคยทดสอบสำเร็จ ข้อมูล SEO มาจากการกรอกหรือ CSV"};
  const age=(Date.now()-new Date(g.lastOk))/864e5;return{s:age>30?"warn":"on",t:"เชื่อมผ่าน Connector แล้ว",d:`ทดสอบสำเร็จล่าสุด ${thDT(g.lastOk)} โดย ${who(g.lastOkBy)} · Property: ${g.siteUrl||"ยังไม่เลือก"}${g.lastSync?` · ดึงข้อมูลล่าสุด ${thDT(g.lastSync)} (${thMonth(g.lastSyncMonth)})`:""}${age>30?" · ทดสอบเกิน 30 วันแล้ว ควรทดสอบใหม่":""}`}}
function gscPanel(){const st=gscState(),g=S.integ?.gsc||{};const loc=S.ui.gscLocal;
  return`<div class="panel" id="gscPanel"><div class="ph"><h2>Google Search Console API</h2><span class="st ${st.s==="on"?"ok":st.s==="warn"?"warn":"bad"}">${st.t}</span></div>
  <div class="cnt">${esc(st.d)}</div>
  ${loc?`<div class="note ${loc.ok?"":"bad"}" style="margin-top:8px">${esc(loc.msg)}</div>`:""}
  ${loc?.sites?.length?`<div class="row" style="margin-top:8px"><label class="f" style="flex:1 1 260px">Property ที่บัญชีคุณเข้าถึงได้<select id="gscSite">${loc.sites.map(s=>`<option value="${esc(s.siteUrl)}" ${s.siteUrl===g.siteUrl?"selected":""}>${esc(s.siteUrl)} · ${esc(s.permissionLevel||"")}</option>`).join("")}</select></label>${S.canEdit?`<button class="btn" data-act="gscSave">บันทึกเป็น Property ของทีม</button>`:`<span class="cnt">Editor เป็นผู้บันทึก Property ของทีม</span>`}</div>`:""}
  <div class="row" style="margin-top:10px"><button class="btn" data-act="gscTest" ${mcp?"":"disabled title='มุมมองนี้ใช้ Connector ไม่ได้'"}>ทดสอบการเชื่อมต่อ</button><button class="btn primary" data-act="gscSync" ${mcp&&g.siteUrl?"":"disabled"}>ดึงข้อมูลจาก Search Console</button><a href="#" data-act="gscHelp" class="cnt">วิธีติดตั้งสำหรับ IT</a></div>
  <div class="cnt" style="margin-top:6px">ข้อมูลดึงด้วยสิทธิ์ Google ของผู้กดเอง (อ่านอย่างเดียว) ใครไม่มีสิทธิ์ใน Property นั้น Google จะปฏิเสธ · สถานะ “เชื่อมแล้ว” แสดงเมื่อทดสอบสำเร็จจริงเท่านั้น</div></div>`}
ACT.gscTest=async el=>{if(!mcp)return;el.disabled=true;S.ui.gscLocal={ok:true,msg:"กำลังทดสอบ…"};forceRender();
  try{const r=await mcp.callTool(GSC_SERVER,"gsc_list_sites",{});const sites=(r?.payload?.sites||[]).filter(s=>s&&s.siteUrl);
    if(!sites.length){S.ui.gscLocal={ok:false,msg:"เชื่อมต่อได้ แต่บัญชี Google ที่ใช้ไม่มีสิทธิ์ใน Property ใดเลย ให้เจ้าของ Search Console เพิ่มบัญชีนี้เป็นผู้ใช้"};}
    else{S.ui.gscLocal={ok:true,msg:`เชื่อมต่อสำเร็จ · พบ ${sites.length} Property`,sites};
      if(S.canEdit){const cur=S.integ?.gsc||{};await db.doc("settings/integrations").set(clean({...S.integ,gsc:{...cur,lastOk:nowISO(),lastOkBy:S.me?.id||null,siteUrl:cur.siteUrl&&sites.some(s=>s.siteUrl===cur.siteUrl)?cur.siteUrl:(sites[0].siteUrl)}}))}}}
  catch(e){S.ui.gscLocal={ok:false,msg:gscErr(e)}}finally{forceRender()}};
ACT.gscSave=async()=>{try{const cur=S.integ?.gsc||{};await db.doc("settings/integrations").set(clean({...S.integ,gsc:{...cur,siteUrl:V("gscSite")}}));toast("บันทึก Property แล้ว")}catch(e){toast(dbErr(e))}};
function gscMonths(){const out=[];const d=new Date();d.setDate(1);for(let i=0;i<16;i++){out.push(ymd(d).slice(0,7));d.setMonth(d.getMonth()-1)}return out}
function monthRange(m){const[y,mo]=m.split("-").map(Number);const last=new Date(y,mo,0).getDate();const end=m+"-"+pad(last);const t=today();return{start:m+"-01",end:end>t?addDays(t,-1):end,partial:end>=t}}
ACT.gscSync=()=>{const g=S.integ?.gsc;if(!g?.siteUrl)return;const ms=gscMonths();
  openDlg({title:"ดึงข้อมูลจาก Search Console",body:`<div class="note">Property: <b>${esc(g.siteUrl)}</b> · ข้อมูล Search Console มักช้ากว่าปัจจุบัน 2–3 วัน และย้อนหลังได้ 16 เดือน</div>
    <div class="row">${sel("เดือน","gsM",Object.fromEntries(ms.map(m=>[m,thMonth(m)+(monthRange(m).partial?" (ยังไม่จบเดือน)":"")])),ms[1])}${sel("มิติ","gsDim",{"query,page":"คีย์เวิร์ด × หน้า","query":"คีย์เวิร์ดอย่างเดียว","query,page,device":"คีย์เวิร์ด × หน้า × อุปกรณ์","query,page,country":"คีย์เวิร์ด × หน้า × ประเทศ"},"query,page")}${sel("จำนวนแถวสูงสุด","gsN",{100:"100",250:"250",500:"500",1000:"1,000"},"250")}</div>
    <div class="cnt">ระบบเรียงตาม Clicks จาก Search Console · แถวที่มีอยู่แล้ว (คีย์เวิร์ด/URL/เดือน/ประเทศ/อุปกรณ์เดียวกัน) จะอัปเดตเฉพาะตัวเลข ไม่แตะ Meta แผนปรับหน้า หรือ Q&A ที่ทีมเขียน</div><div id="gsOut"></div>`,
  foot:["|",{label:"ปิด"},{label:"ดึงข้อมูล",cls:"primary",act:async()=>{const m=V("gsM"),dims=V("gsDim").split(","),n=+V("gsN");const rg=monthRange(m);const out=$("#gsOut");
    out.innerHTML=`<div class="thinking"><div class="spin"></div>กำลังดึงข้อมูล ${thMonth(m)}…</div>`;
    let res;try{res=await mcp.callTool(GSC_SERVER,"gsc_search_analytics",{siteUrl:g.siteUrl,startDate:rg.start,endDate:rg.end,dimensions:dims,rowLimit:n,startRow:0,type:"web",dataState:"final"})}catch(e){out.innerHTML=`<div class="note bad">${esc(gscErr(e))}</div>`;return false}
    const rows=res?.payload?.rows;if(!Array.isArray(rows)){out.innerHTML=`<div class="note bad">ผลลัพธ์จาก Connector ไม่ตรงรูปแบบที่ตกลงไว้ (ไม่มี rows) — ไม่ได้บันทึกอะไร</div>`;return false}
    if(!rows.length){out.innerHTML=`<div class="note">Search Console ไม่มีข้อมูลของ ${thMonth(m)} (ไม่มีข้อมูลใหม่) — ไม่ได้บันทึกอะไร</div>`;return false}
    const src=`Search Console API · ${g.siteUrl}`;let add=0,up=0,bad=0;
    out.innerHTML=`<div class="thinking"><div class="spin"></div>บันทึก ${rows.length} แถว…</div>`;
    for(const r of rows){const k=r.keys||[];const get=d=>{const i=dims.indexOf(d);return i>=0?String(k[i]??""):""};
      const dev={MOBILE:"Mobile",DESKTOP:"Desktop",TABLET:"Tablet"}[get("device").toUpperCase()]||(dims.includes("device")?get("device"):"ทั้งหมด");
      const d={keyword:get("query"),url:get("page"),month:m,country:dims.includes("country")?get("country").toUpperCase():"ทั้งหมด",device:dev,
        clicks:Number.isFinite(r.clicks)?r.clicks:null,impressions:Number.isFinite(r.impressions)?r.impressions:null,position:Number.isFinite(r.position)?Math.round(r.position*10)/10:null,
        source:src,rangeFrom:rg.start,rangeTo:rg.end,fetchedAt:res.payload.fetchedAt||nowISO()};
      if(!d.keyword){bad++;continue}const id="K-"+hash(seoKey(d));
      try{if(S.seo.some(x=>x.id===id)){await dbUpd(COL.seo,id,{clicks:d.clicks,impressions:d.impressions,position:d.position,source:d.source,rangeFrom:d.rangeFrom,rangeTo:d.rangeTo,fetchedAt:d.fetchedAt});up++}else{await dbSetNew(COL.seo,id,d);add++}}catch(e){toast(dbErr(e));break}}
    if(S.canEdit){const cur=S.integ?.gsc||{};db.doc("settings/integrations").set(clean({...S.integ,gsc:{...cur,lastOk:nowISO(),lastOkBy:S.me?.id||null,lastSync:nowISO(),lastSyncMonth:m}})).catch(()=>{})}
    S.ui.seoMonth=m;toast(`ดึงจาก Search Console: ใหม่ ${add} · อัปเดต ${up}${bad?` · ข้าม ${bad}`:""}${rg.partial?" · เดือนนี้ยังไม่จบ":""}`)}}]})};
ACT.gscHelp=()=>openDlg({title:"ติดตั้ง Search Console Connector (สำหรับ IT)",wide:true,body:`<ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:14px">
  <li>Deploy MCP server “delish-gsc-mcp” (Cloudflare Workers ฟรีแพ็กเกจ) ตามคู่มือในโปรเจกต์ — ใช้ Google OAuth scope <code>webmasters.readonly</code> เท่านั้น</li>
  <li>สร้าง OAuth Client ใน Google Cloud (Web application) ตั้ง redirect เป็น <code>https://&lt;worker&gt;/callback</code> และเปิดใช้ Google Search Console API</li>
  <li>ใน claude.ai: Settings → Connectors → Add custom connector ตั้งชื่อ <b>${GSC_SERVER}</b> (ต้องตรงตัวอักษร) URL <code>https://&lt;worker&gt;/mcp</code></li>
  <li>แต่ละคนกด Connect แล้วล็อกอิน Google ด้วยบัญชีที่มีสิทธิ์ใน Property ของ Search Console</li>
  <li>กลับมาหน้านี้ กด “ทดสอบการเชื่อมต่อ” → เลือก Property → Editor กดบันทึก</li></ol>
  <div class="note">เครื่องมือที่หน้านี้เรียก: <code>gsc_list_sites</code> และ <code>gsc_search_analytics</code> (อ่านอย่างเดียว) ไม่มี secret อยู่ในหน้าเว็บ Token ของ Google อยู่ที่เซิร์ฟเวอร์ Connector</div>`,foot:["|",{label:"ปิด"}]});
const _seoBase=VIEWS.seo;VIEWS.seo=()=>{_seoBase();const h=$("#v-seo .vhead");if(h)h.insertAdjacentHTML("afterend",gscPanel());
  const n=$("#v-seo > .note");if(n&&gscState().s!=="off")n.innerHTML=`<span class="dot on"></span><b>Search Console: ดึงผ่าน Connector ได้</b> — แถวที่มาจาก API บันทึกแหล่งข้อมูล ช่วงวันที่ และเวลาที่ดึงไว้ในแต่ละแถว · GA4 ยังไม่เชื่อมต่อ · ระบบไม่สร้าง Search Volume หรือ AI Visibility ขึ้นเอง`};

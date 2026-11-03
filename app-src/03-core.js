"use strict";
// ================= constants =================
const CH={facebook:{n:"Facebook",c:"var(--fb)"},instagram:{n:"Instagram",c:"var(--ig)"},tiktok:{n:"TikTok",c:"var(--tt)"},line:{n:"LINE OA",c:"var(--line-oa)"},youtube:{n:"YouTube",c:"var(--yt)"},shopee:{n:"Shopee/Lazada",c:"var(--mango)"},google:{n:"Google",c:"var(--sky)"},web:{n:"เว็บไซต์",c:"var(--plum)"}};
const SEG={B2B:"B2B · โรงแรม/ร้านอาหาร",B2C:"B2C · ผู้บริโภค/หน้าร้าน",B2M:"B2M · Shopee/Lazada/TikTok Shop"};
const KIND={content:"คอนเทนต์",aw:"กราฟิก AW",video:"วิดีโอ",marketplace:"Marketplace",seo:"SEO/AEO/GEO",ads:"โฆษณา",other:"อื่นๆ"};
const KIND_C={content:"var(--accent)",aw:"var(--ig)",video:"var(--yt)",marketplace:"var(--mango)",seo:"var(--sky)",ads:"var(--plum)",other:"var(--muted)"};
const TST=[["todo","รอเริ่ม"],["doing","กำลังทำ"],["review","รอตรวจ"],["approved","อนุมัติแล้ว"],["ready","พร้อมเผยแพร่"],["published","เผยแพร่แล้ว"]];
const TST_N=Object.fromEntries(TST);
const GATED=new Set(["approved","ready","published"]);
const DONE_ST=new Set(["ready","published"]);
const BRIEFS=[["b2b","คอนเทนต์ B2B","content","B2B"],["b2c","คอนเทนต์ B2C","content","B2C"],["mkt","รายละเอียดสินค้า Marketplace","marketplace","B2M"],["aw","บรีฟกราฟิก AW","aw",""],["video","Hook · สคริปต์ · สตอรี่บอร์ด · Shot list","video",""],["seo","บรีฟ SEO / AEO / GEO","seo",""],["ads","บรีฟโฆษณา","ads",""]];
const PROD_REQ=[["imageId","รูปสินค้า"],["name","ชื่อสินค้า"],["sku","SKU"],["unit","หน่วยขาย"],["origin","แหล่งผลิต"],["usp","จุดขาย"],["usage","วิธีใช้"],["price","ราคา"],["stock","สต๊อก"],["round","รอบส่ง"],["owner","ผู้รับผิดชอบ"],["due","กำหนดส่งงาน"]];
const VERIFY=[["price","ราคา"],["stock","สต๊อก"],["usp","จุดขาย"]];
const TH_M=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

// ================= state =================
const S={mentions:[],lqueries:[],products:[],launches:[],tasks:[],approvals:{},posts:[],camps:[],wfs:[],seo:[],intel:[],ads:[],adplans:[],vouchers:[],brand:{},
  loaded:new Set(),names:{},me:null,canEdit:false,view:"dash",ui:{board:"board",bf:{},cal:null,selDay:null,launch:null,intelTab:"all",seoMonth:"",adsTab:"report",adsMonth:"",adsPlat:"",vMonth:null,vDraft:null}};
let db=null,sample=null,user=null,assets=null,downloads=null;

// ================= helpers =================
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>ymd(new Date());
const nowISO=()=>new Date().toISOString();
const addDays=(s,n)=>{const d=new Date(s+"T00:00");d.setDate(d.getDate()+n);return ymd(d)};
const monthOf=s=>s?String(s).slice(0,7):"";
const thDate=s=>{if(!s)return"";const d=new Date(String(s).slice(0,10)+"T00:00");if(isNaN(d))return esc(s);return d.getDate()+" "+TH_M[d.getMonth()].slice(0,3)+". "+String(d.getFullYear()+543).slice(2)};
const thDT=iso=>{if(!iso)return"";const d=new Date(iso);return isNaN(d)?"":d.toLocaleString("th-TH",{day:"numeric",month:"short",year:"2-digit",hour:"2-digit",minute:"2-digit"})};
const thMonth=m=>{if(!m)return"";const[y,mo]=m.split("-");return TH_M[+mo-1]+" "+(+y+543)};
/** Blank stays blank: "" / null / non-numeric → null, real 0 stays 0 */
const N=v=>{if(v==null)return null;const s=String(v).replace(/[,฿\s]/g,"").replace(/THB/i,"");if(s===""||s==="-"||s==="–")return null;const n=Number(s);return Number.isFinite(n)?n:null};
const fmtN=(v,d=0)=>v==null?"–":Number(v).toLocaleString("th-TH",{maximumFractionDigits:d,minimumFractionDigits:d});
const baht=v=>v==null?"–":"฿"+fmtN(v,Math.abs(v)<100&&v%1?2:0);
const fmtK=v=>{if(v==null)return"–";const a=Math.abs(v);return a>=1e6?(v/1e6).toFixed(2)+"M":a>=1e4?(v/1e3).toFixed(1)+"K":fmtN(v)};
/** Sum that tells you how many values were blank */
function agg(rows,k){let s=0,n=0,miss=0;for(const r of rows){const v=r[k];if(v==null||v===""||!Number.isFinite(+v))miss++;else{s+=+v;n++}}return{sum:n?s:null,n,miss}}
const ratio=(a,b)=>(a==null||b==null||b===0)?null:a/b;
const pct=v=>v==null?"–":(v*100).toFixed(2)+"%";
const xr=v=>v==null?"–":v.toFixed(2)+"x";
const missNote=a=>a.miss?` · ว่าง ${a.miss}`:"";
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(36)}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3200)}
const chip=k=>{const c=CH[k]||{n:k||"-",c:"var(--muted)"};return `<span class="ch" style="--c:${c.c}">${esc(c.n)}</span>`};
const kchip=k=>`<span class="ch" style="--c:${KIND_C[k]||"var(--muted)"}">${esc(KIND[k]||k)}</span>`;
const seg=s=>s?`<span class="tag ${s.toLowerCase()}">${esc(s)}</span>`:"";
const who=id=>id?(S.names[id]||"สมาชิก"):"-";
const opt=(obj,sel)=>Object.entries(obj).map(([k,v])=>`<option value="${esc(k)}" ${k===sel?"selected":""}>${esc(typeof v==="object"?v.n:v)}</option>`).join("");
const HOSTED=!!window.__STANDALONE;const HOST_LOGIN=HOSTED?"บัญชีบริษัท (Google/Microsoft)":"claude.ai";const SHARE_WHERE=HOSTED?"เมนู “จัดการสิทธิ์” (มุมล่างซ้าย)":"เมนู Share ของหน้านี้";
const assetUrl=id=>window.__ASSET_URL?window.__ASSET_URL(id):"/_blob/"+encodeURIComponent(id);
function fld(label,id,val,type="text",extra=""){return `<label class="f">${label}<input type="${type}" id="${id}" value="${esc(val??"")}" ${extra}></label>`}
function area(label,id,val,rows=3,extra=""){return `<label class="f">${label}<textarea id="${id}" rows="${rows}" ${extra}>${esc(val??"")}</textarea></label>`}
function sel(label,id,options,val){return `<label class="f">${label}<select id="${id}">${opt(options,val)}</select></label>`}
const V=id=>{const e=document.getElementById(id);return e?e.value.trim():""};
async function copyText(t){try{await navigator.clipboard.writeText(t);toast("คัดลอกแล้ว")}catch(e){const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("คัดลอกแล้ว")}catch(_){toast("คัดลอกไม่ได้ กรุณาเลือกข้อความเอง")}ta.remove()}}
const dbErr=e=>({permission_denied:"คุณไม่มีสิทธิ์ทำรายการนี้ (ต้องเป็น Editor ขึ้นไป)",not_found:"ไม่พบข้อมูล อาจถูกลบไปแล้ว",conflict:"มีคนแก้ไขรายการนี้ก่อนคุณ ระบบไม่บันทึกทับ กรุณาเปิดใหม่เพื่อดูเวอร์ชันล่าสุด",resource_exhausted:"ใช้งานถี่เกินไป ลองใหม่อีกครั้ง"}[e?.code]||("บันทึกไม่สำเร็จ ("+(e?.code||e?.message||"error")+")"));
const aiErr=e=>({not_granted:"ยังไม่ได้อนุญาตให้หน้านี้ใช้ Claude เปิดได้ที่เมนู Permissions ของหน้า",rate_limited:"เรียก AI ถี่เกินไป รอสักครู่แล้วลองใหม่",cancelled:"หยุดแล้ว"}[e?.code]||("AI ตอบกลับไม่สำเร็จ ("+(e?.code||"error")+")"));

// ================= data layer =================
const COL={products:"products",launches:"launches",tasks:"tasks",posts:"posts",camps:"campaigns",wfs:"workflows",seo:"seo",intel:"intel",ads:"ads",adplans:"adplans",vouchers:"vouchers",mentions:"mentions",lqueries:"listen_queries"};
function need(){if(!db)throw{code:"no_db",message:"ยังเชื่อมต่อฐานข้อมูลไม่ได้"}}
function stampNew(d){const t=nowISO();return{...d,createdAt:t,createdBy:S.me?.id||null,updatedAt:t,updatedBy:S.me?.id||null}}
function stampUpd(d){return{...d,updatedAt:nowISO(),updatedBy:S.me?.id||null}}
function clean(o){if(Array.isArray(o))return o.map(clean);if(o&&typeof o==="object"){const r={};for(const k in o)if(o[k]!==undefined&&k!=="id")r[k]=clean(o[k]);return r}return o}
async function dbAdd(col,data){need();return db.collection(col).add(clean(stampNew(data)))}
async function dbSetNew(col,id,data){need();return db.collection(col).doc(id).set(clean(stampNew(data)))}
async function dbUpd(col,id,patch){need();return db.collection(col).doc(id).update(clean(stampUpd(patch)))}
async function dbDel(col,id){need();return db.collection(col).doc(id).delete()}
async function dbExists(col,id){need();const s=await db.collection(col).doc(id).get();return s.exists?s.data():null}
/** Save only if nobody changed the doc since we opened it (compare updatedAt). */
async function safeSave(col,id,data,baseUpdatedAt){need();const ref=db.collection(col).doc(id);const cur=await ref.get();
  if(cur.exists&&(cur.data().updatedAt||null)!==(baseUpdatedAt||null))throw{code:"conflict"};
  const keep=cur.exists?{createdAt:cur.data().createdAt,createdBy:cur.data().createdBy}:{createdAt:nowISO(),createdBy:S.me?.id||null};
  return ref.set(clean(stampUpd({...data,...keep})))}

// ================= rendering & routing =================
const VIEWS={};
let pendingRender=false,rafQ=false;
function editingInView(){const a=document.activeElement;return a&&$("#main").contains(a)&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.dataset.live!=="1"}
function render(){if(editingInView()){pendingRender=true;return}if(rafQ)return;rafQ=true;requestAnimationFrame(()=>{rafQ=false;pendingRender=false;try{VIEWS[S.view]?.();}catch(e){console.error(e)}badges()})}
document.addEventListener("focusout",()=>setTimeout(()=>{if(pendingRender&&!editingInView())render()},0));
function forceRender(){pendingRender=false;rafQ=false;try{VIEWS[S.view]?.()}catch(e){console.error(e)}badges()}
function show(v){if(!VIEWS[v])v="dash";S.view=v;$$(".view").forEach(s=>s.hidden=s.id!=="v-"+v);
  $$(".nv[data-v]").forEach(b=>b.setAttribute("aria-current",b.dataset.v===v));
  try{localStorage.setItem("cos.view",v)}catch(e){}forceRender();$("#main").scrollTop=0;window.scrollTo(0,0)}
document.querySelector("nav.rail").addEventListener("click",e=>{const b=e.target.closest(".nv[data-v]");if(b)show(b.dataset.v)});
function badges(){const t=today();const over=S.tasks.filter(x=>x.due&&x.due<=t&&!DONE_ST.has(x.status)).length;
  const rv=S.tasks.filter(x=>x.status==="review").length;
  const ln=S.mentions.filter(m=>(m.status||"new")==="new"&&(m.sentiment==="neg"||m.intent==="complaint")).length;const b3=$("#bdgListen");if(b3){b3.hidden=!ln;b3.textContent=ln}
  const b1=$("#bdgFocus");b1.hidden=!over;b1.textContent=over;const b2=$("#bdgReview");b2.hidden=!rv;b2.textContent=rv}

// ================= actions (event delegation) =================
const ACT={};
document.addEventListener("click",e=>{const el=e.target.closest("[data-act]");if(!el)return;const f=ACT[el.dataset.act];if(f){e.preventDefault();f(el,e)}});
document.addEventListener("change",e=>{const el=e.target.closest("[data-chg]");if(!el)return;const f=ACT[el.dataset.chg];if(f)f(el,e)});

// ================= dialog =================
const dlg=$("#dlg");
function openDlg({title,body,foot=[],wide=false,onOpen}){$("#dlgTitle").textContent=title;$("#dlgBody").innerHTML=body;dlg.classList.toggle("wide",wide);
  const f=$("#dlgFoot");f.innerHTML="";for(const b of foot){if(b==="|"){const s=document.createElement("span");s.className="spacer";f.appendChild(s);continue}
    const btn=document.createElement("button");btn.type="button";btn.className="btn "+(b.cls||"");btn.textContent=b.label;if(b.hidden)btn.hidden=true;
    btn.onclick=async()=>{if(b.confirm&&btn.dataset.c!=="1"){btn.dataset.c="1";const old=btn.textContent;btn.textContent=b.confirm;setTimeout(()=>{btn.dataset.c="";btn.textContent=old},4000);return}
      if(!b.act){dlg.close();return}btn.disabled=true;try{const r=await b.act();if(r!==false)dlg.close()}catch(err){toast(dbErr(err))}finally{btn.disabled=false}};f.appendChild(btn)}
  if(!dlg.open)dlg.showModal();onOpen?.()}
$("#dlgX").onclick=()=>dlg.close();
const closeDlg=()=>dlg.open&&dlg.close();

// ================= files =================
function pickFile(accept){return new Promise(res=>{const i=$("#filePick");i.value="";i.accept=accept||"";i.onchange=()=>res(i.files[0]||null);i.click()})}
async function uploadFile(file){if(!assets)throw{code:"no_assets",message:"อัปโหลดไฟล์ได้เฉพาะผู้มีสิทธิ์แก้ไข"};
  if(file.size>20*1024*1024)throw{code:"too_large",message:"ไฟล์ใหญ่เกิน 20 MB (วิดีโอยาวให้แนบลิงก์ไดรฟ์แทน)"};
  const r=await assets.upload(file);return{id:r.id,type:r.contentType||file.type,name:file.name,size:r.sizeBytes||file.size}}
function attHtml(list,removable){if(!list?.length)return`<div class="cnt">ยังไม่มีไฟล์แนบ</div>`;
  return `<div class="att">${list.map((a,i)=>{const u=assetUrl(a.id);const media=/^image\//.test(a.type)?`<img src="${u}" alt="${esc(a.name)}" loading="lazy">`:/^video\//.test(a.type)?`<video src="${u}" controls preload="metadata"></video>`:`<div style="aspect-ratio:4/3;display:grid;place-items:center;font-size:12px;color:var(--muted)">${esc((a.type||"file").split("/").pop().toUpperCase())}</div>`;
    return `<figure>${media}<figcaption><a href="${u}" target="_blank" rel="noopener"><span>${esc(a.name)}</span></a>${removable?`<button class="btn ghost sm" type="button" data-rmatt="${i}" aria-label="ลบไฟล์">✕</button>`:""}</figcaption></figure>`}).join("")}</div>`}
async function saveFile(filename,data){if(!downloads){toast("ดาวน์โหลดไฟล์ไม่ได้ในมุมมองนี้");return}try{const r=await downloads.save({filename,data});if(r?.status==="saved")toast("บันทึกไฟล์แล้ว")}catch(e){if(e?.code!=="declined"&&e?.code!=="cancelled")toast("บันทึกไฟล์ไม่สำเร็จ ("+(e?.code||"error")+")")}}

// ================= CSV =================
function parseCSV(text){text=text.replace(/^﻿/,"");const rows=[];let row=[],cur="",q=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else if(c==='"')q=true;else if(c===","||c==="\t"&&!text.includes(",")){row.push(cur);cur=""}else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cur);cur="";if(row.some(x=>x.trim()!==""))rows.push(row);row=[]}else cur+=c}
  row.push(cur);if(row.some(x=>x.trim()!==""))rows.push(row);return rows}
function toCSV(rows){return rows.map(r=>r.map(v=>{v=v==null?"":String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(",")).join("\n")}
function mapHeaders(hdr,aliases){const h=hdr.map(x=>x.trim().toLowerCase());const m={};for(const[k,al]of Object.entries(aliases)){const i=h.findIndex(x=>al.includes(x));if(i>=0)m[k]=i}return m}
function normDate(s){s=(s||"").trim();if(!s)return"";let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return m[1]+"-"+pad(m[2])+"-"+pad(m[3]);
  m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m){let y=+m[3];if(y>2400)y-=543;return y+"-"+pad(m[2])+"-"+pad(m[1])}return""}
function normMonth(s){s=(s||"").trim();let m=s.match(/^(\d{4})-(\d{1,2})/);if(m)return m[1]+"-"+pad(m[2]);m=s.match(/^(\d{1,2})\/(\d{4})$/);if(m){let y=+m[2];if(y>2400)y-=543;return y+"-"+pad(m[1])}return""}

// ================= Thai baht text =================
function bahtText(n){if(n==null||!Number.isFinite(n))return"";const neg=n<0;n=Math.round(Math.abs(n)*100)/100;const b=Math.floor(n),st=Math.round((n-b)*100);
  const D=["","หนึ่ง","สอง","สาม","สี่","ห้า","หก","เจ็ด","แปด","เก้า"],P=["","สิบ","ร้อย","พัน","หมื่น","แสน"];
  const six=x=>{const s=String(x),L=s.length;let o="";for(let i=0;i<L;i++){const d=+s[i],p=L-i-1;if(!d)continue;
    if(p===0&&d===1&&L>1)o+="เอ็ด";else if(p===1&&d===2)o+="ยี่";else if(p===1&&d===1)o+="";else o+=D[d];o+=P[p]}return o};
  const full=x=>{if(x===0)return"ศูนย์";const parts=[];while(x>0){parts.unshift(x%1e6);x=Math.floor(x/1e6)}
    return parts.map((p,i)=>{let s=p?six(p):"";if(i>0&&p===1)s="เอ็ด";return s+(i<parts.length-1?"ล้าน":"")}).join("")};
  let out=(b?full(b)+"บาท":"")+(st?full(st)+"สตางค์":(b?"ถ้วน":"ศูนย์บาทถ้วน"));return(neg?"ลบ":"")+out}

// ================= cross-month split =================
/** Split an amount across calendar months by the number of running days in each month (start and end inclusive). */
function splitByMonth(amount,start,end){if(amount==null||!start||!end||end<start)return[];const out={};let d=new Date(start+"T00:00");const e=new Date(end+"T00:00");let total=0;
  while(d<=e){const m=ymd(d).slice(0,7);out[m]=(out[m]||0)+1;total++;d.setDate(d.getDate()+1)}
  const keys=Object.keys(out);let acc=0;return keys.map((m,i)=>{let v=i===keys.length-1?Math.round((amount-acc)*100)/100:Math.round(amount*out[m]/total*100)/100;acc+=v;return{month:m,days:out[m],amount:v}})}

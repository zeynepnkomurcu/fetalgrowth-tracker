import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── i18n ────────────────────────────────────────────────────────────────────
const LANG = {
  EN: {
    appTitle: "FetalGrowth Tracker",
    appSub: "INTERGROWTH-21 · BIOMETRY · DOPPLER · FGR DETECTION",
    patients: "PATIENTS", newPatient: "New patient",
    newPatientTitle: "New Patient", firstName: "Name", lastName: "Surname",
    birthDate: "Date of Birth", tcKimlik: "TC Kimlik No", lmpDate: "Last Menstrual Period (LMP)",
    save: "Save", cancel: "Cancel", required: "All fields are required",
    tcInvalid: "TC Kimlik must be 11 digits",
    loginTitle: "Sign in", loginSub: "Authorized clinicians only",
    username: "Username", password: "Password", loginBtn: "Sign in",
    loginErr: "Invalid username or password", logout: "Sign out",
    welcomeBack: "Welcome back",
    newMeasurement: "+ NEW MEASUREMENT", addBtn: "Add Measurement",
    visits: "visits", visit: "Visit", date: "Date", gaWeeks: "GA (w+d)",
    noMeas: "No measurements yet. Add your first measurement above.",
    noMeasFGR: "Add at least 1 measurement to enable analysis.",
    tabChart: "📈 Growth Curve", tabZ: "Z-Scores", tabDoppler: "🔴 Doppler", tabFGR: "⚠ FGR Stage",
    biometry: "BIOMETRY", doppler: "DOPPLER",
    paramRef: "INTERGROWTH-21 reference · patient measurements overlay",
    notMeasured: "Not measured", interpretTitle: "INTERPRETATION GUIDE",
    fgrRiskBanner: "⚠ FGR RISK",
    interpretLines: [
      "AC < 3rd percentile → High suspicion for FGR (most sensitive biometric marker)",
      "Z-score drop > 1 SD between visits → Growth velocity deceleration",
      "UA PI > 95th %ile → Increased placental resistance",
      "Absent/Reversed EDF → Severe uteroplacental insufficiency — urgent evaluation",
      "MCA PI < 5th %ile → Brain-sparing (cerebral redistribution)",
      "CPR < 1.0 → Cerebroplacental ratio abnormal — delivery timing critical",
    ],
    refNote: "Reference: INTERGROWTH-21st · Papageorghiou et al., Lancet 2014 · Mari & Deter Doppler refs",
    disclaimer: "For clinical decision support only. Always combine with clinical judgment.",
    fgrStages: {
      0: { label: "No FGR Detected", desc: "All parameters within normal limits." },
      1: { label: "Stage I — Suspected FGR", desc: "Biometric SGA or mildly elevated UA PI. Increase surveillance." },
      2: { label: "Stage II — Established FGR", desc: "Absent EDF or CPR < 1.0. Consider tertiary referral." },
      3: { label: "Stage III — Severe FGR", desc: "Reversed EDF or MCA PI < 5th %ile. Urgent evaluation required." },
      4: { label: "Stage IV — Critical FGR", desc: "Abnormal ductus venosus. Delivery may be indicated." },
    },
    dopplerLabels: { UA_PI:"Umbilical A. PI", UA_RI:"Umbilical A. RI", UA_SD:"Umbilical A. S/D",
      UA_EDF:"End-Diastolic Flow", MCA_PI:"MCA PI", MCA_RI:"MCA RI", CPR:"Cerebroplacental Ratio", DV_PIV:"Ductus Venosus PIV" },
    edfOptions: ["Normal", "Absent (AEDF)", "Reversed (REDF)"],
    efwLabel: "Est. Fetal Weight", cprFormula: "CPR = MCA PI / UA PI",
  },
  TR: {
    appTitle: "FetalGrowth Tracker",
    appSub: "INTERGROWTH-21 · BİYOMETRİ · DOPPLER · FGR TESPİTİ",
    patients: "HASTALAR", newPatient: "Yeni hasta",
    newPatientTitle: "Yeni Hasta", firstName: "İsim", lastName: "Soyisim",
    birthDate: "Doğum Tarihi", tcKimlik: "TC Kimlik No", lmpDate: "Son Adet Tarihi",
    save: "Kaydet", cancel: "İptal", required: "Tüm alanlar zorunludur",
    tcInvalid: "TC Kimlik 11 hane olmalıdır",
    loginTitle: "Giriş yap", loginSub: "Sadece yetkili klinisyenler",
    username: "Kullanıcı adı", password: "Şifre", loginBtn: "Giriş yap",
    loginErr: "Geçersiz kullanıcı adı veya şifre", logout: "Çıkış",
    welcomeBack: "Hoş geldiniz",
    newMeasurement: "+ YENİ ÖLÇÜM", addBtn: "Ölçüm Ekle",
    visits: "vizit", visit: "Vizit", date: "Tarih", gaWeeks: "GA (h+g)",
    noMeas: "Henüz ölçüm yok. Yukarıdan ilk ölçümü girin.",
    noMeasFGR: "Analiz için en az 1 ölçüm ekleyin.",
    tabChart: "📈 Büyüme Eğrisi", tabZ: "Z-Skorlar", tabDoppler: "🔴 Doppler", tabFGR: "⚠ FGR Evresi",
    biometry: "BİYOMETRİ", doppler: "DOPPLER",
    paramRef: "INTERGROWTH-21 referans eğrisi · hasta ölçümleri",
    notMeasured: "Ölçülmedi", interpretTitle: "YORUM KILAVUZU",
    fgrRiskBanner: "⚠ FGR RİSKİ",
    interpretLines: [
      "AC < 3. persantil → FGR için yüksek şüphe (en hassas biyometrik marker)",
      "Vizitler arası Z-skor düşüşü > 1 SD → Büyüme hızı yavaşlaması",
      "UA PI > 95. persantil → Artmış plasental direnç",
      "Absent/Ters EAD → Ciddi uteroplasental yetmezlik — acil değerlendirme",
      "MCA PI < 5. persantil → Beyin koruma (serebral yeniden dağılım)",
      "CPR < 1.0 → Serebroplasentral oran anormal — doğum zamanlaması kritik",
    ],
    refNote: "Referans: INTERGROWTH-21st · Papageorghiou et al., Lancet 2014 · Mari & Deter Doppler referansları",
    disclaimer: "Yalnızca klinik karar desteği içindir. Her zaman klinik değerlendirmeyle birlikte kullanın.",
    fgrStages: {
      0: { label: "FGR Tespit Edilmedi", desc: "Tüm parametreler normal sınırlar içinde." },
      1: { label: "Evre I — Şüpheli FGR", desc: "SGA biyometrisi veya hafif UA PI yüksekliği. Takip sıklığı artırılmalı." },
      2: { label: "Evre II — Yerleşik FGR", desc: "EAD yok veya CPR < 1.0. Üçüncü basamak sevki düşünülmeli." },
      3: { label: "Evre III — Ciddi FGR", desc: "Ters EAD veya MCA PI < 5. persantil. Acil değerlendirme gerekli." },
      4: { label: "Evre IV — Kritik FGR", desc: "Anormal duktus venozus. Doğum endikasyonu olabilir." },
    },
    dopplerLabels: { UA_PI:"Umblikal A. PI", UA_RI:"Umblikal A. RI", UA_SD:"Umblikal A. S/D",
      UA_EDF:"Diyastol Sonu Akım", MCA_PI:"MCA PI", MCA_RI:"MCA RI", CPR:"Serebroplasentral Oran", DV_PIV:"Duktus Venozus PIV" },
    edfOptions: ["Normal", "Absent (EAD yok)", "Ters (RADS)"],
    efwLabel: "Tahmini Fetal Ağırlık", cprFormula: "CPR = MCA PI / UA PI",
  },
};

// ─── INTERGROWTH-21 ──────────────────────────────────────────────────────────
const IG21 = {
  BPD: {20:{m:47.8,sd:2.4},21:{m:50.5,sd:2.5},22:{m:53.2,sd:2.6},23:{m:55.9,sd:2.7},24:{m:58.5,sd:2.8},25:{m:61.1,sd:2.9},26:{m:63.6,sd:3.0},27:{m:66.0,sd:3.1},28:{m:68.4,sd:3.2},29:{m:70.7,sd:3.3},30:{m:72.9,sd:3.4},31:{m:75.0,sd:3.5},32:{m:77.0,sd:3.6},33:{m:78.9,sd:3.7},34:{m:80.7,sd:3.8},35:{m:82.4,sd:3.9},36:{m:83.9,sd:4.0},37:{m:85.3,sd:4.1},38:{m:86.6,sd:4.2},39:{m:87.7,sd:4.3},40:{m:88.7,sd:4.4}},
  HC:  {20:{m:178,sd:9},21:{m:188,sd:9},22:{m:198,sd:10},23:{m:208,sd:10},24:{m:218,sd:11},25:{m:228,sd:11},26:{m:237,sd:11},27:{m:246,sd:12},28:{m:255,sd:12},29:{m:263,sd:13},30:{m:271,sd:13},31:{m:279,sd:14},32:{m:286,sd:14},33:{m:292,sd:14},34:{m:298,sd:15},35:{m:304,sd:15},36:{m:309,sd:15},37:{m:313,sd:16},38:{m:317,sd:16},39:{m:320,sd:16},40:{m:323,sd:17}},
  AC:  {20:{m:148,sd:11},21:{m:158,sd:12},22:{m:169,sd:12},23:{m:179,sd:13},24:{m:190,sd:14},25:{m:200,sd:14},26:{m:211,sd:15},27:{m:221,sd:16},28:{m:232,sd:16},29:{m:242,sd:17},30:{m:252,sd:18},31:{m:262,sd:18},32:{m:272,sd:19},33:{m:281,sd:20},34:{m:290,sd:20},35:{m:299,sd:21},36:{m:308,sd:22},37:{m:316,sd:22},38:{m:323,sd:23},39:{m:330,sd:24},40:{m:336,sd:24}},
  FL:  {20:{m:33.0,sd:2.5},21:{m:35.5,sd:2.6},22:{m:38.0,sd:2.7},23:{m:40.5,sd:2.8},24:{m:42.9,sd:2.9},25:{m:45.3,sd:3.0},26:{m:47.6,sd:3.1},27:{m:49.8,sd:3.2},28:{m:51.9,sd:3.3},29:{m:54.0,sd:3.4},30:{m:55.9,sd:3.5},31:{m:57.8,sd:3.6},32:{m:59.5,sd:3.7},33:{m:61.2,sd:3.8},34:{m:62.7,sd:3.9},35:{m:64.1,sd:4.0},36:{m:65.4,sd:4.1},37:{m:66.5,sd:4.2},38:{m:67.5,sd:4.3},39:{m:68.3,sd:4.4},40:{m:69.0,sd:4.5}},
};

// ─── Doppler References ──────────────────────────────────────────────────────
const UA_PI_95 = {20:1.80,21:1.75,22:1.70,23:1.65,24:1.60,25:1.55,26:1.50,27:1.45,28:1.40,29:1.35,30:1.30,31:1.25,32:1.20,33:1.15,34:1.10,35:1.05,36:1.00,37:0.96,38:0.93,39:0.90,40:0.88};
const MCA_PI_REF = {20:{m:2.10,p5:1.55},21:{m:2.15,p5:1.58},22:{m:2.20,p5:1.62},23:{m:2.25,p5:1.66},24:{m:2.28,p5:1.68},25:{m:2.30,p5:1.70},26:{m:2.32,p5:1.72},27:{m:2.35,p5:1.73},28:{m:2.38,p5:1.74},29:{m:2.40,p5:1.75},30:{m:2.42,p5:1.76},31:{m:2.44,p5:1.77},32:{m:2.45,p5:1.76},33:{m:2.43,p5:1.73},34:{m:2.38,p5:1.69},35:{m:2.30,p5:1.62},36:{m:2.18,p5:1.52},37:{m:2.05,p5:1.40},38:{m:1.90,p5:1.28},39:{m:1.75,p5:1.15},40:{m:1.60,p5:1.02}};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcGaFromLmp(lmpDate, measDate) {
  if (!lmpDate || !measDate) return null;
  const ms = new Date(measDate).getTime() - new Date(lmpDate).getTime();
  if (isNaN(ms) || ms < 0) return null;
  const totalDays = Math.floor(ms / 86400000);
  const w = Math.floor(totalDays / 7);
  const d = totalDays % 7;
  return { weeks: w, days: d, decimal: w + d / 7, display: `${w}+${d}` };
}
function gaDecimalToDisplay(dec) {
  if (dec == null || isNaN(dec)) return "";
  const w = Math.floor(dec);
  const d = Math.round((dec - w) * 7);
  return d === 7 ? `${w + 1}+0` : `${w}+${d}`;
}
const getZ = (p, wk, v) => { const r=IG21[p]?.[Math.round(wk)]; if(!r||v==null) return null; return parseFloat(((v-r.m)/r.sd).toFixed(2)); };
function normCDF(z) { const t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2),p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>=0?1-p:p; }
const getPct = z => Math.round(normCDF(z)*100);
const calcEFW = m => { if(!m.HC||!m.AC||!m.FL) return null; return Math.round(Math.exp(1.3596+0.0064*m.HC+0.0424*m.AC+0.174*m.FL-0.00386*m.AC*m.FL)*10); };
const calcCPR = m => { if(!m.MCA_PI||!m.UA_PI) return null; return parseFloat((m.MCA_PI/m.UA_PI).toFixed(2)); };

function getFGRStage(meas) {
  if (!meas.length) return { stage:0, findings:[] };
  const sorted=[...meas].sort((a,b)=>a.ga-b.ga);
  const last=sorted[sorted.length-1], prev=sorted.length>1?sorted[sorted.length-2]:null;
  let stage=0; const findings=[];
  const acZ=getZ("AC",last.ga,last.AC);
  if(acZ!=null&&acZ<-1.88){stage=Math.max(stage,1);findings.push({level:"WARN",text:`AC < 3rd %ile (Z=${acZ})`});}
  if(prev){for(const p of["BPD","HC","AC","FL"]){if(last[p]&&prev[p]){const z1=getZ(p,prev.ga,prev[p]),z2=getZ(p,last.ga,last[p]);if(z1!=null&&z2!=null&&z1-z2>1.0){stage=Math.max(stage,1);findings.push({level:"WARN",text:`${p}: Δz=${(z1-z2).toFixed(1)} SD ↓`});}}}}
  const wk=Math.round(last.ga),uaRef=UA_PI_95[wk],mcaRef=MCA_PI_REF[wk];
  if(last.UA_EDF===1){stage=Math.max(stage,2);findings.push({level:"HIGH",text:"Absent EDF (AEDF)"});}
  if(last.UA_EDF===2){stage=Math.max(stage,3);findings.push({level:"HIGH",text:"Reversed EDF (REDF) — critical"});}
  if(last.UA_PI&&uaRef&&last.UA_PI>uaRef){stage=Math.max(stage,1);findings.push({level:"WARN",text:`UA PI ${last.UA_PI} > 95th %ile (${uaRef})`});}
  if(last.MCA_PI&&mcaRef&&last.MCA_PI<mcaRef.p5){stage=Math.max(stage,3);findings.push({level:"HIGH",text:`MCA PI ${last.MCA_PI} < 5th %ile — brain-sparing`});}
  const cpr=calcCPR(last);
  if(cpr!=null&&cpr<1.0){stage=Math.max(stage,2);findings.push({level:"HIGH",text:`CPR = ${cpr} < 1.0`});}
  if(last.DV_PIV&&last.DV_PIV>1.0){stage=Math.max(stage,4);findings.push({level:"HIGH",text:`Ductus venosus PIV ${last.DV_PIV} elevated`});}
  if(!findings.length) findings.push({level:"OK",text:"All parameters normal"});
  return {stage,findings};
}

function getRefCurve(param) {
  return Object.entries(IG21[param]).map(([wk,v])=>({ week:parseInt(wk),
    p3:parseFloat((v.m-1.88*v.sd).toFixed(1)), p10:parseFloat((v.m-1.28*v.sd).toFixed(1)),
    p50:parseFloat(v.m.toFixed(1)), p90:parseFloat((v.m+1.28*v.sd).toFixed(1)), p97:parseFloat((v.m+1.88*v.sd).toFixed(1)) }));
}

// ─── Colors ──────────────────────────────────────────────────────────────────
const C={bg:"#060d1a",card:"#0d1525",border:"#182236",accent:"#00e5b8",accentDim:"#00e5b818",
  warn:"#f59e0b",danger:"#ef4444",ok:"#10b981",text:"#dde6f0",muted:"#4d6480",
  BPD:"#60a5fa",HC:"#c084fc",AC:"#34d399",FL:"#fb923c",UA:"#f87171",MCA:"#a78bfa"};

// ─── Auth ────────────────────────────────────────────────────────────────────
const USERS = {
  zeynepnur: { password: "Summer2027", display: "Dr. Zeynep" },
};
const AUTH_KEY = "fgt_auth_user";

// ─── Responsive hook ─────────────────────────────────────────────────────────
function useViewport() {
  const get = () => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const [v, setV] = useState(get);
  useEffect(() => {
    const onR = () => setV(get());
    window.addEventListener("resize", onR);
    window.addEventListener("orientationchange", onR);
    return () => { window.removeEventListener("resize", onR); window.removeEventListener("orientationchange", onR); };
  }, []);
  return { ...v, isMobile: v.w < 768, isTablet: v.w >= 768 && v.w < 1024, isDesktop: v.w >= 1024 };
}

// ─── UI atoms ────────────────────────────────────────────────────────────────
function Badge({level,small}){
  const cfg={HIGH:{bg:"#ef444420",bd:"#ef4444",tx:"#fca5a5",lb:"⚠ HIGH"},WARN:{bg:"#f59e0b20",bd:"#f59e0b",tx:"#fcd34d",lb:"△ WARN"},OK:{bg:"#10b98120",bd:"#10b981",tx:"#6ee7b7",lb:"✓ OK"}}[level]||{};
  return <span style={{background:cfg.bg,border:`1px solid ${cfg.bd}`,color:cfg.tx,borderRadius:5,padding:small?"1px 7px":"2px 10px",fontSize:small?10:11,fontWeight:700,letterSpacing:"0.05em",fontFamily:"monospace"}}>{cfg.lb}</span>;
}

function PctBar({z}){
  if(z==null)return null;
  const pct=getPct(z),color=z<-1.88?C.danger:z<-1.28?C.warn:C.ok,pos=Math.max(2,Math.min(97,pct));
  return(
    <div style={{marginTop:5}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:2}}>
        {["3","10","50","90","97"].map(v=><span key={v}>P{v}</span>)}
      </div>
      <div style={{position:"relative",height:7,background:"#182236",borderRadius:4}}>
        {[3,10,50,90,97].map(v=><div key={v} style={{position:"absolute",left:`${v}%`,width:1,height:"100%",background:v===3||v===97?C.danger:v===50?C.muted:C.warn,opacity:0.5}}/>)}
        <div style={{position:"absolute",left:`calc(${pos}% - 5px)`,top:-1,width:9,height:9,background:color,borderRadius:"50%",border:`2px solid ${C.bg}`,boxShadow:`0 0 6px ${color}`}}/>
      </div>
      <div style={{textAlign:"right",fontSize:10,color,marginTop:2}}>Z {z>0?"+":""}{z} · P{pct}</div>
    </div>
  );
}

function DGauge({value,label,ref95,ref5,isLow}){
  if(value==null)return null;
  const bad=isLow?value<ref5:value>ref95;
  const color=bad?C.danger:C.ok;
  return(
    <div style={{background:"#0a1220",borderRadius:8,padding:"10px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:10,color:C.muted,letterSpacing:"0.07em"}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color}}>{value}</span>
      </div>
      {ref95&&<div style={{fontSize:9,color:C.muted}}>{isLow?`> ${ref5} (5th %ile)`:`< ${ref95} (95th %ile)`}</div>}
    </div>
  );
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, T, lang, setLang, vp }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [showP, setShowP] = useState(false);

  function submit(e) {
    if (e) e.preventDefault();
    const user = USERS[u.trim().toLowerCase()];
    if (!user || user.password !== p) { setErr(T.loginErr); return; }
    onLogin(u.trim().toLowerCase());
  }

  const inp = {
    background:"#07101e", border:`1px solid ${C.border}`, color:C.text,
    borderRadius:8, padding:"12px 14px", fontSize:14, width:"100%",
    outline:"none", fontFamily:"inherit", boxSizing:"border-box",
  };
  const tb = (a) => ({
    background: a ? `${C.accent}20` : "transparent",
    border: `1px solid ${a ? C.accent : C.border}`,
    color: a ? C.accent : C.muted, borderRadius:6, padding:"5px 12px",
    cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:a?700:400,
  });

  return (
    <div style={{
      minHeight:"100vh",minHeight:"100dvh",background:C.bg,color:C.text,
      fontFamily:"'DM Mono','Courier New',monospace",display:"flex",
      flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:vp.isMobile?16:24,position:"relative",overflow:"hidden",
    }}>
      {/* Ambient glow */}
      <div aria-hidden style={{position:"absolute",inset:0,
        background:`radial-gradient(ellipse at 30% 20%, ${C.accent}15, transparent 50%), radial-gradient(ellipse at 70% 80%, #5cffd910, transparent 50%)`,
        pointerEvents:"none"}}/>

      {/* Lang switcher */}
      <div style={{position:"absolute",top:`calc(20px + env(safe-area-inset-top))`,right:20,display:"flex",gap:6,zIndex:2}}>
        <button style={tb(lang==="EN")} onClick={()=>setLang("EN")}>EN</button>
        <button style={tb(lang==="TR")} onClick={()=>setLang("TR")}>TR</button>
      </div>

      <form onSubmit={submit} style={{
        position:"relative",zIndex:1,width:"100%",maxWidth:380,
        background:"rgba(13, 21, 37, 0.85)",
        backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
        border:`1px solid ${C.border}`,borderRadius:18,
        padding:vp.isMobile?22:32,
        boxShadow:`0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${C.accent}10`,
      }}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
          <div style={{
            width:64,height:64,borderRadius:18,
            background:`radial-gradient(circle at 35% 35%,${C.accent},#007755)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:32,boxShadow:`0 10px 30px ${C.accent}40, 0 0 40px ${C.accent}30`,
            marginBottom:14,
          }}>♡</div>
          <div style={{fontSize:18,fontWeight:700,color:C.accent,letterSpacing:"0.04em"}}>
            FetalGrowth Tracker
          </div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",marginTop:4,textAlign:"center"}}>
            INTERGROWTH-21 · BIOMETRY · DOPPLER · FGR
          </div>
        </div>

        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{T.loginTitle}</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:18,letterSpacing:"0.05em"}}>{T.loginSub}</div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>{T.username}</div>
          <input type="text" autoCapitalize="none" autoComplete="username" autoFocus
            value={u} onChange={e=>{setU(e.target.value);setErr("");}}
            style={inp}/>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>{T.password}</div>
          <div style={{position:"relative"}}>
            <input type={showP?"text":"password"} autoComplete="current-password"
              value={p} onChange={e=>{setP(e.target.value);setErr("");}}
              style={{...inp,paddingRight:44}}/>
            <button type="button" onClick={()=>setShowP(s=>!s)} aria-label="Toggle password"
              style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                background:"transparent",border:"none",color:C.muted,cursor:"pointer",
                fontSize:14,padding:6,fontFamily:"inherit"}}>{showP?"○":"●"}</button>
          </div>
        </div>

        {err && (
          <div style={{fontSize:11,color:C.danger,padding:"9px 12px",
            background:`${C.danger}15`,border:`1px solid ${C.danger}40`,
            borderRadius:8,marginBottom:14}}>{err}</div>
        )}

        <button type="submit" style={{
          width:"100%",background:C.accent,color:"#060d1a",border:"none",
          borderRadius:8,padding:"13px 22px",fontSize:14,fontWeight:700,
          cursor:"pointer",letterSpacing:"0.06em",fontFamily:"inherit",
          boxShadow:`0 6px 20px ${C.accent}40`,
        }}>{T.loginBtn}</button>
      </form>

      <div style={{position:"relative",zIndex:1,marginTop:18,fontSize:9,color:"#2d4060",letterSpacing:"0.1em"}}>
        © FetalGrowth Tracker
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const BLANK={date:"",ga:"",BPD:"",HC:"",AC:"",FL:"",UA_PI:"",UA_RI:"",UA_SD:"",UA_EDF:null,MCA_PI:"",MCA_RI:"",DV_PIV:""};

const NEW_PT_BLANK = { firstName: "", lastName: "", birthDate: "", tcKimlik: "", lmpDate: "" };

export default function App(){
  const vp = useViewport();
  const [lang,setLang]=useState("EN"); const T=LANG[lang];
  const [authUser, setAuthUser] = useState(() => {
    try { return localStorage.getItem(AUTH_KEY) || null; } catch { return null; }
  });
  function login(u){ try{localStorage.setItem(AUTH_KEY,u);}catch{} setAuthUser(u); }
  function logout(){ try{localStorage.removeItem(AUTH_KEY);}catch{} setAuthUser(null); }

  const [patients,setPatients]=useState([]);
  const [pid,setPid]=useState(null);
  const [form,setForm]=useState(BLANK);
  const [tab,setTab]=useState("chart");
  const [param,setParam]=useState("AC");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNewPt, setShowNewPt] = useState(false);
  const [newPt, setNewPt] = useState(NEW_PT_BLANK);
  const [newPtErr, setNewPtErr] = useState("");

  // Close drawer when switching to desktop
  useEffect(() => { if (vp.isDesktop) setDrawerOpen(false); }, [vp.isDesktop]);

  const patient=patients.find(p=>p.id===pid);
  const meas=patient?.measurements||[];
  const sorted=[...meas].sort((a,b)=>a.ga-b.ga);

  // Auto-calc GA from LMP when measurement date changes
  useEffect(() => {
    if (!patient?.lmpDate || !form.date) return;
    const ga = calcGaFromLmp(patient.lmpDate, form.date);
    if (ga && ga.decimal !== form.ga) setForm(x => ({ ...x, ga: ga.decimal }));
  }, [form.date, patient?.lmpDate]);

  const {stage,findings}=useMemo(()=>getFGRStage(meas),[meas]);
  const si=T.fgrStages[stage];
  const sc=stage===0?C.ok:stage===1?C.warn:C.danger;

  const f=(k,v)=>setForm(x=>({...x,[k]:v}));

  function addMeas(){
    if(!form.date||!form.ga)return;
    const m={id:Date.now(),date:form.date,ga:parseFloat(form.ga),
      BPD:form.BPD?parseFloat(form.BPD):null,HC:form.HC?parseFloat(form.HC):null,
      AC:form.AC?parseFloat(form.AC):null,FL:form.FL?parseFloat(form.FL):null,
      UA_PI:form.UA_PI?parseFloat(form.UA_PI):null,UA_RI:form.UA_RI?parseFloat(form.UA_RI):null,
      UA_SD:form.UA_SD?parseFloat(form.UA_SD):null,UA_EDF:form.UA_EDF,
      MCA_PI:form.MCA_PI?parseFloat(form.MCA_PI):null,MCA_RI:form.MCA_RI?parseFloat(form.MCA_RI):null,
      DV_PIV:form.DV_PIV?parseFloat(form.DV_PIV):null};
    setPatients(ps=>ps.map(p=>p.id===pid?{...p,measurements:[...p.measurements,m]}:p));
    setForm(BLANK);
  }
  function openNewPt(){ setNewPt(NEW_PT_BLANK); setNewPtErr(""); setShowNewPt(true); setDrawerOpen(false); }
  function savePt(){
    const np = { ...newPt, firstName: newPt.firstName.trim(), lastName: newPt.lastName.trim(), tcKimlik: newPt.tcKimlik.trim() };
    if (!np.firstName || !np.lastName || !np.birthDate || !np.tcKimlik || !np.lmpDate) { setNewPtErr(T.required); return; }
    if (!/^\d{11}$/.test(np.tcKimlik)) { setNewPtErr(T.tcInvalid); return; }
    const id = Date.now();
    const name = `${np.firstName} ${np.lastName}`;
    setPatients(ps => [...ps, { id, name, ...np, measurements: [] }]);
    setPid(id);
    setShowNewPt(false);
    setNewPt(NEW_PT_BLANK);
  }
  function delM(id){setPatients(ps=>ps.map(p=>p.id===pid?{...p,measurements:p.measurements.filter(m=>m.id!==id)}:p));}
  function pickPatient(id){setPid(id);setDrawerOpen(false);}

  if (!authUser) {
    return <LoginScreen onLogin={login} T={T} lang={lang} setLang={setLang} vp={vp}/>;
  }
  const userInfo = USERS[authUser];

  // chart data
  const ref=getRefCurve(param);
  const ptD=sorted.filter(m=>m[param]!=null).map(m=>({week:m.ga,pv:m[param]}));
  const wks=Array.from(new Set([...ref.map(d=>d.week),...ptD.map(d=>d.week)])).sort((a,b)=>a-b);
  const cd=wks.map(w=>{const r=ref.find(x=>x.week===Math.round(w)),pt=ptD.find(x=>x.week===w);return{week:w,...(r||{}),patientValue:pt?.pv??null};});

  const dpD=sorted.filter(m=>m.UA_PI||m.MCA_PI).map(m=>{const wk=Math.round(m.ga);return{week:m.ga,UA_PI:m.UA_PI,MCA_PI:m.MCA_PI,UA95:UA_PI_95[wk],MCAm:MCA_PI_REF[wk]?.m,MCA5:MCA_PI_REF[wk]?.p5,CPR:calcCPR(m)};});

  // responsive sizing
  const pad = vp.isMobile ? 12 : vp.isTablet ? 16 : 18;
  const sidebarW = vp.isTablet ? 170 : 196;
  const bioCols = vp.isMobile ? "repeat(2,1fr)" : vp.isTablet ? "repeat(3,1fr)" : "repeat(6,1fr)";
  const dopCols = vp.isMobile ? "repeat(2,1fr)" : vp.isTablet ? "repeat(3,1fr)" : "repeat(6,1fr)";
  const dgCols = vp.isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)";
  const chartH = vp.isMobile ? 240 : vp.isTablet ? 270 : 290;

  // style helpers
  const inp={background:"#07101e",border:`1px solid ${C.border}`,color:C.text,borderRadius:6,padding:"9px 10px",fontSize:13,width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  const tb=(a,col)=>({background:a?`${col||C.accent}20`:"#0a1424",border:`1px solid ${a?col||C.accent:"#2a3854"}`,color:a?col||C.accent:"#8ea0bc",borderRadius:6,padding:vp.isMobile?"8px 12px":"7px 14px",cursor:"pointer",fontSize:vp.isMobile?12:12,fontFamily:"inherit",fontWeight:a?700:500,letterSpacing:"0.04em",whiteSpace:"nowrap",minHeight:36});
  const card={background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:vp.isMobile?12:16};
  const lbl={fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3};
  const PLABELS={BPD:"Biparietal Diameter",HC:"Head Circumference",AC:"Abdominal Circumference",FL:"Femur Length"};

  const sidebarContent = (
    <>
      <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:4}}>{T.patients}</div>
      {patients.map(p=>{
        const {stage:ps}=getFGRStage(p.measurements);
        const dot=ps===0&&p.measurements.length>0?C.ok:ps===1?C.warn:ps>1?C.danger:null;
        return(
          <button key={p.id} onClick={()=>pickPatient(p.id)} style={{background:p.id===pid?C.accentDim:"transparent",border:`1px solid ${p.id===pid?C.accent:C.border}`,color:p.id===pid?C.accent:C.text,borderRadius:8,padding:"9px 10px",cursor:"pointer",fontSize:12,textAlign:"left",fontFamily:"inherit"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
              {dot&&<span style={{color:dot,fontSize:9,marginLeft:4}}>●</span>}
            </div>
            <div style={{fontSize:9,color:C.muted,marginTop:2}}>{p.measurements.length} {T.visits}</div>
          </button>
        );
      })}
      <button onClick={openNewPt} style={{background:`${C.accent}15`,border:`1px dashed ${C.accent}`,color:C.accent,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,marginTop:6,letterSpacing:"0.04em"}}>+ {T.newPatient}</button>
    </>
  );

  return(
    <div style={{
      flex:1,
      background:C.bg,
      color:C.text,
      fontFamily:"'DM Mono','Courier New',monospace",
      display:"flex",
      flexDirection:"column",
      paddingTop:"env(safe-area-inset-top)",
      paddingBottom:"env(safe-area-inset-bottom)",
      minHeight:0,
    }}>

      {/* Header */}
      <div style={{background:"#08111f",borderBottom:`1px solid ${C.border}`,padding:vp.isMobile?"10px 12px":"12px 20px",display:"flex",alignItems:"center",gap:vp.isMobile?10:14,flexShrink:0}}>
        {!vp.isDesktop && (
          <button onClick={()=>setDrawerOpen(o=>!o)} aria-label="Menu"
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.accent,borderRadius:6,padding:"6px 9px",cursor:"pointer",fontSize:16,lineHeight:1,fontFamily:"inherit"}}>
            ☰
          </button>
        )}
        <div style={{width:vp.isMobile?28:32,height:vp.isMobile?28:32,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.accent},#007755)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:vp.isMobile?14:16,boxShadow:`0 0 18px ${C.accent}55`,flexShrink:0}}>♡</div>
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:vp.isMobile?14:16,fontWeight:700,color:C.accent,letterSpacing:"0.03em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{T.appTitle}</div>
          {!vp.isMobile && <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em"}}>{T.appSub}</div>}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:vp.isMobile?5:8,alignItems:"center",flexShrink:0}}>
          {stage>0&&!vp.isMobile&&<div style={{background:`${sc}20`,border:`1px solid ${sc}`,borderRadius:7,padding:"5px 12px",color:sc,fontSize:11,fontWeight:700}}>{T.fgrRiskBanner}</div>}
          {stage>0&&vp.isMobile&&<div style={{background:`${sc}20`,border:`1px solid ${sc}`,borderRadius:6,padding:"4px 7px",color:sc,fontSize:10,fontWeight:700}}>⚠</div>}
          <button style={tb(lang==="EN")} onClick={()=>setLang("EN")}>EN</button>
          <button style={tb(lang==="TR")} onClick={()=>setLang("TR")}>TR</button>
          {!vp.isMobile && userInfo && <div style={{fontSize:10,color:C.muted,marginLeft:6,whiteSpace:"nowrap"}}>{userInfo.display}</div>}
          <button onClick={logout} title={T.logout} aria-label={T.logout}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:13,fontFamily:"inherit",lineHeight:1}}>⏻</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative"}}>
        {/* Desktop sidebar */}
        {vp.isDesktop && (
          <div style={{width:sidebarW,background:"#08111f",borderRight:`1px solid ${C.border}`,padding:14,display:"flex",flexDirection:"column",gap:7,overflowY:"auto",flexShrink:0}}>
            {sidebarContent}
          </div>
        )}

        {/* Mobile/Tablet drawer */}
        {!vp.isDesktop && drawerOpen && (
          <>
            <div onClick={()=>setDrawerOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9}}/>
            <div style={{position:"fixed",top:0,left:0,bottom:0,width:Math.min(280,vp.w-60),background:"#08111f",borderRight:`1px solid ${C.border}`,padding:14,paddingTop:`calc(14px + env(safe-area-inset-top))`,paddingBottom:`calc(14px + env(safe-area-inset-bottom))`,display:"flex",flexDirection:"column",gap:7,overflowY:"auto",zIndex:10,boxShadow:"4px 0 24px rgba(0,0,0,0.5)"}}>
              <button onClick={()=>setDrawerOpen(false)} aria-label="Close menu"
                style={{alignSelf:"flex-end",background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:"0 4px",fontFamily:"inherit"}}>×</button>
              {sidebarContent}
            </div>
          </>
        )}

        {/* Main */}
        <div style={{flex:1,overflowY:"auto",padding:pad,display:"flex",flexDirection:"column",gap:vp.isMobile?10:14,minWidth:0,WebkitOverflowScrolling:"touch"}}>

          {!patient && (
            <div style={{...card,textAlign:"center",padding:vp.isMobile?28:48,color:C.muted,marginTop:vp.isMobile?20:60}}>
              <div style={{fontSize:36,marginBottom:12}}>♡</div>
              <div style={{fontSize:14,marginBottom:14,color:C.text}}>{T.patients} · 0</div>
              <button onClick={openNewPt} style={{background:C.accent,color:"#060d1a",border:"none",borderRadius:6,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"inherit"}}>+ {T.newPatient}</button>
            </div>
          )}

          {patient && (<>
          {/* Patient header */}
          <div style={{display:"flex",alignItems:vp.isMobile?"flex-start":"center",justifyContent:"space-between",flexDirection:vp.isMobile?"column":"row",gap:vp.isMobile?6:0}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:vp.isMobile?16:18,fontWeight:700,color:C.accent}}>{patient.name}</div>
              <div style={{fontSize:10,color:C.muted}}>
                TC {patient.tcKimlik} · {T.lmpDate}: {patient.lmpDate} · {meas.length} {T.visits}
              </div>
            </div>
            <div style={{textAlign:vp.isMobile?"left":"right",width:vp.isMobile?"100%":"auto"}}>
              <div style={{fontSize:12,fontWeight:700,color:sc}}>{si.label}</div>
              <div style={{fontSize:10,color:C.muted,maxWidth:vp.isMobile?"none":280}}>{si.desc}</div>
            </div>
          </div>

          {/* Entry form */}
          <div style={card}>
            <div style={{fontSize:11,fontWeight:700,color:C.accent,marginBottom:10,letterSpacing:"0.06em"}}>{T.newMeasurement}</div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:6}}>{T.biometry}</div>
            <div style={{display:"grid",gridTemplateColumns:bioCols,gap:8,marginBottom:12}}>
              {[{k:"date",lb:T.date,tp:"date"},{k:"ga",lb:T.gaWeeks,tp:"number",ph:"28+0"},
                {k:"BPD",lb:"BPD mm",tp:"number",ph:"70"},{k:"HC",lb:"HC mm",tp:"number",ph:"260"},
                {k:"AC",lb:"AC mm",tp:"number",ph:"240"},{k:"FL",lb:"FL mm",tp:"number",ph:"52"}
              ].map(({k,lb,tp,ph})=>{
                if(k==="ga"){
                  const gaLocked=!!patient?.lmpDate;
                  return(
                    <div key={k}><div style={lbl}>{lb}</div>
                      <input type="text" readOnly={gaLocked} value={gaLocked?gaDecimalToDisplay(form.ga):form.ga} placeholder={ph}
                        onChange={e=>f(k,e.target.value)}
                        style={{...inp,background:gaLocked?"#0a1424":inp.background,color:gaLocked?C.accent:inp.color,fontWeight:gaLocked?700:400}}/>
                    </div>
                  );
                }
                return(
                  <div key={k} style={k==="date"&&vp.isMobile?{gridColumn:"span 2"}:undefined}><div style={lbl}>{lb}</div>
                    <input type={tp} inputMode={tp==="number"?"decimal":undefined} value={form[k]} placeholder={ph} onChange={e=>f(k,e.target.value)} style={inp} step={tp==="number"?"0.01":undefined}/>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:6}}>{T.doppler}</div>
            <div style={{display:"grid",gridTemplateColumns:dopCols,gap:8,marginBottom:10}}>
              {[{k:"UA_PI",lb:"UA PI",ph:"0.90"},{k:"UA_RI",lb:"UA RI",ph:"0.60"},
                {k:"UA_SD",lb:"UA S/D",ph:"2.5"},{k:"MCA_PI",lb:"MCA PI",ph:"1.80"},
                {k:"MCA_RI",lb:"MCA RI",ph:"0.75"},{k:"DV_PIV",lb:"DV PIV",ph:"0.80"}
              ].map(({k,lb,ph})=>(
                <div key={k}><div style={lbl}>{lb}</div>
                  <input type="number" inputMode="decimal" value={form[k]} placeholder={ph} onChange={e=>f(k,e.target.value)} style={inp} step="0.01"/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:vp.isMobile?"flex-start":"center",gap:vp.isMobile?6:12,marginBottom:12,flexWrap:"wrap",flexDirection:vp.isMobile?"column":"row"}}>
              <div style={{...lbl,marginBottom:0,whiteSpace:"nowrap"}}>{T.dopplerLabels.UA_EDF}:</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {T.edfOptions.map((opt,i)=>(
                  <button key={i} onClick={()=>f("UA_EDF",i)}
                    style={{...tb(form.UA_EDF===i,i===0?C.ok:i===1?C.warn:C.danger),fontSize:11}}>{opt}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:vp.isMobile?"stretch":"flex-end"}}>
              <button style={{background:C.accent,color:"#060d1a",border:"none",borderRadius:6,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"inherit",width:vp.isMobile?"100%":"auto"}} onClick={addMeas}>{T.addBtn}</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,paddingTop:2,flexShrink:0,scrollbarWidth:"none"}}>
            {[["chart",T.tabChart],["zscore",T.tabZ],["doppler",T.tabDoppler],["fgr",T.tabFGR]].map(([k,lb])=>(
              <button key={k} style={tb(tab===k)} onClick={()=>setTab(k)}>{lb}</button>
            ))}
          </div>

          {/* ── CHART ── */}
          {tab==="chart"&&(
            <div style={card}>
              <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
                {["BPD","HC","AC","FL"].map(p=><button key={p} style={tb(param===p,C[p])} onClick={()=>setParam(p)}>{p}</button>)}
              </div>
              <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{PLABELS[param]} · {T.paramRef}</div>
              <ResponsiveContainer width="100%" height={chartH}>
                <LineChart data={cd} margin={{top:6,right:vp.isMobile?6:14,bottom:18,left:vp.isMobile?-10:8}}>
                  <CartesianGrid stroke={C.border} strokeDasharray="4 4"/>
                  <XAxis dataKey="week" stroke={C.muted} tick={{fontSize:10}} label={{value:"GA (weeks)",position:"insideBottom",offset:-8,fill:C.muted,fontSize:10}}/>
                  <YAxis stroke={C.muted} tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} labelFormatter={v=>`GA: ${v}w`}/>
                  <Line type="monotone" dataKey="p3"  stroke={C.danger} strokeDasharray="3 2" strokeWidth={1} dot={false} name="P3"/>
                  <Line type="monotone" dataKey="p10" stroke={C.warn}   strokeDasharray="3 2" strokeWidth={1} dot={false} name="P10"/>
                  <Line type="monotone" dataKey="p50" stroke={C.muted}  strokeWidth={1.5}     dot={false} name="P50"/>
                  <Line type="monotone" dataKey="p90" stroke={C.warn}   strokeDasharray="3 2" strokeWidth={1} dot={false} name="P90"/>
                  <Line type="monotone" dataKey="p97" stroke={C.danger} strokeDasharray="3 2" strokeWidth={1} dot={false} name="P97"/>
                  <Line type="monotone" dataKey="patientValue" stroke={C[param]} strokeWidth={2.5}
                    dot={{fill:C[param],r:5,strokeWidth:2,stroke:C.bg}} activeDot={{r:7}} name="Patient" connectNulls={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Z-SCORES ── */}
          {tab==="zscore"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sorted.length===0&&<div style={{...card,color:C.muted,textAlign:"center",padding:32}}>{T.noMeas}</div>}
              {sorted.map((m,i)=>{
                const efw=calcEFW(m);
                return(
                  <div key={m.id} style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}>
                      <div style={{minWidth:0,flex:1}}>
                        <span style={{fontWeight:700,color:C.accent}}>{T.visit} {i+1}</span>
                        <span style={{color:C.muted,fontSize:11,marginLeft:8}}>{m.date} · GA {m.ga}w</span>
                        {efw&&<span style={{color:C.warn,fontSize:11,marginLeft:vp.isMobile?6:12,display:vp.isMobile?"block":"inline"}}>{T.efwLabel}: ~{efw}g</span>}
                      </div>
                      <button onClick={()=>delM(m.id)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:vp.isMobile?"1fr":"1fr 1fr",gap:10}}>
                      {["BPD","HC","AC","FL"].map(p=>{
                        const z=getZ(p,m.ga,m[p]);
                        return(
                          <div key={p} style={{background:"#0a1220",borderRadius:8,padding:"10px 12px"}}>
                            <div style={{display:"flex",justifyContent:"space-between"}}>
                              <span style={{fontSize:10,fontWeight:700,color:C[p]}}>{p}</span>
                              <span style={{fontSize:12,color:C.text}}>{m[p]!=null?`${m[p]} mm`:"—"}</span>
                            </div>
                            {m[p]!=null?<PctBar z={z}/>:<div style={{fontSize:10,color:C.muted,marginTop:4}}>{T.notMeasured}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── DOPPLER ── */}
          {tab==="doppler"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sorted.length===0&&<div style={{...card,color:C.muted,textAlign:"center",padding:32}}>{T.noMeas}</div>}
              {sorted.map((m,i)=>{
                const wk=Math.round(m.ga),uaRef=UA_PI_95[wk],mcaRef=MCA_PI_REF[wk],cpr=calcCPR(m);
                return(
                  <div key={m.id} style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div>
                        <span style={{fontWeight:700,color:C.accent}}>{T.visit} {i+1}</span>
                        <span style={{color:C.muted,fontSize:11,marginLeft:8}}>{m.date} · GA {m.ga}w</span>
                      </div>
                      <button onClick={()=>delM(m.id)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:dgCols,gap:8}}>
                      <DGauge value={m.UA_PI} label={T.dopplerLabels.UA_PI} ref95={uaRef}/>
                      <DGauge value={m.UA_RI} label={T.dopplerLabels.UA_RI} ref95={0.70}/>
                      <DGauge value={m.UA_SD} label={T.dopplerLabels.UA_SD} ref95={3.0}/>
                      <DGauge value={m.MCA_PI} label={T.dopplerLabels.MCA_PI} ref5={mcaRef?.p5} isLow/>
                      <DGauge value={m.MCA_RI} label={T.dopplerLabels.MCA_RI} ref5={0.60} isLow/>
                      <DGauge value={m.DV_PIV} label={T.dopplerLabels.DV_PIV} ref95={1.0}/>
                      {cpr!=null&&(
                        <div style={{background:"#0a1220",borderRadius:8,padding:"10px 12px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:10,color:C.muted}}>CPR</span>
                            <span style={{fontSize:13,fontWeight:700,color:cpr<1.0?C.danger:C.ok}}>{cpr}</span>
                          </div>
                          <div style={{fontSize:9,color:C.muted}}>{T.cprFormula} · ≥ 1.0</div>
                        </div>
                      )}
                      <div style={{background:"#0a1220",borderRadius:8,padding:"10px 12px",gridColumn:vp.isMobile?"span 2":"auto"}}>
                        <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{T.dopplerLabels.UA_EDF}</div>
                        <span style={{fontWeight:700,fontSize:12,color:m.UA_EDF==null?C.muted:m.UA_EDF===0?C.ok:m.UA_EDF===1?C.warn:C.danger}}>{m.UA_EDF==null?"—":T.edfOptions[m.UA_EDF]}</span>
                      </div>
                    </div>
                    {dpD.length>1&&i===sorted.length-1&&(
                      <div style={{marginTop:12}}>
                        <div style={{fontSize:9,color:C.muted,marginBottom:6}}>UA PI / MCA PI TREND</div>
                        <ResponsiveContainer width="100%" height={vp.isMobile?140:160}>
                          <LineChart data={dpD} margin={{top:4,right:vp.isMobile?4:10,bottom:14,left:vp.isMobile?-12:4}}>
                            <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
                            <XAxis dataKey="week" stroke={C.muted} tick={{fontSize:9}} label={{value:"GA (w)",position:"insideBottom",offset:-6,fill:C.muted,fontSize:9}}/>
                            <YAxis stroke={C.muted} tick={{fontSize:9}} domain={[0,"auto"]}/>
                            <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,fontSize:10}}/>
                            <Line type="monotone" dataKey="UA_PI"  stroke={C.UA}  strokeWidth={2} dot={{r:4}} name="UA PI"/>
                            <Line type="monotone" dataKey="MCA_PI" stroke={C.MCA} strokeWidth={2} dot={{r:4}} name="MCA PI"/>
                            <Line type="monotone" dataKey="UA95"   stroke={C.danger} strokeDasharray="4 2" strokeWidth={1} dot={false} name="UA 95th"/>
                            <Line type="monotone" dataKey="MCA5"   stroke={C.warn}   strokeDasharray="4 2" strokeWidth={1} dot={false} name="MCA 5th"/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── FGR STAGE ── */}
          {tab==="fgr"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {meas.length===0&&<div style={{...card,color:C.muted,textAlign:"center",padding:32}}>{T.noMeasFGR}</div>}
              {meas.length>0&&(
                <>
                  <div style={{...card,borderColor:sc,background:`${sc}12`,display:"flex",alignItems:"center",gap:16}}>
                    <div style={{width:52,height:52,borderRadius:"50%",background:`${sc}25`,border:`2px solid ${sc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:sc,flexShrink:0}}>{stage}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:sc}}>{si.label}</div>
                      <div style={{fontSize:12,color:C.text,marginTop:3}}>{si.desc}</div>
                    </div>
                  </div>
                  {findings.map((fd,i)=>(
                    <div key={i} style={{...card,borderColor:fd.level==="HIGH"?C.danger:fd.level==="WARN"?C.warn:C.ok,background:fd.level==="HIGH"?"#ef444412":fd.level==="WARN"?"#f59e0b12":"#10b98112"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <Badge level={fd.level} small/>
                        <span style={{fontSize:12,color:C.text}}>{fd.text}</span>
                      </div>
                    </div>
                  ))}
                  <div style={card}>
                    <div style={{fontSize:11,fontWeight:700,color:C.accent,marginBottom:8,letterSpacing:"0.05em"}}>{T.interpretTitle}</div>
                    {T.interpretLines.map((line,i)=><div key={i} style={{fontSize:11,color:C.muted,lineHeight:1.8}}>• {line}</div>)}
                    <div style={{marginTop:10,fontSize:9,color:"#2d4060",lineHeight:1.6}}>{T.refNote}<br/>{T.disclaimer}</div>
                  </div>
                </>
              )}
            </div>
          )}
          </>)}

        </div>
      </div>

      {/* New patient modal */}
      {showNewPt && (
        <div onClick={()=>setShowNewPt(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:vp.isMobile?18:24,width:"100%",maxWidth:480,maxHeight:`calc(100dvh - 32px)`,overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontSize:16,fontWeight:700,color:C.accent,letterSpacing:"0.04em"}}>{T.newPatientTitle}</div>
              <button onClick={()=>setShowNewPt(false)} aria-label="Close"
                style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>×</button>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:vp.isMobile?"1fr":"1fr 1fr",gap:10}}>
                <div>
                  <div style={lbl}>{T.firstName} *</div>
                  <input type="text" autoCapitalize="words" value={newPt.firstName} onChange={e=>setNewPt(x=>({...x,firstName:e.target.value}))} style={inp} autoFocus/>
                </div>
                <div>
                  <div style={lbl}>{T.lastName} *</div>
                  <input type="text" autoCapitalize="words" value={newPt.lastName} onChange={e=>setNewPt(x=>({...x,lastName:e.target.value}))} style={inp}/>
                </div>
              </div>
              <div>
                <div style={lbl}>{T.birthDate} *</div>
                <input type="date" value={newPt.birthDate} onChange={e=>setNewPt(x=>({...x,birthDate:e.target.value}))} style={inp}/>
              </div>
              <div>
                <div style={lbl}>{T.tcKimlik} *</div>
                <input type="text" inputMode="numeric" maxLength={11} pattern="\d{11}" value={newPt.tcKimlik}
                  onChange={e=>setNewPt(x=>({...x,tcKimlik:e.target.value.replace(/\D/g,"").slice(0,11)}))} style={inp}/>
              </div>
              <div>
                <div style={lbl}>{T.lmpDate} *</div>
                <input type="date" value={newPt.lmpDate} onChange={e=>setNewPt(x=>({...x,lmpDate:e.target.value}))} style={inp}/>
              </div>

              {newPtErr && <div style={{fontSize:11,color:C.danger,padding:"8px 10px",background:`${C.danger}15`,border:`1px solid ${C.danger}40`,borderRadius:6}}>{newPtErr}</div>}

              <div style={{display:"flex",gap:8,marginTop:8,flexDirection:vp.isMobile?"column-reverse":"row",justifyContent:"flex-end"}}>
                <button onClick={()=>setShowNewPt(false)} style={{...tb(false),padding:"10px 18px",fontSize:13}}>{T.cancel}</button>
                <button onClick={savePt} style={{background:C.accent,color:"#060d1a",border:"none",borderRadius:6,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"inherit"}}>{T.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

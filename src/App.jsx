import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── i18n (DİLLER) ────────────────────────────────────────────────────────────
const LANG = {
  TR: {
    appTitle: "FetalGrowth Tracker",
    appSub: "ISUOG PROTOKOLÜ · BİYOMETRİ · DOPPLER",
    biometry: "BİYOMETRİ ÖLÇÜMLERİ",
    doppler: "DOPPLER ÖLÇÜMLERİ",
    save: "Kaydet",
    gaWeeks: "Hafta+Gün",
    efwLabel: "Tahmini Ağırlık (EFW)",
    actionTitle: "ISUOG KLİNİK YÖNETİM REHBERİ",
  },
  // ... (Gerekirse EN eklenebilir ama TR üzerinden gidelim temiz olsun)
};

// ─── REFERANS VERİLERİ ────────────────────────────────────────────────────────
const IG21 = {
  AC: {20:{m:148,sd:11},21:{m:158,sd:12},22:{m:169,sd:12},23:{m:179,sd:13},24:{m:190,sd:14},25:{m:200,sd:14},26:{m:211,sd:15},27:{m:221,sd:16},28:{m:232,sd:16},29:{m:242,sd:17},30:{m:252,sd:18},31:{m:262,sd:18},32:{m:272,sd:19},33:{m:281,sd:20},34:{m:290,sd:20},35:{m:299,sd:21},36:{m:308,sd:22},37:{m:316,sd:22},38:{m:323,sd:23},39:{m:330,sd:24},40:{m:336,sd:24}},
  BPD: {20:{m:47.8,sd:2.4},21:{m:50.5,sd:2.5},22:{m:53.2,sd:2.6},23:{m:55.9,sd:2.7},24:{m:58.5,sd:2.8},25:{m:61.1,sd:2.9},26:{m:63.6,sd:3.0},27:{m:66.0,sd:3.1},28:{m:68.4,sd:3.2},29:{m:70.7,sd:3.3},30:{m:72.9,sd:3.4},31:{m:75.0,sd:3.5},32:{m:77.0,sd:3.6},33:{m:78.9,sd:3.7},34:{m:80.7,sd:3.8},35:{m:82.4,sd:3.9},36:{m:83.9,sd:4.0},37:{m:85.3,sd:4.1},38:{m:86.6,sd:4.2},39:{m:87.7,sd:4.3},40:{m:88.7,sd:4.4}},
  HC: {20:{m:178,sd:9},21:{m:188,sd:9},22:{m:198,sd:10},23:{m:208,sd:10},24:{m:218,sd:11},25:{m:228,sd:11},26:{m:237,sd:11},27:{m:246,sd:12},28:{m:255,sd:12},29:{m:263,sd:13},30:{m:271,sd:13},31:{m:279,sd:14},32:{m:286,sd:14},33:{m:292,sd:14},34:{m:298,sd:15},35:{m:304,sd:15},36:{m:309,sd:15},37:{m:313,sd:16},38:{m:317,sd:16},39:{m:320,sd:16},40:{m:323,sd:17}},
  FL: {20:{m:33.0,sd:2.5},21:{m:35.5,sd:2.6},22:{m:38.0,sd:2.7},23:{m:40.5,sd:2.8},24:{m:42.9,sd:2.9},25:{m:45.3,sd:3.0},26:{m:47.6,sd:3.1},27:{m:49.8,sd:3.2},28:{m:51.9,sd:3.3},29:{m:54.0,sd:3.4},30:{m:55.9,sd:3.5},31:{m:57.8,sd:3.6},32:{m:59.5,sd:3.7},33:{m:61.2,sd:3.8},34:{m:62.7,sd:3.9},35:{m:64.1,sd:4.0},36:{m:65.4,sd:4.1},37:{m:66.5,sd:4.2},38:{m:67.5,sd:4.3},39:{m:68.3,sd:4.4},40:{m:69.0,sd:4.5}},
};
const UA_PI_95 = {20:1.80,21:1.75,22:1.70,23:1.65,24:1.60,25:1.55,26:1.50,27:1.45,28:1.40,29:1.35,30:1.30,31:1.25,32:1.20,33:1.15,34:1.10,35:1.05,36:1.00,37:0.96,38:0.93,39:0.90,40:0.88};
const EFW_REF = {20:331,21:387,22:451,23:524,24:608,25:704,26:815,27:941,28:1085,29:1248,30:1431,31:1635,32:1860,33:2103,34:2362,35:2633,36:2914,37:3203,38:3496,39:3789,40:4078};

// ─── HESAPLAYICILAR ──────────────────────────────────────────────────────────
const calcEFW = (m) => {
  if (!m.BPD || !m.HC || !m.AC || !m.FL) return null;
  const bpd = m.BPD / 10, hc = m.HC / 10, ac = m.AC / 10, fl = m.FL / 10;
  const log10efw = 1.3596 - 0.00386 * ac * fl + 0.0064 * hc + 0.00061 * bpd * ac + 0.0424 * ac + 0.174 * fl;
  return Math.round(Math.pow(10, log10efw));
};
const getZ = (p, wk, v) => {
  const r = IG21[p]?.[Math.round(wk)];
  if (!r || v == null) return null;
  return parseFloat(((v - r.m) / r.sd).toFixed(2));
};
const efwZ = (efw, ga) => {
  const m = EFW_REF[Math.round(ga)];
  if (!m || efw == null) return null;
  const sd = m * 0.127;
  return parseFloat(((efw - m) / sd).toFixed(2));
};

// ─── ISUOG YÖNETİM FONKSİYONU ─────────────────────────────────────────────────
function getISUOGManagement(m) {
  if (!m.ga || !m.AC) return { alert: false, message: "Veri bekleniyor", action: "Lütfen ölçümleri girin." };
  
  const efw = calcEFW(m);
  const acZ = getZ("AC", m.ga, m.AC);
  const ez = efwZ(efw, m.ga);
  
  // %10 persantil altı mı?
  const isSGA = (acZ !== null && acZ < -1.28) || (ez !== null && ez < -1.28);

  if (isSGA && (!m.UA_PI || m.UA_PI === "")) {
    return { alert: true, color: "#f59e0b", stage: "DOPPLER GEREKLİ", message: "Biyometri < 10. persantil tespit edildi.", action: "ISUOG rehberine göre bu hastada Doppler ölçümleri zorunludur." };
  }

  const wk = Math.round(m.ga);
  const ua95 = UA_PI_95[wk];
  const cpr = (m.MCA_PI && m.UA_PI) ? (m.MCA_PI / m.UA_PI) : null;

  if (m.UA_EDF === 2 || (m.DV_PIV && m.DV_PIV > 1.0)) return { alert: true, color: "#dc2626", stage: "EVRE 3/4", message: "Kritik FGR!", action: "Acil hastaneye yatış ve doğum planı gereklidir." };
  if (m.UA_EDF === 1) return { alert: true, color: "#ef4444", stage: "EVRE 2", message: "Ciddi FGR.", action: "32-34. haftalarda doğum düşünülmelidir." };
  
  if (isSGA) {
    if (m.UA_PI > ua95 || (cpr && cpr < 1.0)) return { alert: true, color: "#f97316", stage: "EVRE 1 FGR", message: "FGR Onaylandı.", action: "Haftalık takip önerilir. 37+0 haftada doğum planla." };
    return { alert: false, color: "#10b981", stage: "SGA", message: "Konstitüsyonel Küçük Bebek.", action: "Doppler normal. 2 hafta sonra büyüme kontrolü yeterli." };
  }

  return { alert: false, color: "#3b82f6", stage: "NORMAL", message: "Gelişim Normal.", action: "Rutin antenatal takibe devam edilebilir." };
}

// ─── ANA UYGULAMA ────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState({ ga: 30, BPD: "", HC: "", AC: "", FL: "", UA_PI: "", MCA_PI: "", UA_EDF: 0, DV_PIV: "" });
  const management = useMemo(() => getISUOGManagement(form), [form]);
  const efw = useMemo(() => calcEFW(form), [form]);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", maxWidth: "800px", margin: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <h2>FetalGrowth Tracker <span style={{fontSize:"14px", color:"#64748b"}}>ISUOG Edition</span></h2>

      {/* KLİNİK YÖNETİM PANELİ (SENİN İSTEDİĞİN UYARI KUTUSU) */}
      <div style={{ padding: "20px", borderRadius: "12px", background: "#fff", borderLeft: `6px solid ${management.color}`, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: management.color }}>{management.stage}: {management.message}</h3>
        <p style={{ margin: "10px 0", fontWeight: "bold" }}>👉 Öneri: {management.action}</p>
        {efw && <p style={{fontSize:"13px", margin:0}}>Tahmini Ağırlık: <b>{efw} gram</b></p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* BİYOMETRİ FORMU */}
        <div style={{ background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h4>📏 Biyometri</h4>
          <label style={{fontSize:"12px"}}>Hafta (örn: 32)</label>
          <input type="number" value={form.ga} onChange={e => f("ga", parseFloat(e.target.value))} style={sInp} />
          <input placeholder="BPD (mm)" type="number" onChange={e => f("BPD", e.target.value)} style={sInp} />
          <input placeholder="HC (mm)" type="number" onChange={e => f("HC", e.target.value)} style={sInp} />
          <input placeholder="AC (mm)" type="number" onChange={e => f("AC", e.target.value)} style={sInp} />
          <input placeholder="FL (mm)" type="number" onChange={e => f("FL", e.target.value)} style={sInp} />
        </div>

        {/* DOPPLER FORMU */}
        <div style={{ background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", opacity: management.stage === "DOPPLER GEREKLİ" ? 1 : 0.7 }}>
          <h4>🔴 Doppler</h4>
          <input placeholder="UA PI" type="number" onChange={e => f("UA_PI", e.target.value)} style={sInp} />
          <input placeholder="MCA PI" type="number" onChange={e => f("MCA_PI", e.target.value)} style={sInp} />
          <select onChange={e => f("UA_EDF", parseInt(e.target.value))} style={sInp}>
            <option value={0}>Normal Akım</option>
            <option value={1}>AEDF (Akım Yok)</option>
            <option value={2}>REDF (Ters Akım)</option>
          </select>
          <input placeholder="Duktus Venozus PIV" type="number" onChange={e => f("DV_PIV", e.target.value)} style={sInp} />
        </div>
      </div>
      
      <p style={{textAlign:"center", fontSize:"11px", marginTop:"20px", color:"#94a3b8"}}>Bu uygulama yalnızca eğitim amaçlı klinik karar desteği sağlar.</p>
    </div>
  );
}

const sInp = { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #e2e8f0", boxSizing: "border-box" };

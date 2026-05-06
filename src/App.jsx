import React, { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── ISUOG & INTERGROWTH-21 REFERANSLARI ──────────────────────────────────────────
const IG21 = {
  BPD: {20:{m:47.8,sd:2.4},21:{m:50.5,sd:2.5},22:{m:53.2,sd:2.6},23:{m:55.9,sd:2.7},24:{m:58.5,sd:2.8},25:{m:61.1,sd:2.9},26:{m:63.6,sd:3.0},27:{m:66.0,sd:3.1},28:{m:68.4,sd:3.2},29:{m:70.7,sd:3.3},30:{m:72.9,sd:3.4},31:{m:75.0,sd:3.5},32:{m:77.0,sd:3.6},33:{m:78.9,sd:3.7},34:{m:80.7,sd:3.8},35:{m:82.4,sd:3.9},36:{m:83.9,sd:4.0},37:{m:85.3,sd:4.1},38:{m:86.6,sd:4.2},39:{m:87.7,sd:4.3},40:{m:88.7,sd:4.4}},
  HC:  {20:{m:178,sd:9},21:{m:188,sd:9},22:{m:198,sd:10},23:{m:208,sd:10},24:{m:218,sd:11},25:{m:228,sd:11},26:{m:237,sd:11},27:{m:246,sd:12},28:{m:255,sd:12},29:{m:263,sd:13},30:{m:271,sd:13},31:{m:279,sd:14},32:{m:286,sd:14},33:{m:292,sd:14},34:{m:298,sd:15},35:{m:304,sd:15},36:{m:309,sd:15},37:{m:313,sd:16},38:{m:317,sd:16},39:{m:320,sd:16},40:{m:323,sd:17}},
  AC:  {20:{m:148,sd:11},21:{m:158,sd:12},22:{m:169,sd:12},23:{m:179,sd:13},24:{m:190,sd:14},25:{m:200,sd:14},26:{m:211,sd:15},27:{m:221,sd:16},28:{m:232,sd:16},29:{m:242,sd:17},30:{m:252,sd:18},31:{m:262,sd:18},32:{m:272,sd:19},33:{m:281,sd:20},34:{m:290,sd:20},35:{m:299,sd:21},36:{m:308,sd:22},37:{m:316,sd:22},38:{m:323,sd:23},39:{m:330,sd:24},40:{m:336,sd:24}},
  FL:  {20:{m:33.0,sd:2.5},21:{m:35.5,sd:2.6},22:{m:38.0,sd:2.7},23:{m:40.5,sd:2.8},24:{m:42.9,sd:2.9},25:{m:45.3,sd:3.0},26:{m:47.6,sd:3.1},27:{m:49.8,sd:3.2},28:{m:51.9,sd:3.3},29:{m:54.0,sd:3.4},30:{m:55.9,sd:3.5},31:{m:57.8,sd:3.6},32:{m:59.5,sd:3.7},33:{m:61.2,sd:3.8},34:{m:62.7,sd:3.9},35:{m:64.1,sd:4.0},36:{m:65.4,sd:4.1},37:{m:66.5,sd:4.2},38:{m:67.5,sd:4.3},39:{m:68.3,sd:4.4},40:{m:69.0,sd:4.5}},
};

const UA_PI_95 = {20:1.80,21:1.75,22:1.70,23:1.65,24:1.60,25:1.55,26:1.50,27:1.45,28:1.40,29:1.35,30:1.30,31:1.25,32:1.20,33:1.15,34:1.10,35:1.05,36:1.00,37:0.96,38:0.93,39:0.90,40:0.88};
const MCA_PI_REF = {20:{m:2.10,p5:1.55},21:{m:2.15,p5:1.58},22:{m:2.20,p5:1.62},23:{m:2.25,p5:1.66},24:{m:2.28,p5:1.68},25:{m:2.30,p5:1.70},26:{m:2.32,p5:1.72},27:{m:2.35,p5:1.73},28:{m:2.38,p5:1.74},29:{m:2.40,p5:1.75},30:{m:2.42,p5:1.76},31:{m:2.44,p5:1.77},32:{m:2.45,p5:1.76},33:{m:2.43,p5:1.73},34:{m:2.38,p5:1.69},35:{m:2.30,p5:1.62},36:{m:2.18,p5:1.52},37:{m:2.05,p5:1.40},38:{m:1.90,p5:1.28},39:{m:1.75,p5:1.15},40:{m:1.60,p5:1.02}};
const EFW_REF = {20:331,21:387,22:451,23:524,24:608,25:704,26:815,27:941,28:1085,29:1248,30:1431,31:1635,32:1860,33:2103,34:2362,35:2633,36:2914,37:3203,38:3496,39:3789,40:4078};

// ─── YARDIMCI FONKSİYONLAR ──────────────────────────────────────────────────
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

// ─── ISUOG YÖNETİM ALGORİTMASI ────────────────────────────────────────────────
function getISUOGStatus(m, measurements = []) {
  if (!m.ga) return { level: "INFO", message: "Veri bekleniyor...", action: "Lütfen ölçümleri girin." };
  
  const efw = calcEFW(m);
  const acZ = getZ("AC", m.ga, m.AC);
  const ez = efwZ(efw, m.ga);
  
  const isSGA = (acZ !== null && acZ < -1.28) || (ez !== null && ez < -1.28); // < 10. persantil
  const isVeryLow = (acZ !== null && acZ < -1.88) || (ez !== null && ez < -1.88); // < 3. persantil
  
  // Doppler gerekli mi?
  if (isSGA && !m.UA_PI) {
    return { 
      level: "DOPPLER_REQ", 
      message: "⚠️ Biyometri < 10. Persantil (SGA Şüphesi)", 
      action: "ISUOG protokolü gereği Doppler ölçümü (UA PI, MCA PI) zorunludur." 
    };
  }

  const wk = Math.round(m.ga);
  const ua95 = UA_PI_95[wk];
  const mcaRef = MCA_PI_REF[wk];
  const cpr = (m.MCA_PI && m.UA_PI) ? m.MCA_PI / m.UA_PI : null;

  // KRİTİK DURUMLAR (EVRE 3-4)
  if (m.UA_EDF === 2 || (m.DV_PIV && m.DV_PIV > 1.0)) {
    return { level: "CRITICAL", message: "Kritik FGR (Evre 3/4)", action: "Acil hastaneye yatış. Steroid ve magnezyum sonrası acil doğum düşünülmelidir." };
  }
  
  if (m.UA_EDF === 1) {
    return { level: "DANGER", message: "Ciddi FGR (Evre 2)", action: "Günde bir Doppler takibi. 32. haftadan sonra doğum planlanmalıdır." };
  }

  // FGR TANI KRİTERLERİ (EVRE 1)
  const isFGR = isVeryLow || (m.UA_PI > ua95) || (cpr && cpr < 1.0);

  if (isFGR) {
    return { 
      level: "WARN", 
      message: "FGR Tespit Edildi (Evre 1)", 
      action: wk >= 37 ? "37+0 haftada doğum planla." : "Haftalık Doppler ve NST takibi. 37. haftada doğum." 
    };
  }

  if (isSGA) {
    return { level: "OK", message: "İzole SGA (Konstitüsyonel Küçük)", action: "Biyometri normal, Doppler normal. 2 hafta sonra büyüme takibi yeterlidir." };
  }

  return { level: "INFO", message: "Normal Gelişim", action: "Rutin antenatal takip." };
}

// ─── ANA UYGULAMA BİLEŞENİ ──────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), ga: 30, BPD: "", HC: "", AC: "", FL: "", UA_PI: "", MCA_PI: "", UA_EDF: 0, DV_PIV: "" });
  const [theme, setTheme] = useState("light");
  
  const status = useMemo(() => getISUOGStatus(form), [form]);
  const efw = useMemo(() => calcEFW(form), [form]);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const colors = {
    DOPPLER_REQ: "#f59e0b",
    CRITICAL: "#dc2626",
    DANGER: "#ef4444",
    WARN: "#f97316",
    OK: "#10b981",
    INFO: "#3b82f6"
  };

  return (
    <div style={{ 
      fontFamily: "sans-serif", padding: "20px", maxWidth: "900px", margin: "0 auto", 
      background: theme === "dark" ? "#0f172a" : "#f8fafc", color: theme === "dark" ? "#f8fafc" : "#0f172a",
      minHeight: "100vh", transition: "all 0.3s"
    }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>FetalGrowth <span style={{ color: "#3b82f6" }}>ISUOG</span></h1>
          <p style={{ fontSize: "12px", opacity: 0.7 }}>FGR TAKİP VE DOĞUM YÖNETİM SİSTEMİ</p>
        </div>
        <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} style={{ padding: "8px 12px", cursor: "pointer" }}>
          {theme === "light" ? "🌙 Karanlık" : "☀️ Aydınlık"}
        </button>
      </header>

      {/* KARAR DESTEK PANELİ */}
      <div style={{ 
        padding: "20px", borderRadius: "12px", backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
        borderLeft: `6px solid ${colors[status.level]}`, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", marginBottom: "20px"
      }}>
        <h3 style={{ margin: "0 0 5px 0", color: colors[status.level] }}>{status.message}</h3>
        <p style={{ margin: "5px 0", fontSize: "14px", fontWeight: "600" }}>👉 {status.action}</p>
        {efw && <div style={{ marginTop: "10px", fontSize: "13px" }}>Tahmini Fetal Ağırlık: <b>{efw} gr</b></div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* BİYOMETRİ GİRİŞİ */}
        <section style={{ padding: "15px", background: theme === "dark" ? "#1e293b" : "#fff", borderRadius: "10px" }}>
          <h4 style={{ marginTop: 0 }}>📏 Biyometri (mm)</h4>
          <div style={{ display: "grid", gap: "10px" }}>
            <label style={lbl}>Hafta + Gün (Ondalık örn: 30.4)</label>
            <input type="number" value={form.ga} onChange={e => f("ga", parseFloat(e.target.value))} style={inp} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input placeholder="BPD" type="number" onChange={e => f("BPD", e.target.value)} style={inp} />
              <input placeholder="HC" type="number" onChange={e => f("HC", e.target.value)} style={inp} />
              <input placeholder="AC" type="number" onChange={e => f("AC", e.target.value)} style={inp} />
              <input placeholder="FL" type="number" onChange={e => f("FL", e.target.value)} style={inp} />
            </div>
          </div>
        </section>

        {/* DOPPLER GİRİŞİ (KOŞULLU GÖRÜNÜM HİSSİYATI) */}
        <section style={{ 
          padding: "15px", background: theme === "dark" ? "#1e293b" : "#fff", borderRadius: "10px",
          opacity: status.level === "DOPPLER_REQ" || status.level === "WARN" || status.level === "DANGER" || status.level === "CRITICAL" ? 1 : 0.4,
          border: status.level === "DOPPLER_REQ" ? "2px solid #f59e0b" : "none"
        }}>
          <h4 style={{ marginTop: 0 }}>🔴 Doppler Ölçümleri</h4>
          <div style={{ display: "grid", gap: "10px" }}>
            <input placeholder="Umblikal Arter PI" type="number" value={form.UA_PI} onChange={e => f("UA_PI", e.target.value)} style={inp} />
            <input placeholder="MCA PI" type="number" value={form.MCA_PI} onChange={e => f("MCA_PI", e.target.value)} style={inp} />
            <select value={form.UA_EDF} onChange={e => f("UA_EDF", parseInt(e.target.value))} style={inp}>
              <option value={0}>Normal Akım (EDF+)</option>
              <option value={1}>Kayıp Akım (AEDF)</option>
              <option value={2}>Ters Akım (REDF)</option>
            </select>
            <input placeholder="Duktus Venozus PIV" type="number" value={form.DV_PIV} onChange={e => f("DV_PIV", e.target.value)} style={inp} />
          </div>
        </section>
      </div>

      <footer style={{ marginTop: "30px", fontSize: "11px", textAlign: "center", opacity: 0.5 }}>
        Referanslar: ISUOG Fetal Büyüme Kısıtlılığı Rehberi & INTERGROWTH-21st.
      </footer>
    </div>
  );
}

// Basit stil objeleri
const inp = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  width: "100%",
  boxSizing: "border-box",
  fontSize: "14px"
};

const lbl = {
  fontSize: "12px",
  fontWeight: "bold",
  marginBottom: "2px",
  display: "block"
};
}

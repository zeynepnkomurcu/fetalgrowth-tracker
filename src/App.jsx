// ─────────────────────────────────────────────────────────
// ISUOG FGR DECISION MODULE (single-file version)
// ─────────────────────────────────────────────────────────

// CPR 5th percentile (approximate)
const CPR_P5 = {
  24:1.10,25:1.08,26:1.07,27:1.06,28:1.05,
  29:1.04,30:1.03,31:1.02,32:1.01,
  33:1.00,34:0.98,35:0.96,36:0.94,
  37:0.92,38:0.90,39:0.88,40:0.85
};

function getCPR5th(wk){
  return CPR_P5[Math.round(wk)] || 1.0;
}

// Normal distribution CDF
function normCDF(z){
  const t = 1/(1+0.2316419*Math.abs(z));
  const d = 0.3989423*Math.exp(-z*z/2);
  const p = d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  return z>=0 ? 1-p : p;
}

function getPct(z){
  return Math.round(normCDF(z)*100);
}

// Z-score (INTERGROWTH required externally)
export function getZ(param, wk, value, IG21){
  const ref = IG21[param]?.[Math.round(wk)];
  if(!ref || value==null) return null;
  return (value - ref.m)/ref.sd;
}

// EFW (Hadlock)
export function calcEFW(m){
  if(!m.HC || !m.AC || !m.FL) return null;
  return Math.exp(
    1.3596 +
    0.0064*m.HC +
    0.0424*m.AC +
    0.174*m.FL -
    0.00386*m.AC*m.FL
  ) * 10;
}

// CPR
export function calcCPR(m){
  if(!m.MCA_PI || !m.UA_PI) return null;
  return m.MCA_PI / m.UA_PI;
}

// Growth deceleration
function checkGrowthDrop(history, IG21){
  if(!history || history.length < 2) return false;

  const last = history[history.length-1];
  const prev = history[history.length-2];

  const z1 = getZ("AC", prev.ga, prev.AC, IG21);
  const z2 = getZ("AC", last.ga, last.AC, IG21);

  if(z1!=null && z2!=null){
    return (z1 - z2) > 1.0;
  }
  return false;
}

// Doppler trigger
export function shouldOpenDoppler(meas, history, IG21, estimateEFWPercentile){

  const acZ = getZ("AC", meas.ga, meas.AC, IG21);
  const acPct = acZ!=null ? getPct(acZ) : null;

  const efw = calcEFW(meas);
  const efwPct = estimateEFWPercentile ? estimateEFWPercentile(efw, meas.ga) : null;

  const growthDrop = checkGrowthDrop(history, IG21);

  if(acPct!=null && acPct < 10) return true;
  if(efwPct!=null && efwPct < 10) return true;
  if(growthDrop) return true;

  return false;
}

// MAIN DECISION ENGINE
export function getISUOGDecision(meas, history, IG21, UA_PI_95, estimateEFWPercentile){

  const wk = Math.round(meas.ga);

  const acZ = getZ("AC", wk, meas.AC, IG21);
  const acPct = acZ!=null ? getPct(acZ) : null;

  const efw = calcEFW(meas);
  const efwPct = estimateEFWPercentile ? estimateEFWPercentile(efw, wk) : null;

  const small = (acPct<10 || efwPct<10);
  const severeSmall = (acPct<3 || efwPct<3);

  const uaAbn = meas.UA_PI && UA_PI_95[wk] && meas.UA_PI > UA_PI_95[wk];

  const cpr = calcCPR(meas);
  const cprAbn = cpr!=null && cpr < getCPR5th(wk);

  const growthDrop = checkGrowthDrop(history, IG21);

  const early = wk < 32;

  // CRITICAL
  if(meas.UA_EDF === 2){
    return {
      level: "CRITICAL",
      color: "#ef4444",
      title: "Reversed end-diastolic flow",
      message: "Severe placental insufficiency suspected.",
      plan: "Urgent specialist evaluation is recommended."
    };
  }

  if(meas.UA_EDF === 1){
    return {
      level: "SEVERE",
      color: "#f97316",
      title: "Absent end-diastolic flow",
      message: "Marked placental resistance.",
      plan: "Immediate clinical evaluation is recommended."
    };
  }

  // EARLY FGR
  if(early){

    if(severeSmall){
      return {
        level: "EARLY_FGR",
        color: "#ef4444",
        title: "Severely small fetus",
        message: "< 3rd percentile",
        plan: "Specialist referral should be considered."
      };
    }

    if(small && uaAbn){
      return {
        level: "EARLY_FGR",
        color: "#f97316",
        title: "Early FGR suspected",
        message: "Small fetus with abnormal UA Doppler",
        plan: "Close surveillance is recommended."
      };
    }
  }

  // LATE FGR
  if(!early){

    if(severeSmall){
      return {
        level: "LATE_FGR",
        color: "#ef4444",
        title: "FGR likely",
        message: "< 3rd percentile",
        plan: "Monitoring and evaluation recommended."
      };
    }

    let criteria = 0;
    if(uaAbn) criteria++;
    if(cprAbn) criteria++;
    if(growthDrop) criteria++;

    if(small && criteria >= 2){
      return {
        level: "LATE_FGR",
        color: "#f97316",
        title: "FGR suspected",
        message: "Additional Doppler/growth abnormalities present",
        plan: "Closer follow-up is recommended."
      };
    }

    if(small){
      return {
        level: "SGA",
        color: "#eab308",
        title: "Small for gestational age",
        message: "No Doppler abnormality detected",
        plan: "Serial growth follow-up is recommended."
      };
    }
  }

  // NORMAL
  return {
    level: "NORMAL",
    color: "#10b981",
    title: "Normal growth",
    message: "Within expected limits",
    plan: "Routine follow-up."
  };
}

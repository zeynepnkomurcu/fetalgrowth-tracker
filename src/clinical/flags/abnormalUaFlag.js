export function abnormalUaFlag(uaPi) {

  if (!uaPi) {
    return {
      active: false,
      severity: "low",
      message: "UA PI unavailable"
    }
  }

  if (uaPi > 1.4) {
    return {
      active: true,
      severity: "high",
      message: "Elevated umbilical artery Doppler resistance detected",
      evidence: `UA PI ${uaPi}`
    }
  }

  return {
    active: false,
    severity: "low",
    message: "UA Doppler within expected range"
  }
}

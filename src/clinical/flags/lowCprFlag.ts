export interface ClinicalFlag {
  active: boolean
  severity: "low" | "moderate" | "high" | "critical"
  message: string
  evidence?: string
}

export function lowCprFlag(
  cpr?: number
): ClinicalFlag {

  if (!cpr) {
    return {
      active: false,
      severity: "low",
      message: "CPR unavailable"
    }
  }

  if (cpr < 1.08) {
    return {
      active: true,
      severity: "high",
      message: "Low cerebroplacental ratio detected",
      evidence: `CPR ${cpr}`
    }
  }

  return {
    active: false,
    severity: "low",
    message: "CPR within expected range"
  }
}
export function calculateCPR(
  mcaPi?: number,
  uaPi?: number
): number | null {

  if (!mcaPi || !uaPi) {
    return null
  }

  if (uaPi === 0) {
    return null
  }

  const cpr = mcaPi / uaPi

  return Number(cpr.toFixed(2))
}
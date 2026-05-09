export function calculateCpr(
  mcaPi,
  uaPi
) {

  if (!mcaPi || !uaPi) {
    return null
  }

  return (
    Number(mcaPi) /
    Number(uaPi)
  ).toFixed(2)
}
export function detectCprTrend(
  visits
) {

  if (!visits || visits.length < 2) {
    return null
  }

  const lastVisit =
    visits[visits.length - 1]

  const previousVisit =
    visits[visits.length - 2]

  const lastCpr =
    Number(
      lastVisit.calculations?.cpr
    )

  const previousCpr =
    Number(
      previousVisit.calculations?.cpr
    )

  if (
    !lastCpr ||
    !previousCpr
  ) {
    return null
  }

  if (lastCpr < previousCpr) {

    return {
      worsening: true,

      message:
        "CPR deterioration detected"
    }
  }

  return {
    worsening: false,

    message:
      "Stable CPR trend"
  }
}
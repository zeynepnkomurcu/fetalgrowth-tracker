export function detectGrowthVelocity(
  visits
) {
  if (!visits || visits.length < 2) {
    return null;
  }

  const sortedVisits = [...visits].sort(
    (a, b) =>
      new Date(a.date) -
      new Date(b.date)
  );

  const previous =
    sortedVisits[sortedVisits.length - 2];

  const current =
    sortedVisits[sortedVisits.length - 1];

  const previousAc =
    previous.rawData?.ac;

  const currentAc =
    current.rawData?.ac;

  if (!previousAc || !currentAc) {
    return null;
  }

  const acGrowth =
    currentAc - previousAc;

  if (acGrowth < 10) {
    return {
      slowing: true,
      message:
        "Reduced AC growth velocity detected"
    };
  }

  return {
    slowing: false,
    message:
      "Normal interval growth"
  };
}
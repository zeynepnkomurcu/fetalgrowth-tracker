export function detectStage(visit) {

  const ac =
    visit.rawData?.ac || 0;

  const efw =
    visit.calculations?.efw || 0;

  const uaPi =
    visit.rawData?.uaPi || 0;

  const mcaPi =
    visit.rawData?.mcaPi || 0;

  if (
    ac < 140 ||
    efw < 1200
  ) {
    return {
      stage: "Severe FGR",
      color: "red",
    };
  }

  if (
    uaPi > 1.5 &&
    mcaPi < 1.2
  ) {
    return {
      stage: "Stage 2",
      color: "orange",
    };
  }

  if (
    ac < 180 ||
    efw < 2000
  ) {
    return {
      stage: "Stage 1",
      color: "yellow",
    };
  }

  return {
    stage: "Low Risk",
    color: "green",
  };
}
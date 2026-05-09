import { calculateAcPercentile }
  from "../calculateAcPercentile";

export function detectAcTrend(visits) {

  if (visits.length < 2) {
    return null;
  }

  const sorted = [...visits].sort(
    (a, b) =>
      a.gaWeeks - b.gaWeeks
  );

  const previous =
    sorted[sorted.length - 2];

  const current =
    sorted[sorted.length - 1];

  const prevPercentile =
    calculateAcPercentile(
      previous.gaWeeks,
      previous.rawData.ac
    );

  const currentPercentile =
    calculateAcPercentile(
      current.gaWeeks,
      current.rawData.ac
    );

  const drop =
    prevPercentile -
    currentPercentile;

  return {
    prevPercentile,
    currentPercentile,
    drop,
    concerning: drop >= 20,
  };
}
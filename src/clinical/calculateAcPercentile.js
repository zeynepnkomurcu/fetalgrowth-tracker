const acReference = {
  24: { p3: 160, p10: 190, p50: 240, p90: 300, p97: 340 },
  28: { p3: 220, p10: 260, p50: 320, p90: 400, p97: 460 },
  32: { p3: 320, p10: 380, p50: 480, p90: 620, p97: 720 },
  36: { p3: 450, p10: 520, p50: 680, p90: 880, p97: 980 },
  40: { p3: 520, p10: 620, p50: 820, p90: 1040, p97: 1180 },
};

export function calculateAcPercentile(
  gaWeeks,
  ac
) {

  const ref =
    acReference[gaWeeks];

  if (!ref || !ac) {
    return null;
  }

  if (ac < ref.p3) return 3;
  if (ac < ref.p10) return 10;
  if (ac < ref.p50) return 50;
  if (ac < ref.p90) return 90;

  return 97;
}
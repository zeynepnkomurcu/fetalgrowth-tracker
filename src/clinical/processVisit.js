import { calculateCpr }
  from "./calculations/calculateCpr";

import { abnormalUaFlag }
  from "./flags/abnormalUaFlag"

import { lowCprFlag } from "./flags/lowCprFlag"

import { determineFgrStage } from "./staging/fgrStage"

import { generateRecommendations } from "./recommendations/fgrRecommendations"

export function processVisit(
  visit
) {

  // CPR calculation
const cpr = calculateCpr(
  visit.rawData.mcaPi,
  visit.rawData.uaPi
)

  // CPR flag
  const lowCpr = lowCprFlag(cpr || undefined)

  const abnormalUa =
  abnormalUaFlag(
    visit.rawData.uaPi
  )

  // Stage determination
const stage = determineFgrStage({
  lowCPR: lowCpr,
  abnormalUA: abnormalUa
})

  // Recommendations
  const recommendations =
    generateRecommendations(stage)

  return {
    ...visit,

    calculations: {
      ...visit.calculations,

      cpr: cpr || undefined
    },

flags: {
  ...visit.flags,

  lowCPR: lowCpr.active,
  abnormalUA: abnormalUa.active
},

    stage: {
      level: stage.level,
      label: stage.label
    },

    recommendations:
      recommendations.map(r => r.message)
  }
}
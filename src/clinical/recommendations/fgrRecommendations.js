export function generateRecommendations(stage) {

  const recommendations = []

  if (stage.level === 0) {
    recommendations.push({
      level: "info",
      message: "Routine interval growth surveillance recommended"
    })
  }

  if (stage.level === 1) {
    recommendations.push({
      level: "important",
      message: "Weekly Doppler surveillance should be considered"
    })
  }

  if (stage.level === 2) {
    recommendations.push({
      level: "important",
      message: "Twice weekly fetal surveillance may be warranted"
    })
  }

  if (stage.level === 3) {
    recommendations.push({
      level: "critical",
      message: "Inpatient maternal-fetal medicine evaluation should be considered"
    })
  }

  if (stage.level === 4) {
    recommendations.push({
      level: "critical",
      message: "Urgent fetal assessment recommended due to advanced Doppler deterioration"
    })
  }

  return recommendations
}

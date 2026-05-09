import { ClinicalFlag } from "../flags/lowCprFlag"

interface StageInput {
  lowCPR?: ClinicalFlag
  abnormalUA?: ClinicalFlag
  aedf?: ClinicalFlag
  redf?: ClinicalFlag
}

export interface FgrStage {
  level: number
  label: string
  description: string
}

export function determineFgrStage(
  input: StageInput
): FgrStage {

  if (input.redf?.active) {
    return {
      level: 4,
      label: "Stage 4",
      description: "Critical fetal compromise pattern"
    }
  }

  if (input.aedf?.active) {
    return {
      level: 3,
      label: "Stage 3",
      description: "Advanced placental insufficiency"
    }
  }

  if (
    input.abnormalUA?.active &&
    input.lowCPR?.active
  ) {
    return {
      level: 2,
      label: "Stage 2",
      description: "Significant Doppler deterioration"
    }
  }

  if (
    input.lowCPR?.active ||
    input.abnormalUA?.active
  ) {
    return {
      level: 1,
      label: "Stage 1",
      description: "Mild fetal growth restriction pattern"
    }
  }

  return {
    level: 0,
    label: "Stage 0",
    description: "No major Doppler deterioration detected"
  }
}
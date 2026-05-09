export interface Visit {
  id: string

  date: string

  gaWeeks: number
  gaDays: number

  rawData: {
    bpd?: number
    hc?: number
    ac?: number
    fl?: number

    uaPi?: number
    mcaPi?: number
    dvPiv?: number

    edfState?: "normal" | "absent" | "reversed"

    afi?: number
  }

  calculations: {
    efw?: number

    efwPercentile?: number
    acPercentile?: number

    cpr?: number
    cprPercentile?: number
  }

  flags: {
    lowEFW?: boolean
    severeLowEFW?: boolean

    abnormalUA?: boolean
    aedf?: boolean
    redf?: boolean

    lowCPR?: boolean

    abnormalDV?: boolean
  }

  stage: {
    level?: number
    label?: string
  }

  recommendations: string[]
}
export const STATUS_SINGLE = "single"
export const STATUS_JOINT = "joint"

const STATUS_SINGLE_MAX = 250000
const STATUS_JOINT_MAX = 500000

export function calculateCurrentTax({
  income,
  status,
  older65,
  spouseOlder65,
  legallyBlind,
  spouseLegallyBlind,
  numDependents,
  numDependentsUnder17,
  propertyTaxes,
  k12Expenses,
}) {
  const CURRENT_TAX_RATE = 0.0495

  const totalExemptions = calculateExemptions({
    income,
    status,
    older65,
    spouseOlder65,
    legallyBlind,
    spouseLegallyBlind,
    numDependents,
  })
  const taxableIncome = income - totalExemptions

  const taxAmount = taxableIncome * CURRENT_TAX_RATE

  const totalCredits = calculateCurrentCredits({
    income,
    status,
    numDependentsUnder17,
    propertyTaxes,
    k12Expenses,
  })

  const eic = calculateEIC({ income, status, numDependentsUnder17 })

  // EIC can reduce tax bill below 0
  return Math.max(0, taxAmount - totalCredits) - eic
}

// https://www.ilga.gov/legislation/BillStatus.asp?DocNum=687&GAID=15&DocTypeID=SB&LegId=116624&SessionID=108&GA=101
export function calculateFairTax({
  income,
  status,
  older65,
  spouseOlder65,
  legallyBlind,
  spouseLegallyBlind,
  numDependents,
  numDependentsUnder17,
  propertyTaxes,
  k12Expenses,
}) {
  const SINGLE_FILE_RATES = [
    {
      rate: 0.0475,
      gt: 0,
      lte: 10000,
    },
    { rate: 0.049, gt: 10000, lte: 100000 },
    { rate: 0.0495, gt: 100000, lte: 250000 },
    { rate: 0.0775, gt: 250000, lte: 350000 },
    { rate: 0.0785, gt: 350000, lte: 750000 },
  ]

  const SINGLE_FILE_TOP_RATE = 0.0799

  const JOINT_FILE_RATES = [
    {
      rate: 0.0475,
      gt: 0,
      lte: 10000,
    },
    {
      rate: 0.049,
      gt: 10000,
      lte: 100000,
    },
    {
      rate: 0.0495,
      gt: 100000,
      lte: 250000,
    },
    {
      rate: 0.0775,
      gt: 250000,
      lte: 500000,
    },
    {
      rate: 0.0785,
      gt: 500000,
      lte: 1000000,
    },
  ]

  const JOINT_FILE_TOP_RATE = 0.0799

  const totalExemptions = calculateExemptions({
    income,
    status,
    older65,
    spouseOlder65,
    legallyBlind,
    spouseLegallyBlind,
    numDependents,
  })
  const taxableIncome = income - totalExemptions

  const taxAmount = calculateGraduatedTax({
    income: taxableIncome,
    rates: status === STATUS_SINGLE ? SINGLE_FILE_RATES : JOINT_FILE_RATES,
    maxRate:
      status === STATUS_SINGLE ? SINGLE_FILE_TOP_RATE : JOINT_FILE_TOP_RATE,
  })

  const totalCredits = calculateFairTaxCredits({
    income,
    status,
    numDependentsUnder17,
    propertyTaxes,
    k12Expenses,
  })

  const eic = calculateEIC({ income, status, numDependentsUnder17 })

  // EIC can reduce tax bill below 0
  return Math.max(0, taxAmount - totalCredits) - eic
}

function calculateExemptions({
  income,
  status,
  older65,
  spouseOlder65,
  legallyBlind,
  spouseLegallyBlind,
  numDependents,
}) {
  const SINGLE_FILE_EXEMPT = 2225
  const JOINT_FILE_EXEMPT = 4450
  const DEPENDENT_EXEMPT = 2225

  const EXEMPTION_OLDER_65 = 1000
  const EXEMPTION_SPOUSE_OLDER_65 = 1000

  const EXEMPTION_BLIND = 1000
  const EXEMPTION_SPOUSE_BLIND = 1000

  // Filers over the status thresholds are ineligible for exemptions
  if (
    (status === STATUS_SINGLE && income >= STATUS_SINGLE_MAX) ||
    (status === STATUS_JOINT && income >= STATUS_JOINT_MAX)
  ) {
    return 0
  }

  const exemptions = [
    status === STATUS_SINGLE ? SINGLE_FILE_EXEMPT : JOINT_FILE_EXEMPT,
    older65 ? EXEMPTION_OLDER_65 : 0,
    legallyBlind ? EXEMPTION_BLIND : 0,
    numDependents * DEPENDENT_EXEMPT,
  ]
  const jointExemptions = [
    spouseOlder65 ? EXEMPTION_SPOUSE_OLDER_65 : 0,
    spouseLegallyBlind ? EXEMPTION_SPOUSE_BLIND : 0,
  ]

  const eligibleExemptions = exemptions.concat(
    status === STATUS_JOINT ? jointExemptions : []
  )

  const exemptionTotal = eligibleExemptions.reduce((a, b) => a + b, 0)

  return exemptionTotal
}

function calculateCurrentCredits({
  income,
  status,
  propertyTaxes,
  k12Expenses,
}) {
  const propertyTaxCredits = calculatePropertyTaxCredit({
    income,
    status,
    propertyTaxes,
    isFairTax: false,
  })
  const k12Credits = calculateEducationCredit({ income, status, k12Expenses })

  return propertyTaxCredits + k12Credits
}

function calculateFairTaxCredits({
  income,
  status,
  numDependentsUnder17,
  propertyTaxes,
  k12Expenses,
}) {
  const propertyTaxCredits = calculatePropertyTaxCredit({
    income,
    status,
    propertyTaxes,
    isFairTax: true,
  })
  const k12Credits = calculateEducationCredit({ income, status, k12Expenses })

  const childCredits = calculateFairTaxChildCredit({
    income,
    status,
    numDependentsUnder17,
  })

  return propertyTaxCredits + k12Credits + childCredits
}

function calculatePropertyTaxCredit({
  income,
  status,
  propertyTaxes,
  isFairTax,
}) {
  const CURRENT_PROPERTY_TAX_CREDIT_RATE = 0.05
  const FAIR_TAX_PROPERTY_TAX_CREDIT_RATE = 0.06

  const propertyTaxCreditRate = isFairTax
    ? FAIR_TAX_PROPERTY_TAX_CREDIT_RATE
    : CURRENT_PROPERTY_TAX_CREDIT_RATE

  if (
    (status === STATUS_SINGLE && income <= STATUS_SINGLE_MAX) ||
    (status === STATUS_JOINT && income <= STATUS_JOINT_MAX)
  ) {
    return propertyTaxes * propertyTaxCreditRate
  }
  return 0
}

function calculateEducationCredit({ income, status, k12Expenses }) {
  if (
    (status === STATUS_SINGLE && income > STATUS_SINGLE_MAX) ||
    (status === STATUS_JOINT && income > STATUS_JOINT_MAX)
  ) {
    return 0
  }

  const MIN_K12_EXPENSES = 250
  const MAX_K12_CREDIT = 750
  const K12_CREDIT_PERCENTAGE = 0.25
  const eligibleK12Expenses = Math.max(0, k12Expenses - MIN_K12_EXPENSES)
  return Math.min(MAX_K12_CREDIT, eligibleK12Expenses * K12_CREDIT_PERCENTAGE)
}

// https://web.archive.org/web/20190309010153js_/https://www.eitcoutreach.org/customjs/eitc_calculator.js
// https://docs.legis.wisconsin.gov/misc/lfb/informational_papers/january_2019/0003_earned_income_tax_credit_informational_paper_3.pdf#page=6
// https://www2.illinois.gov/rev/programs/EIC/Pages/default.aspx
// https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/earned-income-tax-credit-income-limits-and-maximum-credit-amounts
// https://www.taxpolicycenter.org/statistics/eitc-parameters
// https://github.com/codeforamerica/eitc/blob/master/app/helpers/eitc_calculator.rb
function calculateEIC({ income, status, numDependentsUnder17 }) {
  // Technically, dependents under 18 count, but being more strict with 17 to avoid additional input
  const STATE_PERCENT_EIC = 0.18

  const eligibleChildren = Math.min(3, numDependentsUnder17)

  // https://www.taxpolicycenter.org/statistics/eitc-parameters
  const EIC_2018_LEVELS = [
    {
      baseAmount: 6780,
      beginPhaseOut: 8490,
      marriageRelief: 5680, // Max filed jointly - max filed single
      phaseInRate: 0.0765,
      phaseOutRate: 0.0765,
    },
    {
      baseAmount: 10180,
      beginPhaseOut: 18660,
      marriageRelief: 5690,
      phaseInRate: 0.34,
      phaseOutRate: 0.1598,
    },
    {
      baseAmount: 14290,
      beginPhaseOut: 18660,
      marriageRelief: 5690,
      phaseInRate: 0.4,
      phaseOutRate: 0.2106,
    },
    {
      baseAmount: 14290,
      beginPhaseOut: 18660,
      marriageRelief: 5690,
      phaseInRate: 0.45,
      phaseOutRate: 0.2106,
    },
  ]

  const {
    baseAmount,
    beginPhaseOut,
    marriageRelief,
    phaseInRate,
    phaseOutRate,
  } = EIC_2018_LEVELS[Math.min(3, eligibleChildren)]

  const roundedIncome = income <= 0 ? 0 : Math.floor(income / 50) * 50 + 25
  const marriagePenaltyRelief = status === STATUS_JOINT ? marriageRelief : 0
  const grossEic = Math.min(roundedIncome, baseAmount) * phaseInRate
  const subtractAmount = Math.max(
    0,
    (roundedIncome - (beginPhaseOut + marriagePenaltyRelief)) * phaseOutRate
  )

  const eic = Math.max(0, grossEic - subtractAmount)
  // Illinois is 18% of the federal EIC
  return Math.round(eic * STATE_PERCENT_EIC)
}

// 35 ILCS 5/229
function calculateFairTaxChildCredit({ income, status, numDependentsUnder17 }) {
  const SINGLE_FILE_CHILD_CREDIT_CUTOFF = 40000
  const JOINT_FILE_CHILD_CREDIT_CUTOFF = 60000
  const CHILD_CREDIT_INCOME_INCREMENT = 2000
  const INCOME_INCREMENT_CREDIT_REDUCTION = 5
  const PER_CHILD_CREDIT_AMOUNT = 100

  const childCreditCutoff =
    status === STATUS_SINGLE
      ? SINGLE_FILE_CHILD_CREDIT_CUTOFF
      : JOINT_FILE_CHILD_CREDIT_CUTOFF

  // TODO: Is this whole or partial increments? Going off of Fair Tax site which uses partial
  // Calculate the increments of $2k above the credit cutoff that an income is
  const numIncrementsOverCutoff = Math.max(
    0,
    (income - childCreditCutoff) / CHILD_CREDIT_INCOME_INCREMENT
    // Math.floor((income - childCreditCutoff) / CHILD_CREDIT_INCOME_INCREMENT)
  )
  // Reduce the credit by $5 for each increment it's over the cutoffrate
  // The credit cannot go negative, so set a floor of 0
  const perChildCredit = Math.max(
    0,
    PER_CHILD_CREDIT_AMOUNT -
      numIncrementsOverCutoff * INCOME_INCREMENT_CREDIT_REDUCTION
  )

  // Set a cap of the taxable income because a credit can't make it negative
  return Math.min(income, perChildCredit * numDependentsUnder17)
}

function calculateGraduatedTax({ income, rates, maxRate }) {
  // From d3.ascending
  const sortedRates = rates.sort(({ gt: gtA }, { gt: gtB }) =>
    gtA < gtB ? -1 : gtA > gtB ? 1 : gtA >= gtB ? 0 : NaN
  )

  // Incomes over the maximum threshold are taxed at a single flat rate
  // Based on Public Act 101-0008
  // https://www.civicfed.org/iifs/blog/graduated-income-tax-proposal-part-ii-guide-illinois-plan
  const topRate = sortedRates.slice(-1)[0]
  if (income > topRate.lte) {
    return income * maxRate
  }

  // For each bracket, determine whether it applies to the current income
  // and add the eligible portion multiplied by the rate if so
  return sortedRates.reduce((taxes, { rate, gt, lte }) => {
    if (income > gt && income > lte) {
      return taxes + (lte - gt) * rate
    } else if (income > gt) {
      return taxes + (income - gt) * rate
    } else {
      return taxes
    }
  }, 0)
}

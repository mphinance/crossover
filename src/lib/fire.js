// Crossover — pure financial model. SOURCE OF TRUTH.
//
// Every displayed number (headline, charts, reference table) derives from the
// functions in this file. No UI, no side effects — unit-testable in isolation.
//
// All figures are REAL (inflation-adjusted): expressed in today's purchasing
// power. We assume a fixed annual savings contribution (constant in real terms)
// growing at `realReturn`, on top of a starting `currentNetWorth`.

export const DEFAULTS = Object.freeze({
  takeHomePay: 60000,
  savingsRate: 0.5,
  currentNetWorth: 0,
  realReturn: 0.05,
  withdrawalRate: 0.04,
  // Extra annual income (a side hustle) that gets invested on top of savings.
  sideHustle: 0,
  // Used only by the Coast/Barista variants and the future-dollars view.
  currentAge: 35,
  retirementAge: 65,
  inflation: 0.03,
})

export function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x))
}

// Future value at time t of: starting assets + a fixed annual contribution,
// compounding annually at rate r. Used for both the headline solve and charts.
export function futureValue(currentNetWorth, annualSavings, r, t) {
  if (t <= 0) return currentNetWorth
  if (r === 0) return currentNetWorth + annualSavings * t
  const growth = Math.pow(1 + r, t)
  return currentNetWorth * growth + annualSavings * ((growth - 1) / r)
}

// Validate raw inputs, returning normalized numbers + a list of error strings.
export function validate(raw) {
  const errors = []
  const takeHomePay = Number(raw.takeHomePay)
  const currentNetWorth = Number(raw.currentNetWorth)
  const realReturn = Number(raw.realReturn)
  const withdrawalRate = Number(raw.withdrawalRate)
  let savingsRate = Number(raw.savingsRate)

  // Secondary inputs are forgiving: fall back to defaults rather than block the
  // whole calculation, since they only steer the variants and the display view.
  const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback)
  const sideHustle = Math.max(0, num(raw.sideHustle, DEFAULTS.sideHustle))
  const currentAge = clamp(num(raw.currentAge, DEFAULTS.currentAge), 0, 120)
  const retirementAge = clamp(num(raw.retirementAge, DEFAULTS.retirementAge), 0, 120)
  const inflation = Math.max(0, num(raw.inflation, DEFAULTS.inflation))

  if (!Number.isFinite(takeHomePay) || takeHomePay <= 0) {
    errors.push({ field: 'takeHomePay', message: 'Take-home pay must be a positive number.' })
  }
  if (!Number.isFinite(currentNetWorth) || currentNetWorth < 0) {
    errors.push({ field: 'currentNetWorth', message: 'Current net worth cannot be negative.' })
  }
  if (!Number.isFinite(savingsRate)) {
    errors.push({ field: 'savingsRate', message: 'Savings rate is invalid.' })
    savingsRate = 0
  }
  if (savingsRate < 0) {
    errors.push({ field: 'savingsRate', message: 'Savings rate cannot be negative.' })
  }
  if (!Number.isFinite(realReturn) || realReturn < 0) {
    errors.push({ field: 'realReturn', message: 'Real return must be zero or positive.' })
  }
  if (!Number.isFinite(withdrawalRate) || withdrawalRate <= 0) {
    errors.push({ field: 'withdrawalRate', message: 'Withdrawal rate must be greater than zero.' })
  }

  // savingsRate >= 1 is clamped to 1 (spending becomes zero).
  savingsRate = clamp(savingsRate, 0, 1)

  return {
    valid: errors.length === 0,
    errors,
    inputs: {
      takeHomePay,
      savingsRate,
      currentNetWorth,
      realReturn,
      withdrawalRate,
      sideHustle,
      currentAge,
      retirementAge,
      inflation,
    },
  }
}

// Solve for years-to-FI. Returns a number >= 0, or Infinity when unreachable.
// Uses the closed form when currentNetWorth === 0, otherwise bisection.
export function yearsToFI({ fiTarget, currentNetWorth, annualSavings, realReturn }) {
  if (currentNetWorth >= fiTarget) return 0
  if (annualSavings <= 0) return Infinity // never saving => never reaches FI

  const r = realReturn

  if (r === 0) {
    return (fiTarget - currentNetWorth) / annualSavings
  }

  if (currentNetWorth === 0) {
    // t = ln( fiTarget*r/annualSavings + 1 ) / ln(1+r)
    return Math.log((fiTarget * r) / annualSavings + 1) / Math.log(1 + r)
  }

  // General case: bisection on a monotonically increasing future value.
  const fv = (t) => futureValue(currentNetWorth, annualSavings, r, t)
  let lo = 0
  let hi = 1
  // Expand hi until we bracket the target (cap to avoid runaway).
  while (fv(hi) < fiTarget && hi < 1000) hi *= 2
  if (fv(hi) < fiTarget) return Infinity
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (fv(mid) < fiTarget) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// The full derived model from validated inputs. Everything UI needs.
export function computeModel(raw) {
  const { valid, errors, inputs } = validate(raw)
  const { takeHomePay, savingsRate, currentNetWorth, realReturn, withdrawalRate, sideHustle } = inputs

  if (!valid) {
    return { valid, errors, inputs }
  }

  // Side-hustle income is invested on top of the savings-rate contribution.
  const payrollSavings = takeHomePay * savingsRate
  const annualSavings = payrollSavings + sideHustle
  const annualSpending = takeHomePay * (1 - savingsRate)
  const fiTarget = annualSpending / withdrawalRate // 4% SWR => 25x spending

  const t = yearsToFI({ fiTarget, currentNetWorth, annualSavings, realReturn })
  const reachable = Number.isFinite(t)
  const alreadyFI = reachable && t <= 1e-9

  return {
    valid: true,
    errors: [],
    inputs,
    payrollSavings,
    sideHustle,
    annualSavings,
    annualSpending,
    fiTarget,
    yearsToFI: t,
    reachable,
    alreadyFI,
  }
}

// --- FIRE variants ---------------------------------------------------------
//
// The same engine, re-pointed at different finish lines. Each variant answers
// "if THIS were your definition of enough, when do you get there?" These are
// deliberately simple, opinionated takes on well-known FIRE flavors.

export const LEAN_MULT = 0.7 // a leaner version of your own life
export const FAT_MULT = 1.6 // a roomier one

export function computeVariants(raw) {
  const model = computeModel(raw)
  if (!model.valid) return []
  const { annualSpending, annualSavings, sideHustle, inputs } = model
  const { currentNetWorth, realReturn, withdrawalRate, currentAge, retirementAge } = inputs

  const solve = (fiTarget) => {
    const t = yearsToFI({ fiTarget, currentNetWorth, annualSavings, realReturn })
    return { fiTarget, yearsToFI: t, reachable: Number.isFinite(t), alreadyFI: Number.isFinite(t) && t <= 1e-9 }
  }

  // Standard / Lean / Fat: scale the spending you must cover, keep the engine.
  const standard = {
    key: 'standard',
    label: 'Standard',
    blurb: 'Cover all of today’s spending from your portfolio. The classic 25x.',
    spending: annualSpending,
    ...solve(annualSpending / withdrawalRate),
  }
  const lean = {
    key: 'lean',
    label: 'Lean',
    blurb: `A trimmer life: about ${Math.round(LEAN_MULT * 100)}% of today’s spending. Less to cover, sooner you’re free.`,
    spending: annualSpending * LEAN_MULT,
    ...solve((annualSpending * LEAN_MULT) / withdrawalRate),
  }
  const fat = {
    key: 'fat',
    label: 'Fat',
    blurb: `A roomier life: about ${Math.round(FAT_MULT * 100)}% of today’s spending. More comfort, longer climb.`,
    spending: annualSpending * FAT_MULT,
    ...solve((annualSpending * FAT_MULT) / withdrawalRate),
  }

  // Coast: the pile you need invested NOW so it grows into the full FI number
  // by traditional retirement age, with zero further contributions.
  const yearsToRetire = Math.max(0, retirementAge - currentAge)
  const fullTarget = annualSpending / withdrawalRate
  const coastNumber = fullTarget / Math.pow(1 + realReturn, yearsToRetire)
  const coastSolve = yearsToFI({ fiTarget: coastNumber, currentNetWorth, annualSavings, realReturn })
  const coast = {
    key: 'coast',
    label: 'Coast',
    blurb: `Hit this once and you can stop saving entirely — it drifts up to your full number by age ${retirementAge}.`,
    coast: true,
    spending: annualSpending,
    fiTarget: coastNumber,
    yearsToFI: coastSolve,
    reachable: Number.isFinite(coastSolve),
    alreadyFI: Number.isFinite(coastSolve) && coastSolve <= 1e-9,
    yearsToRetire,
  }

  // Barista: a part-time / side income covers part of spending, so the
  // portfolio only has to fund the rest. Uses your side-hustle figure.
  const baristaCovered = Math.max(0, annualSpending - sideHustle)
  const barista = {
    key: 'barista',
    label: 'Barista',
    blurb:
      sideHustle > 0
        ? 'A part-time income (your side hustle) covers part of spending; the portfolio funds the rest.'
        : 'Add a side-hustle income above, and Barista FIRE shows the smaller number you’d need.',
    barista: true,
    spending: baristaCovered,
    coveredBySide: sideHustle,
    ...solve(baristaCovered / withdrawalRate),
  }

  return [standard, lean, fat, coast, barista]
}

// --- One More Year ---------------------------------------------------------
//
// Past the crossover, each extra working year buys a bigger portfolio, which
// buys more sustainable annual spending. This quantifies the marginal payoff
// (and its diminishing returns) of not pulling the trigger yet.
export function oneMoreYearTable(model, offsets = [0, 1, 2, 3, 5]) {
  if (!model.valid || !model.reachable) return []
  const { annualSavings, annualSpending, fiTarget, yearsToFI: t, inputs } = model
  const { currentNetWorth, realReturn, withdrawalRate } = inputs

  const rows = offsets.map((off) => {
    const years = t + off
    const netWorth = futureValue(currentNetWorth, annualSavings, realReturn, years)
    const sustainableSpend = netWorth * withdrawalRate
    return {
      offset: off,
      years,
      netWorth,
      sustainableSpend,
      // Cushion above the bare FI number, as a share of baseline spending.
      bufferPct: annualSpending > 0 ? (sustainableSpend - annualSpending) / annualSpending : 0,
      extraVsFiTarget: netWorth - fiTarget,
    }
  })
  return rows
}

// Build the time series the charts consume. One row per year, 0..horizon.
// Each row carries the two crossover lines AND the net-worth path, so the
// charts cannot drift out of sync with the headline.
export function buildSeries(model, { maxYears = 60 } = {}) {
  if (!model.valid) return []
  const { inputs, annualSavings, annualSpending, fiTarget, yearsToFI: t } = model
  const { currentNetWorth, realReturn, withdrawalRate } = inputs

  // Horizon: a couple of years past crossover for a clear annotation, capped.
  let horizon
  if (Number.isFinite(t)) horizon = Math.min(maxYears, Math.max(5, Math.ceil(t) + 3))
  else horizon = maxYears

  const series = []
  for (let year = 0; year <= horizon; year++) {
    const netWorth = futureValue(currentNetWorth, annualSavings, realReturn, year)
    series.push({
      year,
      netWorth,
      investmentIncome: netWorth * withdrawalRate,
      expenses: annualSpending,
      fiTarget,
    })
  }
  return series
}

// The famous MMM reference table: years-to-FI by savings rate (5%..95%),
// holding the given assumptions, starting from zero net worth.
// Note: with currentNetWorth = 0, years-to-FI is independent of income.
export function referenceTable({ realReturn = DEFAULTS.realReturn, withdrawalRate = DEFAULTS.withdrawalRate } = {}) {
  const rows = []
  for (let pct = 5; pct <= 95; pct += 5) {
    const s = pct / 100
    const annualSpending = 1 - s // per $1 of take-home
    const annualSavings = s
    const fiTarget = annualSpending / withdrawalRate
    const t = yearsToFI({ fiTarget, currentNetWorth: 0, annualSavings, realReturn })
    rows.push({ savingsRatePct: pct, savingsRate: s, years: t })
  }
  return rows
}

// Inflate a real (today's-dollars) figure to nominal (future) dollars at a
// given year. Used only by the display toggle — never by the FI math itself.
export function toNominal(realValue, years, inflation) {
  if (!Number.isFinite(realValue) || !Number.isFinite(years)) return realValue
  return realValue * Math.pow(1 + inflation, years)
}

// Add `years` (possibly fractional) to a base year -> target calendar year.
export function targetCalendarYear(years, baseYear) {
  if (!Number.isFinite(years)) return null
  return baseYear + Math.round(years)
}

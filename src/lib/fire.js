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
    inputs: { takeHomePay, savingsRate, currentNetWorth, realReturn, withdrawalRate },
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
  const { takeHomePay, savingsRate, currentNetWorth, realReturn, withdrawalRate } = inputs

  if (!valid) {
    return { valid, errors, inputs }
  }

  const annualSavings = takeHomePay * savingsRate
  const annualSpending = takeHomePay * (1 - savingsRate)
  const fiTarget = annualSpending / withdrawalRate // 4% SWR => 25x spending

  const t = yearsToFI({ fiTarget, currentNetWorth, annualSavings, realReturn })
  const reachable = Number.isFinite(t)
  const alreadyFI = reachable && t <= 1e-9

  return {
    valid: true,
    errors: [],
    inputs,
    annualSavings,
    annualSpending,
    fiTarget,
    yearsToFI: t,
    reachable,
    alreadyFI,
  }
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

// Add `years` (possibly fractional) to a base year -> target calendar year.
export function targetCalendarYear(years, baseYear) {
  if (!Number.isFinite(years)) return null
  return baseYear + Math.round(years)
}

import { describe, it, expect } from 'vitest'
import {
  computeModel,
  yearsToFI,
  futureValue,
  referenceTable,
  buildSeries,
  computeVariants,
  oneMoreYearTable,
  toNominal,
  DEFAULTS,
  clamp,
} from './fire.js'
import { encodeState, decodeState } from './urlState.js'

const base = { ...DEFAULTS }

describe('futureValue', () => {
  it('is just the principal at t=0', () => {
    expect(futureValue(1000, 500, 0.05, 0)).toBe(1000)
  })
  it('is linear when return is zero', () => {
    expect(futureValue(0, 1000, 0, 10)).toBe(10000)
    expect(futureValue(5000, 1000, 0, 3)).toBe(8000)
  })
  it('compounds with a positive return', () => {
    // 1000 at 5% for 2 years = 1102.5; plus annuity of 100/yr = 205
    expect(futureValue(1000, 100, 0.05, 2)).toBeCloseTo(1102.5 + 205, 6)
  })
})

describe('years-to-FI — known math', () => {
  it('50% savings rate ~ 17 years (MMM anchor)', () => {
    const m = computeModel({ ...base, savingsRate: 0.5 })
    expect(m.yearsToFI).toBeGreaterThan(16)
    expect(m.yearsToFI).toBeLessThan(18)
  })
  it('headline FI number is 25x spending at 4% SWR', () => {
    const m = computeModel({ ...base, takeHomePay: 100000, savingsRate: 0.4 })
    // spending = 60k, fiTarget = 60k / 0.04 = 1.5M
    expect(m.annualSpending).toBe(60000)
    expect(m.fiTarget).toBe(1_500_000)
  })
  it('result is independent of income when net worth is 0', () => {
    const a = computeModel({ ...base, takeHomePay: 40000, savingsRate: 0.5 })
    const b = computeModel({ ...base, takeHomePay: 400000, savingsRate: 0.5 })
    expect(a.yearsToFI).toBeCloseTo(b.yearsToFI, 9)
  })
  it('zero real return uses the linear solve', () => {
    const m = computeModel({ ...base, realReturn: 0, takeHomePay: 50000, savingsRate: 0.5 })
    // savings 25k/yr, spending 25k, target 625k => 25 years exactly
    expect(m.yearsToFI).toBeCloseTo(25, 9)
  })
  it('starting net worth shortens the path (bisection branch)', () => {
    const cold = computeModel({ ...base, savingsRate: 0.5 })
    const warm = computeModel({ ...base, savingsRate: 0.5, currentNetWorth: 200000 })
    expect(warm.yearsToFI).toBeLessThan(cold.yearsToFI)
  })
})

describe('reference table anchors (5% real, 4% SWR)', () => {
  const rows = referenceTable()
  const yearsAt = (pct) => rows.find((r) => r.savingsRatePct === pct).years
  it('matches published anchors within ±1 year', () => {
    expect(yearsAt(10)).toBeCloseTo(51, 0) // within ~1
    expect(Math.abs(yearsAt(10) - 51)).toBeLessThanOrEqual(1)
    expect(Math.abs(yearsAt(25) - 32)).toBeLessThanOrEqual(1)
    expect(Math.abs(yearsAt(50) - 17)).toBeLessThanOrEqual(1)
    expect(Math.abs(yearsAt(75) - 7)).toBeLessThanOrEqual(1)
  })
  it('covers 5%..95% in 5% steps (19 rows)', () => {
    expect(rows).toHaveLength(19)
    expect(rows[0].savingsRatePct).toBe(5)
    expect(rows[rows.length - 1].savingsRatePct).toBe(95)
  })
  it('is monotonic: higher savings rate => fewer years', () => {
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].years).toBeLessThan(rows[i - 1].years)
    }
  })
  it('table matches the same engine the headline uses', () => {
    const r50 = rows.find((r) => r.savingsRatePct === 50).years
    const headline = computeModel({ ...base, savingsRate: 0.5 }).yearsToFI
    expect(r50).toBeCloseTo(headline, 6)
  })
})

describe('edge cases', () => {
  it('0% savings => Never (infinite)', () => {
    const m = computeModel({ ...base, savingsRate: 0 })
    expect(m.reachable).toBe(false)
    expect(m.yearsToFI).toBe(Infinity)
  })
  it('100% savings => spending 0 => already FI (0 years)', () => {
    const m = computeModel({ ...base, savingsRate: 1 })
    expect(m.fiTarget).toBe(0)
    expect(m.yearsToFI).toBe(0)
    expect(m.alreadyFI).toBe(true)
  })
  it('savings rate > 1 is clamped to 1', () => {
    const m = computeModel({ ...base, savingsRate: 1.7 })
    expect(m.inputs.savingsRate).toBe(1)
  })
  it('already at or above FI target => 0 years', () => {
    const m = computeModel({ ...base, savingsRate: 0.5, currentNetWorth: 100_000_000 })
    expect(m.yearsToFI).toBe(0)
    expect(m.alreadyFI).toBe(true)
  })
  it('non-positive take-home pay => validation error, no calc', () => {
    const m = computeModel({ ...base, takeHomePay: 0 })
    expect(m.valid).toBe(false)
    expect(m.errors.some((e) => e.field === 'takeHomePay')).toBe(true)
  })
  it('negative net worth => validation error', () => {
    const m = computeModel({ ...base, currentNetWorth: -5 })
    expect(m.valid).toBe(false)
    expect(m.errors.some((e) => e.field === 'currentNetWorth')).toBe(true)
  })
  it('clamp helper bounds correctly', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(2, 0, 1)).toBe(1)
    expect(clamp(0.3, 0, 1)).toBe(0.3)
  })
})

describe('crossover series consistency', () => {
  it('crossover (income meets expenses) lands at years-to-FI', () => {
    const m = computeModel({ ...base, savingsRate: 0.5 })
    const series = buildSeries(m)
    // income == netWorth*swr; crosses expenses when netWorth == fiTarget,
    // i.e. exactly at yearsToFI. Find the integer year bracketing the cross.
    const t = m.yearsToFI
    const below = series.filter((row) => row.investmentIncome < row.expenses)
    const lastBelow = below[below.length - 1].year
    expect(lastBelow).toBeLessThanOrEqual(Math.ceil(t))
    expect(lastBelow).toBeGreaterThanOrEqual(Math.floor(t) - 1)
  })
  it('series net worth reaches the FI target by the horizon', () => {
    const m = computeModel({ ...base, savingsRate: 0.5 })
    const series = buildSeries(m)
    const last = series[series.length - 1]
    expect(last.netWorth).toBeGreaterThanOrEqual(m.fiTarget)
  })
})

describe('side-hustle income', () => {
  it('defaults to zero and leaves the timeline unchanged', () => {
    const without = computeModel({ ...base })
    const withZero = computeModel({ ...base, sideHustle: 0 })
    expect(withZero.yearsToFI).toBeCloseTo(without.yearsToFI, 9)
  })
  it('adds to annual savings and shortens the path', () => {
    const plain = computeModel({ ...base })
    const hustling = computeModel({ ...base, sideHustle: 12000 })
    expect(hustling.annualSavings).toBe(plain.annualSavings + 12000)
    expect(hustling.yearsToFI).toBeLessThan(plain.yearsToFI)
  })
  it('does not change spending or the FI target', () => {
    const plain = computeModel({ ...base })
    const hustling = computeModel({ ...base, sideHustle: 12000 })
    expect(hustling.annualSpending).toBe(plain.annualSpending)
    expect(hustling.fiTarget).toBe(plain.fiTarget)
  })
})

describe('FIRE variants', () => {
  const variants = computeVariants({ ...base, sideHustle: 6000 })
  const byKey = (k) => variants.find((v) => v.key === k)

  it('returns the five known styles', () => {
    expect(variants.map((v) => v.key)).toEqual(['standard', 'lean', 'fat', 'coast', 'barista'])
  })
  it('standard matches the headline engine', () => {
    const headline = computeModel({ ...base, sideHustle: 6000 })
    expect(byKey('standard').fiTarget).toBeCloseTo(headline.fiTarget, 6)
    expect(byKey('standard').yearsToFI).toBeCloseTo(headline.yearsToFI, 6)
  })
  it('lean is faster than standard, fat is slower', () => {
    expect(byKey('lean').yearsToFI).toBeLessThan(byKey('standard').yearsToFI)
    expect(byKey('fat').yearsToFI).toBeGreaterThan(byKey('standard').yearsToFI)
  })
  it('coast number is smaller than the full FI number', () => {
    expect(byKey('coast').fiTarget).toBeLessThan(byKey('standard').fiTarget)
  })
  it('barista needs a smaller pile when a side income covers part of spending', () => {
    expect(byKey('barista').fiTarget).toBeLessThan(byKey('standard').fiTarget)
    expect(byKey('barista').spending).toBeCloseTo(byKey('standard').spending - 6000, 6)
  })
})

describe('one more year', () => {
  const model = computeModel({ ...base, savingsRate: 0.5 })
  const rows = oneMoreYearTable(model)

  it('starts at the crossover with no buffer', () => {
    expect(rows[0].offset).toBe(0)
    expect(rows[0].bufferPct).toBeCloseTo(0, 6)
  })
  it('sustainable spending grows with each extra year', () => {
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].sustainableSpend).toBeGreaterThan(rows[i - 1].sustainableSpend)
    }
  })
  it('buffer above baseline spending widens each year', () => {
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].bufferPct).toBeGreaterThan(rows[i - 1].bufferPct)
    }
  })
  it('is empty when FI is unreachable', () => {
    expect(oneMoreYearTable(computeModel({ ...base, savingsRate: 0 }))).toHaveLength(0)
  })
})

describe('nominal restatement', () => {
  it('is the identity at year zero', () => {
    expect(toNominal(1000, 0, 0.03)).toBe(1000)
  })
  it('inflates by the compounded rate', () => {
    expect(toNominal(1000, 10, 0.03)).toBeCloseTo(1000 * Math.pow(1.03, 10), 6)
  })
})

describe('URL state round-trip', () => {
  it('encode -> decode reproduces the inputs', () => {
    const inputs = {
      takeHomePay: 82000,
      savingsRate: 0.42,
      currentNetWorth: 15000,
      realReturn: 0.06,
      withdrawalRate: 0.035,
    }
    const decoded = decodeState('?' + encodeState(inputs))
    expect(decoded.takeHomePay).toBe(82000)
    expect(decoded.savingsRate).toBeCloseTo(0.42, 9)
    expect(decoded.currentNetWorth).toBe(15000)
    expect(decoded.realReturn).toBeCloseTo(0.06, 9)
    expect(decoded.withdrawalRate).toBeCloseTo(0.035, 9)
  })
  it('missing params fall back to defaults', () => {
    const decoded = decodeState('?p=50000')
    expect(decoded.takeHomePay).toBe(50000)
    expect(decoded.savingsRate).toBe(DEFAULTS.savingsRate)
    expect(decoded.withdrawalRate).toBe(DEFAULTS.withdrawalRate)
  })
})

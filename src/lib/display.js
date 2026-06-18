// Real vs. future dollars — a pure display layer on top of the (always-real)
// model. The FI math never changes; this only restates figures in the money of
// a future year by inflating them at the assumed rate. "Today's dollars" is the
// identity transform.

import { toNominal } from './fire.js'
import { formatCurrency, formatCompactCurrency } from './format.js'

export function makeDisplay({ nominal, inflation }) {
  const adj = (value, year = 0) => (nominal ? toNominal(value, year, inflation) : value)
  return {
    nominal: !!nominal,
    inflation,
    adj,
    money: (value, year = 0) => formatCurrency(adj(value, year)),
    compact: (value, year = 0) => formatCompactCurrency(adj(value, year)),
    unit: nominal ? 'future dollars' : 'today’s dollars',
  }
}

// Restate a chart series in the chosen display units (no-op when real).
export function adjustSeries(series, display) {
  if (!display.nominal) return series
  return series.map((row) => ({
    ...row,
    netWorth: display.adj(row.netWorth, row.year),
    investmentIncome: display.adj(row.investmentIncome, row.year),
    expenses: display.adj(row.expenses, row.year),
    fiTarget: display.adj(row.fiTarget, row.year),
  }))
}

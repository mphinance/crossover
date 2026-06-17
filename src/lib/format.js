// Locale-aware formatting helpers. Default USD/en-US; model itself is
// currency-agnostic, so changing these does not affect any math.

const LOCALE = 'en-US'
const CURRENCY = 'USD'

const currency0 = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

const number0 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

export function formatCurrency(n) {
  if (!Number.isFinite(n)) return '—'
  return currency0.format(Math.round(n))
}

export function formatNumber(n) {
  if (!Number.isFinite(n)) return '—'
  return number0.format(n)
}

export function formatPercent(fraction, digits = 0) {
  if (!Number.isFinite(fraction)) return '—'
  return `${(fraction * 100).toFixed(digits)}%`
}

// Years, with one decimal — or a friendly word for the edge cases.
export function formatYears(t) {
  if (!Number.isFinite(t)) return 'Never'
  if (t <= 1e-9) return 'Now'
  return `${t.toFixed(1)} yr`
}

// Compact axis labels for charts ($1.2M, $850k).
export function formatCompactCurrency(n) {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

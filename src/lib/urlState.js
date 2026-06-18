// Serialize the scenario to / from the URL query string so a link reproduces
// the exact scenario. Compact keys, lossless round-trip for the model inputs.

import { DEFAULTS } from './fire.js'

// short key <-> input field
const KEYS = {
  p: 'takeHomePay',
  s: 'savingsRate',
  w: 'currentNetWorth',
  r: 'realReturn',
  d: 'withdrawalRate',
  h: 'sideHustle',
  a: 'currentAge',
  g: 'retirementAge',
  i: 'inflation',
}
const INV = Object.fromEntries(Object.entries(KEYS).map(([k, v]) => [v, k]))

// Encode inputs -> query string (without leading '?').
export function encodeState(inputs) {
  const params = new URLSearchParams()
  for (const field of Object.keys(INV)) {
    const v = inputs[field]
    if (v === undefined || v === null || Number.isNaN(Number(v))) continue
    params.set(INV[field], String(v))
  }
  return params.toString()
}

// Decode a query string -> inputs, falling back to DEFAULTS for missing/invalid.
export function decodeState(search) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const out = { ...DEFAULTS }
  for (const [shortKey, field] of Object.entries(KEYS)) {
    if (!params.has(shortKey)) continue
    const n = Number(params.get(shortKey))
    if (Number.isFinite(n)) out[field] = n
  }
  return out
}

// Push inputs into the address bar without reloading or growing history.
export function syncUrl(inputs) {
  if (typeof window === 'undefined') return
  const qs = encodeState(inputs)
  const url = `${window.location.pathname}?${qs}`
  window.history.replaceState(null, '', url)
}

export function buildShareUrl(inputs) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${window.location.pathname}?${encodeState(inputs)}`
}

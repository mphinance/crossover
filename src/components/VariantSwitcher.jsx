import { useMemo, useState } from 'react'
import { computeVariants } from '../lib/fire.js'
import { formatYears } from '../lib/format.js'
import Tooltip from './Tooltip.jsx'

// The "five calculators in one" panel. Same engine, different finish lines:
// Standard, Lean, Fat, Coast, and Barista FIRE. Tabs pick which one to feature;
// the strip underneath compares all of them at a glance.
export default function VariantSwitcher({ inputs, display }) {
  const variants = useMemo(() => computeVariants(inputs), [inputs])
  const [active, setActive] = useState('standard')

  if (variants.length === 0) return null
  const current = variants.find((v) => v.key === active) ?? variants[0]

  return (
    <section className="rounded-2xl bg-paper p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">
          Which FIRE are you chasing?
          <Tooltip label="About FIRE styles">
            FIRE comes in flavors. Lean is a trimmer life, Fat a roomier one,
            Coast lets you stop saving early, and Barista leans on part-time
            income. Same engine, different finish lines.
          </Tooltip>
        </h2>
      </div>
      <p className="mt-1 text-sm text-slatey">
        Tap a style to feature it. The math is the same, only the definition of
        “enough” changes.
      </p>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="FIRE styles">
        {variants.map((v) => {
          const on = v.key === active
          return (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(v.key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                on
                  ? 'border-target bg-target text-paper shadow-sm'
                  : 'border-rule bg-parchment/60 text-slatey hover:border-target hover:text-target'
              }`}
            >
              {v.label}
            </button>
          )
        })}
      </div>

      {/* Featured variant */}
      <div className="mt-4 rounded-xl border border-rule bg-parchment/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-target">
            {current.label} FIRE
          </p>
          <p className="text-2xl font-bold tabular-nums text-ink">
            {formatYears(current.yearsToFI)}
          </p>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slatey">{current.blurb}</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-faded">
              {current.coast ? 'Coast number (hit it once)' : 'Number you need'}
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-ink">
              {current.reachable ? display.money(current.fiTarget, current.yearsToFI) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-faded">
              {current.barista ? 'Spending the portfolio covers' : 'Spending it covers'}
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-ink">
              {display.money(current.spending, current.reachable ? current.yearsToFI : 0)}
            </dd>
          </div>
        </dl>
        {current.coast && (
          <p className="mt-3 text-xs text-faded">
            Assumes {current.yearsToRetire} years of growth until age {inputs.retirementAge},
            with no further contributions after you hit the coast number.
          </p>
        )}
      </div>

      {/* Compare strip */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {variants.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setActive(v.key)}
            className={`rounded-lg border p-2 text-left transition ${
              v.key === active ? 'border-target bg-target/10' : 'border-rule bg-paper hover:border-target/60'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-faded">{v.label}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-ink">{formatYears(v.yearsToFI)}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

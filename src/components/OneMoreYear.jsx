import { useMemo } from 'react'
import { oneMoreYearTable } from '../lib/fire.js'
import { formatCurrency, formatPercent } from '../lib/format.js'
import Tooltip from './Tooltip.jsx'

// "One More Year" syndrome, quantified. Each extra working year past the
// crossover buys a bigger portfolio and more sustainable spending, but the
// marginal payoff shrinks. The bars make the diminishing returns visible.
export default function OneMoreYear({ model, display }) {
  const rows = useMemo(() => oneMoreYearTable(model), [model])
  if (!model?.valid || !model.reachable || rows.length === 0) return null

  // Scale bars against the richest year shown.
  const maxSpend = Math.max(...rows.map((r) => r.sustainableSpend), 1)

  return (
    <section className="rounded-2xl bg-paper p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold text-ink">
        The “one more year” trap
        <Tooltip label="About one more year">
          Past your crossover, working longer keeps padding the portfolio, which
          raises the spending it can safely support. The dollars keep piling up,
          but what you’re really spending to earn them is time. At some point
          you’re buying comfort you may never live to use.
        </Tooltip>
      </h2>
      <p className="mt-1 text-sm text-slatey">
        What each extra working year past your crossover buys you, in sustainable
        annual spending and safety cushion.
      </p>

      <div className="mt-4 space-y-2.5">
        {rows.map((r) => {
          const isCross = r.offset === 0
          const widthPct = Math.max(6, (r.sustainableSpend / maxSpend) * 100)
          return (
            <div key={r.offset} className="flex items-center gap-3">
              <div className="w-24 shrink-0 text-sm">
                <span className="font-semibold text-ink">
                  {isCross ? 'Crossover' : `+${r.offset} yr`}
                </span>
              </div>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-parchment">
                <div
                  className={`h-full rounded-md ${isCross ? 'bg-target' : 'bg-income'}`}
                  style={{ width: `${widthPct}%` }}
                />
                <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-paper mix-blend-luminosity">
                  {display.money(r.sustainableSpend, r.years)}/yr
                </span>
              </div>
              <div className="w-16 shrink-0 text-right text-xs tabular-nums text-slatey">
                {isCross ? 'baseline' : `+${formatPercent(r.bufferPct)}`}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-faded">
        “Buffer” is how far each year’s sustainable spending sits above your
        baseline expenses of {formatCurrency(model.annualSpending)}. The jump from
        crossover to a year or two of cushion is real. After that, you’re mostly
        buying time you’re trading your life for.
      </p>
    </section>
  )
}

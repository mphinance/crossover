import { computeModel } from '../lib/fire.js'
import { formatYears, formatCurrency, formatPercent } from '../lib/format.js'

// Save up to 3 named scenarios and compare years-to-FI side by side.
// Scenarios live in parent state (mirrored to localStorage).
export default function ScenarioComparison({ inputs, scenarios, onSave, onRemove, onLoad }) {
  const canSave = scenarios.length < 3

  return (
    <section className="rounded-2xl bg-paper p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Compare scenarios</h2>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            const name = window.prompt('Name this scenario (e.g. "cut $300/mo"):')
            if (name) onSave(name.trim() || `Scenario ${scenarios.length + 1}`)
          }}
          className="rounded-lg bg-target px-3 py-1.5 text-sm font-medium text-paper shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Save current
        </button>
      </div>
      <p className="mt-1 text-sm text-slatey">
        Snapshot a setup, tweak your inputs, and see the trade-off. Up to three.
        Always in today's dollars, for a clean comparison.
      </p>

      {scenarios.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-rule p-4 text-sm text-slatey">
          No saved scenarios yet. Save your current numbers to start comparing.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {scenarios.map((sc) => {
            const m = computeModel(sc.inputs)
            return (
              <div key={sc.id} className="rounded-xl border border-rule bg-parchment/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{sc.name}</p>
                  <button
                    type="button"
                    aria-label={`Remove ${sc.name}`}
                    onClick={() => onRemove(sc.id)}
                    className="text-slatey hover:text-expense"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-2 text-2xl font-bold text-target tabular-nums">
                  {formatYears(m.yearsToFI)}
                </p>
                <dl className="mt-2 space-y-0.5 text-xs text-slatey">
                  <Row k="Savings rate" v={formatPercent(sc.inputs.savingsRate)} />
                  <Row k="Spending" v={formatCurrency(m.annualSpending)} />
                  <Row k="FI number" v={m.reachable ? formatCurrency(m.fiTarget) : '—'} />
                </dl>
                <button
                  type="button"
                  onClick={() => onLoad(sc.inputs)}
                  className="mt-3 text-xs font-medium text-target underline-offset-2 hover:underline"
                >
                  Load into calculator
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between">
      <dt>{k}</dt>
      <dd className="tabular-nums text-ink">{v}</dd>
    </div>
  )
}

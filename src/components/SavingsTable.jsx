import { useMemo } from 'react'
import { referenceTable } from '../lib/fire.js'
import { formatYears } from '../lib/format.js'

// The famous MMM table: years-to-FI by savings rate, using current assumptions.
// The row nearest the user's savings rate is highlighted.
export default function SavingsTable({ inputs }) {
  const { realReturn, withdrawalRate, savingsRate } = inputs

  const rows = useMemo(
    () => referenceTable({ realReturn, withdrawalRate }),
    [realReturn, withdrawalRate],
  )

  // Highlight the 5% bucket closest to the user's current rate.
  const currentPct = Math.round((savingsRate * 100) / 5) * 5

  return (
    <section className="rounded-2xl bg-paper p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Savings rate vs. years to FI</h2>
      <p className="mt-1 text-sm text-slatey">
        Starting from zero, using your assumptions ({(realReturn * 100).toFixed(1)}% real
        return, {(withdrawalRate * 100).toFixed(1)}% withdrawal). Income doesn't
        change the answer — only the <em>rate</em> does.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-rule">
        <table className="w-full text-sm">
          <thead className="bg-parchment text-left text-xs uppercase tracking-wide text-slatey">
            <tr>
              <th className="px-4 py-2 font-semibold">Savings rate</th>
              <th className="px-4 py-2 text-right font-semibold">Working years until FI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const active = r.savingsRatePct === currentPct
              return (
                <tr
                  key={r.savingsRatePct}
                  className={
                    active
                      ? 'bg-target/10 font-semibold text-target'
                      : 'odd:bg-paper even:bg-parchment/40 text-ink'
                  }
                >
                  <td className="px-4 py-2 tabular-nums">
                    {r.savingsRatePct}%{active && <span className="ml-2 text-xs">← you</span>}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {formatYears(r.years).replace(' yr', '')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

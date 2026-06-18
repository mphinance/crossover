import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ReferenceDot,
  Legend,
} from 'recharts'
import { formatCompactCurrency, formatCurrency, formatYears } from '../lib/format.js'

// The signature visual: expenses (flat) vs investment income (rising), with the
// crossover point annotated where income meets expenses. The series arrives
// already restated in the chosen display units.
export default function CrossoverChart({ model, series, display }) {
  if (!model?.valid || series.length === 0) return null

  const t = model.yearsToFI
  const reachable = model.reachable
  // The crossover lands where net worth == FI target, i.e. at yearsToFI. Value
  // it in display units at that year so the dot sits on the (possibly tilted)
  // expense line.
  const crossPoint = reachable
    ? { year: t, value: display.adj(model.annualSpending, t) }
    : null

  return (
    <section className="rounded-2xl bg-paper p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">The crossover point</h2>
        {reachable && (
          <span className="text-sm font-medium text-income">
            Income meets expenses at {formatYears(t)}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slatey">
        When investment income (portfolio × withdrawal rate) rises to meet your
        annual expenses, work becomes optional.{' '}
        <span className="text-faded">Shown in {display.unit}.</span>
      </p>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 10, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8c39a" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#6b5d4a' }}
              label={{ value: 'Years from now', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#6b5d4a' }}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: 12, fill: '#6b5d4a' }}
              width={56}
            />
            <RTooltip
              formatter={(value, name) => [formatCurrency(value), name]}
              labelFormatter={(y) => `Year ${y}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Annual expenses"
              stroke="#a23b2d"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="investmentIncome"
              name="Investment income"
              stroke="#5c6e3a"
              strokeWidth={2.5}
              dot={false}
            />
            {crossPoint && (
              <ReferenceDot
                x={crossPoint.year}
                y={crossPoint.value}
                r={6}
                fill="#2f5d62"
                stroke="#f7efdc"
                strokeWidth={2}
                isFront
                label={{ value: 'Crossover', position: 'top', fontSize: 12, fill: '#2f5d62', fontWeight: 700 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

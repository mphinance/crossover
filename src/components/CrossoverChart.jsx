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
// crossover point annotated where income meets expenses.
export default function CrossoverChart({ model, series }) {
  if (!model?.valid || series.length === 0) return null

  const t = model.yearsToFI
  const reachable = model.reachable
  // The crossover lands where net worth == FI target, i.e. at yearsToFI.
  const crossPoint = reachable
    ? { year: t, value: model.annualSpending }
    : null

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
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
        annual expenses, work becomes optional.
      </p>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 10, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#475569' }}
              label={{ value: 'Years from now', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#475569' }}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: 12, fill: '#475569' }}
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
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="investmentIncome"
              name="Investment income"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
            />
            {crossPoint && (
              <ReferenceDot
                x={crossPoint.year}
                y={crossPoint.value}
                r={6}
                fill="#6366f1"
                stroke="#fff"
                strokeWidth={2}
                isFront
                label={{ value: 'Crossover', position: 'top', fontSize: 12, fill: '#6366f1', fontWeight: 700 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

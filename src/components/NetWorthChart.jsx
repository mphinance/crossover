import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ReferenceLine,
} from 'recharts'
import { formatCompactCurrency, formatCurrency } from '../lib/format.js'

// Projected invested net worth over time, with the FI target as a reference line.
export default function NetWorthChart({ model, series }) {
  if (!model?.valid || series.length === 0) return null
  const { fiTarget, reachable } = model

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Net worth growth</h2>
      <p className="mt-1 text-sm text-slatey">
        Your invested assets compounding toward the FI target (in today's dollars).
      </p>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 12, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569' }} />
            <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12, fill: '#475569' }} width={56} />
            <RTooltip
              formatter={(value) => [formatCurrency(value), 'Net worth']}
              labelFormatter={(y) => `Year ${y}`}
            />
            {reachable && (
              <ReferenceLine
                y={fiTarget}
                stroke="#6366f1"
                strokeDasharray="5 4"
                label={{ value: `FI target ${formatCompactCurrency(fiTarget)}`, position: 'insideTopRight', fontSize: 11, fill: '#6366f1' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="netWorth"
              name="Net worth"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#nwFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ReferenceLine,
} from 'recharts'
import { formatCompactCurrency, formatCurrency } from '../lib/format.js'

// Projected invested net worth over time, with the FI target as a reference.
// In today's dollars the target is a flat line; in future dollars it rises with
// inflation, so we draw it as its own series instead.
export default function NetWorthChart({ model, series, display }) {
  if (!model?.valid || series.length === 0) return null
  const { fiTarget, reachable } = model

  return (
    <section className="rounded-2xl bg-paper p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Net worth growth</h2>
      <p className="mt-1 text-sm text-slatey">
        Your invested assets compounding toward the FI target.{' '}
        <span className="text-faded">Shown in {display.unit}.</span>
      </p>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 12, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f5d62" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#2f5d62" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8c39a" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b5d4a' }} />
            <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12, fill: '#6b5d4a' }} width={56} />
            <RTooltip
              formatter={(value, name) => [formatCurrency(value), name === 'fiTarget' ? 'FI target' : 'Net worth']}
              labelFormatter={(y) => `Year ${y}`}
            />
            {reachable && display.nominal && (
              <Line
                type="monotone"
                dataKey="fiTarget"
                name="fiTarget"
                stroke="#2f5d62"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
              />
            )}
            {reachable && !display.nominal && (
              <ReferenceLine
                y={fiTarget}
                stroke="#2f5d62"
                strokeDasharray="5 4"
                label={{ value: `FI target ${formatCompactCurrency(fiTarget)}`, position: 'insideTopRight', fontSize: 11, fill: '#2f5d62' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="netWorth"
              name="Net worth"
              stroke="#2f5d62"
              strokeWidth={2.5}
              fill="url(#nwFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

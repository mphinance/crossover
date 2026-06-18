import { useMemo } from 'react'
import Tooltip from './Tooltip.jsx'
import MarginNote from './MarginNote.jsx'
import { noteFor } from '../lib/notes.js'
import { formatPercent } from '../lib/format.js'

// Controlled input panel. Spending <-> savings-rate stay in sync.
// All changes flow up via onChange(partialInputs); the parent owns state.
export default function InputPanel({ inputs, model, notes = [], onChange, onReset }) {
  const {
    takeHomePay,
    savingsRate,
    currentNetWorth,
    realReturn,
    withdrawalRate,
    sideHustle,
    currentAge,
    retirementAge,
    inflation,
  } = inputs

  // Derived spending for the synced field.
  const spending = useMemo(
    () => Math.round(takeHomePay * (1 - savingsRate)),
    [takeHomePay, savingsRate],
  )

  const errorFor = (field) =>
    model?.errors?.find((e) => e.field === field)?.message

  // Editing spending updates savings rate: s = 1 - spending/takeHome.
  const handleSpending = (value) => {
    const sp = Number(value)
    if (!Number.isFinite(sp) || takeHomePay <= 0) return
    const s = 1 - sp / takeHomePay
    onChange({ savingsRate: Math.max(0, Math.min(1, s)) })
  }

  return (
    <section
      aria-label="Your numbers"
      className="rounded-2xl bg-paper p-5 shadow-card sm:p-6"
    >
      <h2 className="text-lg font-semibold text-ink">Your numbers</h2>
      <p className="mt-1 text-sm text-slatey">Everything recalculates live.</p>

      <div className="mt-5 space-y-5">
        {/* Take-home pay */}
        <Field
          label="Annual take-home pay"
          hint="After tax. The income you actually receive."
          error={errorFor('takeHomePay')}
        >
          <CurrencyInput
            value={takeHomePay}
            onChange={(v) => onChange({ takeHomePay: v })}
            invalid={!!errorFor('takeHomePay')}
          />
        </Field>

        {/* Savings rate — the star variable */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="savingsRate" className="text-sm font-medium text-ink">
              Savings rate
              <Tooltip label="About savings rate">
                The share of your take-home pay you save and invest each year. This
                is the single biggest driver of when you reach FI.
              </Tooltip>
            </label>
            <span className="text-sm font-bold text-target">
              {formatPercent(savingsRate)}
            </span>
          </div>
          <input
            id="savingsRate"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={savingsRate}
            onChange={(e) => onChange({ savingsRate: Number(e.target.value) })}
            className="mt-2 w-full"
            aria-valuetext={formatPercent(savingsRate)}
          />
          <div className="mt-1 flex justify-between text-[11px] text-faded">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <MarginNote text={noteFor(notes, 'savings')} className="mt-1" />
        </div>

        {/* Spending — synced inverse of savings rate */}
        <Field
          label="Annual spending"
          hint="What you live on. Editing this adjusts your savings rate, and vice versa."
        >
          <CurrencyInput value={spending} onChange={handleSpending} invalid={false} />
        </Field>

        {/* Side hustle — extra income that gets invested */}
        <Field
          label="Side-hustle income"
          hint="Extra annual income beyond your day job, invested on top of your savings. Also powers Barista FIRE."
        >
          <CurrencyInput
            value={sideHustle}
            onChange={(v) => onChange({ sideHustle: v })}
            invalid={false}
          />
          <MarginNote text={noteFor(notes, 'sidehustle')} className="mt-1" />
        </Field>

        {/* Current net worth */}
        <Field
          label="Current invested net worth"
          hint="Money already invested toward FI. Defaults to zero."
          error={errorFor('currentNetWorth')}
        >
          <CurrencyInput
            value={currentNetWorth}
            onChange={(v) => onChange({ currentNetWorth: v })}
            invalid={!!errorFor('currentNetWorth')}
          />
          <MarginNote text={noteFor(notes, 'networth')} className="mt-1" />
        </Field>

        {/* Advanced assumptions */}
        <details className="group rounded-xl border border-rule bg-parchment/50 p-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink">
            <span className="inline-flex items-center gap-2">
              <span className="transition group-open:rotate-90">▶</span>
              Assumptions
            </span>
          </summary>
          <div className="mt-4 space-y-4">
            <Field
              label="Real investment return"
              hint="Expected annual return AFTER inflation. 5% is a common long-run assumption for a stock-heavy portfolio."
              error={errorFor('realReturn')}
            >
              <PercentInput
                value={realReturn}
                onChange={(v) => onChange({ realReturn: v })}
                invalid={!!errorFor('realReturn')}
              />
              <MarginNote text={noteFor(notes, 'return')} className="mt-1" />
            </Field>
            <Field
              label="Safe withdrawal rate"
              hint="How much of your portfolio you withdraw each year in retirement. 4% implies a 25x target."
              error={errorFor('withdrawalRate')}
            >
              <PercentInput
                value={withdrawalRate}
                onChange={(v) => onChange({ withdrawalRate: v })}
                invalid={!!errorFor('withdrawalRate')}
              />
              <MarginNote text={noteFor(notes, 'withdrawal')} className="mt-1" />
            </Field>
            <Field
              label="Inflation (for future-dollar view)"
              hint="Only used to restate figures in future dollars when you flip the display toggle. It never changes the FI math, which is already inflation-adjusted."
            >
              <PercentInput
                value={inflation}
                onChange={(v) => onChange({ inflation: v })}
                invalid={false}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Current age"
                hint="Used by Coast FIRE to know how long your money can grow."
              >
                <NumberInput
                  value={currentAge}
                  onChange={(v) => onChange({ currentAge: v })}
                />
              </Field>
              <Field
                label="Retire by age"
                hint="The traditional retirement age Coast FIRE coasts toward."
              >
                <NumberInput
                  value={retirementAge}
                  onChange={(v) => onChange({ retirementAge: v })}
                />
              </Field>
            </div>
            <p className="text-xs text-faded">
              Returns are expressed after inflation, so the core figures are in
              today's dollars. Age and inflation only feed the FIRE styles and the
              future-dollar view.
            </p>
          </div>
        </details>

        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-slatey underline-offset-2 hover:text-ink hover:underline"
        >
          Reset to defaults
        </button>
      </div>
    </section>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <div className="flex items-center">
        <label className="text-sm font-medium text-ink">{label}</label>
        {hint && <Tooltip label={label}>{hint}</Tooltip>}
      </div>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-expense">
          {error}
        </p>
      )}
    </div>
  )
}

function CurrencyInput({ value, onChange, invalid }) {
  return (
    <div
      className={`flex items-center rounded-lg border bg-paper px-3 ${
        invalid ? 'border-expense' : 'border-rule focus-within:border-target'
      }`}
    >
      <span className="text-faded">$</span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent px-2 py-2 text-right tabular-nums text-ink outline-none"
      />
    </div>
  )
}

function PercentInput({ value, onChange, invalid }) {
  // Stored as a fraction; displayed as a percent.
  return (
    <div
      className={`flex items-center rounded-lg border bg-paper px-3 ${
        invalid ? 'border-expense' : 'border-rule focus-within:border-target'
      }`}
    >
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        value={Number.isFinite(value) ? +(value * 100).toFixed(2) : ''}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full bg-transparent px-2 py-2 text-right tabular-nums text-ink outline-none"
      />
      <span className="text-faded">%</span>
    </div>
  )
}

function NumberInput({ value, onChange }) {
  return (
    <div className="flex items-center rounded-lg border border-rule bg-paper px-3 focus-within:border-target">
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent px-2 py-2 text-right tabular-nums text-ink outline-none"
      />
    </div>
  )
}

import { formatYears, formatPercent } from '../lib/format.js'
import { targetCalendarYear } from '../lib/fire.js'
import MarginNote from './MarginNote.jsx'

// The big, plain-language answer. Recomputes live from the model.
export default function HeadlineResult({ model, baseYear, display, note }) {
  if (!model?.valid) {
    return (
      <div className="rounded-2xl bg-paper p-6 shadow-card">
        <p className="text-slatey">
          Enter a valid take-home pay to see your years to financial independence.
        </p>
      </div>
    )
  }

  const { yearsToFI: t, reachable, alreadyFI, fiTarget, annualSpending, inputs } = model
  const year = targetCalendarYear(t, baseYear)

  let headline
  let sub
  if (alreadyFI && inputs.savingsRate >= 1) {
    headline = "You're already financially independent."
    sub = 'With zero spending, your FI number is zero. (A fun edge case more than a plan.)'
  } else if (alreadyFI) {
    headline = "You're already there."
    sub = `Your invested net worth already covers ${formatPercent(inputs.withdrawalRate)}-rule spending.`
  } else if (!reachable) {
    headline = 'At a 0% savings rate, FI never arrives.'
    sub = 'Saving nothing means investments never catch up to expenses. Nudge the savings rate up to see it change.'
  } else {
    headline = (
      <>
        You can reach financial independence in{' '}
        <span className="font-hand text-3xl text-target sm:text-4xl">{formatYears(t)}</span>.
      </>
    )
    sub = `On track for around ${year}.`
  }

  // Show big numbers in the chosen units, valued at the crossover year.
  const valuedAtYear = reachable ? t : 0

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-paper to-parchment p-6 shadow-hero paper-ruled sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-target">
          Your crossover
        </p>
        <MarginNote text={note} arrow="↗" className="hidden max-w-[10rem] text-right sm:block" />
      </div>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-ink sm:text-3xl">
        {headline}
      </h1>
      <p className="mt-2 text-sm text-slatey sm:text-base">
        {sub}
        {reachable && (
          <span className="text-faded"> Figures in {display.unit}.</span>
        )}
      </p>
      <MarginNote text={note} arrow="↑" className="mt-2 sm:hidden" />

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat
          label="Your FI number"
          value={reachable ? display.money(fiTarget, valuedAtYear) : '—'}
        />
        <Stat label="Annual spending" value={display.money(annualSpending, valuedAtYear)} />
        <Stat label="Annual savings" value={display.money(model.annualSavings, valuedAtYear)} />
      </dl>

      <p className="mt-5 text-sm leading-relaxed text-slatey">
        The {formatPercent(inputs.withdrawalRate)} rule says you can retire once
        you've saved about{' '}
        <strong className="text-ink">{Math.round(1 / inputs.withdrawalRate)}×</strong> your
        annual spending. Cutting spending is a double win: you save more now{' '}
        <em>and</em> lower the target you're aiming at.
      </p>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-faded">{label}</dt>
      <dd className="mt-1 text-lg font-bold tabular-nums text-ink">{value}</dd>
    </div>
  )
}

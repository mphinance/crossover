import { formatCurrency, formatYears, formatPercent } from '../lib/format.js'
import { targetCalendarYear } from '../lib/fire.js'

// The big, plain-language answer. Recomputes live from the model.
export default function HeadlineResult({ model, baseYear }) {
  if (!model?.valid) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-slatey">
          Enter a valid take-home pay to see your years to financial independence.
        </p>
      </div>
    )
  }

  const { yearsToFI: t, reachable, alreadyFI, fiTarget, annualSpending, inputs } = model

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
    const year = targetCalendarYear(t, baseYear)
    headline = (
      <>
        You can reach financial independence in{' '}
        <span className="text-target">{formatYears(t)}</span>.
      </>
    )
    sub = `On track for around ${year}, in today's dollars.`
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-mist p-6 shadow-hero sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-target">
        Your crossover
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-ink sm:text-3xl">
        {headline}
      </h1>
      <p className="mt-2 text-sm text-slatey sm:text-base">{sub}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Your FI number" value={reachable ? formatCurrency(fiTarget) : '—'} />
        <Stat label="Annual spending" value={formatCurrency(annualSpending)} />
        <Stat label="Annual savings" value={formatCurrency(model.annualSavings)} />
      </dl>

      <p className="mt-5 text-sm leading-relaxed text-slatey">
        The {formatPercent(inputs.withdrawalRate)} rule says you can retire once
        you've saved about{' '}
        <strong className="text-ink">
          {Math.round(1 / inputs.withdrawalRate)}×
        </strong>{' '}
        your annual spending. Cutting spending is a double win: you save more now{' '}
        <em>and</em> lower the target you're aiming at.
      </p>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slatey">{label}</dt>
      <dd className="mt-1 text-lg font-bold tabular-nums text-ink">{value}</dd>
    </div>
  )
}

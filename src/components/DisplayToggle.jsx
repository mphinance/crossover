// Segmented control: show money in today's dollars (real) or future dollars
// (nominal). Purely a view switch — it never changes the underlying FI math.
export default function DisplayToggle({ nominal, inflation, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rule bg-paper px-3 py-2 shadow-card">
      <p className="text-xs text-slatey">
        Show money in{' '}
        <span className="font-semibold text-ink">
          {nominal ? 'future dollars' : 'today’s dollars'}
        </span>
        {nominal && (
          <span className="text-faded">
            {' '}
            (inflated {(inflation * 100).toFixed(1)}%/yr)
          </span>
        )}
      </p>
      <div className="inline-flex rounded-lg border border-rule p-0.5" role="group" aria-label="Display units">
        <button
          type="button"
          aria-pressed={!nominal}
          onClick={() => onChange(false)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
            !nominal ? 'bg-target text-paper shadow-sm' : 'text-slatey hover:text-target'
          }`}
        >
          Today’s $
        </button>
        <button
          type="button"
          aria-pressed={nominal}
          onClick={() => onChange(true)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
            nominal ? 'bg-target text-paper shadow-sm' : 'text-slatey hover:text-target'
          }`}
        >
          Future $
        </button>
      </div>
    </div>
  )
}

// Persistent, plain disclaimer. This app is an educational illustration only.
export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs text-slatey">
        Illustration only — not financial advice. Results depend entirely on the
        assumptions you enter.
      </p>
    )
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">This is an educational illustration, not financial advice.</p>
      <p className="mt-1 leading-relaxed">
        Crossover shows simple projections based on the assumptions you supply.
        Real returns, inflation, taxes, and spending are uncertain and will vary.
        Nothing here is personalized advice. Consult a licensed professional
        before making real financial decisions.
      </p>
    </div>
  )
}

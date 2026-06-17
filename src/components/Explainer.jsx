// Short, plain-language "How this works" content.
export default function Explainer() {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold text-ink">How this works</h2>
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-slatey">
        <p>
          <strong className="text-ink">Your savings rate is the whole game.</strong>{' '}
          Not your salary, not your current net worth — the percentage of your
          take-home pay you save each year is what decides how soon you reach
          financial independence. Someone earning $40k and saving half gets there
          in the same time as someone earning $400k and saving half.
        </p>
        <p>
          <strong className="text-ink">Cutting spending is a double win.</strong>{' '}
          Spend less and two things happen at once: you save more each year, and
          the finish line moves closer, because you need a smaller pile to cover a
          smaller lifestyle. That's why high savings rates collapse the timeline so
          fast.
        </p>
        <p>
          <strong className="text-ink">The crossover point</strong> is the moment
          your investments throw off enough income to cover your expenses. We
          estimate that income as your portfolio multiplied by a safe withdrawal
          rate (4% by default — the classic "25× your spending" rule). When that
          income line meets your expense line, work becomes optional.
        </p>
        <p>
          <strong className="text-ink">Everything is in today's dollars.</strong>{' '}
          We use real (after-inflation) returns, so the numbers you see reflect
          today's purchasing power. The default 5% real return roughly matches a
          long-run, stock-heavy portfolio — but the future is uncertain, and a
          single bad sequence of returns can change the picture.
        </p>
        <p className="text-xs">
          Limitations: this is a smooth, deterministic projection. It ignores
          taxes, fees, lumpy income, market volatility, healthcare, Social
          Security, and life. Treat it as intuition, not a plan.
        </p>
      </div>
    </section>
  )
}

// "How this works" plus a short field guide to the FIRE variants. This is the
// documentation half of the diary: enough to teach, not a whole blog post.
export default function Explainer() {
  return (
    <section className="rounded-2xl bg-paper p-5 shadow-card paper-ruled sm:p-6">
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
          rate (4% by default — the classic “25× your spending” rule). When that
          income line meets your expense line, work becomes optional.
        </p>
        <p>
          <strong className="text-ink">A side hustle just adds fuel.</strong>{' '}
          Any extra income you invest is piled on top of your savings each year, so
          it pulls the crossover closer without changing what your life costs.
        </p>
        <p>
          <strong className="text-ink">Everything is in today's dollars.</strong>{' '}
          We use real (after-inflation) returns, so the core numbers reflect
          today's purchasing power. Flip the display toggle to restate them in
          future dollars if you want to see the scarier, inflated figures. The
          underlying math doesn't change — only the units do.
        </p>
      </div>

      <h3 className="mt-6 text-base font-semibold text-ink">A field guide to FIRE</h3>
      <dl className="mt-3 space-y-3 text-sm leading-relaxed text-slatey">
        <Def term="Standard FIRE">
          The default. Save 25× your annual spending (at a 4% withdrawal rate) and
          your portfolio can cover your whole life indefinitely.
        </Def>
        <Def term="Lean FIRE">
          The same idea on a trimmer budget. A smaller target you can hit years
          earlier, at the cost of a leaner lifestyle with less margin.
        </Def>
        <Def term="Fat FIRE">
          A roomier retirement with more comfort and cushion. A bigger number, a
          longer climb, but more breathing room when life gets expensive.
        </Def>
        <Def term="Coast FIRE">
          Hit a smaller number early, then stop saving entirely and let compounding
          carry it to a full retirement by your target age. You still work to cover
          today's bills, but you never have to invest another dollar.
        </Def>
        <Def term="Barista FIRE">
          Semi-retire. A part-time or side income covers part of your spending, so
          your portfolio only has to fund the rest. The name comes from taking an
          easy job partly for the health insurance.
        </Def>
      </dl>

      <p className="mt-5 rounded-xl border border-rule bg-parchment/50 p-3 text-xs leading-relaxed text-slatey">
        <strong className="text-ink">The one big caveat:</strong> this is a smooth,
        average-return projection. Real markets don't deliver the average every
        year, and a bad run of returns early in retirement (sequence-of-returns
        risk) can do real damage even when the long-run average works out. It also
        ignores taxes, fees, healthcare, Social Security, lumpy income, and life.
        Treat the number as intuition, not a plan.
      </p>
    </section>
  )
}

function Def({ term, children }) {
  return (
    <div>
      <dt className="font-semibold text-ink">{term}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}

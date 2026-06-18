import { useEffect, useMemo, useState, useCallback } from 'react'
import { computeModel, buildSeries, DEFAULTS } from './lib/fire.js'
import { decodeState, syncUrl, buildShareUrl } from './lib/urlState.js'
import { makeDisplay, adjustSeries } from './lib/display.js'
import { pickNotes, noteFor } from './lib/notes.js'
import InputPanel from './components/InputPanel.jsx'
import HeadlineResult from './components/HeadlineResult.jsx'
import DisplayToggle from './components/DisplayToggle.jsx'
import VariantSwitcher from './components/VariantSwitcher.jsx'
import CrossoverChart from './components/CrossoverChart.jsx'
import NetWorthChart from './components/NetWorthChart.jsx'
import OneMoreYear from './components/OneMoreYear.jsx'
import SavingsTable from './components/SavingsTable.jsx'
import ScenarioComparison from './components/ScenarioComparison.jsx'
import Explainer from './components/Explainer.jsx'
import Disclaimer from './components/Disclaimer.jsx'

const BASE_YEAR = new Date().getFullYear()
const SCENARIO_KEY = 'crossover.scenarios.v1'

// Scenarios get a stable id without Date.now()/random dependence headaches.
let scenarioSeq = 0

export default function App() {
  // Initial state: URL params win, else defaults.
  const [inputs, setInputs] = useState(() => decodeState(window.location.search))

  // Today's dollars vs. future dollars. A view toggle, not a model input.
  const [nominal, setNominal] = useState(false)

  const [scenarios, setScenarios] = useState(() => {
    try {
      const raw = localStorage.getItem(SCENARIO_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      scenarioSeq = parsed.reduce((m, s) => Math.max(m, s.id || 0), 0)
      return parsed
    } catch {
      return []
    }
  })

  const [copied, setCopied] = useState(false)

  // Single source of truth: model + chart series derive from inputs only.
  const model = useMemo(() => computeModel(inputs), [inputs])
  const series = useMemo(() => buildSeries(model), [model])

  // The display layer (real vs. nominal) sits on top of the model, never inside it.
  const display = useMemo(
    () => makeDisplay({ nominal, inflation: inputs.inflation }),
    [nominal, inputs.inflation],
  )
  const displaySeries = useMemo(() => adjustSeries(series, display), [series, display])
  const notes = useMemo(() => pickNotes(model), [model])

  // Mirror inputs to the URL (shareable, no history spam).
  useEffect(() => {
    syncUrl(inputs)
  }, [inputs])

  // Persist scenarios.
  useEffect(() => {
    try {
      localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios))
    } catch {
      /* localStorage unavailable — non-fatal */
    }
  }, [scenarios])

  const updateInputs = useCallback((patch) => {
    setInputs((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetInputs = useCallback(() => setInputs({ ...DEFAULTS }), [])

  const saveScenario = useCallback(
    (name) => {
      setScenarios((prev) => {
        if (prev.length >= 3) return prev
        scenarioSeq += 1
        return [...prev, { id: scenarioSeq, name, inputs: { ...inputs } }]
      })
    },
    [inputs],
  )

  const removeScenario = useCallback((id) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const loadScenario = useCallback((scInputs) => {
    setInputs({ ...scInputs })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const copyLink = useCallback(async () => {
    const url = buildShareUrl(inputs)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link:', url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }, [inputs])

  return (
    <div className="min-h-full">
      <header className="border-b border-rule bg-parchment/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-hand text-3xl font-bold leading-none text-ink">Crossover</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-faded">
              The Lost Diary of FIRE
            </p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg border border-rule bg-paper px-3 py-1.5 text-sm font-medium text-ink transition hover:border-target hover:text-target"
          >
            {copied ? 'Link copied ✓' : 'Copy link'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* A short diary-style intro instead of a cold calculator. */}
        <section className="mb-6 rounded-2xl bg-paper p-5 shadow-card paper-ruled sm:p-7">
          <p className="font-hand text-2xl text-margin">Entry one.</p>
          <p className="mt-1 max-w-2xl text-base leading-relaxed text-ink">
            Somewhere there is a year when your money quietly starts working
            harder than you do. The investments throw off enough to cover the
            life you live, and the alarm clock becomes a choice. That moment is
            the <em className="font-semibold">crossover</em>. This little book
            does one thing: it finds yours, and shows you the handful of dials
            that move it.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
          {/* Left: inputs (sticky on desktop) */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <InputPanel
              inputs={inputs}
              model={model}
              notes={notes}
              onChange={updateInputs}
              onReset={resetInputs}
            />
            <div className="mt-4">
              <Disclaimer compact />
            </div>
          </div>

          {/* Right: results */}
          <div className="space-y-6">
            <DisplayToggle
              nominal={nominal}
              inflation={inputs.inflation}
              onChange={setNominal}
            />
            <HeadlineResult
              model={model}
              baseYear={BASE_YEAR}
              display={display}
              note={noteFor(notes, 'headline')}
            />
            <VariantSwitcher inputs={inputs} display={display} />
            <CrossoverChart model={model} series={displaySeries} display={display} />
            <NetWorthChart model={model} series={displaySeries} display={display} />
            <OneMoreYear model={model} display={display} />
            <SavingsTable inputs={inputs} />
            <ScenarioComparison
              inputs={inputs}
              scenarios={scenarios}
              onSave={saveScenario}
              onRemove={removeScenario}
              onLoad={loadScenario}
            />
            <Explainer />
            <Disclaimer />
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-faded sm:px-6">
        <p className="mx-auto max-w-2xl leading-relaxed">
          Built on two old ideas: the “crossover point” from Vicki Robin and Joe
          Dominguez’s <em>Your Money or Your Life</em>, and Mr. Money Mustache’s{' '}
          <a
            href="https://www.mrmoneymustache.com/2012/01/13/the-shockingly-simple-math-behind-early-retirement/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-target underline decoration-rule underline-offset-2 hover:decoration-target"
          >
            The Shockingly Simple Math Behind Early Retirement
          </a>
          .
        </p>
        <p className="mt-2">Runs entirely in your browser. Nothing is sent anywhere.</p>
      </footer>
    </div>
  )
}

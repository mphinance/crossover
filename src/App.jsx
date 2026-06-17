import { useEffect, useMemo, useState, useCallback } from 'react'
import { computeModel, buildSeries, DEFAULTS } from './lib/fire.js'
import { decodeState, syncUrl, buildShareUrl } from './lib/urlState.js'
import InputPanel from './components/InputPanel.jsx'
import HeadlineResult from './components/HeadlineResult.jsx'
import CrossoverChart from './components/CrossoverChart.jsx'
import NetWorthChart from './components/NetWorthChart.jsx'
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
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-lg font-bold tracking-tight text-ink">Crossover</p>
            <p className="text-xs text-slatey">A shockingly simple FIRE calculator</p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-target hover:text-target"
          >
            {copied ? 'Link copied ✓' : 'Copy link'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
          {/* Left: inputs (sticky on desktop) */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <InputPanel
              inputs={inputs}
              model={model}
              onChange={updateInputs}
              onReset={resetInputs}
            />
            <div className="mt-4">
              <Disclaimer compact />
            </div>
          </div>

          {/* Right: results */}
          <div className="space-y-6">
            <HeadlineResult model={model} baseYear={BASE_YEAR} />
            <CrossoverChart model={model} series={series} />
            <NetWorthChart model={model} series={series} />
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

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slatey sm:px-6">
        <p>
          Inspired by "Your Money or Your Life" (the crossover point) and Mr. Money
          Mustache's "The Shockingly Simple Math Behind Early Retirement."
        </p>
        <p className="mt-1">Runs entirely in your browser. Nothing is sent anywhere.</p>
      </footer>
    </div>
  )
}

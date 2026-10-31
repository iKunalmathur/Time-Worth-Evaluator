import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

const STORAGE_KEY = 'twe-v1'

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: '₹ (INR)' },
  { code: 'USD', symbol: '$', label: '$ (USD)' },
  { code: 'EUR', symbol: '€', label: '€ (EUR)' },
  { code: 'GBP', symbol: '£', label: '£ (GBP)' },
]

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'hourly', label: 'Hourly' },
]

const DEFAULTS = {
  income: 100000,
  frequency: 'monthly',
  currency: 'USD',
  workDays: 22,
  hoursPerDay: 8,
  theme: 'light',
  shareCardTheme: 'sunset',
}

const RATE_CHIP_COLORS = [
  { bg: 'var(--sky-soft)', fg: '#5b63d6', emoji: '☀️' },
  { bg: 'var(--butter-soft)', fg: '#a16207', emoji: '⏱' },
  { bg: 'var(--peach-soft)', fg: '#c2410c', emoji: '⚡' },
  { bg: 'var(--lilac-soft)', fg: '#9333ea', emoji: '✨' },
]

const SHARE_CARD_THEMES = [
  {
    id: 'sunset',
    label: 'Sunset Mix',
    swatches: ['#ff8f5c', '#9ba3ff', '#d4a5e8'],
    background: 'linear-gradient(145deg, #ffe2d4 0%, #e4e6ff 30%, #fff4c2 60%, #f3e4fa 100%)',
    text: '#2f3448',
    muted: '#7a7588',
    brand: '#e8733f',
    amount: '#ff8f5c',
    badgeBg: '#f0d96a',
    badgeText: '#a16207',
    dash: '#d4a5e8',
    chipA: 'rgba(228, 230, 255, 0.8)',
    chipB: 'rgba(255, 226, 212, 0.85)',
    ring: '0 0 0 3px #ff8f5c, 0 0 0 6px #9ba3ff, 0 0 0 9px #d4a5e8',
    mark: ['#ff8f5c', '#9ba3ff', '#d4a5e8'],
  },
  {
    id: 'sky',
    label: 'Soft Sky',
    swatches: ['#8ec5ff', '#b8d0ff', '#f0d96a'],
    background: 'linear-gradient(145deg, #dff0ff 0%, #e8efff 40%, #fff8e0 100%)',
    text: '#2f3448',
    muted: '#717995',
    brand: '#3b6fd9',
    amount: '#3b6fd9',
    badgeBg: '#8ec5ff',
    badgeText: '#1e3a8a',
    dash: '#8ec5ff',
    chipA: 'rgba(220, 232, 255, 0.85)',
    chipB: 'rgba(255, 244, 194, 0.85)',
    ring: '0 0 0 3px #8ec5ff, 0 0 0 6px #b8d0ff, 0 0 0 9px #f0d96a',
    mark: ['#3b6fd9', '#8ec5ff', '#f0d96a'],
  },
  {
    id: 'lemon',
    label: 'Lemon Pop',
    swatches: ['#f0d96a', '#ffb89a', '#9fd4c8'],
    background: 'linear-gradient(145deg, #fff4c2 0%, #ffe9de 45%, #e3f5f0 100%)',
    text: '#2f3448',
    muted: '#7a7588',
    brand: '#a16207',
    amount: '#ca8a04',
    badgeBg: '#ffb89a',
    badgeText: '#7c2d12',
    dash: '#f0d96a',
    chipA: 'rgba(255, 244, 194, 0.9)',
    chipB: 'rgba(227, 245, 240, 0.9)',
    ring: '0 0 0 3px #f0d96a, 0 0 0 6px #ffb89a, 0 0 0 9px #9fd4c8',
    mark: ['#ca8a04', '#ff8f5c', '#0f766e'],
  },
  {
    id: 'orchid',
    label: 'Orchid Dream',
    swatches: ['#d4a5e8', '#ffb3b8', '#9ba3ff'],
    background: 'linear-gradient(145deg, #f3e4fa 0%, #ffe6e8 50%, #e4e6ff 100%)',
    text: '#2f3448',
    muted: '#7a7588',
    brand: '#9333ea',
    amount: '#9333ea',
    badgeBg: '#d4a5e8',
    badgeText: '#581c87',
    dash: '#d4a5e8',
    chipA: 'rgba(243, 228, 250, 0.9)',
    chipB: 'rgba(255, 230, 232, 0.9)',
    ring: '0 0 0 3px #d4a5e8, 0 0 0 6px #ffb3b8, 0 0 0 9px #9ba3ff',
    mark: ['#9333ea', '#ff8f5c', '#9ba3ff'],
  },
  {
    id: 'midnight',
    label: 'Midnight Candy',
    swatches: ['#2f3448', '#ff8f5c', '#9ba3ff'],
    background: 'linear-gradient(145deg, #2a2438 0%, #3a3050 50%, #1e2233 100%)',
    text: '#f5f2ff',
    muted: '#b0a9c4',
    brand: '#ff9f75',
    amount: '#ff9f75',
    badgeBg: '#ff8f5c',
    badgeText: '#2f3448',
    dash: '#5a4f6a',
    chipA: 'rgba(155, 163, 255, 0.2)',
    chipB: 'rgba(255, 143, 92, 0.2)',
    ring: '0 0 0 3px #ff8f5c, 0 0 0 6px #9ba3ff, 0 0 0 9px #d4a5e8',
    mark: ['#ff8f5c', '#9ba3ff', '#d4a5e8'],
  },
  {
    id: 'mint',
    label: 'Mint Cream',
    swatches: ['#9fd4c8', '#8ec5ff', '#f0d96a'],
    background: 'linear-gradient(145deg, #e3f5f0 0%, #dff0ff 45%, #fff8e0 100%)',
    text: '#2f3448',
    muted: '#6f8580',
    brand: '#0f766e',
    amount: '#0f766e',
    badgeBg: '#9fd4c8',
    badgeText: '#115e59',
    dash: '#9fd4c8',
    chipA: 'rgba(227, 245, 240, 0.95)',
    chipB: 'rgba(223, 240, 255, 0.95)',
    ring: '0 0 0 3px #9fd4c8, 0 0 0 6px #8ec5ff, 0 0 0 9px #f0d96a',
    mark: ['#0f766e', '#3b6fd9', '#ca8a04'],
  },
]

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

function computeRates({ income, frequency, workDays, hoursPerDay }) {
  const amount = Number(income) || 0
  const days = Math.max(Number(workDays) || 1, 1)
  const hours = Math.max(Number(hoursPerDay) || 1, 1)

  let monthly = amount
  if (frequency === 'annual') monthly = amount / 12
  if (frequency === 'hourly') monthly = amount * hours * days

  const perDay = monthly / days
  const perHour = perDay / hours
  const perMinute = perHour / 60
  const perSecond = perMinute / 60

  return { monthly, perDay, perHour, perMinute, perSecond }
}

function formatMoney(value, symbol, decimals = 2) {
  const n = Number(value)
  if (!Number.isFinite(n)) return `${symbol}0.00`
  return `${symbol}${n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

function formatCompactMoney(value, symbol) {
  const n = Number(value)
  if (!Number.isFinite(n)) return `${symbol}0`
  if (Math.abs(n) >= 1e7) return `${symbol}${(n / 1e7).toFixed(2)}Cr`
  if (Math.abs(n) >= 1e5) return `${symbol}${(n / 1e5).toFixed(2)}L`
  if (Math.abs(n) >= 1e3) return `${symbol}${(n / 1e3).toFixed(1)}K`
  return formatMoney(n, symbol, n < 1 ? 3 : 2)
}

function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return 'less than a second of work'
  }

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
  if (parts.length === 0) {
    parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`)
  }

  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function fieldClass() {
  return 'w-full rounded-2xl border-2 px-3.5 py-2.5 text-[15px] font-semibold outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/20'
}

function labelClass() {
  return 'mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]'
}

function sectionClass(tint) {
  const map = {
    peach: 'border-[var(--peach)]/55 bg-[var(--peach-soft)]/35',
    sky: 'border-[var(--sky)]/55 bg-[var(--sky-soft)]/40',
    butter: 'border-[var(--butter)]/70 bg-[var(--butter-soft)]/45',
    lilac: 'border-[var(--lilac)]/55 bg-[var(--lilac-soft)]/40',
    mint: 'border-[var(--mint)]/50 bg-[var(--mint-soft)]/35',
    rose: 'border-[var(--rose)]/45 bg-[var(--rose-soft)]/35',
  }
  const tintCls = map[tint] || 'border-[var(--border)] bg-[var(--bg-elevated)]'
  return `rounded-[1.75rem] border-2 ${tintCls} p-5 shadow-[var(--shadow)] sm:p-6`
}

function btnPrimary() {
  return 'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_6px_0_var(--accent-deep)] transition hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_var(--accent-deep)] disabled:opacity-50'
}

function btnSecondary() {
  return 'inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm font-extrabold text-[var(--text)] transition hover:bg-[var(--bg-muted)] active:scale-[0.98] disabled:opacity-50'
}

export default function App() {
  const initial = useMemo(() => loadPersisted(), [])

  const [income, setIncome] = useState(initial.income)
  const [frequency, setFrequency] = useState(initial.frequency)
  const [currency, setCurrency] = useState(initial.currency)
  const [workDays, setWorkDays] = useState(initial.workDays)
  const [hoursPerDay, setHoursPerDay] = useState(initial.hoursPerDay)
  const [theme, setTheme] = useState(initial.theme)
  const [shareCardTheme, setShareCardTheme] = useState(
    SHARE_CARD_THEMES.some((t) => t.id === initial.shareCardTheme)
      ? initial.shareCardTheme
      : 'sunset',
  )

  // Ticker state
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [preset, setPreset] = useState('break') // 'break' | 'meeting'
  const [attendees, setAttendees] = useState(5)
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)

  // Purchase
  const [itemName, setItemName] = useState('Sneakers')
  const [itemCost, setItemCost] = useState(8000)

  // Outsource
  const [taskName, setTaskName] = useState('Cleaning the House')
  const [taskHours, setTaskHours] = useState(3)
  const [hireCost, setHireCost] = useState(500)

  // Share
  const [shareBusy, setShareBusy] = useState(false)
  const shareCardRef = useRef(null)
  const cardTheme =
    SHARE_CARD_THEMES.find((t) => t.id === shareCardTheme) || SHARE_CARD_THEMES[0]

  const currencyMeta = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]
  const symbol = currencyMeta.symbol

  const rates = useMemo(
    () => computeRates({ income, frequency, workDays, hoursPerDay }),
    [income, frequency, workDays, hoursPerDay],
  )

  const multiplier = preset === 'meeting' ? Math.max(1, Number(attendees) || 1) : 1
  const accrued = elapsed * rates.perSecond * multiplier

  // Theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  // Persist
  useEffect(() => {
    const payload = {
      income,
      frequency,
      currency,
      workDays,
      hoursPerDay,
      theme,
      shareCardTheme,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [income, frequency, currency, workDays, hoursPerDay, theme, shareCardTheme])

  // rAF ticker
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
      return
    }

    const tick = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const delta = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setElapsed((prev) => prev + delta)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running])

  const handleStartPause = useCallback(() => {
    setRunning((r) => !r)
  }, [])

  const handleReset = useCallback(() => {
    setRunning(false)
    setElapsed(0)
    lastTsRef.current = null
  }, [])

  const purchaseSeconds = rates.perSecond > 0 ? Number(itemCost) / rates.perSecond : Infinity
  const purchasePct = rates.monthly > 0 ? Math.min(100, (Number(itemCost) / rates.monthly) * 100) : 0

  const diyValue = rates.perHour * (Number(taskHours) || 0)
  const outsourceCost = Number(hireCost) || 0
  const shouldOutsource = outsourceCost < diyValue && diyValue > 0

  const badge =
    preset === 'meeting'
      ? attendees >= 8
        ? 'Meeting Survivor'
        : 'Calendar Warrior'
      : elapsed >= 900
        ? 'Professional Break Taker'
        : 'Stealth Recharger'

  const downloadShareCard = async () => {
    if (!shareCardRef.current) return
    setShareBusy(true)
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      })
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return

      const file = new File([blob], 'time-worth-card.png', { type: 'image/png' })
      const canShare =
        typeof navigator.share === 'function' &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))

      if (canShare) {
        try {
          await navigator.share({
            files: [file],
            title: "What's My Time Worth?",
            text: `I earned ${formatMoney(accrued, symbol, 2)} in ${formatClock(elapsed)}!`,
          })
          return
        } catch (err) {
          if (err?.name === 'AbortError') return
        }
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'time-worth-card.png'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setShareBusy(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Mixed pastel atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="blob absolute -left-24 -top-20 h-[26rem] w-[26rem] rounded-full opacity-50 blur-3xl"
          style={{ background: 'var(--blob-1)' }}
        />
        <div
          className="blob blob-delay absolute -right-16 top-[18%] h-72 w-72 rounded-full opacity-55 blur-3xl"
          style={{ background: 'var(--blob-2)' }}
        />
        <div
          className="blob blob-delay-2 absolute bottom-8 left-[28%] h-64 w-64 rounded-full opacity-50 blur-3xl"
          style={{ background: 'var(--blob-3)' }}
        />
        <div
          className="blob blob-delay-3 absolute right-[20%] bottom-[22%] h-56 w-56 rounded-full opacity-45 blur-3xl"
          style={{ background: 'var(--blob-4)' }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-[var(--border)] bg-[var(--bg)]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)] shadow-sm wiggle-hover">
              <ClockIcon />
            </span>
            <span className="text-sm font-extrabold tracking-tight sm:text-base">
              Time Worth{' '}
              <span className="text-[var(--accent)]">✦</span>
              <span className="text-[var(--sky)]">✦</span>
              <span className="text-[var(--lilac)]">✦</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className={btnSecondary()}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        {/* Hero + Income Setup */}
        <section className="fade-up mb-10 sm:mb-14">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--butter-soft)] px-3 py-1 text-xs font-extrabold text-[#a16207]">
              soft math
            </span>
            <span className="rounded-full bg-[var(--sky-soft)] px-3 py-1 text-xs font-extrabold text-[#5b63d6]">
              big vibes
            </span>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-extrabold text-[var(--accent-deep)]">
              zero judgment
            </span>
          </div>
          <h1 className="mb-3 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            What&apos;s My{' '}
            <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--sky)] to-[var(--lilac)] bg-clip-text text-transparent">
              Time
            </span>{' '}
            Worth?
          </h1>
          <p className="mb-8 max-w-lg text-base font-semibold text-[var(--text-muted)] sm:text-lg">
            Watch your paycheck dance by the second — meetings, snack runs, and impulse buys
            suddenly get very honest.
          </p>

          <div className={sectionClass('peach')}>
            <h2 className="mb-5 text-xl font-extrabold">Your Numbers</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass()} htmlFor="income">
                  Base Income
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {symbol}
                  </span>
                  <input
                    id="income"
                    type="number"
                    min="0"
                    step="any"
                    value={income}
                    onChange={(e) => setIncome(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`${fieldClass()} pl-8`}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass()} htmlFor="frequency">
                  Pay Frequency
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className={fieldClass()}
                  style={inputStyle}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass()} htmlFor="currency">
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={fieldClass()}
                  style={inputStyle}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass()} htmlFor="workDays">
                  Working Days / Month
                </label>
                <input
                  id="workDays"
                  type="number"
                  min="1"
                  max="31"
                  value={workDays}
                  onChange={(e) => setWorkDays(Number(e.target.value) || 1)}
                  className={fieldClass()}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelClass()} htmlFor="hoursPerDay">
                  Hours / Workday
                </label>
                <input
                  id="hoursPerDay"
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value) || 1)}
                  className={fieldClass()}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Rate breakdown */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Per Day', value: rates.perDay, decimals: 2 },
                { label: 'Per Hour', value: rates.perHour, decimals: 2 },
                { label: 'Per Minute', value: rates.perMinute, decimals: 3 },
                { label: 'Per Second', value: rates.perSecond, decimals: 4 },
              ].map((r, i) => (
                <div
                  key={r.label}
                  className="rounded-2xl border-2 border-white/60 px-3 py-3.5 text-center shadow-sm"
                  style={{ background: RATE_CHIP_COLORS[i].bg }}
                >
                  <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    {RATE_CHIP_COLORS[i].emoji} {r.label}
                  </div>
                  <div
                    className="tabular text-sm font-bold sm:text-base"
                    style={{ color: RATE_CHIP_COLORS[i].fg }}
                  >
                    {formatMoney(r.value, symbol, r.decimals)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ticker */}
        <section className={`${sectionClass('mint')} fade-up mb-6 sm:mb-8`} style={{ animationDelay: '0.05s' }}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">The Ticker</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreset('break')
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                  preset === 'break'
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'bg-white/70 text-[var(--text-muted)]'
                }`}
              >
                Coffee / Bathroom Break
              </button>
              <button
                type="button"
                onClick={() => setPreset('meeting')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                  preset === 'meeting'
                    ? 'bg-[var(--sky)] text-white shadow-sm'
                    : 'bg-white/70 text-[var(--text-muted)]'
                }`}
              >
                Useless Meeting
              </button>
            </div>
          </div>

          {preset === 'meeting' && (
            <div className="mb-5 max-w-xs">
              <label className={labelClass()} htmlFor="attendees">
                Attendees (burn multiplier)
              </label>
              <input
                id="attendees"
                type="number"
                min="1"
                value={attendees}
                onChange={(e) => setAttendees(Math.max(1, Number(e.target.value) || 1))}
                className={fieldClass()}
                style={inputStyle}
              />
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                Burn rate × {multiplier} people = {formatMoney(rates.perSecond * multiplier, symbol, 4)}
                /sec
              </p>
            </div>
          )}

          <div
            className={`mx-auto max-w-md rounded-[2rem] border-2 border-white/80 bg-white/70 px-6 py-8 text-center backdrop-blur-sm ${
              running ? 'ticker-live' : ''
            }`}
          >
            <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
              {running ? 'ka-ching…' : 'hit start whenever'}
            </div>
            <div className="tabular mb-4 text-5xl font-bold tracking-tight text-[var(--text)] sm:text-6xl">
              {formatClock(elapsed)}
            </div>
            <div className="text-3xl font-bold sm:text-4xl">
              <span className="tabular inline-block bg-gradient-to-r from-[var(--accent)] via-[var(--sky)] to-[var(--lilac)] bg-clip-text text-transparent">
                {formatMoney(accrued, symbol, 3)}
              </span>
            </div>
            {multiplier > 1 && (
              <p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">
                Team burn · your share {formatMoney(elapsed * rates.perSecond, symbol, 3)}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={handleStartPause} className={btnPrimary()}>
              {running ? (
                <>
                  <PauseIcon /> Pause
                </>
              ) : (
                <>
                  <PlayIcon /> Start Ticker
                </>
              )}
            </button>
            <button type="button" onClick={handleReset} className={btnSecondary()}>
              <ResetIcon /> Reset
            </button>
          </div>
        </section>

        <div className="mb-6 grid gap-6 sm:mb-8 lg:grid-cols-2">
          {/* Hours to Buy */}
          <section className={`${sectionClass('sky')} fade-up`} style={{ animationDelay: '0.1s' }}>
            <h2 className="mb-1 text-xl font-extrabold">Hours-to-Buy</h2>
            <p className="mb-5 text-sm font-semibold text-[var(--text-muted)]">
              That cute purchase… how many hours of you is it?
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelClass()} htmlFor="itemName">
                  Item Name
                </label>
                <input
                  id="itemName"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className={fieldClass()}
                  style={inputStyle}
                  placeholder="e.g. Latest Smartphone"
                />
              </div>
              <div>
                <label className={labelClass()} htmlFor="itemCost">
                  Item Cost
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {symbol}
                  </span>
                  <input
                    id="itemCost"
                    type="number"
                    min="0"
                    step="any"
                    value={itemCost}
                    onChange={(e) =>
                      setItemCost(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className={`${fieldClass()} pl-8`}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border-2 border-white/70 bg-white/65 p-4">
              <p className="text-sm font-semibold leading-relaxed">
                {itemName.trim() || 'This item'} costs you{' '}
                <span className="font-extrabold text-[#5b63d6]">
                  {formatDuration(purchaseSeconds)}
                </span>{' '}
                of work.
              </p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs font-bold text-[var(--text-muted)]">
                  <span>% of monthly earnings</span>
                  <span className="tabular">{purchasePct.toFixed(1)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[var(--lilac-soft)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${purchasePct}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--sky), var(--lilac))',
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Outsource */}
          <section className={`${sectionClass('lilac')} fade-up`} style={{ animationDelay: '0.15s' }}>
            <h2 className="mb-1 text-xl font-extrabold">Worth Outsourcing?</h2>
            <p className="mb-5 text-sm font-semibold text-[var(--text-muted)]">
              Should you DIY… or hand it off and reclaim your day?
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelClass()} htmlFor="taskName">
                  Task Name
                </label>
                <input
                  id="taskName"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className={fieldClass()}
                  style={inputStyle}
                  placeholder="e.g. Cooking"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass()} htmlFor="taskHours">
                    Hours to DIY
                  </label>
                  <input
                    id="taskHours"
                    type="number"
                    min="0"
                    step="0.25"
                    value={taskHours}
                    onChange={(e) =>
                      setTaskHours(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className={fieldClass()}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass()} htmlFor="hireCost">
                    Hire Cost
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      {symbol}
                    </span>
                    <input
                      id="hireCost"
                      type="number"
                      min="0"
                      step="any"
                      value={hireCost}
                      onChange={(e) =>
                        setHireCost(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className={`${fieldClass()} pl-8`}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between rounded-2xl bg-[var(--lilac-soft)] px-3 py-2.5 text-sm font-semibold">
                <span className="text-[var(--text-muted)]">Your time value</span>
                <span className="tabular font-extrabold">{formatMoney(diyValue, symbol)}</span>
              </div>
              <div className="flex justify-between rounded-2xl bg-[var(--butter-soft)] px-3 py-2.5 text-sm font-semibold">
                <span className="text-[var(--text-muted)]">Cost to hire</span>
                <span className="tabular font-extrabold">{formatMoney(outsourceCost, symbol)}</span>
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-center text-sm font-extrabold ${
                  shouldOutsource
                    ? 'bg-[var(--mint-soft)] text-[#0f766e]'
                    : 'bg-[var(--rose-soft)] text-[#c2410c]'
                }`}
              >
                {diyValue <= 0
                  ? 'Add hours for a vibe check'
                  : shouldOutsource
                    ? `Outsource it — save ${formatMoney(diyValue - outsourceCost, symbol)}`
                    : `DIY it — hiring costs ${formatMoney(outsourceCost - diyValue, symbol)} more`}
              </div>
              {taskName.trim() && diyValue > 0 && (
                <p className="text-center text-xs font-semibold text-[var(--text-muted)]">
                  For &ldquo;{taskName.trim()}&rdquo;:{' '}
                  {shouldOutsource ? 'pay someone else' : 'keep it yourself'}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Share Card */}
        <section className={`${sectionClass('butter')} fade-up`} style={{ animationDelay: '0.2s' }}>
          <h2 className="mb-1 text-xl font-extrabold">Share Card</h2>
          <p className="mb-5 text-sm font-semibold text-[var(--text-muted)]">
            Flex your break earnings (or meeting trauma) on socials.
          </p>

          <div className="mb-5">
            <p className={labelClass()}>Card theme</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SHARE_CARD_THEMES.map((t) => {
                const selected = t.id === cardTheme.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setShareCardTheme(t.id)}
                    className={`rounded-2xl border-2 px-3 py-2.5 text-left transition ${
                      selected
                        ? 'border-[var(--accent)] bg-white shadow-sm'
                        : 'border-[var(--border)] bg-white/60 hover:border-[var(--accent)]/40'
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="mb-1.5 flex gap-1">
                      {t.swatches.map((c) => (
                        <span
                          key={c}
                          className="h-3.5 w-3.5 rounded-full border border-black/5"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span className="block text-xs font-extrabold text-[var(--text)]">
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div
              ref={shareCardRef}
              className="w-full max-w-sm overflow-hidden rounded-[1.75rem]"
              style={{
                background: cardTheme.background,
                color: cardTheme.text,
                border: '3px solid transparent',
                boxShadow: cardTheme.ring,
              }}
            >
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-extrabold tracking-wide"
                    style={{ color: cardTheme.brand }}
                  >
                    What&apos;s My Time Worth?
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{ background: cardTheme.badgeBg, color: cardTheme.badgeText }}
                  >
                    {badge}
                  </span>
                </div>
                <p className="mb-1 text-sm font-bold" style={{ color: cardTheme.muted }}>
                  {preset === 'meeting' ? 'Meeting burn' : 'Break earnings'}
                </p>
                <p
                  className="tabular mb-1 text-4xl font-bold"
                  style={{ color: cardTheme.amount }}
                >
                  {formatMoney(accrued, symbol, 2)}
                </p>
                <p
                  className="tabular mb-6 text-lg font-bold"
                  style={{ color: cardTheme.text }}
                >
                  in {formatClock(elapsed)}
                  {multiplier > 1 ? ` · ${multiplier} people` : ''}
                </p>
                <div
                  className="grid grid-cols-2 gap-3 pt-4 text-xs"
                  style={{ borderTop: `2px dashed ${cardTheme.dash}` }}
                >
                  <div className="rounded-xl p-2" style={{ background: cardTheme.chipA }}>
                    <div className="font-bold" style={{ color: cardTheme.muted }}>
                      Hourly rate
                    </div>
                    <div className="tabular font-extrabold" style={{ color: cardTheme.text }}>
                      {formatCompactMoney(rates.perHour, symbol)}
                    </div>
                  </div>
                  <div className="rounded-xl p-2" style={{ background: cardTheme.chipB }}>
                    <div className="font-bold" style={{ color: cardTheme.muted }}>
                      Monthly
                    </div>
                    <div className="tabular font-extrabold" style={{ color: cardTheme.text }}>
                      {formatCompactMoney(rates.monthly, symbol)}
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-center text-[10px] font-extrabold tracking-widest">
                  <span style={{ color: cardTheme.mark[0] }}>TIME</span>{' '}
                  <span style={{ color: cardTheme.mark[1] }}>WORTH</span>{' '}
                  <span style={{ color: cardTheme.mark[2] }}>✦</span>
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:max-w-xs">
              <p className="text-sm font-semibold text-[var(--text-muted)]">
                Pick a theme, run the ticker, then download or share. Choice is saved for next time.
              </p>
              <button
                type="button"
                onClick={downloadShareCard}
                disabled={shareBusy}
                className={btnPrimary()}
              >
                {shareBusy ? 'Making magic…' : 'Download / Share PNG'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[var(--border)] py-6 text-center text-xs font-bold text-[var(--text-muted)]">
        Time Worth · made for snack breaks · data stays on your device
      </footer>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

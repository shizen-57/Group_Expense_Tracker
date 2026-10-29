import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner@2.0.3'
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BrainCircuit,
  Check,
  Gauge,
  Loader2,
  Play,
  Repeat,
  RefreshCw,
  Sparkles,
  Target,
  Users,
  Wand2,
} from 'lucide-react'
import { api } from '../../utils/api'
import { executeAgentAction, type AgentAction, type AppPage } from '../../utils/ai/agentActions'
import { useCopilot } from '../copilot/CopilotPanel'

interface CommandCenterPageProps {
  accessToken: string
  userName: string
  onNavigate: (page: AppPage, groupId?: string) => void
}

const fmt = (n: number) => `${n < 0 ? '-' : ''}৳${Math.abs(Math.round((n || 0) * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`

const PROMPTS = [
  'Set my food budget to 5000',
  'Who owes me money and how much?',
  'Settle everything I owe',
  'Where is my money going this month?',
]

function HealthRing({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * score) / 100}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" textAnchor="middle" className="fill-white" fontSize="28" fontWeight="600">{score}</text>
      <text x="60" y="78" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" letterSpacing="2">HEALTH</text>
    </svg>
  )
}

function Section({ title, icon: Icon, children, aside }: { title: string; icon: any; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500">{children}</p>

export function CommandCenterPage({ accessToken, userName, onNavigate }: CommandCenterPageProps) {
  const queryClient = useQueryClient()
  const { openCopilot } = useCopilot()
  const [prompt, setPrompt] = useState('')
  const [actionState, setActionState] = useState<Record<string, 'running' | 'done' | 'failed'>>({})

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['autopilot', accessToken],
    queryFn: () => api.getAutopilot(accessToken),
    enabled: !!accessToken,
    staleTime: 60 * 1000,
  })

  const run = async (action: AgentAction) => {
    setActionState((s) => ({ ...s, [action.id]: 'running' }))
    try {
      await executeAgentAction(accessToken, action, { queryClient, navigate: onNavigate })
      setActionState((s) => ({ ...s, [action.id]: 'done' }))
      toast.success(action.summary)
    } catch (e: any) {
      setActionState((s) => ({ ...s, [action.id]: 'failed' }))
      toast.error(e?.message || 'Action failed')
    }
  }

  const runAll = async () => {
    for (const action of data?.actions || []) {
      if (actionState[action.id] !== 'done') await run(action)
    }
  }

  const submit = (text: string) => {
    if (!text.trim()) return
    openCopilot(text.trim())
    setPrompt('')
  }

  const firstName = userName?.split(' ')[0] || 'there'
  const pendingActions: AgentAction[] = (data?.actions || []).filter((a: AgentAction) => actionState[a.id] !== 'done')

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* Hero: command bar + autopilot headline */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-gray-900 via-indigo-950 to-emerald-950 p-6 text-white sm:p-10"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
              <BrainCircuit className="h-4 w-4" /> Autopilot
            </div>
            <div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">Hey {firstName}, I've got this.</h1>
              <p className="mt-4 text-white/70">
                {isLoading ? 'Scanning every group, friend, expense and budget…' : data?.headline || 'Your AI money operator is ready.'}
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit(prompt)
              }}
              className="flex items-center gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/20 focus-within:ring-emerald-400"
            >
              <Sparkles className="ml-3 h-5 w-5 shrink-0 text-emerald-300" />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask or command anything — “I paid 900 for pizza in Flatmates”"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/40 outline-none sm:text-base"
              />
              <button type="submit" className="rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-900 hover:bg-white/90">
                Go
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <button key={p} onClick={() => submit(p)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">
                  {p}
                </button>
              ))}
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-6 rounded-3xl border border-white/15 bg-white/5 p-6">
              <HealthRing score={data.healthScore.score} />
              <ul className="max-w-[220px] space-y-1.5 text-xs text-white/70">
                {data.healthScore.reasons.slice(0, 4).map((r: string) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.section>

      {error && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Autopilot is unavailable right now ({(error as Error).message}). The Copilot can still help — press <kbd>⌘K</kbd>.
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-gray-200 bg-white py-16 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> Building your briefing…
        </div>
      )}

      {data && (
        <>
          {/* Position */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Owed to you', value: data.position.totalOwedToYou, icon: ArrowDownLeft, tone: 'text-emerald-600' },
              { label: 'You owe', value: data.position.totalYouOwe, icon: ArrowUpRight, tone: 'text-rose-600' },
              { label: 'Net position', value: data.position.net, icon: Gauge, tone: data.position.net >= 0 ? 'text-emerald-600' : 'text-rose-600' },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  {s.label} <s.icon className={`h-4 w-4 ${s.tone}`} />
                </div>
                <p className={`mt-3 text-3xl font-semibold ${s.tone}`}>{fmt(s.value)}</p>
              </div>
            ))}
          </div>

          {/* Autopilot actions */}
          <Section
            title="Autopilot actions"
            icon={Wand2}
            aside={
              <div className="flex items-center gap-2">
                <button onClick={() => refetch()} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Refresh briefing">
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
                {pendingActions.length > 1 && (
                  <button onClick={runAll} className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
                    <Play className="h-3 w-3" /> Run all
                  </button>
                )}
              </div>
            }
          >
            {data.actions.length === 0 ? (
              <Empty>Nothing needs your attention. Debts are settled and budgets look healthy.</Empty>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {data.actions.map((a: AgentAction) => {
                  const state = actionState[a.id]
                  return (
                    <div key={a.id} className={`flex items-center gap-3 rounded-2xl border p-4 ${state === 'done' ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'}`}>
                      <p className="flex-1 text-sm text-gray-800">{a.summary}</p>
                      {state === 'done' ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <button
                          onClick={() => run(a)}
                          disabled={state === 'running'}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {state === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                          {state === 'failed' ? 'Retry' : 'Run'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Section>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Settlement plan */}
            <Section title="Settlement plan" icon={Users}>
              {data.owedToYou.length + data.youOwe.length === 0 ? (
                <Empty>All group balances are settled.</Empty>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {[...data.owedToYou.map((d: any) => ({ ...d, dir: 'in' })), ...data.youOwe.map((d: any) => ({ ...d, dir: 'out' }))].map((d: any) => (
                    <li key={`${d.dir}-${d.groupId}-${d.personId}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <button onClick={() => onNavigate('groups', d.groupId)} className="text-left">
                        <p className="font-medium text-gray-900">{d.dir === 'in' ? `${d.personName} owes you` : `You owe ${d.personName}`}</p>
                        <p className="text-xs text-gray-500">{d.groupName}</p>
                      </button>
                      <span className={`font-semibold ${d.dir === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(d.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Spending pulse */}
            <Section title="Spending pulse" icon={Gauge}>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'This month', value: data.spending.thisMonth },
                  { label: 'Projected', value: data.spending.projectedMonthTotal },
                  { label: 'Last month', value: data.spending.lastMonth },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="mt-1 font-semibold text-gray-900">{fmt(s.value)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {data.spending.topCategories.length === 0 && <Empty>No personal expenses yet this month.</Empty>}
                {data.spending.topCategories.map((c: any) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="capitalize">{c.category}</span>
                      <span>{fmt(c.amount)} · {Math.round(c.share)}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.min(100, c.share)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Budget forecasts */}
            <Section title="Budget forecasts" icon={Target}>
              {data.budgetForecasts.length === 0 ? (
                <Empty>No budgets this month. Ask the Copilot: “set my food budget to 5000”.</Empty>
              ) : (
                <div className="space-y-4">
                  {data.budgetForecasts.map((b: any) => {
                    const tone = b.status === 'over' ? 'bg-rose-500' : b.status === 'at_risk' ? 'bg-amber-400' : 'bg-emerald-500'
                    const label = b.status === 'over' ? 'Over budget' : b.status === 'at_risk' ? `Heading for ${fmt(b.projected)}` : 'On track'
                    return (
                      <div key={b.budgetId}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize text-gray-900">{b.category}</span>
                          <span className="text-gray-600">{fmt(b.spent)} / {fmt(b.limit)}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gray-100">
                          <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.min(100, (b.spent / b.limit) * 100)}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{label} · {fmt(b.dailyAllowance)}/day left to stay within budget</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            {/* Anomalies + recurring */}
            <Section title="Signals" icon={AlertTriangle}>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gray-400">Unusual purchases</p>
                  {data.anomalies.length === 0 ? (
                    <Empty>Nothing unusual in the last 30 days.</Empty>
                  ) : (
                    data.anomalies.map((a: any) => (
                      <p key={a.id} className="text-sm text-gray-700">
                        <span className="font-medium">{a.description}</span> — {fmt(a.amount)}, {a.ratio}× your typical {a.category} spend
                      </p>
                    ))
                  )}
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-gray-400">
                    <Repeat className="h-3 w-3" /> Recurring
                  </p>
                  {data.recurring.length === 0 ? (
                    <Empty>No recurring expenses detected yet.</Empty>
                  ) : (
                    data.recurring.map((r: any) => (
                      <p key={r.name} className="text-sm text-gray-700">
                        <span className="font-medium">{r.name}</span> ≈ {fmt(r.averageAmount)} · next around{' '}
                        {new Date(r.nextExpected).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </Section>
          </div>

          {/* Groups */}
          <Section title="Your groups" icon={Users}>
            {data.groups.length === 0 ? (
              <Empty>No groups yet. Try “create a group called Flatmates”.</Empty>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.groups.map((g: any) => (
                  <button key={g.id} onClick={() => onNavigate('groups', g.id)} className="rounded-2xl border border-gray-200 p-4 text-left hover:border-emerald-300 hover:shadow-sm">
                    <p className="font-medium text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.members} members · {fmt(g.totalSpent)} spent</p>
                    <p className={`mt-2 text-sm font-semibold ${g.yourNet > 0 ? 'text-emerald-600' : g.yourNet < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                      {g.yourNet > 0 ? `You're owed ${fmt(g.yourNet)}` : g.yourNet < 0 ? `You owe ${fmt(-g.yourNet)}` : 'Settled up'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  )
}

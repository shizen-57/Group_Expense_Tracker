import { ActivityList } from '../activity/ActivityList'
import { BalanceSummary } from '../activity/BalanceSummary'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Clock, Download } from 'lucide-react'

interface ActivityPageProps {
  activityData: any
  loading: boolean
  onGroupClick: (groupId: string) => void
}

export function ActivityPage({ activityData, loading, onGroupClick }: ActivityPageProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 pb-16">
        <section className="rounded-[32px] border border-dashed border-emerald-200 bg-white p-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-emerald-500 animate-pulse" />
          <p className="mt-6 text-gray-600">Pulling your ledger...</p>
        </section>
      </div>
    )
  }

  if (!activityData) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 pb-16 text-center text-gray-500">
        No activity data yet. Log expenses or invite teammates to get movement.
      </div>
    )
  }

  const totalBalance = activityData.totalBalance || 0
  const totalOwed = activityData.totalOwed || 0
  const totalReceiving = activityData.totalReceiving || 0
  const activityCount = Array.isArray(activityData.activities) ? activityData.activities.length : 0

  const heroMetrics = [
    { label: 'Live entries', value: activityCount.toString(), hint: 'Last 90 days' },
    { label: 'Net position', value: `৳${Math.abs(totalBalance).toFixed(0)}`, hint: totalBalance >= 0 ? 'Net receiving' : 'Net owing' },
    { label: 'Credits', value: `৳${totalReceiving.toFixed(0)}`, hint: 'Friends owe you' }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-gray-900 via-slate-900 to-emerald-900 p-10 text-white">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.6em] text-emerald-200">Activity</p>
            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">Mission log for every settlement</h1>
            <p className="text-white/70 max-w-2xl">Audit every move, filter by squads, and export a clean CSV whenever finance asks.</p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full bg-white text-gray-900 hover:bg-white/90">
                Export feed
              </Button>
              <Button variant="secondary" className="rounded-full border-white/40 text-white hover:bg-white/10">
                Subscribe to alerts
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                <p className="text-xs text-white/60 mt-1">{metric.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Live feed</p>
                <h2 className="text-2xl font-semibold text-gray-900">Recent activity</h2>
                <p className="text-sm text-gray-500">{activityCount} updates • Chronological</p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" /> Snapshot
              </Button>
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="rounded-full bg-white px-3 py-1">All</span>
                <span className="rounded-full px-3 py-1 hover:bg-white">Settlements</span>
                <span className="rounded-full px-3 py-1 hover:bg-white">New groups</span>
                <span className="rounded-full px-3 py-1 hover:bg-white">High spend</span>
              </div>
            </div>
            <ActivityList activities={activityData.activities || []} onGroupClick={onGroupClick} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-3xl border border-gray-200 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Balance lens</p>
                <h3 className="text-xl font-semibold text-gray-900">Network snapshot</h3>
              </div>
              <BalanceSummary totalBalance={totalBalance} totalOwed={totalOwed} totalReceiving={totalReceiving} />
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-gray-200 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Playbook</p>
                <h3 className="text-xl font-semibold text-gray-900">Need-to-do next</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Ping crews with open payables ≥ ৳5K.</div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Export ledger for finance Monday a.m.</div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Run Simplify debts if 10+ entries logged today.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

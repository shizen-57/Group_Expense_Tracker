// AI Copilot + Autopilot engine
//
// The Copilot turns natural language into concrete, validated actions across the
// whole app (personal expenses, group expenses, payments, budgets, groups, friends,
// navigation). Actions are proposed here and executed by the client through the
// existing REST endpoints, so all business rules stay in one place.
//
// The Autopilot analyses everything the user is involved in (all groups, friends,
// personal spending, budgets) and produces a briefing plus one-click actions.
// It is fully deterministic, so it works even when no AI provider is configured.

type KV = {
  get: (key: string) => Promise<{ value: any }>
  set: (key: string, value: any) => Promise<void>
}

export interface CopilotDeps {
  kv: KV
  requireAuth: any
  callAI: (prompt: string, systemInstruction?: string) => Promise<string>
  parseBalanceKey: (key: string) => { creditorId: string; debtorId: string }
  generateId: () => string
}

export type ActionType =
  | 'add_personal_expense'
  | 'delete_personal_expense'
  | 'add_group_expense'
  | 'create_group'
  | 'add_group_member'
  | 'record_payment'
  | 'simplify_debts'
  | 'create_budget'
  | 'add_friend'
  | 'navigate'

export interface AgentAction {
  id: string
  type: ActionType
  params: Record<string, any>
  summary: string
  risk: 'safe' | 'write'
}

interface Person {
  id: string
  name: string
  username: string
}

interface GroupWorld {
  id: string
  name: string
  description: string
  createdBy: string
  members: Person[]
  // debtor owes creditor `amount`
  debts: { debtorId: string; creditorId: string; amount: number }[]
  expenseCount: number
  totalSpent: number
  recentExpenses: { description: string; amount: number; paidBy: string; category: string; createdAt: string }[]
}

interface World {
  me: Person
  now: Date
  groups: GroupWorld[]
  friends: (Person & { email: string; balance: number })[]
  personalExpenses: { id: string; description: string; amount: number; category: string; createdAt: string }[]
  budgets: { id: string; category: string; limit: number; month: number; year: number }[]
}

const PAGES = ['command', 'dashboard', 'expenses', 'groups', 'friends', 'activity', 'profile', 'ai-insights'] as const

// Category ids match expenseCategories in src/components/groups/ExpenseCategories.tsx
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'pizza', 'burger', 'coffee', 'cafe', 'snack', 'meal', 'biryani', 'kacchi', 'tea'],
  groceries: ['grocery', 'groceries', 'supermarket', 'shwapno', 'vegetables', 'bazar'],
  shopping: ['shopping', 'clothes', 'shoes', 'sneakers', 'kurta', 'panjabi', 'daraz', 'amazon', 'mall', 'headphones'],
  transport: ['uber', 'pathao', 'taxi', 'cab', 'bus', 'train', 'fuel', 'petrol', 'rickshaw', 'cng', 'metro', 'transport', 'parking'],
  entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'party', 'entertainment'],
  utilities: ['electricity', 'water', 'internet', 'wifi', 'bill', 'utility', 'utilities', 'phone', 'mobile', 'recharge'],
  housing: ['rent', 'house', 'apartment', 'flat', 'housing'],
  travel: ['hotel', 'trip', 'travel', 'resort', 'tour', 'airbnb', 'flight'],
  gifts: ['gift', 'gifts', 'present', 'birthday'],
  healthcare: ['doctor', 'medicine', 'pharmacy', 'hospital', 'health', 'healthcare', 'gym'],
}

const CATEGORY_ALIASES: Record<string, string> = {
  rent: 'housing',
  health: 'healthcare',
  medical: 'healthcare',
  grocery: 'groceries',
  gift: 'gifts',
  dining: 'food',
  bills: 'utilities',
}

export function normalizeCategory(category: unknown, fallbackText = ''): string {
  const c = String(category || '').trim().toLowerCase()
  if (c && (c in CATEGORY_KEYWORDS || c === 'other')) return c
  if (c && CATEGORY_ALIASES[c]) return CATEGORY_ALIASES[c]
  return inferCategory(`${c} ${fallbackText}`)
}

const round2 = (n: number) => Math.round(n * 100) / 100
const toNumber = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}
const fmt = (n: number) => `${n < 0 ? '-' : ''}৳${Math.abs(round2(n)).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

export function inferCategory(text: string): string {
  const t = norm(text)
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => new RegExp(`\\b${w}\\b`).test(t))) return category
  }
  return 'other'
}

// ---------------------------------------------------------------------------
// World snapshot
// ---------------------------------------------------------------------------

async function buildWorld(deps: CopilotDeps, userId: string): Promise<World> {
  const { kv, parseBalanceKey } = deps
  const userCache = new Map<string, Person>()
  const getPerson = async (id: string): Promise<Person> => {
    if (userCache.has(id)) return userCache.get(id)!
    const u = (await kv.get(`user:${id}`)).value
    const person = { id, name: u?.name || 'Unknown', username: u?.username || '' }
    userCache.set(id, person)
    return person
  }

  const me = await getPerson(userId)

  const groupIds: string[] = (await kv.get(`user:${userId}:groups`)).value || []
  const groups: GroupWorld[] = []
  for (const groupId of groupIds) {
    const group = (await kv.get(`group:${groupId}`)).value
    if (!group?.id) continue
    const memberIds: string[] = (await kv.get(`group:${groupId}:members`)).value || []
    if (!memberIds.includes(userId)) continue
    const members = await Promise.all(memberIds.map(getPerson))
    const expenses: any[] = (await kv.get(`group:${groupId}:expenses`)).value || []
    const balanceMap: Record<string, number> = (await kv.get(`group:${groupId}:balances`)).value || {}

    const debts = Object.entries(balanceMap)
      .map(([key, value]) => {
        const { creditorId, debtorId } = parseBalanceKey(key)
        return { creditorId, debtorId, amount: round2(toNumber(value)) }
      })
      .filter((d) => d.amount > 0.009 && d.creditorId !== d.debtorId)

    groups.push({
      id: group.id,
      name: group.name,
      description: group.description || '',
      createdBy: group.createdBy,
      members,
      debts,
      expenseCount: expenses.length,
      totalSpent: round2(expenses.reduce((s, e) => s + toNumber(e.amount), 0)),
      recentExpenses: expenses.slice(0, 8).map((e) => ({
        description: e.description,
        amount: toNumber(e.amount),
        paidBy: e.paidBy,
        category: e.category || 'other',
        createdAt: e.createdAt,
      })),
    })
  }

  const friendIds: string[] = (await kv.get(`user:${userId}:friends`)).value || []
  const friendBalances: Record<string, number> = (await kv.get(`user:${userId}:balances`)).value || {}
  const friends: World['friends'] = []
  for (const friendId of friendIds) {
    const f = (await kv.get(`user:${friendId}`)).value
    if (!f) continue
    friends.push({
      id: friendId,
      name: f.name,
      username: f.username,
      email: f.email,
      balance: round2(toNumber(friendBalances[friendId])),
    })
  }

  const personalExpenses = ((await kv.get(`user:${userId}:personal_expenses`)).value || [])
    .map((e: any) => ({
      id: e.id,
      description: e.description || '',
      amount: toNumber(e.amount),
      category: (e.category || 'other').toLowerCase(),
      createdAt: e.createdAt,
    }))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const budgets = ((await kv.get(`user:${userId}:budgets`)).value || []).map((b: any) => ({
    id: b.id,
    category: String(b.category || '').toLowerCase(),
    limit: toNumber(b.limit),
    month: toNumber(b.month),
    year: toNumber(b.year),
  }))

  return { me, now: new Date(), groups, friends, personalExpenses, budgets }
}

// ---------------------------------------------------------------------------
// Autopilot
// ---------------------------------------------------------------------------

function simplifyTransfers(group: GroupWorld) {
  const net: Record<string, number> = {}
  group.members.forEach((m) => (net[m.id] = 0))
  for (const d of group.debts) {
    net[d.creditorId] = (net[d.creditorId] || 0) + d.amount
    net[d.debtorId] = (net[d.debtorId] || 0) - d.amount
  }
  const creditors = Object.entries(net).filter(([, v]) => v > 0.01).sort((a, b) => b[1] - a[1])
  const debtors = Object.entries(net).filter(([, v]) => v < -0.01).sort((a, b) => a[1] - b[1])
  const transfers: { from: string; to: string; amount: number }[] = []
  let i = 0
  let j = 0
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i][1], -debtors[j][1])
    if (amount > 0.01) transfers.push({ from: debtors[j][0], to: creditors[i][0], amount: round2(amount) })
    creditors[i][1] -= amount
    debtors[j][1] += amount
    if (creditors[i][1] < 0.01) i++
    if (debtors[j][1] > -0.01) j++
  }
  return { net, transfers }
}

const sameMonth = (iso: string, month: number, year: number) => {
  const d = new Date(iso)
  return d.getMonth() === month && d.getFullYear() === year
}

export function computeAutopilot(world: World, newId: () => string) {
  const { me, now, groups, personalExpenses, budgets } = world
  const month = now.getMonth()
  const year = now.getFullYear()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const nameOf = (group: GroupWorld, id: string) =>
    id === me.id ? 'You' : group.members.find((m) => m.id === id)?.name || 'Someone'

  // --- Settlements across every group
  const youOwe: any[] = []
  const owedToYou: any[] = []
  const simplifyOpportunities: any[] = []
  for (const group of groups) {
    const { net, transfers } = simplifyTransfers(group)
    for (const t of transfers) {
      if (t.from === me.id) {
        youOwe.push({ groupId: group.id, groupName: group.name, personId: t.to, personName: nameOf(group, t.to), amount: t.amount })
      } else if (t.to === me.id) {
        owedToYou.push({ groupId: group.id, groupName: group.name, personId: t.from, personName: nameOf(group, t.from), amount: t.amount })
      }
    }
    if (group.debts.length > transfers.length) {
      simplifyOpportunities.push({
        groupId: group.id,
        groupName: group.name,
        before: group.debts.length,
        after: transfers.length,
      })
    }
    // keep for briefing
    ;(group as any)._net = net[me.id] || 0
  }
  const totalYouOwe = round2(youOwe.reduce((s, x) => s + x.amount, 0))
  const totalOwedToYou = round2(owedToYou.reduce((s, x) => s + x.amount, 0))

  // --- Spending pulse
  const thisMonthExpenses = personalExpenses.filter((e) => sameMonth(e.createdAt, month, year))
  const lastMonthDate = new Date(year, month - 1, 1)
  const lastMonthExpenses = personalExpenses.filter((e) =>
    sameMonth(e.createdAt, lastMonthDate.getMonth(), lastMonthDate.getFullYear()),
  )
  const spentThisMonth = round2(thisMonthExpenses.reduce((s, e) => s + e.amount, 0))
  const spentLastMonth = round2(lastMonthExpenses.reduce((s, e) => s + e.amount, 0))
  const lastMonthSamePeriod = round2(
    lastMonthExpenses.filter((e) => new Date(e.createdAt).getDate() <= dayOfMonth).reduce((s, e) => s + e.amount, 0),
  )
  const projectedMonthTotal = round2((spentThisMonth / Math.max(dayOfMonth, 1)) * daysInMonth)

  const byCategory: Record<string, number> = {}
  thisMonthExpenses.forEach((e) => (byCategory[e.category] = (byCategory[e.category] || 0) + e.amount))
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount: round2(amount), share: spentThisMonth ? round2((amount / spentThisMonth) * 100) : 0 }))

  // --- Budget forecasts
  const activeBudgets = budgets.filter((b) => b.month === month && b.year === year)
  const budgetForecasts = activeBudgets.map((b) => {
    const spent = round2(byCategory[b.category] || 0)
    const projected = round2((spent / Math.max(dayOfMonth, 1)) * daysInMonth)
    const status = spent > b.limit ? 'over' : projected > b.limit ? 'at_risk' : 'on_track'
    const dailyAllowance = round2(Math.max(b.limit - spent, 0) / Math.max(daysInMonth - dayOfMonth + 1, 1))
    return { budgetId: b.id, category: b.category, limit: b.limit, spent, projected, status, dailyAllowance }
  })

  // --- Recurring detection
  const recurringMap: Record<string, typeof personalExpenses> = {}
  personalExpenses.forEach((e) => {
    const key = norm(e.description).replace(/\d+/g, '').trim()
    if (key.length >= 3) (recurringMap[key] ||= []).push(e)
  })
  const recurringKeys = new Set<string>()
  const recurring = Object.entries(recurringMap)
    .map(([key, items]) => {
      const months = new Set(items.map((e) => `${new Date(e.createdAt).getFullYear()}-${new Date(e.createdAt).getMonth()}`))
      const avg = items.reduce((s, e) => s + e.amount, 0) / items.length
      const consistent = items.every((e) => Math.abs(e.amount - avg) <= avg * 0.25)
      const sorted = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      const first = new Date(sorted[0].createdAt).getTime()
      const last = new Date(sorted[sorted.length - 1].createdAt).getTime()
      const interval = Math.max((last - first) / Math.max(sorted.length - 1, 1), 86400000)
      let next = last + interval
      while (next < now.getTime()) next += interval
      if (items.length >= 3 && months.size >= 2 && consistent) recurringKeys.add(key)
      return {
        name: items[0].description,
        category: items[0].category,
        averageAmount: Math.round(avg),
        occurrences: items.length,
        nextExpected: new Date(next).toISOString(),
        _key: key,
      }
    })
    .filter((r) => recurringKeys.has(r._key))
    .sort((a, b) => b.averageAmount - a.averageAmount)
    .slice(0, 5)
    .map(({ _key, ...r }) => r)

  // --- Anomalies: unusually large one-off purchases in the last 30 days
  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b)
    const mid = Math.floor(s.length / 2)
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
  }
  const amountsByCategory: Record<string, number[]> = {}
  personalExpenses.forEach((e) => (amountsByCategory[e.category] ||= []).push(e.amount))
  const thirtyDaysAgo = now.getTime() - 30 * 86400000
  const anomalies = personalExpenses
    .filter((e) => new Date(e.createdAt).getTime() >= thirtyDaysAgo)
    .filter((e) => !recurringKeys.has(norm(e.description).replace(/\d+/g, '').trim()))
    .map((e) => {
      const xs = amountsByCategory[e.category] || []
      const m = xs.length >= 3 ? median(xs) : 0
      return { ...e, typical: round2(m), ratio: m > 0 ? round2(e.amount / m) : 0 }
    })
    .filter((e) => e.ratio >= 3)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3)

  // --- Health score
  let score = 70
  const reasons: string[] = []
  const overCount = budgetForecasts.filter((b) => b.status === 'over').length
  const riskCount = budgetForecasts.filter((b) => b.status === 'at_risk').length
  if (overCount) { score -= Math.min(30, overCount * 10); reasons.push(`${overCount} budget(s) already exceeded`) }
  if (riskCount) { score -= riskCount * 5; reasons.push(`${riskCount} budget(s) on track to overspend`) }
  if (activeBudgets.length) { score += 5; reasons.push('Budgets are set for this month') }
  else reasons.push('No budgets set for this month')
  if (lastMonthSamePeriod > 0) {
    const change = (spentThisMonth - lastMonthSamePeriod) / lastMonthSamePeriod
    if (change > 0.2) { score -= 10; reasons.push(`Spending is ${Math.round(change * 100)}% above last month's pace`) }
    else if (change < -0.1) { score += 10; reasons.push(`Spending is ${Math.round(-change * 100)}% below last month's pace`) }
  }
  if (totalYouOwe > 0) { score -= Math.min(10, youOwe.length * 3); reasons.push(`${youOwe.length} open debt(s) you owe`) }
  if (!youOwe.length && !owedToYou.length && groups.length) { score += 5; reasons.push('All group balances are settled') }
  if (anomalies.length) { score -= 5; reasons.push(`${anomalies.length} unusual purchase(s) detected`) }
  score = Math.max(0, Math.min(100, Math.round(score)))

  // --- One-click actions
  const actions: AgentAction[] = []
  for (const d of youOwe) {
    actions.push({
      id: newId(),
      type: 'record_payment',
      params: { groupId: d.groupId, fromMemberId: me.id, toMemberId: d.personId, amount: d.amount, note: 'Settled via Autopilot' },
      summary: `Pay ${d.personName} ${fmt(d.amount)} in ${d.groupName}`,
      risk: 'write',
    })
  }
  for (const s of simplifyOpportunities) {
    actions.push({
      id: newId(),
      type: 'simplify_debts',
      params: { groupId: s.groupId },
      summary: `Simplify ${s.groupName}: ${s.before} debts → ${s.after} transfers`,
      risk: 'write',
    })
  }
  const budgeted = new Set(activeBudgets.map((b) => b.category))
  const lastMonthByCategory: Record<string, number> = {}
  lastMonthExpenses.forEach((e) => (lastMonthByCategory[e.category] = (lastMonthByCategory[e.category] || 0) + e.amount))
  Object.entries(lastMonthByCategory)
    .filter(([cat, amt]) => !budgeted.has(cat) && amt > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .forEach(([category, amount]) => {
      const limit = Math.max(500, Math.ceil((amount * 0.9) / 500) * 500)
      actions.push({
        id: newId(),
        type: 'create_budget',
        params: { category, limit },
        summary: `Set a ${fmt(limit)} ${category} budget (last month: ${fmt(amount)})`,
        risk: 'write',
      })
    })

  // --- Headline
  const headlineParts: string[] = []
  if (totalOwedToYou > 0) headlineParts.push(`${fmt(totalOwedToYou)} is owed to you`)
  if (totalYouOwe > 0) headlineParts.push(`you owe ${fmt(totalYouOwe)}`)
  if (spentThisMonth > 0) headlineParts.push(`you've spent ${fmt(spentThisMonth)} this month, heading for ${fmt(projectedMonthTotal)}`)
  if (overCount) headlineParts.push(`${overCount} budget${overCount > 1 ? 's are' : ' is'} over the limit`)
  const headline = headlineParts.length
    ? headlineParts[0].charAt(0).toUpperCase() + headlineParts.join(', ').slice(1) + '.'
    : 'Everything is calm. Add an expense or ask me anything to get started.'

  return {
    generatedAt: now.toISOString(),
    headline,
    healthScore: { score, reasons },
    position: { totalOwedToYou, totalYouOwe, net: round2(totalOwedToYou - totalYouOwe) },
    youOwe,
    owedToYou,
    simplifyOpportunities,
    spending: {
      thisMonth: spentThisMonth,
      lastMonth: spentLastMonth,
      lastMonthSamePeriod,
      projectedMonthTotal,
      topCategories,
    },
    budgetForecasts,
    anomalies,
    recurring,
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: g.members.length,
      totalSpent: g.totalSpent,
      yourNet: round2((g as any)._net || 0),
    })),
    actions,
  }
}

// ---------------------------------------------------------------------------
// Action normalisation: resolve names → ids and validate against the world
// ---------------------------------------------------------------------------

const SELF_WORDS = new Set(['me', 'i', 'myself', 'you', 'self'])

function findGroup(world: World, ref: unknown): GroupWorld | undefined {
  if (!ref) return world.groups.length === 1 ? world.groups[0] : undefined
  const r = String(ref)
  const byId = world.groups.find((g) => g.id === r)
  if (byId) return byId
  const n = norm(r)
  return (
    world.groups.find((g) => norm(g.name) === n) ||
    world.groups.find((g) => norm(g.name).includes(n) || (n.length > 2 && n.includes(norm(g.name))))
  )
}

function findPerson(people: Person[], ref: unknown, me: Person): Person | undefined {
  if (!ref) return undefined
  const r = String(ref)
  if (SELF_WORDS.has(r.toLowerCase())) return me
  const byId = people.find((p) => p.id === r)
  if (byId) return byId
  const n = norm(r.replace(/^@/, ''))
  return (
    people.find((p) => norm(p.username) === n || norm(p.name) === n) ||
    people.find((p) => norm(p.name).split(' ')[0] === n) ||
    people.find((p) => norm(p.name).includes(n) || norm(p.username).includes(n))
  )
}

export function normalizeAction(raw: any, world: World, newId: () => string): AgentAction | { error: string } {
  const type = raw?.type as ActionType
  const p = raw?.params || {}
  const { me } = world
  const base = { id: newId(), type, risk: 'write' as const }

  switch (type) {
    case 'add_personal_expense': {
      const amount = round2(toNumber(p.amount))
      const description = String(p.description || '').trim()
      if (!description || amount <= 0) return { error: 'Personal expense needs a description and a positive amount' }
      const category = normalizeCategory(p.category, description)
      return {
        ...base,
        params: { description, amount, category, notes: String(p.notes || '') },
        summary: `Add personal expense "${description}" — ${fmt(amount)} (${category})`,
      }
    }
    case 'delete_personal_expense': {
      const expense = world.personalExpenses.find((e) => e.id === p.expenseId)
      if (!expense) return { error: 'Could not find that personal expense' }
      return {
        ...base,
        params: { expenseId: expense.id },
        summary: `Delete personal expense "${expense.description}" (${fmt(expense.amount)})`,
      }
    }
    case 'add_group_expense': {
      const group = findGroup(world, p.groupId || p.group)
      if (!group) return { error: `Could not find group "${p.groupId || p.group || ''}"` }
      const amount = round2(toNumber(p.amount))
      const description = String(p.description || '').trim()
      if (!description || amount <= 0) return { error: 'Group expense needs a description and a positive amount' }
      const payer = findPerson(group.members, p.paidBy || 'me', me)
      if (!payer) return { error: `"${p.paidBy}" is not a member of ${group.name}` }

      let participants: Person[] = []
      const rawSplit: unknown[] = Array.isArray(p.splitWith) ? p.splitWith : []
      if (!rawSplit.length || rawSplit.some((x) => /^(all|everyone|everybody)$/i.test(String(x)))) {
        participants = group.members
      } else {
        for (const ref of rawSplit) {
          const person = findPerson(group.members, ref, me)
          if (!person) return { error: `"${ref}" is not a member of ${group.name}` }
          if (!participants.some((x) => x.id === person.id)) participants.push(person)
        }
      }

      // Custom amounts (by id or name) or an equal split with cent-accurate remainder
      const splitAmounts: Record<string, number> = {}
      let splitType = 'equal'
      if (p.splitAmounts && typeof p.splitAmounts === 'object' && Object.keys(p.splitAmounts).length) {
        for (const [ref, value] of Object.entries(p.splitAmounts)) {
          const person = findPerson(group.members, ref, me)
          if (!person) return { error: `"${ref}" is not a member of ${group.name}` }
          splitAmounts[person.id] = round2(toNumber(value))
          if (!participants.some((x) => x.id === person.id)) participants.push(person)
        }
        participants = participants.filter((x) => splitAmounts[x.id] > 0)
        const total = round2(Object.values(splitAmounts).reduce((s, v) => s + v, 0))
        if (Math.abs(total - amount) > 0.05) return { error: `Split amounts add up to ${fmt(total)}, not ${fmt(amount)}` }
        splitType = 'unequal'
      } else {
        const share = Math.floor((amount / participants.length) * 100) / 100
        participants.forEach((x) => (splitAmounts[x.id] = share))
        const remainder = round2(amount - share * participants.length)
        splitAmounts[participants[0].id] = round2(splitAmounts[participants[0].id] + remainder)
      }

      const category = normalizeCategory(p.category, description)
      const who = participants.length === group.members.length ? 'everyone' : participants.map((x) => (x.id === me.id ? 'you' : x.name)).join(', ')
      return {
        ...base,
        params: {
          groupId: group.id,
          description,
          amount,
          paidBy: payer.id,
          splitWith: participants.map((x) => x.id),
          splitType,
          splitAmounts,
          category,
          notes: String(p.notes || ''),
        },
        summary: `Add "${description}" ${fmt(amount)} to ${group.name}, paid by ${payer.id === me.id ? 'you' : payer.name}, split with ${who}`,
      }
    }
    case 'create_group': {
      const name = String(p.name || '').trim()
      if (!name) return { error: 'A group needs a name' }
      const memberIds: string[] = []
      const memberNames: string[] = []
      for (const ref of Array.isArray(p.members) ? p.members : []) {
        const friend = findPerson(world.friends, ref, me)
        if (!friend) return { error: `"${ref}" is not in your friends list — add them as a friend first` }
        if (friend.id !== me.id && !memberIds.includes(friend.id)) {
          memberIds.push(friend.id)
          memberNames.push(friend.name)
        }
      }
      return {
        ...base,
        params: { name, description: String(p.description || ''), memberIds },
        summary: `Create group "${name}"${memberNames.length ? ` with ${memberNames.join(', ')}` : ''}`,
      }
    }
    case 'add_group_member': {
      const group = findGroup(world, p.groupId || p.group)
      if (!group) return { error: `Could not find group "${p.groupId || p.group || ''}"` }
      const friend = findPerson(world.friends, p.friendId || p.member, me)
      if (!friend || friend.id === me.id) return { error: `"${p.friendId || p.member}" is not in your friends list` }
      if (group.members.some((m) => m.id === friend.id)) return { error: `${friend.name} is already in ${group.name}` }
      return { ...base, params: { groupId: group.id, friendId: friend.id }, summary: `Add ${friend.name} to ${group.name}` }
    }
    case 'record_payment': {
      const group = findGroup(world, p.groupId || p.group)
      if (!group) return { error: `Could not find group "${p.groupId || p.group || ''}"` }
      const from = findPerson(group.members, p.fromMemberId || p.from || 'me', me)
      const to = findPerson(group.members, p.toMemberId || p.to, me)
      if (!from || !to) return { error: `Both people must be members of ${group.name}` }
      if (from.id === to.id) return { error: 'Payer and receiver must be different people' }
      let amount = round2(toNumber(p.amount))
      if (amount <= 0) {
        // "settle up" without an amount → use the simplified outstanding debt
        const t = simplifyTransfers(group).transfers.find((x) => x.from === from.id && x.to === to.id)
        amount = t?.amount || 0
      }
      if (amount <= 0) return { error: `${from.id === me.id ? 'You don\'t' : `${from.name} doesn't`} owe ${to.id === me.id ? 'you' : to.name} anything in ${group.name}` }
      return {
        ...base,
        params: { groupId: group.id, fromMemberId: from.id, toMemberId: to.id, amount, note: String(p.note || 'Recorded by AI Copilot') },
        summary: `Record ${from.id === me.id ? 'your' : `${from.name}'s`} payment of ${fmt(amount)} to ${to.id === me.id ? 'you' : to.name} in ${group.name}`,
      }
    }
    case 'simplify_debts': {
      const group = findGroup(world, p.groupId || p.group)
      if (!group) return { error: `Could not find group "${p.groupId || p.group || ''}"` }
      return { ...base, params: { groupId: group.id }, summary: `Simplify debts in ${group.name}` }
    }
    case 'create_budget': {
      const category = p.category ? normalizeCategory(p.category) : ''
      const limit = round2(toNumber(p.limit))
      if (!category || limit <= 0) return { error: 'A budget needs a category and a positive limit' }
      return { ...base, params: { category, limit }, summary: `Set a ${fmt(limit)} monthly budget for ${category}` }
    }
    case 'add_friend': {
      const identifier = String(p.username || p.email || '').trim().replace(/^@/, '')
      if (!identifier) return { error: 'Adding a friend needs a username or email' }
      const isEmail = identifier.includes('@')
      return {
        ...base,
        params: isEmail ? { email: identifier } : { username: identifier },
        summary: `Add ${isEmail ? identifier : '@' + identifier} as a friend`,
      }
    }
    case 'navigate': {
      const page = String(p.page || '')
      if (!(PAGES as readonly string[]).includes(page)) return { error: `Unknown page "${page}"` }
      const group = p.groupId || p.group ? findGroup(world, p.groupId || p.group) : undefined
      return {
        ...base,
        risk: 'safe',
        params: { page, groupId: group?.id },
        summary: group ? `Open ${group.name}` : `Open ${page.replace('-', ' ')}`,
      }
    }
    default:
      return { error: `Unknown action "${raw?.type}"` }
  }
}

// ---------------------------------------------------------------------------
// LLM agent
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are ExpenseFlow AI, the autonomous copilot inside a group expense manager.
You can answer any question about the user's money AND operate the app on their behalf.
Currency is Bangladeshi Taka (৳). Today is {{TODAY}}. The user is {{ME}}.

You receive a JSON snapshot of everything the user can see: groups (members, who owes whom, recent expenses),
friends, personal expenses, budgets, and an autopilot analysis. Use it to answer precisely — cite real numbers and names.

To make changes, return actions. Available actions (params in parentheses):
- add_personal_expense (description, amount, category?, notes?)
- delete_personal_expense (expenseId)
- add_group_expense (group: name or id, description, amount, paidBy: name/id or "me", splitWith: array of names/ids or ["all"], splitAmounts?: {name_or_id: amount}, category?)
- create_group (name, description?, members?: array of friend names/usernames)
- add_group_member (group, member: friend name/username)
- record_payment (group, from: name or "me", to: name or "me", amount? — omit amount to settle the full outstanding debt)
- simplify_debts (group)
- create_budget (category, limit)
- add_friend (username or email)
- navigate (page: one of command|dashboard|expenses|groups|friends|activity|profile|ai-insights, group?)

Rules:
- Only propose actions the user asked for or clearly implied. Questions get answers, not actions.
- A multi-step request becomes multiple actions in order (e.g. create a group, then add an expense to it is NOT possible in one turn because the new group has no id yet — create the group and tell the user to ask for the expense next).
- "I paid 1200 for dinner with Rahim and Karim in Trip" → add_group_expense paidBy "me", splitWith ["me","Rahim","Karim"].
- If something is ambiguous (which group? how much?), ask a short clarifying question and return no actions.
- Categories (use these exact ids): food, groceries, shopping, transport, entertainment, utilities, housing, travel, gifts, healthcare, other.
- Keep "reply" short, warm and specific (1-4 sentences, markdown allowed). Never invent ids.

Respond with ONLY a JSON object, no markdown fences:
{"reply": "...", "actions": [{"type": "...", "params": {...}}], "suggestions": ["up to 3 short follow-up prompts"]}`

function compactWorld(world: World, autopilot: ReturnType<typeof computeAutopilot>) {
  const { me } = world
  const label = (g: GroupWorld, id: string) => (id === me.id ? 'me' : g.members.find((m) => m.id === id)?.name || id)
  return {
    groups: world.groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: g.members.map((m) => (m.id === me.id ? 'me' : `${m.name} (@${m.username})`)),
      debts: g.debts.map((d) => `${label(g, d.debtorId)} owes ${label(g, d.creditorId)} ${d.amount}`),
      totalSpent: g.totalSpent,
      recentExpenses: g.recentExpenses.slice(0, 5).map((e) => `${e.description} ${e.amount} paid by ${label(g, e.paidBy)} (${e.createdAt?.slice(0, 10)})`),
    })),
    friends: world.friends.map((f) => `${f.name} (@${f.username})`),
    personalExpenses: world.personalExpenses.slice(0, 40).map((e) => ({ id: e.id, d: e.description, a: e.amount, c: e.category, t: e.createdAt?.slice(0, 10) })),
    budgets: world.budgets.filter((b) => b.month === world.now.getMonth() && b.year === world.now.getFullYear()).map((b) => `${b.category}: ${b.limit}`),
    autopilot: {
      position: autopilot.position,
      youOwe: autopilot.youOwe.map((x) => `you owe ${x.personName} ${x.amount} in ${x.groupName}`),
      owedToYou: autopilot.owedToYou.map((x) => `${x.personName} owes you ${x.amount} in ${x.groupName}`),
      spending: autopilot.spending,
      budgetForecasts: autopilot.budgetForecasts,
      anomalies: autopilot.anomalies.map((a) => `${a.description} ${a.amount} (typical ${a.typical})`),
      recurring: autopilot.recurring,
      healthScore: autopilot.healthScore.score,
    },
  }
}

export function extractJson(text: string): any {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```(?:json)?/gi, '')
    .trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON object in model response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
  Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI timeout')), ms))])

// ---------------------------------------------------------------------------
// Rule-based fallback agent (works with no AI provider)
// ---------------------------------------------------------------------------

const AMOUNT_RE = /(?:৳|tk\.?|taka|bdt|\$)?\s*(\d+(?:[.,]\d+)?)(?:\s*(?:৳|tk|taka|bdt))?/i

export function localAgent(text: string, world: World, autopilot: ReturnType<typeof computeAutopilot>) {
  const t = text.trim()
  const lower = t.toLowerCase()
  const raw: any[] = []
  let reply = ''

  const groupInText = () =>
    [...world.groups].sort((a, b) => b.name.length - a.name.length).find((g) => lower.includes(g.name.toLowerCase()))

  const peopleInText = (people: Person[]) =>
    people.filter((p) => p.id !== world.me.id && (
      new RegExp(`\\b${norm(p.name).split(' ')[0]}\\b`).test(norm(lower)) ||
      (p.username && lower.includes(p.username.toLowerCase()))
    ))

  let m: RegExpMatchArray | null

  if ((m = t.match(/(?:create|make|start|new)\s+(?:a\s+)?group\s+(?:called|named)?\s*["']?([^"',]+?)["']?(?:\s+with\s+(.+))?$/i))) {
    const members = m[2] ? m[2].split(/,|\band\b|&/).map((s) => s.trim()).filter(Boolean) : []
    raw.push({ type: 'create_group', params: { name: m[1].trim(), members } })
    reply = `Ready to create **${m[1].trim()}**.`
  } else if ((m = lower.match(/(?:set|create|make|add)?\s*(?:a\s+)?budget\s+(?:of\s+)?(?:৳|tk)?\s*(\d+(?:\.\d+)?)\s*(?:tk|taka)?\s+(?:for|on)\s+([a-z]+)/)) ||
             (m = lower.match(/(?:set\s+)?(?:my\s+)?([a-z]+)\s+budget\s+(?:to|at|of)\s+(?:৳|tk)?\s*(\d+(?:\.\d+)?)/))) {
    const [amount, category] = /^\d/.test(m[1]) ? [m[1], m[2]] : [m[2], m[1]]
    raw.push({ type: 'create_budget', params: { category, limit: amount } })
    reply = `I'll set that budget for you.`
  } else if (/\bsimplif/.test(lower)) {
    const group = groupInText()
    const targets = group ? [group] : world.groups.filter((g) => autopilot.simplifyOpportunities.some((s) => s.groupId === g.id))
    targets.forEach((g) => raw.push({ type: 'simplify_debts', params: { groupId: g.id } }))
    reply = targets.length ? 'Here is the simplification plan.' : 'Nothing to simplify — your groups already use the minimum number of transfers.'
  } else if (/\b(settle|pay back|payback|clear (my )?debts?)\b/.test(lower)) {
    const group = groupInText()
    const people = peopleInText(world.groups.flatMap((g) => g.members))
    const debts = autopilot.youOwe.filter((d) =>
      (!group || d.groupId === group.id) && (!people.length || people.some((p) => p.id === d.personId)))
    debts.forEach((d) => raw.push({ type: 'record_payment', params: { groupId: d.groupId, fromMemberId: world.me.id, toMemberId: d.personId, amount: d.amount } }))
    reply = debts.length ? `You have ${debts.length} debt${debts.length > 1 ? 's' : ''} to settle, totalling ${fmt(debts.reduce((s, d) => s + d.amount, 0))}.` : `You don't owe anyone${group ? ` in ${group.name}` : ''} right now. 🎉`
  } else if ((m = t.match(/add\s+(?:friend\s+)?@?([\w.+-]+@[\w.-]+|[\w.]+)\s+as\s+(?:a\s+)?friend|add\s+friend\s+@?([\w.+@-]+)/i))) {
    const id = m[1] || m[2]
    raw.push({ type: 'add_friend', params: id.includes('@') ? { email: id } : { username: id } })
    reply = `I'll send that friend request.`
  } else if ((m = lower.match(/^(?:go to|open|show(?: me)?)\s+(?:the\s+|my\s+)?(.+?)(?:\s+page)?$/))) {
    const target = m[1].trim()
    const group = groupInText()
    const map: Record<string, string> = { home: 'command', command: 'command', overview: 'dashboard', dashboard: 'dashboard', expenses: 'expenses', groups: 'groups', friends: 'friends', activity: 'activity', profile: 'profile', insights: 'ai-insights', 'ai insights': 'ai-insights' }
    if (group) raw.push({ type: 'navigate', params: { page: 'groups', groupId: group.id } })
    else if (map[target]) raw.push({ type: 'navigate', params: { page: map[target] } })
    reply = raw.length ? 'Taking you there.' : `I couldn't find a page called "${target}".`
  } else if (/\b(who owes|owe me|i owe|do i owe|balance|debts?)\b/.test(lower)) {
    const lines = [
      ...autopilot.owedToYou.map((d) => `- **${d.personName}** owes you ${fmt(d.amount)} (${d.groupName})`),
      ...autopilot.youOwe.map((d) => `- You owe **${d.personName}** ${fmt(d.amount)} (${d.groupName})`),
    ]
    reply = lines.length
      ? `Net position: **${fmt(autopilot.position.net)}**\n${lines.join('\n')}`
      : 'All your group balances are settled. 🎉'
  } else if (/\b(spend|spent|spending)\b/.test(lower) && /\b(how much|total|this month|last month)\b/.test(lower)) {
    const s = autopilot.spending
    const cat = Object.keys(CATEGORY_KEYWORDS).find((c) => lower.includes(c))
    if (cat) {
      const amt = s.topCategories.find((x) => x.category === cat)?.amount || 0
      reply = `You've spent **${fmt(amt)}** on ${cat} this month.`
    } else {
      reply = `This month: **${fmt(s.thisMonth)}** (projected ${fmt(s.projectedMonthTotal)}). Last month: ${fmt(s.lastMonth)}.` +
        (s.topCategories.length ? `\nTop: ${s.topCategories.slice(0, 3).map((c) => `${c.category} ${fmt(c.amount)}`).join(', ')}` : '')
    }
  } else if ((m = t.match(AMOUNT_RE)) && /\b(spent|paid|add|bought|cost|for|on)\b/.test(lower)) {
    const amount = parseFloat(m[1].replace(',', '.'))
    const group = groupInText()
    const description = t
      .replace(AMOUNT_RE, ' ')
      .replace(group ? new RegExp(group.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : /$^/, ' ')
      .replace(/\b(split|shared?|with|between|among)\b.*$/i, ' ')
      .replace(/\b(i|just|spent|paid|add|added|bought|an?|expense|for|on|of|to|in|the|with|split|equally|between|among|everyone|all|and|group|me)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const desc = description ? description.charAt(0).toUpperCase() + description.slice(1) : 'Expense'
    if (group) {
      const people = peopleInText(group.members)
      const splitWith = people.length ? ['me', ...people.map((p) => p.id)] : ['all']
      raw.push({ type: 'add_group_expense', params: { group: group.id, description: desc, amount, paidBy: 'me', splitWith } })
    } else {
      raw.push({ type: 'add_personal_expense', params: { description: desc, amount } })
    }
    reply = 'Got it — confirm below.'
  }

  if (!reply) {
    reply = `${autopilot.headline}\n\nI can add expenses, split bills, settle debts, set budgets, create groups and answer questions. Try one of the suggestions below.`
  }
  return { reply, raw }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export function registerCopilotRoutes(app: any, deps: CopilotDeps) {
  const { requireAuth, callAI, generateId } = deps

  app.get('/make-server-f573a585/ai/autopilot', requireAuth, async (c: any) => {
    try {
      const world = await buildWorld(deps, c.get('userId'))
      return c.json(computeAutopilot(world, generateId))
    } catch (error) {
      console.log('[autopilot] error:', error)
      return c.json({ error: 'Failed to compute autopilot briefing' }, 500)
    }
  })

  app.post('/make-server-f573a585/ai/agent', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const body = await c.req.json()
      const messages: { role: string; content: string }[] = Array.isArray(body.messages) ? body.messages.slice(-12) : []
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content?.trim()
      if (!lastUser) return c.json({ error: 'Message is required' }, 400)

      const world = await buildWorld(deps, userId)
      const autopilot = computeAutopilot(world, generateId)

      let reply = ''
      let rawActions: any[] = []
      let suggestions: string[] = []
      let aiPowered = false

      try {
        const system = SYSTEM_PROMPT
          .replace('{{TODAY}}', world.now.toDateString())
          .replace('{{ME}}', `${world.me.name} (@${world.me.username})`)
        const transcript = messages
          .map((m) => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${String(m.content).slice(0, 2000)}`)
          .join('\n')
        const prompt = `CURRENT PAGE: ${body.page || 'unknown'}\nDATA SNAPSHOT:\n${JSON.stringify(compactWorld(world, autopilot))}\n\nCONVERSATION:\n${transcript}\n\nRespond to the last USER message with the JSON object.`
        const parsed = extractJson(await withTimeout(callAI(prompt, system), 25000))
        reply = String(parsed.reply || '')
        rawActions = Array.isArray(parsed.actions) ? parsed.actions : []
        suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3).map(String) : []
        aiPowered = true
      } catch (aiError: any) {
        console.log('[agent] AI unavailable, using local agent:', aiError?.message)
        const local = localAgent(lastUser, world, autopilot)
        reply = local.reply
        rawActions = local.raw
      }

      const actions: AgentAction[] = []
      const problems: string[] = []
      for (const raw of rawActions.slice(0, 10)) {
        const result = normalizeAction(raw, world, generateId)
        if ('error' in result) problems.push(result.error)
        else actions.push(result)
      }
      if (problems.length) reply = `${reply}\n\n⚠️ ${problems.join('\n⚠️ ')}`.trim()

      if (!suggestions.length) {
        suggestions = [
          autopilot.youOwe.length ? 'Settle all my debts' : 'Who owes me money?',
          'How much did I spend this month?',
          world.groups[0] ? `Add 500 for dinner in ${world.groups[0].name}` : 'Create a group called Weekend Trip',
        ]
      }

      return c.json({ reply, actions, suggestions, aiPowered })
    } catch (error) {
      console.log('[agent] error:', error)
      return c.json({ error: 'Copilot failed to respond' }, 500)
    }
  })
}

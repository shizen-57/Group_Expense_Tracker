import type { QueryClient } from '@tanstack/react-query'
import { api } from '../api'

// Mirrors AgentAction in supabase/functions/make-server-f573a585/copilot.ts
export type AgentActionType =
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
  type: AgentActionType
  params: Record<string, any>
  summary: string
  risk: 'safe' | 'write'
}

export type AppPage = 'command' | 'dashboard' | 'expenses' | 'groups' | 'friends' | 'activity' | 'profile' | 'ai-insights'

export interface ActionContext {
  queryClient: QueryClient
  navigate: (page: AppPage, groupId?: string) => void
}

// Every cache the Copilot can affect; keys are prefixes of ['<name>', accessToken, ...]
const AFFECTED_QUERIES = [
  'groups',
  'group-detail',
  'friends',
  'personal-expenses',
  'budgets',
  'trends',
  'dashboard',
  'activity',
  'autopilot',
]

const ensureOk = (result: any) => {
  if (result?.error) throw new Error(result.error)
  return result
}

export async function executeAgentAction(token: string, action: AgentAction, ctx: ActionContext) {
  const p = action.params

  switch (action.type) {
    case 'navigate':
      ctx.navigate(p.page as AppPage, p.groupId)
      return
    case 'add_personal_expense':
      await api.createPersonalExpense(token, {
        description: p.description,
        amount: p.amount,
        category: p.category,
        notes: p.notes,
      })
      break
    case 'delete_personal_expense':
      ensureOk(await api.deletePersonalExpense(token, p.expenseId))
      break
    case 'add_group_expense':
      await api.addExpense(token, p.groupId, {
        description: p.description,
        amount: p.amount,
        paidBy: p.paidBy,
        splitWith: p.splitWith,
        splitType: p.splitType,
        splitAmounts: p.splitAmounts,
        category: p.category,
        notes: p.notes,
      })
      break
    case 'create_group': {
      const group = await api.createGroup(token, { name: p.name, description: p.description })
      for (const friendId of p.memberIds || []) {
        await api.addMemberById(token, group.id, friendId)
      }
      break
    }
    case 'add_group_member':
      await api.addMemberById(token, p.groupId, p.friendId)
      break
    case 'record_payment':
      await api.recordPayment(token, p.groupId, {
        fromMemberId: p.fromMemberId,
        toMemberId: p.toMemberId,
        amount: p.amount,
        note: p.note,
      })
      break
    case 'simplify_debts':
      ensureOk(await api.simplifyDebts(token, p.groupId))
      break
    case 'create_budget':
      await api.createBudget(token, { category: p.category, limit: p.limit })
      break
    case 'add_friend':
      ensureOk(p.email ? await api.addFriendByEmail(token, p.email) : await api.addFriend(token, p.username))
      break
    default:
      throw new Error(`Unsupported action: ${action.type}`)
  }

  await Promise.all(AFFECTED_QUERIES.map((key) => ctx.queryClient.invalidateQueries({ queryKey: [key] })))
}

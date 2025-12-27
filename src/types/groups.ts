export type LegacySplitType = 'equal' | 'unequal' | 'percentage'
export type AdvancedSplitType = 'who-joined' | 'itemized' | 'custom-percentage' | 'by-duration'

export type GroupSplitType = LegacySplitType | AdvancedSplitType

export type SplitAmounts = Record<string, number>

export interface ItemSplit {
  item: string
  amount: number
  selectedBy: string[]
}

export type DurationData = Record<string, number>

export interface GroupExpensePayload {
  description: string
  amount: number
  paidBy: string
  splitWith: string[]
  splitType?: GroupSplitType
  splitAmounts?: SplitAmounts
  category?: string
  notes?: string
  itemSplits?: ItemSplit[]
  duration?: DurationData
}

export interface GroupPaymentPayload {
  fromMemberId: string
  toMemberId: string
  amount: number
  note?: string
}

export interface GroupPayment extends GroupPaymentPayload {
  id: string
  createdBy: string
  createdAt: string
}

export interface GroupMemberSummary {
  memberId: string
  totalPaid: number
  totalOwed: number
  paymentsMade: number
  paymentsReceived: number
  netBalance: number
}

export interface GroupSummary {
  totalExpenses: number
  totalExpenseAmount: number
  totalPayments: number
  totalPaymentAmount: number
  outstandingBalance: number
  memberSummaries: GroupMemberSummary[]
}

export interface GroupActivityEntry {
  id: string
  type: 'expense' | 'payment'
  createdAt: string
  amount: number
  paidBy?: string
  description?: string
  category?: string
  fromMemberId?: string
  toMemberId?: string
  note?: string
  recordedBy?: string
}

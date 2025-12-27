import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

// Create Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
}

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID()

const BALANCE_KEY_SEPARATOR = '__'

const makeBalanceKey = (creditorId: string, debtorId: string) => {
  return `${creditorId}${BALANCE_KEY_SEPARATOR}${debtorId}`
}

const parseBalanceKey = (key: string) => {
  if (key.includes(BALANCE_KEY_SEPARATOR)) {
    const [creditorId, debtorId] = key.split(BALANCE_KEY_SEPARATOR)
    return { creditorId, debtorId }
  }

  const segments = key.split('-')
  if (segments.length >= 10) {
    const creditorId = segments.slice(0, 5).join('-')
    const debtorId = segments.slice(5).join('-')
    return { creditorId, debtorId }
  }

  const [creditorId, debtorId] = segments
  return { creditorId, debtorId }
}

// Auth routes
app.post('/make-server-f573a585/auth/signup', async (c) => {
  try {
    const { name, email, password, phone, username } = await c.req.json()
    
    if (!name || !email || !password || !username) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const supabase = getSupabaseClient()
    
    // Check if username already exists
    const existingUsers = await kv.getByPrefix('user:username:')
    const usernameTaken = existingUsers.some(u => u.value === username)
    if (usernameTaken) {
      return c.json({ error: 'Username already taken' }, 400)
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, username },
      email_confirm: true // Auto-confirm since we don't have email server configured
    })

    if (authError) {
      console.log('Auth error during signup:', authError)
      return c.json({ error: authError.message }, 400)
    }

    const userId = authData.user.id

    // Store user data in KV
    const userData = {
      id: userId,
      name,
      email,
      phone: phone || '',
      username,
      createdAt: new Date().toISOString()
    }

    await kv.set(`user:${userId}`, userData)
    await kv.set(`user:username:${username}`, userId)
    await kv.set(`user:email:${email}`, userId)
    
    // Initialize user collections
    await kv.set(`user:${userId}:groups`, [])
    await kv.set(`user:${userId}:friends`, [])
    await kv.set(`user:${userId}:friend_requests`, [])
    await kv.set(`user:${userId}:notifications`, [])
    await kv.set(`user:${userId}:balances`, {})
    await kv.set(`user:${userId}:personal_expenses`, [])
    await kv.set(`user:${userId}:budgets`, [])

    return c.json({ 
      success: true, 
      user: userData 
    })
  } catch (error) {
    console.log('Error during signup:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

app.post('/make-server-f573a585/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    // Use anon key client for sign in, not service role key
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )
    
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log('Login error from Supabase auth:', error)
      return c.json({ error: error.message }, 401)
    }

    if (!data.user || !data.session) {
      console.log('Login error: No user or session data returned')
      return c.json({ error: 'No user or session data' }, 401)
    }

    const userId = data.user.id
    console.log('Login successful for user ID:', userId)
    
    const userData = await kv.get(`user:${userId}`)
    console.log('User data from KV store:', userData)

    if (!userData.value) {
      console.log('Warning: User not found in KV store, creating from auth data')
      // Create user data from auth metadata if not found in KV
      const newUserData = {
        id: userId,
        name: data.user.user_metadata?.name || 'User',
        email: data.user.email || email,
        phone: data.user.user_metadata?.phone || '',
        username: data.user.user_metadata?.username || email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      
      await kv.set(`user:${userId}`, newUserData)
      await kv.set(`user:${userId}:groups`, [])
      await kv.set(`user:${userId}:friends`, [])
      await kv.set(`user:${userId}:friend_requests`, [])
      await kv.set(`user:${userId}:notifications`, [])
      await kv.set(`user:${userId}:balances`, {})
      await kv.set(`user:${userId}:personal_expenses`, [])
      await kv.set(`user:${userId}:budgets`, [])
      
      return c.json({ 
        accessToken: data.session.access_token,
        user: newUserData
      })
    }

    return c.json({ 
      accessToken: data.session.access_token,
      user: userData.value
    })
  } catch (error) {
    console.log('Error during login process:', error)
    return c.json({ error: 'Internal server error during login' }, 500)
  }
})

// Middleware to verify auth
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  if (!accessToken || accessToken === 'null') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const supabase = getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  
  if (error || !user?.id) {
    console.log('Authorization error:', error)
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('userId', user.id)
  await next()
}

// Profile routes
app.get('/make-server-f573a585/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const userData = await kv.get(`user:${userId}`)
    
    if (!userData.value) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json(userData.value)
  } catch (error) {
    console.log('Error fetching profile:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// Groups routes
app.get('/make-server-f573a585/groups', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    console.log(`[GET /groups] Fetching groups for user ${userId}`)
    
    const userGroups = await kv.get(`user:${userId}:groups`)
    const groupIds = userGroups.value || []
    console.log(`[GET /groups] User has group IDs:`, groupIds)
    
    const groups = []
    const invalidGroupIds = []
    
    for (const groupId of groupIds) {
      const group = await kv.get(`group:${groupId}`)
      console.log(`[GET /groups] Group ${groupId} data:`, group.value)
      
      if (group.value && group.value.id) {
        // Verify group has required data
        const members = await kv.get(`group:${groupId}:members`)
        const memberIds = members.value || []
        
        // Check if user is still a member
        if (!memberIds.includes(userId)) {
          console.log(`[GET /groups] User ${userId} is not a member of group ${groupId}`)
          invalidGroupIds.push(groupId)
          continue
        }
        
        const expenses = await kv.get(`group:${groupId}:expenses`)
        const balances = await kv.get(`group:${groupId}:balances`)
        const outstandingBalance = Object.values(balances.value || {}).reduce((sum, value) => {
          const numeric = typeof value === 'number' ? value : parseFloat(String(value))
          return sum + (Number.isFinite(numeric) ? numeric : 0)
        }, 0)

        groups.push({
          ...group.value,
          memberCount: memberIds.length,
          expenseCount: (expenses.value || []).length,
          outstandingBalance: Number.isFinite(outstandingBalance) ? parseFloat(outstandingBalance.toFixed(2)) : 0
        })
      } else {
        console.log(`[GET /groups] Group ${groupId} not found or invalid in KV store`)
        invalidGroupIds.push(groupId)
      }
    }
    
    // Clean up invalid group IDs from user's list
    if (invalidGroupIds.length > 0) {
      console.log(`[GET /groups] Cleaning up ${invalidGroupIds.length} invalid group IDs:`, invalidGroupIds)
      const validGroupIds = groupIds.filter(id => !invalidGroupIds.includes(id))
      await kv.set(`user:${userId}:groups`, validGroupIds)
    }

    console.log(`[GET /groups] Returning ${groups.length} valid groups`)
    return c.json(groups)
  } catch (error) {
    console.log('[GET /groups] Error fetching groups:', error)
    return c.json({ error: 'Failed to fetch groups' }, 500)
  }
})

app.post('/make-server-f573a585/groups', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { name, description } = await c.req.json()
    
    console.log(`[POST /groups] Creating group for user ${userId}:`, { name, description })
    
    if (!name || name.trim() === '') {
      return c.json({ error: 'Group name is required' }, 400)
    }

    const groupId = generateId()
    const group = {
      id: groupId,
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: userId,
      createdAt: new Date().toISOString()
    }

    console.log(`[POST /groups] Saving group with ID ${groupId}:`, group)
    
    try {
      // Save all group data with error handling
      await kv.set(`group:${groupId}`, group)
      console.log(`[POST /groups] ✓ Saved group data`)
      
      await kv.set(`group:${groupId}:members`, [userId])
      console.log(`[POST /groups] ✓ Saved group members`)
      
      await kv.set(`group:${groupId}:expenses`, [])
      console.log(`[POST /groups] ✓ Saved group expenses`)
      
      await kv.set(`group:${groupId}:balances`, {})
      console.log(`[POST /groups] ✓ Saved group balances`)

      // Add group to user's groups
      const userGroups = await kv.get(`user:${userId}:groups`)
      const groups = userGroups.value || []
      
      // Prevent duplicates
      if (!groups.includes(groupId)) {
        groups.push(groupId)
        await kv.set(`user:${userId}:groups`, groups)
        console.log(`[POST /groups] ✓ Updated user groups list`)
      }
      
      console.log(`[POST /groups] Group created successfully. User now has ${groups.length} groups`)
      return c.json(group)
      
    } catch (kvError) {
      console.error(`[POST /groups] KV store error while saving group ${groupId}:`, kvError)
      // Try to clean up partial data
      try {
        await kv.del(`group:${groupId}`)
        await kv.del(`group:${groupId}:members`)
        await kv.del(`group:${groupId}:expenses`)
        await kv.del(`group:${groupId}:balances`)
        console.log(`[POST /groups] Cleaned up partial group data`)
      } catch (cleanupError) {
        console.error(`[POST /groups] Cleanup failed:`, cleanupError)
      }
      return c.json({ error: 'Failed to save group data to database' }, 500)
    }
  } catch (error) {
    console.log('[POST /groups] Error creating group:', error)
    return c.json({ error: 'Failed to create group' }, 500)
  }
})

app.get('/make-server-f573a585/groups/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const groupId = c.req.param('id')
    
    console.log(`[GET /groups/:id] Fetching group ${groupId} for user ${userId}`)
    
    if (!groupId || groupId === 'null' || groupId === 'undefined') {
      console.log(`[GET /groups/:id] Invalid group ID: ${groupId}`)
      return c.json({ error: 'Invalid group ID' }, 400)
    }
    
    const group = await kv.get(`group:${groupId}`)
    console.log(`[GET /groups/:id] Group data:`, group.value)
    
    if (!group.value || !group.value.id) {
      console.log(`[GET /groups/:id] Group not found: ${groupId}`)
      // Clean up this group from user's list
      const userGroups = await kv.get(`user:${userId}:groups`)
      const groups = userGroups.value || []
      const updatedGroups = groups.filter(gId => gId !== groupId)
      if (updatedGroups.length !== groups.length) {
        await kv.set(`user:${userId}:groups`, updatedGroups)
        console.log(`[GET /groups/:id] Removed invalid group ${groupId} from user ${userId}'s list`)
      }
      return c.json({ error: 'Group not found' }, 404)
    }

    // Check if user is a member
    const members = await kv.get(`group:${groupId}:members`)
    const memberIds = members.value || []
    console.log(`[GET /groups/:id] Member IDs:`, memberIds)
    console.log(`[GET /groups/:id] User is member:`, memberIds.includes(userId))
    
    if (!memberIds.includes(userId)) {
      console.log(`[GET /groups/:id] User ${userId} not authorized for group ${groupId}`)
      // Clean up this group from user's list since they're not a member
      const userGroups = await kv.get(`user:${userId}:groups`)
      const groups = userGroups.value || []
      const updatedGroups = groups.filter(gId => gId !== groupId)
      if (updatedGroups.length !== groups.length) {
        await kv.set(`user:${userId}:groups`, updatedGroups)
        console.log(`[GET /groups/:id] Removed unauthorized group ${groupId} from user ${userId}'s list`)
      }
      return c.json({ error: 'Not authorized to view this group' }, 403)
    }

    // Get member details
    const memberDetails = []
    for (const memberId of memberIds) {
      const user = await kv.get(`user:${memberId}`)
      if (user.value) {
        memberDetails.push({
          id: user.value.id,
          name: user.value.name,
          email: user.value.email,
          username: user.value.username
        })
      }
    }
    console.log(`[GET /groups/:id] Member details:`, memberDetails)

    const toNumber = (value: unknown) => {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0
      }
      const parsed = parseFloat(String(value))
      return Number.isFinite(parsed) ? parsed : 0
    }

    const roundAmount = (value: number) => {
      return Math.round(value * 100) / 100
    }

    // Get expenses
    const expenses = await kv.get(`group:${groupId}:expenses`)
    const expenseList = expenses.value || []
    console.log(`[GET /groups/:id] Expenses:`, expenseList.length)

    // Get payments
    const payments = await kv.get(`group:${groupId}:payments`)
    const paymentList = payments.value || []
    console.log(`[GET /groups/:id] Payments:`, paymentList.length)

    // Get balances
    const balances = await kv.get(`group:${groupId}:balances`)
    const rawBalanceMap: Record<string, number> = balances.value || {}

    // Filter out balance entries where either party is not a current group member
    const memberIdSet = new Set(memberIds)
    const balanceMap: Record<string, number> = {}
    let hasInvalidEntries = false
    
    Object.entries(rawBalanceMap).forEach(([key, value]) => {
      const { creditorId, debtorId } = parseBalanceKey(key)
      if (memberIdSet.has(creditorId) && memberIdSet.has(debtorId)) {
        balanceMap[key] = value
      } else {
        hasInvalidEntries = true
        console.log(`[GET /groups/:id] Removing invalid balance entry: ${key} (creditor: ${creditorId}, debtor: ${debtorId})`)
      }
    })

    // If we found invalid entries, clean up the stored balances
    if (hasInvalidEntries) {
      await kv.set(`group:${groupId}:balances`, balanceMap)
      console.log(`[GET /groups/:id] Cleaned up invalid balance entries`)
    }

    // Prepare member summaries
    const memberSummaryMap: Record<string, {
      totalPaid: number
      totalOwed: number
      paymentsMade: number
      paymentsReceived: number
      netBalance: number
    }> = {}

    memberDetails.forEach(member => {
      memberSummaryMap[member.id] = {
        totalPaid: 0,
        totalOwed: 0,
        paymentsMade: 0,
        paymentsReceived: 0,
        netBalance: 0
      }
    })

    let totalExpenseAmount = 0
    expenseList.forEach((expense: any) => {
      const amount = toNumber(expense.amount)
      totalExpenseAmount += amount
      if (memberSummaryMap[expense.paidBy]) {
        memberSummaryMap[expense.paidBy].totalPaid += amount
      }

      const splits = expense.splitAmounts || {}
      Object.entries(splits).forEach(([memberId, share]) => {
        if (memberSummaryMap[memberId]) {
          memberSummaryMap[memberId].totalOwed += toNumber(share)
        }
      })
    })

    let totalPaymentAmount = 0
    paymentList.forEach((payment: any) => {
      const amount = toNumber(payment.amount)
      totalPaymentAmount += amount
      if (memberSummaryMap[payment.fromMemberId]) {
        memberSummaryMap[payment.fromMemberId].paymentsMade += amount
      }
      if (memberSummaryMap[payment.toMemberId]) {
        memberSummaryMap[payment.toMemberId].paymentsReceived += amount
      }
    })

    const outstandingBalanceTotal = Object.values(balanceMap).reduce((sum, value) => {
      return sum + toNumber(value)
    }, 0)

    Object.entries(balanceMap).forEach(([key, value]) => {
      const { creditorId, debtorId } = parseBalanceKey(key)
      const numericValue = toNumber(value)
      if (!numericValue) return
      if (memberSummaryMap[creditorId]) {
        memberSummaryMap[creditorId].netBalance += numericValue
      }
      if (memberSummaryMap[debtorId]) {
        memberSummaryMap[debtorId].netBalance -= numericValue
      }
    })

    const memberSummaries = memberDetails.map(member => {
      const summary = memberSummaryMap[member.id] || {
        totalPaid: 0,
        totalOwed: 0,
        paymentsMade: 0,
        paymentsReceived: 0,
        netBalance: 0
      }
      return {
        memberId: member.id,
        totalPaid: roundAmount(summary.totalPaid),
        totalOwed: roundAmount(summary.totalOwed),
        paymentsMade: roundAmount(summary.paymentsMade),
        paymentsReceived: roundAmount(summary.paymentsReceived),
        netBalance: roundAmount(summary.netBalance)
      }
    })

    const activity = [
      ...expenseList.map((expense: any) => ({
        id: expense.id,
        type: 'expense' as const,
        createdAt: expense.createdAt,
        amount: roundAmount(toNumber(expense.amount)),
        paidBy: expense.paidBy,
        description: expense.description,
        category: expense.category || 'other'
      })),
      ...paymentList.map((payment: any) => ({
        id: payment.id,
        type: 'payment' as const,
        createdAt: payment.createdAt,
        amount: roundAmount(toNumber(payment.amount)),
        fromMemberId: payment.fromMemberId,
        toMemberId: payment.toMemberId,
        note: payment.note || '',
        recordedBy: payment.createdBy
      }))
    ].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })

    const summary = {
      totalExpenses: expenseList.length,
      totalExpenseAmount: roundAmount(totalExpenseAmount),
      totalPayments: paymentList.length,
      totalPaymentAmount: roundAmount(totalPaymentAmount),
      outstandingBalance: roundAmount(outstandingBalanceTotal),
      memberSummaries
    }

    const result = {
      ...group.value,
      members: memberDetails,
      expenses: expenseList,
      balances: balanceMap,
      payments: paymentList,
      summary,
      activity
    }
    console.log(`[GET /groups/:id] Returning result with ${memberDetails.length} members and ${expenseList.length} expenses`)

    return c.json(result)
  } catch (error) {
    console.log('[GET /groups/:id] Error fetching group details:', error)
    return c.json({ error: 'Failed to fetch group details' }, 500)
  }
})

app.post('/make-server-f573a585/groups/:id/members', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const groupId = c.req.param('id')
    const { username } = await c.req.json()
    
    if (!username) {
      return c.json({ error: 'Username is required' }, 400)
    }

    // Find user by username
    const newUserId = await kv.get(`user:username:${username}`)
    if (!newUserId.value) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Add member to group
    const members = await kv.get(`group:${groupId}:members`)
    const memberIds = members.value || []
    
    if (memberIds.includes(newUserId.value)) {
      return c.json({ error: 'User already in group' }, 400)
    }

    memberIds.push(newUserId.value)
    await kv.set(`group:${groupId}:members`, memberIds)

    // Add group to new member's groups
    const userGroups = await kv.get(`user:${newUserId.value}:groups`)
    const groups = userGroups.value || []
    groups.push(groupId)
    await kv.set(`user:${newUserId.value}:groups`, groups)

    // Add notification
    const notifications = await kv.get(`user:${newUserId.value}:notifications`)
    const notifs = notifications.value || []
    notifs.push({
      id: generateId(),
      type: 'group_invite',
      message: `You were added to a group`,
      groupId,
      createdAt: new Date().toISOString()
    })
    await kv.set(`user:${newUserId.value}:notifications`, notifs)

    const newUser = await kv.get(`user:${newUserId.value}`)
    return c.json({
      id: newUser.value.id,
      name: newUser.value.name,
      email: newUser.value.email,
      username: newUser.value.username
    })
  } catch (error) {
    console.log('Error adding member to group:', error)
    return c.json({ error: 'Failed to add member' }, 500)
  }
})

app.post('/make-server-f573a585/groups/:id/expenses', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const groupId = c.req.param('id')
    const {
      description,
      amount,
      paidBy,
      splitWith,
      splitType,
      splitAmounts,
      category,
      notes,
      itemSplits,
      duration
    } = await c.req.json()

    if (!description || !amount || !paidBy) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const members = await kv.get(`group:${groupId}:members`)
    const memberIds: string[] = members.value || []
    if (!memberIds.includes(paidBy)) {
      return c.json({ error: 'Invalid payer for this group' }, 400)
    }

    const parseNumber = (value: unknown) => {
      const numeric = typeof value === 'number' ? value : parseFloat(String(value))
      return Number.isFinite(numeric) ? numeric : 0
    }

    const numericAmount = parseNumber(amount)
    if (numericAmount <= 0) {
      return c.json({ error: 'Amount must be greater than zero' }, 400)
    }

    const allowedSplitTypes = new Set([
      'equal',
      'unequal',
      'percentage',
      'who-joined',
      'itemized',
      'custom-percentage',
      'by-duration'
    ])
    const sanitizedSplitType = allowedSplitTypes.has(splitType)
      ? splitType
      : 'equal'

    const validMemberIds = new Set(memberIds)
    const sanitizedSplitWith = Array.isArray(splitWith)
      ? Array.from(new Set(
          splitWith
            .filter((memberId) => typeof memberId === 'string')
            .filter((memberId) => validMemberIds.has(memberId))
        ))
      : []

    const splitAmountKeys =
      splitAmounts && typeof splitAmounts === 'object'
        ? Object.keys(splitAmounts)
        : []

    const derivedSplitWith = sanitizedSplitWith.length > 0
      ? sanitizedSplitWith
      : Array.from(
          new Set(splitAmountKeys.filter((memberId) => validMemberIds.has(memberId)))
        )

    if (derivedSplitWith.length === 0) {
      return c.json({ error: 'At least one valid participant is required' }, 400)
    }

    const sanitizedSplitAmounts: Record<string, number> = {}
    for (const memberId of derivedSplitWith) {
      sanitizedSplitAmounts[memberId] = parseNumber(splitAmounts?.[memberId])
    }

    const hasPositiveSplit = Object.values(sanitizedSplitAmounts).some((value) => value > 0)
    if (!hasPositiveSplit) {
      const equalShare = parseFloat((numericAmount / derivedSplitWith.length).toFixed(2))
      derivedSplitWith.forEach((memberId) => {
        sanitizedSplitAmounts[memberId] = equalShare
      })
    }

    const sanitizedItemSplits = Array.isArray(itemSplits)
      ? itemSplits
          .map((item: any) => ({
            item: typeof item.item === 'string' ? item.item.trim() : '',
            amount: parseNumber(item.amount),
            selectedBy: Array.isArray(item.selectedBy)
              ? Array.from(
                  new Set(
                    item.selectedBy
                      .filter((memberId: string) => typeof memberId === 'string')
                      .filter((memberId: string) => validMemberIds.has(memberId))
                  )
                )
              : []
          }))
          .filter((item) => item.item && item.amount > 0 && item.selectedBy.length > 0)
      : undefined

    const sanitizedDuration =
      duration && typeof duration === 'object'
        ? Object.entries(duration).reduce((acc, [memberId, value]) => {
            if (validMemberIds.has(memberId)) {
              const parsed = parseNumber(value)
              if (parsed > 0) {
                acc[memberId] = parsed
              }
            }
            return acc
          }, {} as Record<string, number>)
        : undefined

    const finalSplitWith = Object.keys(sanitizedSplitAmounts).filter(
      (memberId) => sanitizedSplitAmounts[memberId] > 0
    )

    if (finalSplitWith.length === 0) {
      return c.json({ error: 'Split amounts must include at least one participant' }, 400)
    }

    const filteredSplitAmounts = finalSplitWith.reduce((acc, memberId) => {
      acc[memberId] = sanitizedSplitAmounts[memberId]
      return acc
    }, {} as Record<string, number>)

    const expenseId = generateId()
    const expense = {
      id: expenseId,
      groupId,
      description: description.trim(),
      amount: numericAmount,
      paidBy,
      splitWith: finalSplitWith,
      splitType: sanitizedSplitType,
      splitAmounts: filteredSplitAmounts,
      category: category?.trim() || 'other',
      notes: notes?.trim() || '',
      itemSplits: sanitizedItemSplits,
      duration: sanitizedDuration,
      createdBy: userId,
      createdAt: new Date().toISOString()
    }

    // Add expense to group
    const expenses = await kv.get(`group:${groupId}:expenses`)
    const expenseList = expenses.value || []
    expenseList.unshift(expense)
    await kv.set(`group:${groupId}:expenses`, expenseList)

    // Update balances based on split amounts
    const balances = await kv.get(`group:${groupId}:balances`)
    const balanceMap = balances.value || {}

    for (const memberId of finalSplitWith) {
      if (memberId !== paidBy) {
        const memberAmount = filteredSplitAmounts[memberId] || 0
        const key = makeBalanceKey(paidBy, memberId)
        balanceMap[key] = (balanceMap[key] || 0) + memberAmount
      }
    }

    await kv.set(`group:${groupId}:balances`, balanceMap)

    return c.json(expense)
  } catch (error) {
    console.log('Error adding expense:', error)
    return c.json({ error: 'Failed to add expense' }, 500)
  }
})

app.post('/make-server-f573a585/groups/:id/payments', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const groupId = c.req.param('id')
    const { fromMemberId, toMemberId, amount, note } = await c.req.json()

    if (!fromMemberId || !toMemberId) {
      return c.json({ error: 'Missing participant information' }, 400)
    }

    if (fromMemberId === toMemberId) {
      return c.json({ error: 'Cannot record payment to the same member' }, 400)
    }

    const parseNumber = (value: unknown) => {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0
      }
      const numeric = parseFloat(String(value))
      return Number.isFinite(numeric) ? numeric : 0
    }

    const numericAmount = parseNumber(amount)
    if (numericAmount <= 0) {
      return c.json({ error: 'Payment amount must be greater than zero' }, 400)
    }

    const members = await kv.get(`group:${groupId}:members`)
    const memberIds: string[] = members.value || []

    if (!memberIds.includes(fromMemberId) || !memberIds.includes(toMemberId)) {
      return c.json({ error: 'Participants must be members of the group' }, 400)
    }

    const payments = await kv.get(`group:${groupId}:payments`)
    const paymentList = payments.value || []

    const payment = {
      id: generateId(),
      groupId,
      fromMemberId,
      toMemberId,
      amount: parseFloat(numericAmount.toFixed(2)),
      note: typeof note === 'string' ? note.trim() : '',
      createdBy: userId,
      createdAt: new Date().toISOString()
    }

    paymentList.unshift(payment)
    await kv.set(`group:${groupId}:payments`, paymentList)

    const balances = await kv.get(`group:${groupId}:balances`)
    const balanceMap: Record<string, number> = balances.value || {}

    const roundAmount = (value: number) => Math.round(value * 100) / 100

    const settleKey = makeBalanceKey(toMemberId, fromMemberId)
    const reverseKey = makeBalanceKey(fromMemberId, toMemberId)

    let remaining = numericAmount
    const existing = balanceMap[settleKey] || 0

    if (existing > 0) {
      if (existing >= remaining) {
        const updated = roundAmount(existing - remaining)
        if (updated > 0.009) {
          balanceMap[settleKey] = updated
        } else {
          delete balanceMap[settleKey]
        }
        remaining = 0
      } else {
        remaining = remaining - existing
        delete balanceMap[settleKey]
      }
    }

    if (remaining > 0.009) {
      const updated = roundAmount((balanceMap[reverseKey] || 0) + remaining)
      if (updated > 0.009) {
        balanceMap[reverseKey] = updated
      } else {
        delete balanceMap[reverseKey]
      }
    }

    await kv.set(`group:${groupId}:balances`, balanceMap)

    return c.json({ payment, balances: balanceMap })
  } catch (error) {
    console.log('Error recording payment:', error)
    return c.json({ error: 'Failed to record payment' }, 500)
  }
})

app.post('/make-server-f573a585/groups/:id/simplify', requireAuth, async (c) => {
  try {
    const groupId = c.req.param('id')
    
    const balances = await kv.get(`group:${groupId}:balances`)
    const balanceMap = balances.value || {}

    // Calculate net balances for each member
    const members = await kv.get(`group:${groupId}:members`)
    const memberIds = members.value || []
    
    const netBalances: Record<string, number> = {}
    memberIds.forEach(id => netBalances[id] = 0)

    // Process existing balances
    Object.entries(balanceMap).forEach(([key, value]) => {
      const { creditorId, debtorId } = parseBalanceKey(key)
      netBalances[creditorId] = (netBalances[creditorId] || 0) + (value as number)
      netBalances[debtorId] = (netBalances[debtorId] || 0) - (value as number)
    })

    // Simplify: match creditors with debtors
    const simplified: Record<string, number> = {}
    const creditors = Object.entries(netBalances).filter(([_, bal]) => bal > 0.01)
    const debtors = Object.entries(netBalances).filter(([_, bal]) => bal < -0.01)

    creditors.sort((a, b) => b[1] - a[1])
    debtors.sort((a, b) => a[1] - b[1])

    let i = 0, j = 0
    while (i < creditors.length && j < debtors.length) {
      const [creditorId, creditAmount] = creditors[i]
      const [debtorId, debtAmount] = debtors[j]
      
      const settleAmount = Math.min(creditAmount, -debtAmount)
      
      if (settleAmount > 0.01) {
        const key = makeBalanceKey(creditorId, debtorId)
        simplified[key] = settleAmount
      }

      creditors[i][1] -= settleAmount
      debtors[j][1] += settleAmount

      if (creditors[i][1] < 0.01) i++
      if (debtors[j][1] > -0.01) j++
    }

    await kv.set(`group:${groupId}:balances`, simplified)

    return c.json({ balances: simplified })
  } catch (error) {
    console.log('Error simplifying debts:', error)
    return c.json({ error: 'Failed to simplify debts' }, 500)
  }
})

app.post('/make-server-f573a585/groups/:id/members-by-id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const groupId = c.req.param('id')
    const { friendId } = await c.req.json()
    
    if (!friendId) {
      return c.json({ error: 'Friend ID is required' }, 400)
    }

    // Verify the friend exists
    const friend = await kv.get(`user:${friendId}`)
    if (!friend.value) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Add member to group
    const members = await kv.get(`group:${groupId}:members`)
    const memberIds = members.value || []
    
    if (memberIds.includes(friendId)) {
      return c.json({ error: 'User already in group' }, 400)
    }

    memberIds.push(friendId)
    await kv.set(`group:${groupId}:members`, memberIds)

    // Add group to new member's groups
    const userGroups = await kv.get(`user:${friendId}:groups`)
    const groups = userGroups.value || []
    groups.push(groupId)
    await kv.set(`user:${friendId}:groups`, groups)

    // Add notification
    const notifications = await kv.get(`user:${friendId}:notifications`)
    const notifs = notifications.value || []
    notifs.push({
      id: generateId(),
      type: 'group_invite',
      message: `You were added to a group`,
      groupId,
      createdAt: new Date().toISOString()
    })
    await kv.set(`user:${friendId}:notifications`, notifs)

    return c.json({
      id: friend.value.id,
      name: friend.value.name,
      email: friend.value.email,
      username: friend.value.username
    })
  } catch (error) {
    console.log('Error adding member to group by ID:', error)
    return c.json({ error: 'Failed to add member' }, 500)
  }
})

app.post('/make-server-f573a585/groups/:id/settle', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const groupId = c.req.param('id')

    // Get group expenses
    const expenses = await kv.get(`group:${groupId}:expenses`)
    const expenseList = expenses.value || []

    // Get group info
    const group = await kv.get(`group:${groupId}`)
    if (!group.value) {
      return c.json({ error: 'Group not found' }, 404)
    }

    // Sync current user's expenses to personal tracker
    const userExpenses = expenseList.filter(exp => exp.paidBy === userId)
    
    if (userExpenses.length > 0) {
      const personalExpenses = await kv.get(`user:${userId}:personal_expenses`)
      const personalList = personalExpenses.value || []

      for (const expense of userExpenses) {
        // Create personal expense from group expense
        const personalExpense = {
          id: generateId(),
          description: `${expense.description} (${group.value.name})`,
          amount: expense.amount,
          category: expense.category || 'other',
          notes: `Settled from group: ${group.value.name}. ${expense.notes || ''}`,
          createdAt: expense.createdAt,
          userId
        }
        personalList.unshift(personalExpense)
      }

      await kv.set(`user:${userId}:personal_expenses`, personalList)
    }

    return c.json({ 
      success: true, 
      syncedExpenses: userExpenses.length,
      message: 'Expenses settled and synced to personal tracker'
    })
  } catch (error) {
    console.log('Error settling group bill:', error)
    return c.json({ error: 'Failed to settle group bill' }, 500)
  }
})

app.delete('/make-server-f573a585/groups/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const groupId = c.req.param('id')

    // Get group
    const group = await kv.get(`group:${groupId}`)
    if (!group.value) {
      return c.json({ error: 'Group not found' }, 404)
    }

    // Check if user is the creator
    if (group.value.createdBy !== userId) {
      return c.json({ error: 'Only the group creator can delete the group' }, 403)
    }

    // Get all members
    const members = await kv.get(`group:${groupId}:members`)
    const memberIds = members.value || []

    // Remove group from all members' group lists
    for (const memberId of memberIds) {
      const userGroups = await kv.get(`user:${memberId}:groups`)
      const groups = userGroups.value || []
      const updatedGroups = groups.filter(gId => gId !== groupId)
      await kv.set(`user:${memberId}:groups`, updatedGroups)
    }

    // Delete all group data
    await kv.del(`group:${groupId}`)
    await kv.del(`group:${groupId}:members`)
    await kv.del(`group:${groupId}:expenses`)
    await kv.del(`group:${groupId}:balances`)

    return c.json({ success: true, message: 'Group deleted successfully' })
  } catch (error) {
    console.log('Error deleting group:', error)
    return c.json({ error: 'Failed to delete group' }, 500)
  }
})

// Friends routes
app.get('/make-server-f573a585/friends', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    
    const friends = await kv.get(`user:${userId}:friends`)
    const friendIds = friends.value || []
    
    const friendList = []
    for (const friendId of friendIds) {
      const friend = await kv.get(`user:${friendId}`)
      if (friend.value) {
        // Calculate balance with this friend
        const userBalances = await kv.get(`user:${userId}:balances`)
        const balances = userBalances.value || {}
        const balance = balances[friendId] || 0
        
        friendList.push({
          id: friend.value.id,
          name: friend.value.name,
          email: friend.value.email,
          username: friend.value.username,
          balance // positive = they owe you, negative = you owe them
        })
      }
    }

    return c.json(friendList)
  } catch (error) {
    console.log('Error fetching friends:', error)
    return c.json({ error: 'Failed to fetch friends' }, 500)
  }
})

app.post('/make-server-f573a585/friends/add', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { username } = await c.req.json()
    
    if (!username) {
      return c.json({ error: 'Username is required' }, 400)
    }

    const friendUserId = await kv.get(`user:username:${username}`)
    if (!friendUserId.value) {
      return c.json({ error: 'User not found' }, 404)
    }

    if (friendUserId.value === userId) {
      return c.json({ error: 'Cannot add yourself as friend' }, 400)
    }

    // Check if already friends
    const friends = await kv.get(`user:${userId}:friends`)
    const friendIds = friends.value || []
    if (friendIds.includes(friendUserId.value)) {
      return c.json({ error: 'Already friends' }, 400)
    }

    // Add to both users' friend lists
    friendIds.push(friendUserId.value)
    await kv.set(`user:${userId}:friends`, friendIds)

    const theirFriends = await kv.get(`user:${friendUserId.value}:friends`)
    const theirFriendIds = theirFriends.value || []
    theirFriendIds.push(userId)
    await kv.set(`user:${friendUserId.value}:friends`, theirFriendIds)

    // Add notification
    const notifications = await kv.get(`user:${friendUserId.value}:notifications`)
    const notifs = notifications.value || []
    const currentUser = await kv.get(`user:${userId}`)
    notifs.push({
      id: generateId(),
      type: 'friend_request',
      message: `${currentUser.value.name} added you as a friend`,
      createdAt: new Date().toISOString()
    })
    await kv.set(`user:${friendUserId.value}:notifications`, notifs)

    const friend = await kv.get(`user:${friendUserId.value}`)
    return c.json({
      id: friend.value.id,
      name: friend.value.name,
      email: friend.value.email,
      username: friend.value.username,
      balance: 0
    })
  } catch (error) {
    console.log('Error adding friend:', error)
    return c.json({ error: 'Failed to add friend' }, 500)
  }
})

app.post('/make-server-f573a585/friends/add-by-email', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { email } = await c.req.json()
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400)
    }

    const friendUserId = await kv.get(`user:email:${email}`)
    if (!friendUserId.value) {
      return c.json({ error: 'User with this email not found' }, 404)
    }

    if (friendUserId.value === userId) {
      return c.json({ error: 'Cannot add yourself as friend' }, 400)
    }

    // Check if already friends
    const friends = await kv.get(`user:${userId}:friends`)
    const friendIds = friends.value || []
    if (friendIds.includes(friendUserId.value)) {
      return c.json({ error: 'Already friends' }, 400)
    }

    // Add to both users' friend lists
    friendIds.push(friendUserId.value)
    await kv.set(`user:${userId}:friends`, friendIds)

    const theirFriends = await kv.get(`user:${friendUserId.value}:friends`)
    const theirFriendIds = theirFriends.value || []
    theirFriendIds.push(userId)
    await kv.set(`user:${friendUserId.value}:friends`, theirFriendIds)

    // Add notification
    const notifications = await kv.get(`user:${friendUserId.value}:notifications`)
    const notifs = notifications.value || []
    const currentUser = await kv.get(`user:${userId}`)
    notifs.push({
      id: generateId(),
      type: 'friend_request',
      message: `${currentUser.value.name} added you as a friend`,
      createdAt: new Date().toISOString()
    })
    await kv.set(`user:${friendUserId.value}:notifications`, notifs)

    const friend = await kv.get(`user:${friendUserId.value}`)
    return c.json({
      id: friend.value.id,
      name: friend.value.name,
      email: friend.value.email,
      username: friend.value.username,
      balance: 0
    })
  } catch (error) {
    console.log('Error adding friend by email:', error)
    return c.json({ error: 'Failed to add friend' }, 500)
  }
})

app.post('/make-server-f573a585/friends/add-by-code', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { code } = await c.req.json()
    
    if (!code) {
      return c.json({ error: 'Friend code is required' }, 400)
    }

    // Friend code is just the user ID
    const friendUserId = code

    const friend = await kv.get(`user:${friendUserId}`)
    if (!friend.value) {
      return c.json({ error: 'Invalid friend code' }, 404)
    }

    if (friendUserId === userId) {
      return c.json({ error: 'Cannot add yourself as friend' }, 400)
    }

    // Check if already friends
    const friends = await kv.get(`user:${userId}:friends`)
    const friendIds = friends.value || []
    if (friendIds.includes(friendUserId)) {
      return c.json({ error: 'Already friends' }, 400)
    }

    // Add to both users' friend lists
    friendIds.push(friendUserId)
    await kv.set(`user:${userId}:friends`, friendIds)

    const theirFriends = await kv.get(`user:${friendUserId}:friends`)
    const theirFriendIds = theirFriends.value || []
    theirFriendIds.push(userId)
    await kv.set(`user:${friendUserId}:friends`, theirFriendIds)

    // Add notification
    const notifications = await kv.get(`user:${friendUserId}:notifications`)
    const notifs = notifications.value || []
    const currentUser = await kv.get(`user:${userId}`)
    notifs.push({
      id: generateId(),
      type: 'friend_request',
      message: `${currentUser.value.name} added you as a friend`,
      createdAt: new Date().toISOString()
    })
    await kv.set(`user:${friendUserId}:notifications`, notifs)

    return c.json({
      id: friend.value.id,
      name: friend.value.name,
      email: friend.value.email,
      username: friend.value.username,
      balance: 0
    })
  } catch (error) {
    console.log('Error adding friend by code:', error)
    return c.json({ error: 'Failed to add friend' }, 500)
  }
})

app.get('/make-server-f573a585/friends/suggestions', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const query = c.req.query('q') || ''
    
    const friends = await kv.get(`user:${userId}:friends`)
    const friendIds = friends.value || []
    
    const allUsers = await kv.getByPrefix('user:username:')
    const suggestions = []
    
    for (const item of allUsers) {
      const suggestedUserId = item.value
      if (suggestedUserId !== userId && !friendIds.includes(suggestedUserId)) {
        const user = await kv.get(`user:${suggestedUserId}`)
        if (user.value) {
          const username = user.value.username.toLowerCase()
          const name = user.value.name.toLowerCase()
          const searchQuery = query.toLowerCase()
          
          if (username.includes(searchQuery) || name.includes(searchQuery)) {
            suggestions.push({
              id: user.value.id,
              name: user.value.name,
              username: user.value.username,
              email: user.value.email
            })
          }
        }
      }
    }

    return c.json(suggestions.slice(0, 10))
  } catch (error) {
    console.log('Error fetching friend suggestions:', error)
    return c.json({ error: 'Failed to fetch suggestions' }, 500)
  }
})

app.post('/make-server-f573a585/friends/settle', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { friendId, amount, method } = await c.req.json()
    
    if (!friendId || !amount || !method) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const transactionId = generateId()
    const transaction = {
      id: transactionId,
      from: userId,
      to: friendId,
      amount: parseFloat(amount),
      method,
      status: 'completed',
      createdAt: new Date().toISOString()
    }

    // Update balances
    const userBalances = await kv.get(`user:${userId}:balances`)
    const balances = userBalances.value || {}
    balances[friendId] = (balances[friendId] || 0) + parseFloat(amount)
    await kv.set(`user:${userId}:balances`, balances)

    const friendBalances = await kv.get(`user:${friendId}:balances`)
    const fBalances = friendBalances.value || {}
    fBalances[userId] = (fBalances[userId] || 0) - parseFloat(amount)
    await kv.set(`user:${friendId}:balances`, fBalances)

    return c.json(transaction)
  } catch (error) {
    console.log('Error settling debt:', error)
    return c.json({ error: 'Failed to settle debt' }, 500)
  }
})

// Activity routes
app.get('/make-server-f573a585/activity', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    
    // Get all user's groups
    const userGroups = await kv.get(`user:${userId}:groups`)
    const groupIds = userGroups.value || []
    
    const activities = []
    
    // Collect expenses from all groups
    for (const groupId of groupIds) {
      const group = await kv.get(`group:${groupId}`)
      const expenses = await kv.get(`group:${groupId}:expenses`)
      const expenseList = expenses.value || []
      
      for (const expense of expenseList) {
        const payer = await kv.get(`user:${expense.paidBy}`)
        const creator = await kv.get(`user:${expense.createdBy}`)
        
        activities.push({
          id: expense.id,
          type: 'expense',
          description: expense.description,
          amount: expense.amount,
          groupName: group.value?.name || 'Unknown',
          groupId: groupId,
          paidBy: payer.value?.name || 'Unknown',
          createdBy: creator.value?.name || 'Unknown',
          createdAt: expense.createdAt,
          involvedUsers: expense.splitWith.length
        })
      }
    }

    // Sort by date
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate total balance
    const userBalances = await kv.get(`user:${userId}:balances`)
    const balances = userBalances.value || {}
    
    let totalOwed = 0
    let totalReceiving = 0
    
    Object.values(balances).forEach((balance: any) => {
      if (balance > 0) {
        totalReceiving += balance
      } else {
        totalOwed += Math.abs(balance)
      }
    })

    return c.json({
      activities: activities.slice(0, 50),
      totalBalance: totalReceiving - totalOwed,
      totalOwed,
      totalReceiving
    })
  } catch (error) {
    console.log('Error fetching activity:', error)
    return c.json({ error: 'Failed to fetch activity' }, 500)
  }
})

app.get('/make-server-f573a585/notifications', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const notifications = await kv.get(`user:${userId}:notifications`)
    
    return c.json(notifications.value || [])
  } catch (error) {
    console.log('Error fetching notifications:', error)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
})

app.get('/make-server-f573a585/dashboard', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    
    // Get personal expenses
    const personalExpenses = await kv.get(`user:${userId}:personal_expenses`)
    const personalExpenseList = personalExpenses.value || []
    
    // Get all user's groups
    const userGroups = await kv.get(`user:${userId}:groups`)
    const groupIds = userGroups.value || []
    
    // Get friends
    const friends = await kv.get(`user:${userId}:friends`)
    const friendIds = friends.value || []
    
    // Get budgets
    const budgets = await kv.get(`user:${userId}:budgets`)
    const budgetList = budgets.value || []
    
    // Calculate balances
    const userBalances = await kv.get(`user:${userId}:balances`)
    const balances = userBalances.value || {}
    
    let totalOwed = 0
    let totalReceiving = 0
    
    Object.values(balances).forEach((balance: any) => {
      if (balance > 0) {
        totalReceiving += balance
      } else {
        totalOwed += Math.abs(balance)
      }
    })

    // Calculate personal expense statistics
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const monthlyExpenses = personalExpenseList.filter((exp: any) => {
      const expDate = new Date(exp.createdAt)
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
    })
    
    const monthlyTotal = monthlyExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    
    // Calculate category spending for personal expenses
    const categorySpending: any = {}
    personalExpenseList.forEach((exp: any) => {
      const category = exp.category || 'other'
      categorySpending[category] = (categorySpending[category] || 0) + exp.amount
    })

    // Collect recent activities (both personal and group)
    const activities = []
    let totalGroupExpenses = 0
    
    // Add personal expenses to activities
    for (const expense of personalExpenseList) {
      activities.push({
        id: expense.id,
        type: 'personal',
        description: expense.description,
        amount: expense.amount,
        groupName: 'Personal',
        groupId: null,
        paidBy: 'You',
        createdAt: expense.createdAt,
        category: expense.category || 'other',
        notes: expense.notes || ''
      })
    }
    
    for (const groupId of groupIds) {
      const group = await kv.get(`group:${groupId}`)
      const expenses = await kv.get(`group:${groupId}:expenses`)
      const expenseList = expenses.value || []
      
      totalGroupExpenses += expenseList.length
      
      for (const expense of expenseList) {
        const payer = await kv.get(`user:${expense.paidBy}`)
        
        activities.push({
          id: expense.id,
          type: 'group',
          description: expense.description,
          amount: expense.amount,
          groupName: group.value?.name || 'Unknown',
          groupId: groupId,
          paidBy: payer.value?.name || 'Unknown',
          createdAt: expense.createdAt,
          category: expense.category || 'other'
        })
      }
    }

    // Sort by date
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return c.json({
      totalGroups: groupIds.length,
      totalFriends: friendIds.length,
      totalExpenses: totalGroupExpenses,
      personalExpensesCount: personalExpenseList.length,
      monthlyTotal,
      monthlyExpensesCount: monthlyExpenses.length,
      totalBalance: totalReceiving - totalOwed,
      totalOwed,
      totalReceiving,
      recentActivity: activities.slice(0, 20),
      categorySpending,
      budgets: budgetList
    })
  } catch (error) {
    console.log('Error fetching dashboard stats:', error)
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
  }
})

// Personal Expenses Routes
app.get('/make-server-f573a585/personal-expenses', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    console.log('GET personal-expenses for userId:', userId)
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    console.log('Found expenses count:', (expenses.value || []).length)
    
    return c.json(expenses.value || [])
  } catch (error) {
    console.log('Error fetching personal expenses:', error)
    return c.json({ error: 'Failed to fetch personal expenses' }, 500)
  }
})

app.post('/make-server-f573a585/personal-expenses', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { description, amount, category, notes, receiptUrl } = await c.req.json()
    
    if (!description || !amount) {
      return c.json({ error: 'Description and amount are required' }, 400)
    }

    const expenseId = generateId()
    const expense = {
      id: expenseId,
      userId,
      description,
      amount: parseFloat(amount),
      category: category || 'other',
      notes: notes || '',
      receiptUrl: receiptUrl || null,
      createdAt: new Date().toISOString()
    }

    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const expenseList = expenses.value || []
    expenseList.push(expense)
    await kv.set(`user:${userId}:personal_expenses`, expenseList)

    return c.json(expense)
  } catch (error) {
    console.log('Error creating personal expense:', error)
    return c.json({ error: 'Failed to create expense' }, 500)
  }
})

app.delete('/make-server-f573a585/personal-expenses/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const expenseId = c.req.param('id')
    
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const expenseList = expenses.value || []
    
    const updatedList = expenseList.filter((exp: any) => exp.id !== expenseId)
    await kv.set(`user:${userId}:personal_expenses`, updatedList)

    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting personal expense:', error)
    return c.json({ error: 'Failed to delete expense' }, 500)
  }
})

// Budget Routes
app.get('/make-server-f573a585/budgets', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const budgets = await kv.get(`user:${userId}:budgets`)
    
    return c.json(budgets.value || [])
  } catch (error) {
    console.log('Error fetching budgets:', error)
    return c.json({ error: 'Failed to fetch budgets' }, 500)
  }
})

app.post('/make-server-f573a585/budgets', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { category, limit, month, year } = await c.req.json()
    
    if (!category || !limit) {
      return c.json({ error: 'Category and limit are required' }, 400)
    }

    const budgetId = generateId()
    const now = new Date()
    const budget = {
      id: budgetId,
      category,
      limit: parseFloat(limit),
      month: month || now.getMonth(),
      year: year || now.getFullYear(),
      createdAt: new Date().toISOString()
    }

    const budgets = await kv.get(`user:${userId}:budgets`)
    const budgetList = budgets.value || []
    budgetList.push(budget)
    await kv.set(`user:${userId}:budgets`, budgetList)

    return c.json(budget)
  } catch (error) {
    console.log('Error creating budget:', error)
    return c.json({ error: 'Failed to create budget' }, 500)
  }
})

app.delete('/make-server-f573a585/budgets/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const budgetId = c.req.param('id')
    
    const budgets = await kv.get(`user:${userId}:budgets`)
    const budgetList = budgets.value || []
    
    const updatedList = budgetList.filter((b: any) => b.id !== budgetId)
    await kv.set(`user:${userId}:budgets`, updatedList)

    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting budget:', error)
    return c.json({ error: 'Failed to delete budget' }, 500)
  }
})

// Rate limiting state - Balanced for OpenRouter free tier with model fallbacks
const rateLimitState = {
  lastCallTime: 0,
  callCount: 0,
  resetTime: 0,
  minDelay: 3000, // 3 seconds between calls (we have model fallbacks now)
  maxCallsPerMinute: 10 // Allow more calls since we rotate models
}

// Helper function to check and enforce rate limits
async function checkRateLimit() {
  const now = Date.now()
  
  // Reset counter every minute
  if (now > rateLimitState.resetTime) {
    rateLimitState.callCount = 0
    rateLimitState.resetTime = now + 60000 // Next minute
  }
  
  // Check if we've exceeded calls per minute
  if (rateLimitState.callCount >= rateLimitState.maxCallsPerMinute) {
    const waitTime = rateLimitState.resetTime - now
    console.log(`Rate limit reached (${rateLimitState.callCount}/${rateLimitState.maxCallsPerMinute}), reset in ${waitTime}ms`)
    throw new Error(`Rate limit: ${Math.ceil(waitTime / 1000)}s cooldown. Cached results served for 30 minutes.`)
  }
  
  // Enforce minimum delay between calls
  const timeSinceLastCall = now - rateLimitState.lastCallTime
  if (timeSinceLastCall < rateLimitState.minDelay) {
    const waitTime = rateLimitState.minDelay - timeSinceLastCall
    console.log(`Enforcing rate limit delay: ${waitTime}ms`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  rateLimitState.lastCallTime = Date.now()
  rateLimitState.callCount++
}

// Free models to try in order (fallback chain)
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'mistralai/mistral-7b-instruct:free'
]

// Helper function to call OpenRouter API with rate limiting and retry logic
async function callGeminiAPI(prompt: string, systemInstruction?: string, retryCount = 0, modelIndex = 0): Promise<string> {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  // Check rate limits before making call
  await checkRateLimit()

  const model = FREE_MODELS[modelIndex] || FREE_MODELS[0]
  console.log(`Trying model: ${model} (attempt ${retryCount + 1})`)

  try {
    const messages: any[] = []
    
    if (systemInstruction) {
      messages.push({
        role: 'system',
        content: systemInstruction
      })
    }
    
    messages.push({
      role: 'user',
      content: prompt
    })

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://expense-manager.app',
          'X-Title': 'Expense Manager AI'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.1,
          max_tokens: 1024,
        })
      }
    )

    const data = await response.json()

    // Handle rate limit errors from API
    if (!response.ok) {
      if (response.status === 429) {
        console.error(`Rate limit hit for model ${model}`)
        
        // Try next model if available
        if (modelIndex < FREE_MODELS.length - 1) {
          console.log(`Trying fallback model...`)
          await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s before trying next model
          return callGeminiAPI(prompt, systemInstruction, 0, modelIndex + 1)
        }
        
        // If all models exhausted, retry with exponential backoff
        if (retryCount < 3) {
          const waitTime = Math.pow(2, retryCount + 1) * 5000 // 10s, 20s, 40s
          console.log(`All models rate limited. Waiting ${waitTime/1000}s before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          return callGeminiAPI(prompt, systemInstruction, retryCount + 1, 0)
        }
        
        throw new Error('Too Many Requests - All models rate limited. Please try again in a minute.')
      }
      
      // Check for error in response body
      if (data.error) {
        console.error('OpenRouter API error:', data.error)
        
        // Try next model on other errors too
        if (modelIndex < FREE_MODELS.length - 1) {
          console.log(`Error with ${model}, trying fallback...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return callGeminiAPI(prompt, systemInstruction, retryCount, modelIndex + 1)
        }
        
        throw new Error(data.error.message || 'API error')
      }
      
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const content = data.choices?.[0]?.message?.content || ''
    if (!content) {
      // Empty response, try next model
      if (modelIndex < FREE_MODELS.length - 1) {
        console.log(`Empty response from ${model}, trying fallback...`)
        return callGeminiAPI(prompt, systemInstruction, retryCount, modelIndex + 1)
      }
    }
    
    console.log(`Success with model: ${model}`)
    return content
  } catch (error: any) {
    // On network errors, retry with next model
    if (modelIndex < FREE_MODELS.length - 1 && !error.message.includes('not configured')) {
      console.log(`Network error with ${model}, trying fallback...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return callGeminiAPI(prompt, systemInstruction, retryCount, modelIndex + 1)
    }
    
    // Final retry attempt
    if (retryCount < 2 && !error.message.includes('not configured') && !error.message.includes('Too Many Requests')) {
      console.log(`Retrying API call (attempt ${retryCount + 1})...`)
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000))
      return callGeminiAPI(prompt, systemInstruction, retryCount + 1, 0)
    }
    
    throw error
  }
}

// Helper function to call OpenRouter Vision API with rate limiting
async function callGeminiVisionAPI(imageBase64: string, prompt: string, retryCount = 0) {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  // Check rate limits before making call
  await checkRateLimit()

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://expense-manager.app',
          'X-Title': 'Expense Manager AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }],
          temperature: 0.1,
          max_tokens: 2048,
        })
      }
    )

    const data = await response.json()

    // Handle rate limit errors from API
    if (!response.ok) {
      if (response.status === 429) {
        console.error('OpenRouter Vision API rate limit exceeded')
        throw new Error('Too Many Requests')
      }
      
      // Check for error in response body
      if (data.error) {
        console.error('OpenRouter Vision API error:', data.error)
        throw new Error(data.error.message || 'API error')
      }
      
      throw new Error(`OpenRouter Vision API error: ${response.statusText}`)
    }

    return data.choices?.[0]?.message?.content || ''
  } catch (error: any) {
    // Don't retry on rate limit errors
    if (error.message.includes('Too Many Requests')) {
      throw error
    }
    
    // Retry on network errors (max 2 retries)
    if (retryCount < 2 && !error.message.includes('not configured')) {
      console.log(`Retrying Vision API call (attempt ${retryCount + 1})...`)
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
      return callGeminiVisionAPI(imageBase64, prompt, retryCount + 1)
    }
    
    throw error
  }
}

// Helper function to handle analytics queries
async function handleAnalyticsQuery(parsedQuery: any, expenseList: any[], originalQuery: string) {
  // Filter expenses by date if specified
  let filteredExpenses = expenseList
  const now = new Date()
  
  if (parsedQuery.dateFilter && parsedQuery.dateFilter !== 'null') {
    filteredExpenses = expenseList.filter((exp: any) => {
      const expDate = new Date(exp.createdAt)
      
      switch (parsedQuery.dateFilter) {
        case 'last_week':
          return expDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case 'last_month':
          return expDate >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        case 'this_month':
          return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
        case 'this_year':
          return expDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
  }
  
  // Filter by category if specified
  if (parsedQuery.category && parsedQuery.category !== 'null') {
    filteredExpenses = filteredExpenses.filter((exp: any) => exp.category === parsedQuery.category)
  }
  
  // Perform analysis based on type
  let analysisResult: any = {}
  
  switch (parsedQuery.analysisType) {
    case 'total':
      const total = filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      analysisResult = {
        value: total,
        count: filteredExpenses.length,
        text: `You spent ৳${total.toFixed(2)} across ${filteredExpenses.length} expenses`
      }
      break
      
    case 'average':
      const avg = filteredExpenses.length > 0 
        ? filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0) / filteredExpenses.length
        : 0
      analysisResult = {
        value: avg,
        count: filteredExpenses.length,
        text: `Your average expense is ৳${avg.toFixed(2)} (based on ${filteredExpenses.length} expenses)`
      }
      break
      
    case 'breakdown':
      const categoryBreakdown: any = {}
      filteredExpenses.forEach((exp: any) => {
        const cat = exp.category || 'other'
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { total: 0, count: 0 }
        }
        categoryBreakdown[cat].total += exp.amount
        categoryBreakdown[cat].count += 1
      })
      
      const sortedCategories = Object.entries(categoryBreakdown)
        .sort(([, a]: any, [, b]: any) => b.total - a.total)
      
      const topCategory = sortedCategories[0]
      analysisResult = {
        breakdown: categoryBreakdown,
        topCategory: topCategory ? topCategory[0] : 'none',
        topAmount: topCategory ? (topCategory[1] as any).total : 0,
        text: topCategory 
          ? `Your top spending category is ${topCategory[0]} with ৳${(topCategory[1] as any).total.toFixed(2)}`
          : 'No expenses found'
      }
      break
      
    case 'comparison':
      if (parsedQuery.compareWith) {
        const cat1Expenses = filteredExpenses.filter((exp: any) => exp.category === parsedQuery.category)
        const cat2Expenses = filteredExpenses.filter((exp: any) => exp.category === parsedQuery.compareWith)
        
        const cat1Total = cat1Expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
        const cat2Total = cat2Expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
        
        const difference = cat1Total - cat2Total
        const percentage = cat2Total > 0 ? ((difference / cat2Total) * 100) : 0
        
        analysisResult = {
          category1: { name: parsedQuery.category, total: cat1Total, count: cat1Expenses.length },
          category2: { name: parsedQuery.compareWith, total: cat2Total, count: cat2Expenses.length },
          difference: difference,
          percentage: percentage,
          text: difference > 0 
            ? `You spent ৳${Math.abs(difference).toFixed(2)} more on ${parsedQuery.category} than ${parsedQuery.compareWith}`
            : `You spent ৳${Math.abs(difference).toFixed(2)} less on ${parsedQuery.category} than ${parsedQuery.compareWith}`
        }
      }
      break
      
    case 'trend':
      // Group by month
      const monthlyData: any = {}
      filteredExpenses.forEach((exp: any) => {
        const expDate = new Date(exp.createdAt)
        const monthKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, count: 0 }
        }
        monthlyData[monthKey].total += exp.amount
        monthlyData[monthKey].count += 1
      })
      
      const months = Object.keys(monthlyData).sort()
      const trend = months.length >= 2 
        ? monthlyData[months[months.length - 1]].total - monthlyData[months[months.length - 2]].total
        : 0
      
      analysisResult = {
        monthlyData: monthlyData,
        trend: trend,
        text: trend > 0 
          ? `Your spending increased by ৳${trend.toFixed(2)} compared to previous month`
          : trend < 0
          ? `Your spending decreased by ৳${Math.abs(trend).toFixed(2)} compared to previous month`
          : 'Your spending remained stable'
      }
      break
  }
  
  return {
    type: 'analytics',
    data: {
      analysisResult: analysisResult,
      explanation: parsedQuery.explanation,
      expenses: filteredExpenses.slice(0, 5)
    }
  }
}

// Helper function to filter expenses based on AI-parsed query
function filterExpensesByAI(parsedQuery: any, expenseList: any[]): any[] {
  const now = new Date()
  
  return expenseList.filter((exp: any) => {
    // Keyword matching
    if (parsedQuery.keywords && parsedQuery.keywords.length > 0) {
      const searchText = `${exp.description} ${exp.category} ${exp.notes || ''}`.toLowerCase()
      const matchesKeywords = parsedQuery.keywords.some((keyword: string) => 
        searchText.includes(keyword.toLowerCase())
      )
      if (!matchesKeywords) return false
    }
    
    // Category matching
    if (parsedQuery.category && parsedQuery.category !== 'null' && parsedQuery.category !== null) {
      if (exp.category?.toLowerCase() !== parsedQuery.category.toLowerCase()) return false
    }
    
    // Amount filters
    if (parsedQuery.minAmount !== null && parsedQuery.minAmount !== undefined) {
      if (exp.amount < parsedQuery.minAmount) return false
    }
    if (parsedQuery.maxAmount !== null && parsedQuery.maxAmount !== undefined) {
      if (exp.amount > parsedQuery.maxAmount) return false
    }
    
    // Date filter
    if (parsedQuery.dateFilter && parsedQuery.dateFilter !== 'null' && parsedQuery.dateFilter !== null) {
      const expDate = new Date(exp.createdAt)
      
      switch (parsedQuery.dateFilter) {
        case 'today':
          if (expDate.toDateString() !== now.toDateString()) return false
          break
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          if (expDate.toDateString() !== yesterday.toDateString()) return false
          break
        case 'this_week':
          const weekStart = new Date(now)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          weekStart.setHours(0, 0, 0, 0)
          if (expDate < weekStart) return false
          break
        case 'last_week':
          const lastWeekEnd = new Date(now)
          lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay())
          lastWeekEnd.setHours(0, 0, 0, 0)
          const lastWeekStart = new Date(lastWeekEnd)
          lastWeekStart.setDate(lastWeekStart.getDate() - 7)
          if (expDate < lastWeekStart || expDate >= lastWeekEnd) return false
          break
        case 'this_month':
          if (expDate.getMonth() !== now.getMonth() || expDate.getFullYear() !== now.getFullYear()) return false
          break
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          if (expDate < lastMonth || expDate >= thisMonthStart) return false
          break
        case 'this_year':
          if (expDate.getFullYear() !== now.getFullYear()) return false
          break
      }
    }
    
    return true
  })
}

// AI-Powered Natural Language Search & Analytics with OpenRouter AI
app.get('/make-server-f573a585/search', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const query = c.req.query('q') || ''
    const skipCache = c.req.query('nocache') === '1'
    
    console.log('=== AI Search Request ===')
    console.log('userId:', userId, 'query:', query)
    
    if (!query.trim()) {
      return c.json({ type: 'results', data: [] })
    }
    
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const expenseList = expenses.value || []
    
    console.log('User has', expenseList.length, 'personal expenses')
    
    // If user has no expenses, return helpful message
    if (expenseList.length === 0) {
      return c.json({ 
        type: 'results', 
        data: [],
        explanation: 'You don\'t have any personal expenses yet. Add some expenses first to use the search feature!'
      })
    }
    
    // Check cache first (5 minute cache for search results) - can be bypassed with nocache=1
    const searchCacheKey = `search:${userId}:${query.toLowerCase().trim()}`
    if (!skipCache) {
      const cachedSearch = await kv.get(searchCacheKey)
      if (cachedSearch.value) {
        const cacheAge = Date.now() - new Date(cachedSearch.value.cachedAt).getTime()
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log(`Returning cached search (age: ${Math.round(cacheAge / 1000)}s)`)
          return c.json(cachedSearch.value.data)
        }
      }
    }
    
    // Check for OpenRouter API Key
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    console.log('OPENROUTER_API_KEY configured:', !!apiKey)
    
    if (!apiKey) {
      return c.json({ 
        type: 'error',
        error: 'AI search is not configured. Please set up OPENROUTER_API_KEY.',
        data: []
      }, 503)
    }
    
    // Build expense summary for AI context
    const categoryTotals: Record<string, number> = {}
    let totalSpent = 0
    expenseList.forEach((exp: any) => {
      const cat = exp.category || 'other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount
      totalSpent += exp.amount
    })
    
    const expenseSummary = Object.entries(categoryTotals)
      .map(([cat, total]) => `${cat}: ৳${total.toFixed(2)}`)
      .join(', ')
    
    // Build detailed expense list for AI
    const expenseDetails = expenseList.slice(0, 50).map((exp: any, i: number) => 
      `${i+1}. ${exp.description} - ৳${exp.amount} (${exp.category || 'other'}) on ${exp.createdAt?.split('T')[0] || 'unknown date'}`
    ).join('\n')
    
    const systemInstruction = `You are an intelligent financial assistant analyzing user expenses.

Available categories: food, groceries, transport, entertainment, utilities, shopping, health, education, other.

Current date: ${new Date().toISOString().split('T')[0]}

=== USER'S EXPENSE DATA ===
Total expenses: ${expenseList.length}
Total spent: ৳${totalSpent.toFixed(2)}
Breakdown by category: ${expenseSummary}

Recent expenses:
${expenseDetails}

=== YOUR TASK ===
Analyze the user's query and respond with the appropriate JSON format.

QUERY TYPES:

1. SEARCH QUERIES (finding specific expenses):
   Examples: "show food expenses", "coffee purchases", "expenses over ৳500"
   Return:
   {
     "type": "search",
     "keywords": ["relevant", "keywords"],
     "category": "food|groceries|transport|entertainment|utilities|shopping|health|education|other|null",
     "dateFilter": "today|yesterday|this_week|last_week|this_month|last_month|this_year|null",
     "minAmount": number or null,
     "maxAmount": number or null,
     "explanation": "Human-readable explanation of what you found"
   }

2. ANALYTICAL QUERIES (calculating totals, comparing, analyzing):
   Examples: "how much did I spend on food?", "what's my top spending category?", "compare food vs transport"
   Return:
   {
     "type": "analytics",
     "analysisType": "total|average|comparison|breakdown|trend|top_category",
     "category": "specific category or null for all",
     "dateFilter": "today|yesterday|this_week|last_week|this_month|last_month|this_year|null",
     "compareWith": "second category for comparison or null",
     "result": {
       "text": "Your top spending category is 'food' with ৳1500.00 across 10 expenses",
       "total": calculated_total_number,
       "category": "the relevant category",
       "breakdown": {"food": 1500, "transport": 800, ...} // for breakdown queries
     },
     "explanation": "Human-readable explanation with actual calculated numbers from the data above"
   }

CRITICAL RULES:
1. ALWAYS calculate actual numbers from the expense data provided
2. For "most spent" or "top category" queries, look at the breakdown and identify the highest
3. Return ONLY valid JSON, no markdown code blocks
4. The "explanation" and "result.text" should contain ACTUAL calculated values, not placeholders`

    const prompt = `User query: "${query}"

Based on the expense data provided, analyze this query and return the appropriate JSON response.`
    
    console.log('Calling AI with query:', query)
    
    // Call AI
    const aiResponse = await callGeminiAPI(prompt, systemInstruction)
    console.log('AI raw response:', aiResponse)
    
    // Parse AI response
    const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let parsedQuery
    try {
      parsedQuery = JSON.parse(cleanResponse)
      console.log('AI parsed response:', JSON.stringify(parsedQuery, null, 2))
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return c.json({ 
        type: 'error',
        error: 'AI returned an invalid response. Please try rephrasing your query.',
        rawResponse: cleanResponse,
        data: []
      }, 500)
    }
    
    // Handle analytics queries
    if (parsedQuery.type === 'analytics') {
      console.log('Processing analytics query')
      
      // If AI provided direct result, use it
      if (parsedQuery.result) {
        const analyticsResult = {
          type: 'analytics',
          data: {
            analysisResult: parsedQuery.result,
            explanation: parsedQuery.explanation || parsedQuery.result.text,
            expenses: expenseList.slice(0, 5),
            aiPowered: true
          }
        }
        
        // Cache result
        await kv.set(searchCacheKey, {
          data: analyticsResult,
          cachedAt: new Date().toISOString()
        })
        
        return c.json(analyticsResult)
      }
      
      // Otherwise use handleAnalyticsQuery
      const analyticsResult = await handleAnalyticsQuery(parsedQuery, expenseList, query)
      
      if (analyticsResult.data) {
        analyticsResult.data.aiExplanation = parsedQuery.explanation
        analyticsResult.data.aiPowered = true
      }
      
      // Cache result
      await kv.set(searchCacheKey, {
        data: analyticsResult,
        cachedAt: new Date().toISOString()
      })
      
      return c.json(analyticsResult)
    }
    
    // Handle search queries - filter expenses based on AI understanding
    console.log('Processing search query')
    const results = filterExpensesByAI(parsedQuery, expenseList)
    
    const searchResult = { 
      type: 'results', 
      data: results,
      explanation: parsedQuery.explanation || `Found ${results.length} matching expense(s)`,
      aiPowered: true
    }
    
    // Cache result
    await kv.set(searchCacheKey, {
      data: searchResult,
      cachedAt: new Date().toISOString()
    })
    
    return c.json(searchResult)
    
  } catch (error: any) {
    console.error('AI Search error:', error?.message || error)
    return c.json({ 
      type: 'error',
      error: `AI search failed: ${error?.message || 'Unknown error'}. Please try again.`,
      data: []
    }, 500)
  }
})

// AI Receipt Scanner with OpenRouter Vision
app.post('/make-server-f573a585/scan-receipt', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const imageBase64 = body.image
    
    if (!imageBase64) {
      return c.json({ error: 'No image provided' }, 400)
    }
    
    // Check if API key is configured
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!apiKey) {
      console.log('OPENROUTER_API_KEY not configured, returning error')
      return c.json({ 
        error: 'AI receipt scanning is not configured. Please set OPENROUTER_API_KEY environment variable.',
        details: 'OPENROUTER_API_KEY not configured'
      }, 503)
    }
    
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    // Enhanced receipt analysis prompt
    const prompt = `Analyze this receipt/bill image in detail and extract ALL information in JSON format.

Required JSON structure:
{
  "merchant": "exact store/restaurant name",
  "amount": total_amount_as_number (FINAL TOTAL only),
  "subtotal": subtotal_before_tax_and_tips,
  "tax": tax_amount,
  "tip": tip_amount,
  "date": "YYYY-MM-DD format or null",
  "time": "HH:MM format or null",
  "items": [
    {"name": "item name", "quantity": number, "price": price_per_unit, "total": item_total}
  ],
  "paymentMethod": "cash|card|upi|mobile|null",
  "category": "one of: food, groceries, transport, entertainment, utilities, shopping, health, education, other",
  "currency": "৳|$|€|£ or currency code",
  "receiptNumber": "receipt/invoice number if visible",
  "merchantAddress": "address if visible",
  "merchantPhone": "phone if visible",
  "confidence": "high|medium|low - your confidence in the extraction",
  "notes": "any special observations like discounts, offers, etc"
}

CRITICAL RULES:
1. Amount must be the FINAL TOTAL (after tax, tip, everything)
2. If you see "Total", "Grand Total", "Amount to Pay" - use that
3. Don't use subtotals, don't use individual items
4. For currency: Bangladeshi Taka (৳), Indian Rupee (₹), Dollar ($), etc
5. Category must match merchant type:
   - Restaurants/cafes → food
   - Supermarkets/shops → groceries
   - Uber/taxi/gas → transport
   - Movies/events → entertainment
   - Electric/water → utilities
   - Clothing/electronics → shopping
   - Medicine/clinic → health
   - Books/courses → education
6. Extract ALL items with their individual prices
7. Look for tax, service charge, tips separately
8. Return ONLY valid JSON, no markdown, no explanation`

    const aiResponse = await callGeminiVisionAPI(base64Data, prompt)
    console.log('OpenRouter Vision response:', aiResponse)
    
    // Parse the AI response
    const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const scannedData = JSON.parse(cleanResponse)
    
    // Validate and build response
    const description = scannedData.merchant || 'Receipt scan'
    const itemsText = scannedData.items && scannedData.items.length > 0
      ? scannedData.items.map((item: any) => `${item.name} (৳${item.total || item.price})`).join(', ')
      : 'No items detected'
    
    const notesText = [
      scannedData.notes,
      scannedData.receiptNumber ? `Receipt #${scannedData.receiptNumber}` : '',
      scannedData.paymentMethod ? `Paid via ${scannedData.paymentMethod}` : '',
      scannedData.tax ? `Tax: ৳${scannedData.tax}` : '',
      scannedData.tip ? `Tip: ৳${scannedData.tip}` : ''
    ].filter(Boolean).join(' | ')
    
    // Return enhanced structured data
    return c.json({
      description: description,
      amount: scannedData.amount || 0,
      category: scannedData.category || 'other',
      notes: `${itemsText}\n${notesText}`,
      date: scannedData.date,
      confidence: scannedData.confidence || 'medium',
      rawData: scannedData,
      itemBreakdown: scannedData.items || [],
      subtotal: scannedData.subtotal,
      tax: scannedData.tax,
      tip: scannedData.tip,
      merchantInfo: {
        name: scannedData.merchant,
        address: scannedData.merchantAddress,
        phone: scannedData.merchantPhone
      }
    })
  } catch (error) {
    console.log('Error scanning receipt:', error)
    return c.json({ 
      error: 'Failed to scan receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// AI-Powered Spending Insights with caching
app.get('/make-server-f573a585/ai/insights', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    
    // Check cache first (4 hour cache - significantly increased for free tier rate limits)
    const cacheKey = `ai_insights:${userId}`
    const cached = await kv.get(cacheKey)
    if (cached.value) {
      const cacheAge = Date.now() - new Date(cached.value.cachedAt).getTime()
      if (cacheAge < 4 * 60 * 60 * 1000) { // 4 hours
        console.log(`Returning cached insights (age: ${Math.round(cacheAge / 1000)}s)`)
        return c.json(cached.value.data)
      }
    }
    
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const budgets = await kv.get(`user:${userId}:budgets`)
    const expenseList = expenses.value || []
    const budgetList = budgets.value || []
    
    if (expenseList.length === 0) {
      return c.json({
        insights: [],
        summary: 'No expenses yet. Start tracking to get personalized insights!',
        recommendations: [],
        stats: {
          thisMonth: 0,
          lastMonth: 0,
          change: 0,
          changePercentage: 0
        }
      })
    }
    
    // Check if API key is configured
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!apiKey) {
      console.log('OPENROUTER_API_KEY not configured, returning basic stats without AI insights')
      // Calculate basic stats without AI
      const now = new Date()
      const thisMonth = expenseList.filter((exp: any) => {
        const expDate = new Date(exp.createdAt)
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
      })
      const lastMonth = expenseList.filter((exp: any) => {
        const expDate = new Date(exp.createdAt)
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear()
      })
      const totalThisMonth = thisMonth.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      const totalLastMonth = lastMonth.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      
      return c.json({
        insights: [{
          type: 'info',
          severity: 'info',
          message: 'AI insights are not available. Configure OPENROUTER_API_KEY for advanced analytics.',
          value: 0
        }],
        summary: `You have ${expenseList.length} expenses tracked. AI insights require configuration.`,
        recommendations: [],
        stats: {
          thisMonth: totalThisMonth,
          lastMonth: totalLastMonth,
          change: totalThisMonth - totalLastMonth,
          changePercentage: totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0
        }
      })
    }
    
    // Calculate statistics
    const now = new Date()
    const thisMonth = expenseList.filter((exp: any) => {
      const expDate = new Date(exp.createdAt)
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    
    const lastMonth = expenseList.filter((exp: any) => {
      const expDate = new Date(exp.createdAt)
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear()
    })
    
    const categoryTotals: any = {}
    thisMonth.forEach((exp: any) => {
      const cat = exp.category || 'other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount
    })
    
    const totalThisMonth = thisMonth.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const totalLastMonth = lastMonth.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const avgExpense = thisMonth.length > 0 ? totalThisMonth / thisMonth.length : 0
    
    // Build context for AI
    const context = `User's Expense Data:
- Total expenses this month: ৳${totalThisMonth.toFixed(2)} (${thisMonth.length} expenses)
- Total last month: ৳${totalLastMonth.toFixed(2)} (${lastMonth.length} expenses)
- Average expense: ৳${avgExpense.toFixed(2)}
- Category breakdown: ${JSON.stringify(categoryTotals)}
- Active budgets: ${budgetList.map((b: any) => `${b.category}: ৳${b.limit}`).join(', ')}

Top 5 Recent Expenses:
${expenseList.slice(0, 5).map((exp: any) => `- ${exp.description} (${exp.category}): ৳${exp.amount}`).join('\n')}`

    const systemInstruction = `You are a personal finance advisor analyzing a user's spending patterns. 
Provide actionable insights and recommendations in JSON format.

Return this structure:
{
  "insights": [
    {"type": "spending_trend", "severity": "info|warning|alert", "message": "insight text", "value": number},
    {"type": "category_alert", "severity": "info|warning|alert", "message": "insight text", "category": "category_name"},
    {"type": "budget_status", "severity": "info|warning|alert", "message": "insight text", "percentage": number}
  ],
  "summary": "brief overall summary (2-3 sentences)",
  "recommendations": [
    {"priority": "high|medium|low", "action": "specific recommendation", "potential_savings": number}
  ],
  "patterns": [
    {"pattern": "pattern description", "suggestion": "what to do about it"}
  ],
  "predictions": {
    "month_end_total": estimated_total,
    "confidence": "high|medium|low",
    "reasoning": "why this prediction"
  }
}

Focus on:
1. Spending trends (increasing/decreasing)
2. Budget overspending warnings
3. Unusual expenses or patterns
4. Category-specific insights
5. Savings opportunities
6. Comparison with previous month
7. Predictions for month-end

Be specific, actionable, and supportive. Use Bangladeshi Taka (৳) for amounts.`

    const prompt = `Analyze this user's spending and provide insights:\n\n${context}\n\nReturn JSON only, no markdown.`
    
    // Call AI with better error handling
    let insights
    try {
      const aiResponse = await callGeminiAPI(prompt, systemInstruction)
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      insights = JSON.parse(cleanResponse)
      console.log('AI Insights generated successfully')
    } catch (aiError: any) {
      console.error('AI Generation Error:', aiError.message)
      // Return fallback insights if AI fails
      return c.json({
        insights: [{
          type: 'info',
          severity: 'info',
          message: `You've spent ৳${totalThisMonth.toFixed(2)} this month across ${thisMonth.length} transactions.`,
          value: totalThisMonth
        }],
        summary: `Your spending this month is ৳${totalThisMonth.toFixed(2)}, ${totalThisMonth > totalLastMonth ? 'up' : 'down'} from last month's ৳${totalLastMonth.toFixed(2)}.`,
        recommendations: [],
        patterns: [],
        predictions: {
          month_end_total: totalThisMonth,
          confidence: 'low',
          reasoning: 'Based on current spending'
        },
        stats: {
          thisMonth: totalThisMonth,
          lastMonth: totalLastMonth,
          change: totalThisMonth - totalLastMonth,
          changePercentage: totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth * 100) : 0
        },
        generatedAt: new Date().toISOString(),
        error: 'AI insights temporarily unavailable. Using basic statistics.'
      })
    }
    
    const result = {
      ...insights,
      generatedAt: new Date().toISOString(),
      stats: {
        thisMonth: totalThisMonth,
        lastMonth: totalLastMonth,
        change: totalThisMonth - totalLastMonth,
        changePercentage: totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth * 100) : 0
      }
    }
    
    // Cache the result
    await kv.set(cacheKey, {
      data: result,
      cachedAt: new Date().toISOString()
    })
    
    return c.json(result)
  } catch (error: any) {
    console.error('Error in insights endpoint:', error.message, error.stack)
    // Return a valid response even on error
    return c.json({
      insights: [{
        type: 'info',
        severity: 'info',
        message: 'Insights temporarily unavailable. Please try again later.',
        value: 0
      }],
      summary: 'Unable to generate insights at this time.',
      recommendations: [],
      patterns: [],
      predictions: {
        month_end_total: 0,
        confidence: 'low',
        reasoning: 'Data unavailable'
      },
      stats: {
        thisMonth: 0,
        lastMonth: 0,
        change: 0,
        changePercentage: 0
      },
      generatedAt: new Date().toISOString(),
      error: 'Service temporarily unavailable'
    }, 200) // Return 200 with error field instead of 500
  }
})

// Analytics endpoint for trends
app.get('/make-server-f573a585/analytics/trends', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const expenseList = expenses.value || []
    
    // Calculate monthly trends for the last 6 months
    const trends: any = {}
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
      trends[monthKey] = { total: 0, count: 0, categories: {} }
    }
    
    expenseList.forEach((exp: any) => {
      const expDate = new Date(exp.createdAt)
      const monthKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`
      
      if (trends[monthKey]) {
        trends[monthKey].total += exp.amount
        trends[monthKey].count += 1
        
        const category = exp.category || 'other'
        trends[monthKey].categories[category] = (trends[monthKey].categories[category] || 0) + exp.amount
      }
    })
    
    return c.json(trends)
  } catch (error) {
    console.log('Error fetching trends:', error)
    return c.json({ error: 'Failed to fetch trends' }, 500)
  }
})

// Debug endpoint to check KV store state for a specific group
app.get('/make-server-f573a585/debug/group/:id', requireAuth, async (c) => {
  try {
    const groupId = c.req.param('id')
    const userId = c.get('userId')
    
    const group = await kv.get(`group:${groupId}`)
    const members = await kv.get(`group:${groupId}:members`)
    const expenses = await kv.get(`group:${groupId}:expenses`)
    const balances = await kv.get(`group:${groupId}:balances`)
    const userGroups = await kv.get(`user:${userId}:groups`)
    
    return c.json({
      groupId,
      userId,
      groupExists: !!group.value,
      group: group.value,
      members: members.value,
      expenses: expenses.value,
      balances: balances.value,
      userGroupsList: userGroups.value,
      isInUserGroups: (userGroups.value || []).includes(groupId)
    })
  } catch (error) {
    console.log('Error in debug endpoint:', error)
    return c.json({ error: 'Debug failed', details: String(error) }, 500)
  }
})

Deno.serve(app.fetch)

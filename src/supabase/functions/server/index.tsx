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
        
        groups.push({
          ...group.value,
          memberCount: memberIds.length,
          expenseCount: (expenses.value || []).length
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

    // Get expenses
    const expenses = await kv.get(`group:${groupId}:expenses`)
    const expenseList = expenses.value || []
    console.log(`[GET /groups/:id] Expenses:`, expenseList.length)

    // Get balances
    const balances = await kv.get(`group:${groupId}:balances`)

    const result = {
      ...group.value,
      members: memberDetails,
      expenses: expenseList,
      balances: balances.value || {}
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
    const { description, amount, paidBy, splitWith, splitType, splitAmounts, category, notes } = await c.req.json()
    
    if (!description || !amount || !paidBy || !splitWith || splitWith.length === 0) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const expenseId = generateId()
    const expense = {
      id: expenseId,
      groupId,
      description,
      amount: parseFloat(amount),
      paidBy,
      splitWith,
      splitType: splitType || 'equal',
      splitAmounts: splitAmounts || {},
      category: category || 'other',
      notes: notes || '',
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

    // Use splitAmounts if provided, otherwise calculate equal split
    const amounts = splitAmounts && Object.keys(splitAmounts).length > 0
      ? splitAmounts
      : Object.fromEntries(splitWith.map(id => [id, parseFloat(amount) / splitWith.length]))

    for (const memberId of splitWith) {
      if (memberId !== paidBy) {
        const memberAmount = amounts[memberId] || 0
        const key = `${paidBy}-${memberId}`
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
      const [creditor, debtor] = key.split('-')
      netBalances[creditor] = (netBalances[creditor] || 0) + (value as number)
      netBalances[debtor] = (netBalances[debtor] || 0) - (value as number)
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
        const key = `${creditorId}-${debtorId}`
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
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    
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

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string, systemInstruction?: string) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        systemInstruction: systemInstruction ? {
          parts: [{ text: systemInstruction }]
        } : undefined,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates[0]?.content?.parts[0]?.text || ''
}

// Helper function to call Gemini Vision API
async function callGeminiVisionAPI(imageBase64: string, prompt: string) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini Vision API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates[0]?.content?.parts[0]?.text || ''
}

// Natural Language Search with Gemini AI
app.get('/make-server-f573a585/search', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const query = c.req.query('q') || ''
    
    if (!query.trim()) {
      return c.json([])
    }
    
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const expenseList = expenses.value || []
    
    // Use Gemini AI to parse the natural language query
    const systemInstruction = `You are a financial assistant that parses natural language expense queries.
Available categories: food, groceries, transport, entertainment, utilities, shopping, health, education, other.
Parse the query and return a JSON object with filters. Include only filters that are explicitly mentioned.

Return JSON in this exact format:
{
  "keywords": ["word1", "word2"],
  "category": "category_name or null",
  "dateFilter": "last_week|last_month|this_month|this_year|null",
  "minAmount": number or null,
  "maxAmount": number or null,
  "explanation": "brief explanation of what you understood"
}`

    const prompt = `Parse this expense search query: "${query}"\n\nReturn only valid JSON, no markdown.`
    
    let filters: any = {}
    try {
      const aiResponse = await callGeminiAPI(prompt, systemInstruction)
      // Remove markdown code blocks if present
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      filters = JSON.parse(cleanResponse)
      console.log('Gemini parsed filters:', filters)
    } catch (aiError) {
      console.log('AI parsing failed, using fallback:', aiError)
      // Fallback to simple keyword search
      filters = { keywords: [query.toLowerCase()] }
    }
    
    // Apply AI-parsed filters to expenses
    const results = expenseList.filter((exp: any) => {
      // Check keywords
      if (filters.keywords && filters.keywords.length > 0) {
        const searchText = `${exp.description} ${exp.category} ${exp.notes || ''}`.toLowerCase()
        const matchesKeywords = filters.keywords.some((keyword: string) => 
          searchText.includes(keyword.toLowerCase())
        )
        if (!matchesKeywords) return false
      }
      
      // Check category
      if (filters.category && filters.category !== 'null') {
        if (exp.category !== filters.category) return false
      }
      
      // Check amount range
      if (filters.minAmount !== null && exp.amount < filters.minAmount) return false
      if (filters.maxAmount !== null && exp.amount > filters.maxAmount) return false
      
      // Check date filter
      if (filters.dateFilter && filters.dateFilter !== 'null') {
        const expDate = new Date(exp.createdAt)
        const now = new Date()
        
        switch (filters.dateFilter) {
          case 'last_week':
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (expDate < lastWeek) return false
            break
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            if (expDate < lastMonth) return false
            break
          case 'this_month':
            if (expDate.getMonth() !== now.getMonth() || expDate.getFullYear() !== now.getFullYear()) return false
            break
          case 'this_year':
            if (expDate.getFullYear() !== now.getFullYear()) return false
            break
        }
      }
      
      return true
    })
    
    return c.json(results)
  } catch (error) {
    console.log('Error searching expenses:', error)
    return c.json({ error: 'Failed to search expenses' }, 500)
  }
})

// AI Receipt Scanner with Gemini Vision
app.post('/make-server-f573a585/scan-receipt', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const imageBase64 = body.image
    
    if (!imageBase64) {
      return c.json({ error: 'No image provided' }, 400)
    }
    
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    // Use Gemini Vision to analyze the receipt
    const prompt = `Analyze this receipt image and extract the following information in JSON format:
{
  "merchant": "merchant/store name",
  "amount": total_amount_as_number,
  "date": "date in YYYY-MM-DD format if visible, otherwise null",
  "items": ["item1", "item2"],
  "category": "one of: food, groceries, transport, entertainment, utilities, shopping, health, education, other",
  "currency": "currency symbol or code if visible",
  "notes": "any additional relevant information"
}

Guidelines:
- Extract the TOTAL amount (not individual items)
- Suggest the most appropriate category based on the merchant and items
- If you see multiple amounts, use the final total
- For Bangladeshi receipts, amounts might be in Taka (৳)
- Return only valid JSON, no markdown or extra text`

    const aiResponse = await callGeminiVisionAPI(base64Data, prompt)
    console.log('Gemini Vision response:', aiResponse)
    
    // Parse the AI response
    const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const scannedData = JSON.parse(cleanResponse)
    
    // Create a description from merchant name
    const description = scannedData.merchant || 'Receipt scan'
    
    // Return the structured data
    return c.json({
      description: description,
      amount: scannedData.amount || 0,
      category: scannedData.category || 'other',
      notes: scannedData.notes || `Items: ${scannedData.items?.join(', ') || 'N/A'}`,
      date: scannedData.date,
      rawData: scannedData
    })
  } catch (error) {
    console.log('Error scanning receipt:', error)
    return c.json({ 
      error: 'Failed to scan receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
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

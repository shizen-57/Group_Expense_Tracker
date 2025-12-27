# Authentication Fix - Session Persistence Issue

## Problem
After a successful login, the app was redirecting back to the login page instead of staying logged in. The session was not being persisted in the browser.

## Root Cause
The previous implementation was calling the backend API (`/auth/login`) which used Supabase Auth on the **server side**. While this created a valid session and returned an access token, the session was not stored in the browser's localStorage, causing the session check on page reload to fail.

## Solution
Changed the authentication flow to use the **frontend Supabase client** directly for login:

### Before (Backend API Login):
```typescript
// Called backend API
const response = await api.login(email, password)
setAccessToken(response.accessToken)
setUser(response.user)
```

**Issue:** Session created on server, not persisted in browser.

### After (Frontend Supabase Client):
```typescript
// Use frontend Supabase client directly
const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
setAccessToken(data.session.access_token)
```

**Fix:** Session is automatically persisted in browser's localStorage by Supabase.

## Additional Improvements

### 1. Auth State Listener
Added `onAuthStateChange` listener to handle:
- Automatic token refresh
- Sign out events
- Sign in events
- Session persistence across page reloads

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      setAccessToken(session.access_token)
      await fetchUserProfile(session.access_token)
    } else if (event === 'SIGNED_OUT') {
      setAccessToken(null)
      setUser(null)
    } else if (event === 'TOKEN_REFRESHED' && session) {
      setAccessToken(session.access_token)
    }
  }
)
```

### 2. Session Check on Mount
The app now properly checks for existing sessions when the app loads:

```typescript
const { data: { session } } = await supabase.auth.getSession()
if (session?.access_token) {
  setAccessToken(session.access_token)
  await fetchUserProfile(session.access_token)
}
```

## How Authentication Now Works

1. **Login Flow:**
   - User enters email/password
   - Frontend calls `supabase.auth.signInWithPassword()`
   - Supabase stores session in browser localStorage
   - Access token extracted and stored in React state
   - User profile fetched from backend using access token
   - User redirected to app

2. **Session Persistence:**
   - On page reload, `useEffect` runs
   - Calls `supabase.auth.getSession()` to check localStorage
   - If session found, loads user profile and continues
   - If no session, shows login page

3. **Token Refresh:**
   - Supabase automatically refreshes tokens
   - `onAuthStateChange` listener updates React state
   - User stays logged in seamlessly

4. **Logout:**
   - Calls `supabase.auth.signOut()`
   - Clears session from localStorage
   - Clears React state
   - User redirected to login

## Files Modified
- `/hooks/useAuth.ts` - Main authentication hook

## Backend API Still Used For:
- `/auth/signup` - Creating user accounts (still needed to store user data in KV store)
- `/profile` - Fetching user profile data
- All other protected endpoints

## Testing Checklist
- ✅ Login works and persists across page reloads
- ✅ Signup creates account and auto-logs in
- ✅ Logout clears session properly
- ✅ Token refresh happens automatically
- ✅ Session persists even after browser close/reopen
- ✅ Protected routes work correctly
- ✅ User data loads correctly after login

## Benefits
1. **Session Persistence** - Users stay logged in across page reloads
2. **Automatic Token Refresh** - No manual token management needed
3. **Better Security** - Supabase handles session storage securely
4. **Simpler Code** - Less custom session management code
5. **Standard Flow** - Follows Supabase best practices

## Note
The backend `/auth/login` endpoint is now unused but kept for backward compatibility. It could be removed in a future cleanup.

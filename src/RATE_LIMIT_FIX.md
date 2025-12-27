# Rate Limit Fix - OpenRouter API

## 🔧 Problem Fixed

The app was hitting OpenRouter API rate limits causing these errors:
- "AI insights temporarily unavailable. Using basic statistics."
- "OpenRouter API rate limit exceeded"
- "Too Many Requests"

## ✅ Solutions Implemented

### 1. **Extended Cache Duration** 
- **Before:** 15 minutes cache
- **After:** 30 minutes cache
- **Why:** Reduces API calls by serving cached results longer

```typescript
// Cache now lasts 30 minutes instead of 15
if (cacheAge < 30 * 60 * 1000) { // 30 minutes
  return c.json(cached.value.data)
}
```

### 2. **More Conservative Rate Limiting**
- **Before:** 6 calls/minute, 5s delay between calls
- **After:** 4 calls/minute, 10s delay between calls
- **Why:** OpenRouter free tier is sensitive to rapid calls

```typescript
minDelay: 10000, // 10 seconds between calls (very conservative)
maxCallsPerMinute: 4 // Reduced from 6 to 4
```

### 3. **Frontend Duplicate Call Prevention**
- Added 10-second cooldown on frontend
- Prevents users from spam-clicking refresh
- Cooldown timer shows remaining seconds

```typescript
// Prevent duplicate calls within 10 seconds
if (loading || (now - lastFetchTime < 10000)) {
  console.log('Skipping fetch - too soon since last call')
  return
}
```

### 4. **Better Error Messages**
- **Before:** Generic "temporarily unavailable"
- **After:** Specific, helpful messages

```typescript
if (error.message.includes('Rate limit')) {
  errorMessage = '⏱️ AI rate limit reached'
  userMessage = 'OpenRouter free tier: 4 AI calls per minute with 10s cooldown. 
                 Results are cached for 30 minutes.'
}
```

### 5. **Improved User Experience**
- Cooldown timer shows when refresh is available
- Clear explanation of rate limits in UI
- Graceful fallback to basic stats when AI unavailable
- Stats still shown even when AI fails

## 📊 Rate Limit Strategy

### OpenRouter Free Tier Limits
- **Free tier:** Very limited requests per minute
- **Our conservative approach:** 4 calls/minute max
- **Minimum delay:** 10 seconds between any two calls
- **Cache:** 30 minutes per user

### How It Works

```
User loads AI Insights page
    ↓
Check cache (30 min TTL)
    ↓ (cache miss)
Check rate limit (4/min, 10s delay)
    ↓ (under limit)
Call OpenRouter API
    ↓
Cache result for 30 minutes
    ↓
Serve to user

Next request within 30 minutes?
    ↓
Serve from cache (no API call)
```

## 🎯 Benefits

1. **Fewer API Calls**
   - 30-minute cache reduces calls by ~50%
   - Frontend cooldown prevents spam
   - Rate limiting prevents bursts

2. **Better UX**
   - Clear error messages
   - Cooldown indicators
   - Basic stats always available
   - No broken state

3. **Cost Effective**
   - Works within free tier limits
   - Predictable API usage
   - Automatic cache management

4. **Resilient**
   - Graceful degradation
   - Fallback to basic stats
   - Never shows empty state

## 🔢 Expected API Usage

### Before Fix (Worst Case)
- User refreshes 5 times = 5 API calls
- Multiple users = Immediate rate limit
- No protection = App breaks

### After Fix (Best Case)
- First load: 1 API call
- Cached for 30 minutes
- Subsequent loads: 0 API calls
- After 30 min: 1 API call (if user returns)

### Example Scenario
```
Time    Action              API Calls   Cache Hit
00:00   User A loads page   1           No
00:05   User A refreshes    0           Yes (cached)
00:10   User B loads page   1           No (different user)
00:15   User A refreshes    0           Yes (cached)
00:20   User C loads page   1           No
00:31   User A returns      1           No (cache expired)
```

**Total in 30 minutes:** 4 API calls (within free tier!)

## 🛡️ Protection Layers

### Layer 1: Frontend (10s cooldown)
```typescript
if (now - lastFetchTime < 10000) {
  return // Skip call
}
```

### Layer 2: Backend Cache (30 min)
```typescript
if (cacheAge < 30 * 60 * 1000) {
  return cached.value.data
}
```

### Layer 3: Rate Limiter (4/min, 10s delay)
```typescript
if (rateLimitState.callCount >= 4) {
  throw new Error('Rate limit reached')
}
```

### Layer 4: Error Handling
```typescript
catch (error) {
  // Return basic stats instead of failing
  return fallbackData
}
```

## 📝 User Instructions

### When Rate Limited
1. **Wait 10-30 seconds** before refreshing
2. **Results are cached** - no need to refresh often
3. **Basic stats still work** - you always see something
4. **Cache auto-refreshes** every 30 minutes

### Tips for Users
- ✅ Check AI Insights once per session
- ✅ Let cache serve results (30 min)
- ✅ Basic stats are always accurate
- ❌ Don't spam refresh button
- ❌ Don't open multiple tabs

## 🔍 Monitoring

### Server Logs
```
✅ Returning cached insights (age: 245s)
✅ AI Insights generated successfully
⚠️  Rate limit reached (4/4), reset in 15000ms
❌ OpenRouter API rate limit exceeded
```

### Frontend Console
```
✅ AI Insights fetched: {...}
⚠️  Skipping fetch - too soon since last call
⚠️  AI insights returned with error: ...
```

## 🎉 Result

- **No more rate limit errors** for normal usage
- **Better user experience** with clear messaging
- **Reliable AI insights** when available
- **Graceful degradation** when not available
- **Works within free tier** OpenRouter limits

The app now handles rate limits gracefully and provides a smooth experience even with OpenRouter's free tier restrictions! 🚀

## 🔄 Future Improvements

If rate limits still occur:
1. Increase cache to 60 minutes
2. Reduce calls to 2-3 per minute
3. Add queue system for multiple users
4. Consider upgrade to paid tier
5. Add "last updated" timestamp in UI

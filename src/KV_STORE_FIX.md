# KV Store Data Format Fix

## Critical Issue Found & Fixed

### The Problem
The application was failing with "Failed to save group data" errors because of a **data format mismatch** between the KV store functions and how they were being used throughout the codebase.

### Root Cause
The `kv.get()` function in `/supabase/functions/server/kv_store.tsx` was returning data directly:
```typescript
// BEFORE (incorrect)
export const get = async (key: string): Promise<any> => {
  return data?.value;  // Returns the value directly
};
```

But **all the server code** expected it to return an object with a `value` property:
```typescript
// Usage in server code
const userData = await kv.get(`user:${userId}`)
if (!userData.value) {  // Expects { value: data }
  // ...
}
```

This mismatch caused:
- Groups appearing to not save (verification failed)
- Inconsistent data retrieval
- Potential data corruption
- "Group not found" errors even for valid groups

### The Fix

#### 1. Updated `kv.get()` function:
```typescript
// AFTER (correct)
export const get = async (key: string): Promise<{ value: any }> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_f573a585").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  // Return in format { value: data } to match usage pattern across codebase
  return { value: data?.value };
};
```

#### 2. Updated `kv.getByPrefix()` function:
```typescript
// AFTER (correct)
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_f573a585").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  // Return array of objects with { key, value } to match usage pattern
  return data?.map((d) => ({ key: d.key, value: d.value })) ?? [];
};
```

#### 3. Improved Group Creation Error Handling:
```typescript
try {
  // Save all group data with error handling and detailed logging
  await kv.set(`group:${groupId}`, group)
  console.log(`[POST /groups] ✓ Saved group data`)
  
  await kv.set(`group:${groupId}:members`, [userId])
  console.log(`[POST /groups] ✓ Saved group members`)
  
  await kv.set(`group:${groupId}:expenses`, [])
  console.log(`[POST /groups] ✓ Saved group expenses`)
  
  await kv.set(`group:${groupId}:balances`, {})
  console.log(`[POST /groups] ✓ Saved group balances`)
  
  // ... rest of the logic
  
} catch (kvError) {
  console.error(`[POST /groups] KV store error:`, kvError)
  // Clean up partial data
  await kv.del(`group:${groupId}`)
  // ... cleanup logic
  return c.json({ error: 'Failed to save group data to database' }, 500)
}
```

### What This Fixes

✅ **Group Creation**: Groups now save correctly to the database  
✅ **Data Retrieval**: All kv.get() calls now work consistently  
✅ **Verification**: Group save verification now works properly  
✅ **Data Integrity**: No more format mismatches  
✅ **Error Messages**: Better error handling with detailed logging  
✅ **Cleanup**: Failed saves are cleaned up properly  

### Impact

This was a **critical bug** that affected:
- ✅ All group operations (create, read, update)
- ✅ User data retrieval
- ✅ Friend lookups
- ✅ Any code using kv.get() or kv.getByPrefix()

### Testing

The fix ensures:
1. ✅ Groups can be created successfully
2. ✅ Groups persist across sessions
3. ✅ All data reads return consistent format
4. ✅ Error handling catches and reports issues
5. ✅ Failed operations clean up properly

### Files Modified

1. `/supabase/functions/server/kv_store.tsx` - Fixed return types
2. `/supabase/functions/server/index.tsx` - Improved error handling

### Why This Happened

The KV store functions were likely generated or updated at some point without considering the existing usage pattern in the server code. The entire codebase was written expecting `{ value: data }` format, but the KV store was returning data directly.

### Going Forward

- ✅ The KV store now matches the expected interface
- ✅ All existing code works without modification
- ✅ Future code can continue using the `.value` pattern
- ✅ Error handling is more robust

## Summary

This fix resolves the "Failed to save group data" error by correcting the data format returned by the KV store functions to match how they're used throughout the application. Groups now save and retrieve correctly, and the application's data layer is consistent and reliable.

# Testing AI Features - Complete Guide

This guide helps you test the Google Gemini AI-powered features.

## 🎯 Quick Test Checklist

- [ ] Gemini API key is set in Supabase
- [ ] Edge Function is deployed
- [ ] Smart search works with simple query
- [ ] Smart search understands dates
- [ ] Smart search filters by category
- [ ] Receipt scanner extracts amount
- [ ] Receipt scanner suggests category
- [ ] Error handling works

## 🔍 Testing Smart Natural Language Search

### Test 1: Simple Keyword Search

**Query:** `coffee`

**Expected Result:**
- Returns all expenses with "coffee" in description
- Works like basic search

**Verification:**
```
✅ Results contain "coffee" in description
✅ Returns quickly (< 2 seconds)
✅ No errors in console
```

---

### Test 2: Category-Based Search

**Query:** `food expenses`

**Expected Result:**
- Filters expenses by "food" category
- Shows all food-related expenses

**Verification:**
```
✅ All results have category = "food"
✅ Non-food expenses are excluded
✅ Gemini correctly identified "food" category
```

---

### Test 3: Date-Based Search (Last Week)

**Query:** `expenses last week`

**Expected Result:**
- Shows only expenses from the last 7 days
- Excludes older expenses

**Verification:**
```
✅ All expenses are from the last 7 days
✅ No expenses older than 7 days
✅ Gemini understood "last week"
```

**Debug:** Check backend logs:
```bash
supabase functions logs make-server-f573a585
# Look for: "Gemini parsed filters: {dateFilter: 'last_week'}"
```

---

### Test 4: Date-Based Search (This Month)

**Query:** `spending this month`

**Expected Result:**
- Shows only expenses from current calendar month
- Excludes previous months

**Verification:**
```
✅ All expenses are from current month
✅ No expenses from previous months
✅ Month matches current month
```

---

### Test 5: Amount-Based Search

**Query:** `expenses over ৳500`

**Expected Result:**
- Shows only expenses where amount > 500
- Excludes expenses under 500

**Verification:**
```
✅ All results have amount > 500
✅ No results with amount ≤ 500
✅ Gemini understood amount filter
```

**Debug:** Check for `minAmount: 500` in logs

---

### Test 6: Combined Filters

**Query:** `food over ৳300 last week`

**Expected Result:**
- Category = food
- Amount > 300
- Date within last 7 days

**Verification:**
```
✅ All results match ALL three criteria
✅ Category is "food"
✅ Amount > 300
✅ Date within last week
```

---

### Test 7: Complex Natural Language

**Query:** `show me groceries from this month under ৳1000`

**Expected Result:**
- Category = groceries
- Date = this month
- Amount < 1000

**Verification:**
```
✅ Gemini parses complex sentence
✅ Extracts multiple filters correctly
✅ Results match all criteria
```

---

### Test 8: Fallback Behavior

**Test with API error:**
1. Temporarily use invalid API key
2. Try searching

**Expected Result:**
- Falls back to keyword matching
- Still returns some results
- Shows console warning but no user error

**Verification:**
```
✅ Search still works (degraded)
✅ Returns keyword matches
✅ User doesn't see error
✅ Console shows "AI parsing failed, using fallback"
```

---

## 📸 Testing AI Receipt Scanner

### Test 1: Clear Restaurant Receipt

**Steps:**
1. Go to Expenses tab
2. Click "Scan Receipt"
3. Upload a clear restaurant receipt photo

**Expected Extraction:**
- Merchant: Restaurant name
- Amount: Total bill amount
- Category: "food"
- Items: List of ordered items

**Verification:**
```
✅ Merchant name extracted correctly
✅ Total amount matches receipt (±10%)
✅ Category suggested as "food"
✅ Date extracted if visible
✅ User can edit before saving
```

---

### Test 2: Grocery Store Receipt

**Upload:** Grocery store receipt

**Expected Extraction:**
- Merchant: Store name
- Amount: Total
- Category: "groceries"
- Items: Purchased items

**Verification:**
```
✅ Category is "groceries" (not "food")
✅ Amount is total, not individual items
✅ Multiple items listed
```

---

### Test 3: Transport Receipt (Uber/Taxi)

**Upload:** Ride receipt or fuel bill

**Expected Extraction:**
- Category: "transport"
- Amount: Trip cost or fuel cost

**Verification:**
```
✅ Category correctly identified as "transport"
✅ Amount extracted
```

---

### Test 4: Utility Bill

**Upload:** Electric/gas/water bill

**Expected Extraction:**
- Category: "utilities"
- Amount: Bill total

**Verification:**
```
✅ Category is "utilities"
✅ Total amount (not partial payments)
```

---

### Test 5: Blurry Image

**Upload:** Low-quality or blurry receipt

**Expected Result:**
- AI tries to extract data
- May be inaccurate
- User can manually correct

**Verification:**
```
✅ Doesn't crash
✅ Returns some data (may be wrong)
✅ User can edit extracted data
✅ Shows extracted vs. user-edited difference
```

---

### Test 6: Non-Receipt Image

**Upload:** Random photo (not a receipt)

**Expected Result:**
- Gemini Vision analyzes anyway
- Returns generic data
- User must correct

**Verification:**
```
✅ Doesn't crash
✅ Shows warning/error
✅ Allows manual entry
```

---

### Test 7: Multiple Amounts on Receipt

**Upload:** Receipt with subtotal, tax, and total

**Expected Extraction:**
- Amount: Final total (not subtotal)

**Verification:**
```
✅ Extracts TOTAL, not subtotal
✅ Includes tax if applicable
✅ Matches the final amount to pay
```

---

### Test 8: Bangladeshi Receipt (Taka)

**Upload:** Receipt with ৳ symbol or "Taka"

**Expected Extraction:**
- Currency: "৳" or "Taka"
- Amount: Numeric value

**Verification:**
```
✅ Recognizes Taka currency
✅ Extracts amount correctly
✅ Category suggested appropriately
```

---

## 🐛 Error Handling Tests

### Test 1: No API Key

**Setup:**
```bash
# Remove API key
supabase secrets unset GEMINI_API_KEY
supabase functions deploy make-server-f573a585
```

**Expected:**
- Search falls back to keyword matching
- Receipt scan shows error message
- App doesn't crash

**Restore:**
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo
supabase functions deploy make-server-f573a585
```

---

### Test 2: Network Timeout

**Simulate:** Large image upload on slow connection

**Expected:**
- Loading indicator shows
- Timeout after 30 seconds
- Error message displayed
- User can retry

---

### Test 3: Invalid Image Format

**Upload:** PDF or text file instead of image

**Expected:**
- Frontend validation catches it
- Shows "Please select an image file"
- Doesn't call API

---

### Test 4: Image Too Large

**Upload:** Very large image (> 10MB)

**Expected:**
- May be slow
- Should still work or show size warning
- Consider adding size limit

---

## 📊 Performance Tests

### Search Performance

**Test:** Search with 100+ expenses

**Measure:**
- Response time
- Results accuracy
- UI responsiveness

**Target:**
```
✅ Response < 3 seconds
✅ Results shown progressively
✅ No UI freeze
```

---

### Receipt Scan Performance

**Test:** Upload various image sizes

**Measure:**
- Small image (< 500KB): Should be < 3 seconds
- Medium image (500KB-2MB): Should be < 5 seconds
- Large image (2MB-5MB): Should be < 10 seconds

**Target:**
```
✅ Clear feedback during processing
✅ Progress indicator
✅ Doesn't block UI
```

---

## 🔬 Advanced Testing

### Test Gemini API Directly

Test without frontend:

```bash
# Test search endpoint
curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-f573a585/search?q=coffee%20last%20week" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return JSON array of expenses
```

---

### Test Receipt Scan Endpoint

```bash
# First, encode image to base64
IMAGE_BASE64=$(base64 -i receipt.jpg)

# Then test the endpoint
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-f573a585/scan-receipt" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"data:image/jpeg;base64,$IMAGE_BASE64\"}"

# Should return JSON with extracted data
```

---

## 📈 Monitoring and Logging

### Check Edge Function Logs

```bash
# View real-time logs
supabase functions logs make-server-f573a585 --tail

# Look for these log messages:
# - "Gemini parsed filters: {...}"
# - "Gemini Vision response: {...}"
# - Any error messages
```

---

### Monitor API Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Dashboard
3. Click on Generative Language API
4. View metrics:
   - Requests per day
   - Errors
   - Latency

**Set up alerts for:**
- Daily requests > 1000
- Error rate > 5%
- Costs > $10/month

---

## ✅ Success Criteria

Your AI features are working correctly if:

### Smart Search:
- [x] Understands at least 5 different query types
- [x] Date filters work (last week, this month, etc.)
- [x] Category filters work
- [x] Amount filters work
- [x] Combined filters work
- [x] Response time < 3 seconds
- [x] Fallback works if AI fails

### Receipt Scanner:
- [x] Extracts amount correctly (80%+ accuracy)
- [x] Identifies merchant name (70%+ accuracy)
- [x] Suggests correct category (80%+ accuracy)
- [x] Handles errors gracefully
- [x] User can edit extracted data
- [x] Processing time < 10 seconds

### Overall:
- [x] No crashes or errors
- [x] Good user experience
- [x] Clear error messages
- [x] Fast and responsive
- [x] Costs are reasonable (< $5/month for testing)

---

## 🔍 Debugging Common Issues

### Search returns no results

**Check:**
1. Is there data in the database?
2. Is the query too specific?
3. Check logs for Gemini response
4. Try simple query: "food"

**Debug command:**
```bash
supabase functions logs make-server-f573a585 | grep "Gemini"
```

---

### Receipt scan fails

**Check:**
1. Image format supported?
2. Image size reasonable?
3. API key set correctly?
4. Check logs for error details

**Debug:**
```bash
# Check if API key is set
supabase secrets list

# View detailed logs
supabase functions logs make-server-f573a585 --tail
```

---

### "GEMINI_API_KEY not configured"

**Fix:**
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo
supabase functions deploy make-server-f573a585
```

---

## 📝 Test Report Template

Use this to document your testing:

```markdown
## AI Features Test Report

**Date:** [Date]
**Tester:** [Your Name]

### Smart Search Tests
- [ ] Simple keyword: PASS/FAIL
- [ ] Category filter: PASS/FAIL  
- [ ] Date filter: PASS/FAIL
- [ ] Amount filter: PASS/FAIL
- [ ] Combined filters: PASS/FAIL
- [ ] Performance (< 3s): PASS/FAIL

### Receipt Scanner Tests
- [ ] Restaurant receipt: PASS/FAIL
- [ ] Grocery receipt: PASS/FAIL
- [ ] Amount extraction: PASS/FAIL
- [ ] Category suggestion: PASS/FAIL
- [ ] Error handling: PASS/FAIL
- [ ] Performance (< 10s): PASS/FAIL

### Issues Found
1. [Description]
2. [Description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

**Happy Testing! 🚀**

Remember: AI isn't perfect. The goal is 70-80% accuracy with good error handling for the rest.

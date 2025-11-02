# Gemini AI Integration Setup Guide

This guide explains how to set up and use the Google Gemini AI features in your expense manager app.

## ✨ What's Integrated

Your app now uses **Google Gemini Pro 2.0 Flash** for:

1. **🔍 Smart Natural Language Search** - Understands queries like:
   - "coffee expenses last week"
   - "show groceries over ৳500"
   - "food spending this month"
   - "entertainment expenses"

2. **📸 AI Receipt Scanner** - Real OCR that:
   - Extracts total amount from receipt
   - Identifies merchant name
   - Detects date if visible
   - Auto-categorizes expenses
   - Lists items purchased

## 🔑 API Key Setup

### Step 1: Set the Environment Variable in Supabase

Your Gemini API key needs to be stored as a Supabase secret:

```bash
# Using Supabase CLI
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo
```

**OR** set it in the Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Scroll to **Secrets**
4. Add new secret:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo`

### Step 2: Deploy the Updated Edge Function

After setting the secret, deploy your updated backend:

```bash
supabase functions deploy make-server-f573a585
```

### Step 3: Verify It's Working

Test the search endpoint:

```bash
curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-f573a585/search?q=coffee%20last%20week" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 🧠 How the Smart Search Works

### What Users Can Ask:

**Date-based queries:**
- "expenses last week"
- "spending this month"
- "groceries this year"

**Category-based queries:**
- "food expenses"
- "transportation costs"
- "entertainment spending"

**Amount-based queries:**
- "expenses over ৳1000"
- "purchases under ৳500"

**Combined queries:**
- "food expenses last month over ৳500"
- "coffee this week"

### Behind the Scenes:

1. User types natural language query
2. Query sent to Gemini AI
3. Gemini parses and returns structured filters:
   ```json
   {
     "keywords": ["coffee"],
     "category": "food",
     "dateFilter": "last_week",
     "minAmount": null,
     "maxAmount": null
   }
   ```
4. Backend applies filters to user's expenses
5. Results returned to frontend

### Example Transformations:

| User Query | Gemini Understands |
|-----------|-------------------|
| "coffee expenses" | keywords: ["coffee"] |
| "groceries last week" | category: "groceries", dateFilter: "last_week" |
| "food over ৳500" | category: "food", minAmount: 500 |
| "transport this month" | category: "transport", dateFilter: "this_month" |

## 📸 How Receipt Scanning Works

### Process Flow:

1. User uploads receipt image (JPG, PNG, etc.)
2. Image converted to base64 in frontend
3. Sent to backend `/scan-receipt` endpoint
4. Backend calls Gemini Vision API
5. Gemini analyzes image and extracts:
   - Merchant/store name
   - Total amount
   - Date (if visible)
   - Items purchased
   - Suggested category
6. Structured data returned to user
7. User can edit before saving

### What Gemini Extracts:

```json
{
  "merchant": "Star Coffee",
  "amount": 450.50,
  "date": "2025-01-15",
  "items": ["Latte", "Croissant"],
  "category": "food",
  "currency": "৳",
  "notes": "Additional context if any"
}
```

### Supported Image Formats:
- JPG/JPEG
- PNG
- WebP
- GIF (first frame)

### Best Practices for Receipt Scanning:
- ✅ Good lighting
- ✅ Clear, focused image
- ✅ Entire receipt visible
- ✅ Flat surface (not crumpled)
- ✅ Text readable
- ❌ Avoid blurry images
- ❌ Don't crop out important parts

## 💰 API Costs

### Gemini 2.0 Flash Pricing (as of Nov 2024):

**Text Generation (Smart Search):**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Vision (Receipt Scanner):**
- Input (text): $0.075 per 1M tokens
- Input (image): $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

### Estimated Costs:

**Low Usage** (100 searches + 50 receipts/month):
- Smart Search: ~$0.05-0.10
- Receipt Scanning: ~$0.10-0.20
- **Total: ~$0.15-0.30/month**

**Medium Usage** (1000 searches + 500 receipts/month):
- Smart Search: ~$0.50-1.00
- Receipt Scanning: ~$1.00-2.00
- **Total: ~$1.50-3.00/month**

**High Usage** (10,000 searches + 5000 receipts/month):
- Smart Search: ~$5-10
- Receipt Scanning: ~$10-20
- **Total: ~$15-30/month**

### Cost Optimization Tips:

1. **Cache common queries** (future enhancement)
2. **Compress images** before sending to API
3. **Add query debouncing** for search (wait 500ms after typing)
4. **Set usage limits** in Google Cloud Console
5. **Monitor usage** in Google Cloud Console

## 🔒 Security Best Practices

### ✅ DO:
- Store API key in Supabase secrets (environment variables)
- Never expose API key in frontend code
- Use server-side API calls only
- Monitor API usage regularly
- Set up billing alerts in Google Cloud

### ❌ DON'T:
- Commit API key to Git
- Store in frontend .env files
- Share API key publicly
- Use same key for multiple projects
- Ignore usage monitoring

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not configured"

**Solution:**
```bash
# Check if secret is set
supabase secrets list

# Set the secret
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo

# Redeploy function
supabase functions deploy make-server-f573a585
```

### Issue: Search returns empty results

**Check:**
1. Is the query too specific?
2. Check backend logs: `supabase functions logs make-server-f573a585`
3. Test with simple query: "food"
4. Verify Gemini API is responding

### Issue: Receipt scanning fails

**Check:**
1. Is image size too large? (Max ~4MB recommended)
2. Is image format supported?
3. Check backend logs for Gemini errors
4. Test with a clear, simple receipt
5. Verify GEMINI_API_KEY is set

### Issue: "Gemini API error" in logs

**Possible causes:**
- Invalid API key
- API quota exceeded
- Billing not enabled in Google Cloud
- Network/connectivity issues

**Solution:**
1. Verify API key is correct
2. Check Google Cloud Console for quota
3. Enable billing if needed
4. Check Gemini API status page

## 📊 Monitoring Usage

### Check Gemini API Usage:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Enabled APIs**
4. Click on **Generative Language API**
5. View metrics and quota

### Set Up Billing Alerts:

1. Go to **Billing** in Google Cloud Console
2. Click **Budgets & alerts**
3. Create budget (e.g., $10/month)
4. Set alert thresholds (50%, 90%, 100%)
5. Add email notifications

## 🚀 Testing the Features

### Test Smart Search:

1. Go to Expenses tab
2. Use the search bar
3. Try these queries:
   - "coffee"
   - "groceries last week"
   - "food over 500"
   - "transport this month"

### Test Receipt Scanner:

1. Go to Expenses tab
2. Click "Scan Receipt" button
3. Upload a receipt image
4. Wait for AI analysis
5. Review and edit extracted data
6. Save expense

## 🔄 Fallback Behavior

If Gemini API fails, the app has fallbacks:

**Smart Search Fallback:**
- Falls back to simple keyword matching
- Still returns results (less accurate)
- User won't see errors

**Receipt Scanner Fallback:**
- Shows error message
- Allows manual entry
- Doesn't break the app

## 📈 Future Enhancements

Possible improvements:

1. **Query caching** - Cache common search patterns
2. **Image compression** - Reduce API costs
3. **Batch processing** - Process multiple receipts
4. **Multi-language** - Support Bengali receipts better
5. **Smart suggestions** - Learn from user patterns
6. **Voice input** - Speak search queries
7. **Export receipts** - Generate expense reports

## 🆘 Support

### Gemini API Resources:
- [Gemini API Docs](https://ai.google.dev/docs)
- [Pricing Info](https://ai.google.dev/pricing)
- [Quickstart Guide](https://ai.google.dev/tutorials/quickstart)

### Supabase Resources:
- [Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Secrets Management](https://supabase.com/docs/guides/functions/secrets)

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] GEMINI_API_KEY is set in Supabase secrets
- [ ] Edge function is deployed
- [ ] Smart search works with test query
- [ ] Receipt scanner works with test image
- [ ] Billing alerts are set up
- [ ] Usage is being monitored
- [ ] Error handling works (test with invalid image)
- [ ] Fallbacks work when API is slow/down

---

**Congratulations! 🎉** Your expense manager now has real AI-powered features using Google Gemini!

**API Key Used:** `AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo`

Remember to monitor usage and costs in the Google Cloud Console.

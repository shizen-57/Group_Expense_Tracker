# Quick Reference - Gemini AI Features

## 🚀 Quick Deploy

```bash
# Set API key and deploy
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo
supabase functions deploy make-server-f573a585
```

## 🔍 Smart Search Examples

| Query | What It Does |
|-------|-------------|
| `coffee` | Finds expenses with "coffee" |
| `food expenses` | Filters by food category |
| `last week` | Shows expenses from last 7 days |
| `this month` | Shows current month expenses |
| `over ৳500` | Shows expenses above ৳500 |
| `groceries last month` | Groceries from previous month |
| `food over ৳300 last week` | Food > ৳300 from last week |

## 📸 Receipt Scanner

**Extracts:**
- ✅ Total amount
- ✅ Merchant name
- ✅ Date
- ✅ Items
- ✅ Suggested category

**Best Images:**
- Clear and focused
- Good lighting
- Full receipt visible
- Not blurry

## 🐛 Quick Troubleshooting

### Search Not Working?
```bash
# Check API key
supabase secrets list

# Set API key
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo

# Deploy
supabase functions deploy make-server-f573a585
```

### Check Logs
```bash
supabase functions logs make-server-f573a585 --tail
```

## 💰 Costs

| Usage | Monthly Cost |
|-------|-------------|
| Light (100 searches + 50 receipts) | $0.15-$0.30 |
| Medium (1K searches + 500 receipts) | $1.50-$3.00 |
| Heavy (10K searches + 5K receipts) | $15-$30 |

## 📚 Full Documentation

- `GEMINI_AI_SETUP.md` - Complete setup guide
- `AI_FEATURES_TESTING.md` - Testing guide
- `GEMINI_IMPLEMENTATION_SUMMARY.md` - Overview

## 🔑 API Key

`AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo`

Store in Supabase Secrets as `GEMINI_API_KEY`

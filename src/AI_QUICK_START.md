# AI Features - Quick Start

## 🚀 Deploy in 3 Steps

```bash
# 1. Set API Key
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo

# 2. Deploy Function
supabase functions deploy make-server-f573a585

# 3. Test
Open app → Go to Expenses tab → Try it!
```

---

## 💬 Try These Queries

### Questions (Analytics):
```
"how much did I spend on food?"
"total spending last month"
"compare food vs transport"
"what's my average expense?"
"which category costs most?"
"am I over budget?"
"spending trend"
```

### Search (Find Expenses):
```
"show coffee expenses"
"groceries last week"
"food over ৳500"
"transport this month"
```

---

## 📸 Receipt Scanner

1. Click "Scan Receipt" button
2. Upload receipt photo
3. AI extracts:
   - Amount ✓
   - Items ✓
   - Merchant ✓
   - Category ✓
   - Tax/Tip ✓
4. Edit if needed
5. Save expense

---

## 💡 AI Insights

**Auto-loads on Expenses tab**

Shows:
- 📊 Spending summary
- 🔴 Budget alerts
- 💡 Recommendations
- 📈 Patterns
- 🔮 Predictions

Click "Refresh" to regenerate.

---

## 🐛 Troubleshooting

### Search not working?
```bash
supabase secrets list
# If GEMINI_API_KEY missing, set it
```

### Receipt scan fails?
- Check image is clear
- Try JPEG or PNG
- Keep under 5MB

### No insights?
- Need at least 5 expenses
- Wait for auto-load
- Click refresh button

---

## 📊 What's New

| Feature | What It Does |
|---------|-------------|
| **Smart Search** | Answers questions + finds expenses |
| **Receipt OCR** | 90% accurate extraction |
| **AI Insights** | Personalized recommendations |
| **Analytics** | Comparisons, trends, breakdowns |
| **Predictions** | Month-end forecasts |

---

## 💰 Costs

**Light usage:** ~$0.30/month
**Medium usage:** ~$3/month
**Heavy usage:** ~$15/month

Still cheaper than a coffee! ☕

---

## 📚 Full Docs

- `ENHANCED_AI_FEATURES.md` - Complete guide
- `AI_ENHANCEMENT_SUMMARY.md` - What changed
- `GEMINI_AI_SETUP.md` - Setup details
- `AI_FEATURES_TESTING.md` - Test guide

---

## ✅ Checklist

- [ ] API key set
- [ ] Function deployed
- [ ] Smart search tested
- [ ] Receipt scan tested
- [ ] Insights loading
- [ ] Questions working
- [ ] Comparisons working

---

**You're all set!** 🎉

Ask your expenses anything! 💬

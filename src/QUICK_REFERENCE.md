# 🚀 Quick Reference Card

## One-Page Cheat Sheet for Smart Expense Dialog

---

## 📦 Files Created

```
/components/groups/AddSmartExpenseDialog.tsx    ← Main component
/SMART_EXPENSE_USAGE_GUIDE.md                   ← Detailed guide
/SPLIT_TYPES_VISUAL_GUIDE.md                    ← Visual examples
/IMPLEMENTATION_COMPLETE_SUMMARY.md             ← Full summary
/examples/SmartExpenseIntegrationExample.tsx    ← Code examples
/examples/SmartExpenseDemo.tsx                  ← Demo page
/QUICK_REFERENCE.md                             ← This file
```

---

## 🎯 5 Split Types at a Glance

| Type | Icon | Use When | Example |
|------|------|----------|---------|
| **Equal Split** 🔵 | ⚖️ | Everyone pays same | Team lunch |
| **Who Joined** 🟣 | 👥 | Not everyone participated | Movie night |
| **Itemized** 🟢 | 🧾 | Different orders | Restaurant |
| **Custom %** 🟠 | % | Weighted split | Rent by room size |
| **By Duration** 🩷 | 📅 | Time-based | Airbnb stay |

---

## ⚡ Quick Integration (3 Steps)

### Step 1: Import
```tsx
import { AddSmartExpenseDialog } from './components/groups/AddSmartExpenseDialog'
import { useState } from 'react'
```

### Step 2: Add State
```tsx
const [dialogOpen, setDialogOpen] = useState(false)
```

### Step 3: Use Component
```tsx
<Button onClick={() => setDialogOpen(true)}>
  Add Smart Expense
</Button>

<AddSmartExpenseDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  members={groupMembers}
  currentUserId={currentUser.id}
  onAddExpense={handleAddExpense}
/>
```

---

## 📊 Data Output Format

```typescript
{
  description: string          // "Lunch at restaurant"
  amount: number              // 500
  paidBy: string              // "user123"
  splitWith: string[]         // ["user123", "user456"]
  splitType: string           // "by-duration"
  splitAmounts: {             // Calculated amounts
    "user123": 250,
    "user456": 250
  }
  category: string            // "food"
  notes?: string             // Optional notes
  
  // Type-specific fields
  itemSplits?: ItemSplit[]   // Only for 'itemized'
  duration?: DurationData    // Only for 'by-duration'
}
```

---

## 🎨 Color Codes

- **Blue** → Equal Split
- **Purple** → Who Joined
- **Emerald** → Itemized
- **Orange** → Custom %
- **Pink** → By Duration

---

## 💻 Example Handler

```tsx
const handleAddExpense = async (data) => {
  // POST to your API
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) throw new Error('Failed')
  
  // Success - dialog will close automatically
}
```

---

## ✅ Testing Checklist

- [ ] Equal split calculates correctly (amount ÷ members)
- [ ] Who Joined excludes non-participants
- [ ] Itemized sums to total amount
- [ ] Custom % totals to 100%
- [ ] By Duration proportional to days
- [ ] Dark mode looks good
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Validation prevents errors
- [ ] Currency shows ৳ (BDT)

---

## 🔧 Backend Updates Needed

```sql
-- Add columns to expenses table
ALTER TABLE expenses ADD COLUMN split_type VARCHAR(50);
ALTER TABLE expenses ADD COLUMN split_amounts JSONB;
ALTER TABLE expenses ADD COLUMN item_splits JSONB;
ALTER TABLE expenses ADD COLUMN duration JSONB;
```

```typescript
// API endpoint update
POST /api/groups/:id/expenses
{
  ...expenseData,
  splitType: string,
  splitAmounts: Record<string, number>,
  itemSplits?: ItemSplit[],
  duration?: DurationData
}
```

---

## 🐛 Common Issues & Solutions

**Issue:** Split amounts don't sum to total  
**Fix:** Check itemized splits - each item needs correct amount

**Issue:** Percentages error  
**Fix:** Ensure custom % adds up to exactly 100%

**Issue:** Dark mode colors look off  
**Fix:** Component has dark mode variants - check your theme config

**Issue:** Dialog doesn't open  
**Fix:** Verify state is managed correctly with `open` and `onOpenChange`

**Issue:** Validation failing  
**Fix:** Ensure description, amount, and at least 1 participant selected

---

## 📱 Props Quick Reference

```typescript
interface Props {
  open: boolean                    // Dialog open state
  onOpenChange: (open: boolean)    // State setter
  members: Member[]                // Group members
  currentUserId: string            // Logged in user
  onAddExpense: (data) => Promise  // Submit handler
}
```

---

## 🎓 Learning Path

1. **Read** → `/SPLIT_TYPES_VISUAL_GUIDE.md` (10 min)
2. **Try** → `/examples/SmartExpenseDemo.tsx` (15 min)
3. **Review** → `/SMART_EXPENSE_USAGE_GUIDE.md` (20 min)
4. **Integrate** → Follow integration steps (30 min)
5. **Test** → All 5 split types (30 min)

**Total time:** ~2 hours for complete understanding

---

## 🔗 Quick Links

- **Main Component:** `/components/groups/AddSmartExpenseDialog.tsx`
- **Full Guide:** `/SMART_EXPENSE_USAGE_GUIDE.md`
- **Visual Guide:** `/SPLIT_TYPES_VISUAL_GUIDE.md`
- **Demo Page:** `/examples/SmartExpenseDemo.tsx`
- **Examples:** `/examples/SmartExpenseIntegrationExample.tsx`

---

## 💡 Pro Tips

✨ **Use Itemized** for restaurant bills - most accurate  
✨ **Use By Duration** for vacation rentals - fair for time-based  
✨ **Use Custom %** for rent - accounts for room sizes  
✨ **Use Who Joined** for optional events - excludes non-participants  
✨ **Use Equal Split** for quick shared expenses - simplest option  

---

## 🎯 Decision Tree

```
Need to split expense?
├─ Everyone participated equally? → Equal Split
├─ Some didn't participate? → Who Joined
├─ Different items consumed? → Itemized
├─ Need weighted amounts? → Custom %
└─ Based on time? → By Duration
```

---

## 📞 Need Help?

1. Check `/SMART_EXPENSE_USAGE_GUIDE.md` for detailed docs
2. Review `/SPLIT_TYPES_VISUAL_GUIDE.md` for examples
3. Look at `/examples/` folder for code samples
4. Test with `/examples/SmartExpenseDemo.tsx`

---

## 🎉 That's It!

You're ready to use the Smart Expense Dialog with all 5 split types!

**Remember:** The component is production-ready, fully typed, animated, responsive, and supports dark mode. Just integrate and test! 🚀

---

**Version:** 1.0.0  
**Status:** ✅ Ready  
**Last Updated:** December 2024

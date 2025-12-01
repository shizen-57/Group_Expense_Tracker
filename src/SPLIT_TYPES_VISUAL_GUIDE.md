# 🎨 Visual Guide: 5 Split Types Explained

## Overview

This guide provides a visual and practical explanation of all 5 splitting methods available in the Add Smart Expense dialog.

---

## 1. 🔵 Equal Split

### When to Use
- Group dinners where everyone shares equally
- Shared utilities (electricity, internet)
- Group gifts
- Team activities

### How It Works
Total amount ÷ Number of members = Each person's share

### Example Scenario
**Restaurant Bill:** ৳900 for 3 people

```
Total: ৳900
Members: Alice, Bob, Charlie

Calculation:
- Alice: ৳900 ÷ 3 = ৳300.00
- Bob: ৳900 ÷ 3 = ৳300.00
- Charlie: ৳900 ÷ 3 = ৳300.00
```

### Visual UI
```
┌─────────────────────────────────────┐
│ 🔵 Everyone pays equally            │
├─────────────────────────────────────┤
│ Alice         [৳300.00]             │
│ Bob           [৳300.00]             │
│ Charlie       [৳300.00]             │
└─────────────────────────────────────┘
```

### Use Case Benefits
✅ Simplest method  
✅ No disputes  
✅ Fair for shared activities  

---

## 2. 🟣 Who Joined (Participation-Based)

### When to Use
- Optional movie nights
- Casual hangouts
- Events where not everyone attended
- Weekend trips with partial attendance

### How It Works
Only selected participants split the bill equally

### Example Scenario
**Movie Night:** ৳600, but Charlie didn't attend

```
Total: ৳600
All Members: Alice, Bob, Charlie
Who Joined: Alice, Bob

Calculation:
- Alice: ৳600 ÷ 2 = ৳300.00
- Bob: ৳600 ÷ 2 = ৳300.00
- Charlie: ৳0.00 (didn't participate)
```

### Visual UI
```
┌─────────────────────────────────────┐
│ 🟣 Select who participated          │
├─────────────────────────────────────┤
│ [✓] Alice     [৳300.00]             │
│ [✓] Bob       [৳300.00]             │
│ [ ] Charlie   (not selected)        │
└─────────────────────────────────────┘
```

### Use Case Benefits
✅ Fair for optional events  
✅ No one pays for others' choices  
✅ Encourages participation tracking  

---

## 3. 🟢 Itemized Split

### When to Use
- Restaurant orders with different items
- Grocery shopping (different items for different people)
- Shopping trips with individual purchases
- Food delivery orders

### How It Works
Each item is assigned to specific people who consumed it

### Example Scenario
**Restaurant Bill:** ৳1000

```
Items:
- Pizza (৳500) → Shared by Alice & Bob
- Pasta (৳300) → Only Charlie
- Dessert (৳200) → Shared by all 3

Calculation:
- Alice: (৳500 ÷ 2) + (৳200 ÷ 3) = ৳250 + ৳66.67 = ৳316.67
- Bob: (৳500 ÷ 2) + (৳200 ÷ 3) = ৳250 + ৳66.67 = ৳316.67
- Charlie: ৳300 + (৳200 ÷ 3) = ৳300 + ৳66.67 = ৳366.67

Total: ৳1000.00 ✓
```

### Visual UI
```
┌─────────────────────────────────────┐
│ 🟢 Add items and assign to members  │
├─────────────────────────────────────┤
│ Item: Pizza          ৳500.00        │
│ [Alice] [Bob] Charlie               │
├─────────────────────────────────────┤
│ Item: Pasta          ৳300.00        │
│ Alice Bob [Charlie]                 │
├─────────────────────────────────────┤
│ Item: Dessert        ৳200.00        │
│ [Alice] [Bob] [Charlie]             │
├─────────────────────────────────────┤
│ [+ Add Item]                        │
└─────────────────────────────────────┘
```

### Use Case Benefits
✅ Most accurate for restaurant bills  
✅ Transparent individual consumption  
✅ No subsidizing others' orders  

---

## 4. 🟠 Custom Percentage

### When to Use
- Income-based rent splitting
- Business expense sharing
- Weighted contributions based on usage
- Unequal ownership scenarios

### How It Works
Assign custom percentage to each person (must total 100%)

### Example Scenario
**Shared Apartment Rent:** ৳30,000

```
Total: ৳30,000
Members with different room sizes:

Percentages:
- Alice (Master bedroom): 40%
- Bob (Regular room): 30%
- Charlie (Regular room): 30%

Calculation:
- Alice: ৳30,000 × 40% = ৳12,000.00
- Bob: ৳30,000 × 30% = ৳9,000.00
- Charlie: ৳30,000 × 30% = ৳9,000.00

Total: 100% ✓
```

### Visual UI
```
┌─────────────────────────────────────┐
│ 🟠 Set custom percentages (100%)    │
├─────────────────────────────────────┤
│ Alice    [40.0] %    [৳12,000.00]   │
│ Bob      [30.0] %    [৳9,000.00]    │
│ Charlie  [30.0] %    [৳9,000.00]    │
└─────────────────────────────────────┘
```

### Use Case Benefits
✅ Flexible for complex scenarios  
✅ Accounts for unequal circumstances  
✅ Transparent percentage distribution  

---

## 5. 🩷 By Duration (Time-Based)

### When to Use
- Shared vacation rentals
- Hotel room splitting
- Car rental with different usage days
- Temporary shared accommodations
- Pay-per-day arrangements

### How It Works
Split based on days/hours each person used the service

### Example Scenario
**Airbnb for Weekend Trip:** ৳9,000

```
Total: ৳9,000 for 4.5 days total usage

Duration:
- Alice: 2 days
- Bob: 1.5 days  
- Charlie: 1 day

Calculation:
Total duration = 2 + 1.5 + 1 = 4.5 days

- Alice: (2 ÷ 4.5) × ৳9,000 = ৳4,000.00
- Bob: (1.5 ÷ 4.5) × ৳9,000 = ৳3,000.00
- Charlie: (1 ÷ 4.5) × ৳9,000 = ৳2,000.00

Total: ৳9,000.00 ✓
```

### Visual UI
```
┌─────────────────────────────────────┐
│ 🩷 Days/hours each person spent     │
├─────────────────────────────────────┤
│ Alice    [2.0] days   [৳4,000.00]   │
│ Bob      [1.5] days   [৳3,000.00]   │
│ Charlie  [1.0] days   [৳2,000.00]   │
└─────────────────────────────────────┘
```

### Use Case Benefits
✅ Fair for time-based resources  
✅ Proportional to actual usage  
✅ Perfect for vacation rentals  

---

## Real-World Use Cases

### 🏠 Apartment Sharing
- **Rent:** Custom % (based on room size)
- **Utilities:** Equal Split
- **Groceries:** Itemized (different preferences)
- **Internet:** Equal Split

### 🌴 Weekend Trip
- **Hotel:** By Duration (different stay lengths)
- **Meals:** Who Joined (not everyone at every meal)
- **Gas:** Equal Split (shared car)
- **Activities:** Who Joined (optional activities)

### 🍕 Restaurant Group
- **Food:** Itemized (different orders)
- **Tip:** Equal Split
- **Drinks:** Who Joined (not everyone drank)

### 💼 Business Expense
- **Office Rent:** Custom % (based on company equity)
- **Supplies:** Equal Split
- **Client Dinner:** Itemized (different meals)

---

## Decision Tree

```
Need to split an expense?
│
├─ Everyone participated equally?
│  └─ YES → Use Equal Split 🔵
│
├─ Did some people not participate?
│  └─ YES → Use Who Joined 🟣
│
├─ Restaurant with different orders?
│  └─ YES → Use Itemized 🟢
│
├─ Need weighted distribution?
│  └─ YES → Use Custom % 🟠
│
└─ Based on time/days used?
   └─ YES → Use By Duration 🩷
```

---

## Validation Rules

### All Split Types
✅ Total amount must be positive  
✅ At least one person must be included  
✅ Description is required  
✅ Category must be selected  

### Type-Specific Validations

**Equal Split:**  
✅ No additional validation needed

**Who Joined:**  
✅ At least 1 participant must be selected

**Itemized:**  
✅ Item amounts must sum to total  
✅ Each item needs at least 1 person  
✅ Item names can't be empty

**Custom %:**  
✅ Percentages must sum to exactly 100%  
✅ All percentages must be non-negative

**By Duration:**  
✅ At least one person with >0 days  
✅ All durations must be non-negative

---

## Color Coding Reference

| Split Type | Primary Color | Background | Text Color | Border |
|------------|---------------|------------|------------|--------|
| Equal Split | Blue | `bg-blue-50` | `text-blue-900` | `border-blue-100` |
| Who Joined | Purple | `bg-purple-50` | `text-purple-900` | `border-purple-100` |
| Itemized | Emerald | `bg-emerald-50` | `text-emerald-900` | `border-emerald-100` |
| Custom % | Orange | `bg-orange-50` | `text-orange-900` | `border-orange-100` |
| By Duration | Pink | `bg-pink-50` | `text-pink-900` | `border-pink-100` |

---

## Tips for Users

### 💡 Pro Tips

1. **For Restaurant Bills:** Use Itemized for accurate splitting
2. **For Quick Splits:** Equal Split is fastest
3. **For Trips:** Combine Who Joined and By Duration
4. **For Rent:** Use Custom % based on room sizes
5. **Review Before Submit:** Check split preview before adding

### ⚠️ Common Mistakes

❌ Using Equal Split when people ordered different amounts  
✅ Use Itemized instead

❌ Forgetting to deselect non-participants in Who Joined  
✅ Double-check participant list

❌ Itemized amounts not matching total  
✅ Use split preview to verify

❌ Custom % not totaling 100%  
✅ Watch the validation message

---

## Implementation Notes

### Data Structure

Each split type stores different metadata:

```typescript
// Equal Split
{ splitType: 'equal', splitAmounts: {...} }

// Who Joined
{ splitType: 'who-joined', participants: [...], splitAmounts: {...} }

// Itemized
{ splitType: 'itemized', itemSplits: [...], splitAmounts: {...} }

// Custom %
{ splitType: 'custom-percentage', percentages: {...}, splitAmounts: {...} }

// By Duration
{ splitType: 'by-duration', duration: {...}, splitAmounts: {...} }
```

### Backward Compatibility

The component maintains compatibility with existing split types by mapping:
- Old `'equal'` → New `'equal'` ✅
- Old `'unequal'` → New `'itemized'` or `'custom-percentage'`
- Old `'percentage'` → New `'custom-percentage'` ✅

---

## Summary

All 5 split types are now implemented with:
- ✅ Beautiful color-coded UI
- ✅ Real-time calculations
- ✅ Animated transitions
- ✅ Validation rules
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ BDT currency (৳)

Choose the right split type for your scenario and enjoy transparent, fair expense management! 🎉

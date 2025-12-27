# Group Expense Split Types - Complete Logic Summary

## Overview
The group expense system supports 5 sophisticated split types, each with comprehensive validation and proper rounding logic to ensure accurate calculations.

---

## 1. Equal Split (`equal`)

### Logic
- Divides the total expense amount equally among **all group members**
- Uses precise 2-decimal rounding: `parseFloat((amount / memberCount).toFixed(2))`

### Calculation
```typescript
equalShare = totalAmount / numberOfMembers
// Example: ৳100 ÷ 3 members = ৳33.33 each
```

### Validation
- ✅ Requires at least one member in the group
- ✅ Automatically includes all members
- ✅ No user configuration needed

### UI Behavior
- Shows all members with their calculated share
- Green badges display individual amounts
- Simple and straightforward - default option

---

## 2. Who Joined (`who-joined`)

### Logic
- Allows selecting **which members participated** in the expense
- Offers two sub-modes:
  - **Equal Mode**: Splits equally among selected participants
  - **Manual Mode**: User enters exact amount for each participant

### Calculation

**Equal Mode:**
```typescript
participantShare = totalAmount / numberOfParticipants
// Example: ৳100 ÷ 2 participants = ৳50.00 each
```

**Manual Mode:**
```typescript
// User enters amounts directly
participant1 = ৳60.00
participant2 = ৳40.00
// Total must equal ৳100.00
```

### Validation
- ✅ At least one participant must be selected
- ✅ Manual mode: Entered amounts must sum to total expense (±৳0.01 tolerance)
- ✅ Only valid group members can be selected
- ✅ Real-time validation feedback

### UI Behavior
- Purple theme with checkboxes for member selection
- Toggle between equal/manual modes
- Manual mode shows input fields for each selected participant
- Summary card displays total entered vs. expected with color coding:
  - 🟢 Green = Amounts match
  - 🔴 Red = Mismatch with warning

---

## 3. Itemized Split (`itemized`)

### Logic
- Allows creating a **detailed item-by-item breakdown**
- Each item can be assigned to specific members
- Members split the cost of items they ordered

### Calculation
```typescript
// For each item:
itemShare = itemAmount / numberOfPeopleWhoOrderedIt

// Member's total = sum of all their item shares
memberTotal = sum(itemShare for each item they ordered)

// Example:
// Pizza ৳60 → [Alice, Bob] = ৳30 each
// Salad ৳20 → [Alice] = ৳20
// Alice total = ৳30 + ৳20 = ৳50
// Bob total = ৳30
```

### Validation
- ✅ At least one item with name and amount required
- ✅ Each item must be assigned to at least one member
- ✅ Sum of all item amounts must match total expense (±৳0.50 tolerance)
- ✅ Specific error messages show unassigned items by name

### UI Behavior
- Emerald theme for food/item tracking
- Dynamic item list with add/remove buttons
- Member selection chips for each item
- Real-time split summary showing each member's calculated total
- CSV export includes itemized breakdown

---

## 4. Custom Percentage (`custom-percentage`)

### Logic
- Members pay based on **custom percentage allocations**
- Useful for income-based splitting or agreed-upon ratios

### Calculation
```typescript
memberAmount = (totalAmount × memberPercentage) / 100

// Example: ৳100 expense
// Alice: 60% → ৳60.00
// Bob: 40% → ৳40.00
```

### Validation
- ✅ Total percentages must equal 100% (±1% tolerance)
- ✅ Clear error messages show current total and how much over/under
- ✅ Visual indicator: Green badge for valid, red badge for invalid

### UI Behavior
- Orange theme for financial precision
- Slider controls for each member (0-100%)
- Large percentage display with amount preview
- Real-time total percentage tracker with color coding
- Amount updates instantly as sliders move

---

## 5. By Duration (`by-duration`)

### Logic
- Splits cost **proportionally based on time spent**
- Useful for shared accommodations, subscriptions, rentals

### Calculation
```typescript
totalDuration = sum(all member durations)
memberAmount = (totalAmount × memberDuration) / totalDuration

// Example: ৳300 hotel for 3 nights
// Alice: 3 days → (300 × 3) / 5 = ৳180.00
// Bob: 2 days → (300 × 2) / 5 = ৳120.00
```

### Validation
- ✅ At least one member must have positive duration
- ✅ Total duration must be > 0
- ✅ Durations accept decimal values (0.5 days = 12 hours)
- ✅ Real-time proportion calculation

### UI Behavior
- Pink theme for temporal tracking
- Number inputs with 0.5 step increments
- "days" label (can represent hours, nights, etc.)
- Live preview of calculated amounts
- Each row shows: member name + duration input + calculated amount

---

## Backend Processing

### Data Flow
1. **Frontend Validation**: All validations run before submission
2. **Payload Sanitization**: Backend further validates and cleans data
3. **Balance Updates**: Only positive splits update group balances
4. **Storage**: Full metadata preserved for audit/export

### Backend Validations (Additional Layer)
```typescript
// Server-side checks:
✅ Payer is a valid group member
✅ All participants are valid group members
✅ Amount > 0
✅ Split amounts are numeric and properly rounded
✅ ItemSplits and duration data properly structured
✅ No empty participant lists
```

### Balance Key System
- Uses deterministic key generation: `${creditorId}__${debtorId}`
- Payer becomes creditor for all other participants
- Only updates balances where `memberId !== paidBy`
- Robust parsing handles legacy formats

---

## CSV Export Features

All split metadata is preserved in exports:
- **Split Type column**: Shows which method was used
- **Participants column**: Lists who participated
- **Split Details column**: Shows amounts/percentages/durations
- **Itemized Data**: Full item breakdown with attendees
- **Duration Data**: Shows days for each member

Export format:
```csv
"Date","Description","Category","Amount","Paid By","Split Type","Participants","Split Details","Notes"
"12/20/2024","Dinner","Food & Dining","100.00","Alice","Itemized","Alice; Bob","Alice: ৳50.00 | Bob: ৳30.00 || Items: Pizza ৳60.00 → Alice, Bob | Salad ৳20.00 → Alice",""
```

---

## Edge Cases Handled

### Rounding Precision
- All calculations use 2-decimal precision
- Intermediate calculations rounded at each step
- Prevents floating-point accumulation errors

### Zero Members
```typescript
if (memberIds.length === 0) break
// Returns empty splits object
```

### No Participants Selected (Who Joined)
```typescript
if (activeParticipants.length === 0) break
// Validation prevents submission
```

### Empty Itemized List
- Validation requires at least one valid item
- Items must have both name and amount > 0

### Percentage Tolerance
- Allows ±1% variance from 100%
- Prevents frustrating slider precision issues
- Still catches major errors

### Item Total Tolerance
- Allows ±৳0.50 variance for itemized totals
- Accounts for rounding across multiple items
- Prevents "can't add up" frustration

---

## State Management

### Form Reset Logic
- Resets on dialog open
- Resets when member list changes
- Preserves current user as default payer
- Initializes percentages evenly distributed
- All states properly memoized

### Memoized Calculations
```typescript
// Prevents unnecessary recalculations:
✅ splitAmounts (depends on amount, type, participants, etc.)
✅ manualWhoJoinedTotal (depends on participants, amounts)
✅ totalPercent (depends on percentages)
✅ memberIds (depends on members array)
```

---

## User Experience Enhancements

### Visual Feedback
- **Color Coding**: Each split type has distinct theme color
- **Real-time Updates**: All amounts update as user adjusts inputs
- **Validation Indicators**: Green/red badges show status
- **Error Messages**: Specific, actionable error descriptions

### Accessibility
- All inputs properly labeled
- Screen reader support with DialogTitle/Description
- Keyboard navigation support
- Clear visual hierarchy

### Help Text
- Each mode has descriptive text explaining behavior
- Manual mode clarifies "exact amount each person owes"
- Duration mode explains "proportionally based on durations"

---

## Testing Checklist

### Per Split Type
- [ ] Creates expense successfully
- [ ] Validation catches invalid inputs
- [ ] Amounts round correctly (no .999999 issues)
- [ ] Backend processes payload correctly
- [ ] Balances update accurately
- [ ] CSV export includes correct metadata
- [ ] UI shows proper split breakdown in expense list

### Cross-cutting
- [ ] Dialog resets properly on open/close
- [ ] Member list changes handled gracefully
- [ ] All split types work with 1 member (edge case)
- [ ] All split types work with 10+ members (scale test)
- [ ] Build compiles without errors
- [ ] No console errors in browser

---

## Summary Statistics

| Split Type | Complexity | Validation Rules | User Inputs Required |
|------------|-----------|------------------|---------------------|
| Equal | Low | 1 | None (automatic) |
| Who Joined | Medium | 3 | Member selection + optional amounts |
| Itemized | High | 4 | Items + amounts + member assignments |
| Custom % | Medium | 2 | Percentage sliders |
| By Duration | Medium | 3 | Duration values |

**Total Lines of Split Logic**: ~200 lines
**Total Validation Rules**: 15+ distinct checks
**Supported Currencies**: ৳ (Taka) with 2-decimal precision
**Backend Compatibility**: Full metadata preservation

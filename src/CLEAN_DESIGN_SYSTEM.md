# Clean Design System - Minimalist Financial UI

Based on the AI Insights redesign, this document outlines the design principles to apply across all pages.

## 🎨 Core Design Principles

### 1. **Minimalist Color Palette**
- **Primary Background:** Light gray (#f5f5f5, #fafafa)
- **Card Background:** Pure white (#ffffff)
- **Primary Accent:** Soft teal/emerald (#10b981, #14b8a6)
- **Secondary Accents:** Soft pastels (light blue, light purple)
- **Text:** Dark gray for primary (#1f2937), medium gray for secondary (#6b7280)
- **Borders:** Light gray (#e5e7eb, #d1d5db)

### 2. **Typography**
```css
/* Headers */
H1: text-3xl (30px) - Page title
H2: text-2xl (24px) - Section headers  
H3: font-medium (500 weight) - Card titles

/* Body Text */
Regular: text-sm (14px) - Most content
Large Numbers: text-5xl (48px), text-2xl (24px) - Stats
Small Text: text-xs (12px) - Labels, metadata

/* Font Weight */
Regular: 400 (default)
Medium: 500 (card titles, buttons)
Bold: Avoid unless necessary
```

### 3. **Card Design**

#### Standard Card
```tsx
<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

**Properties:**
- White background
- Subtle border (1px, gray-200)
- Small shadow (shadow-sm)
- Hover effect (shadow-md)
- Smooth transitions
- Padding: p-6 (24px)

#### Hero Card (Featured)
```tsx
<Card className="border-0 shadow-md bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50">
  <CardContent className="p-8">
    {/* Large stat or featured content */}
  </CardContent>
</Card>
```

**Properties:**
- Soft gradient background (very subtle)
- No border
- Medium shadow (shadow-md)
- Extra padding: p-8 (32px)
- Used for main/hero content only

### 4. **Buttons**

#### Primary Button
```tsx
<Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">
  Action
</Button>
```

#### Secondary Button (Outline)
```tsx
<Button variant="outline" className="rounded-full">
  Action
</Button>
```

#### Icon Button
```tsx
<Button variant="outline" size="icon" className="rounded-full">
  <Settings className="h-5 w-5" />
</Button>
```

**Properties:**
- Rounded-full (fully rounded)
- Small size (size="sm" or default)
- Clear hover states
- Emerald for primary actions
- Blue for special actions

### 5. **Layout Grid**

#### Page Structure
```tsx
<div className="max-w-7xl mx-auto space-y-6">
  {/* Content with consistent vertical spacing */}
</div>
```

#### Card Grid (Responsive)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Cards with consistent gaps */}
</div>
```

#### Stat Cards Grid
```tsx
<div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
  {/* Small stat cards */}
</div>
```

**Spacing:**
- Page gaps: space-y-6 (24px vertical)
- Card gaps: gap-6 (24px), gap-4 (16px for smaller)
- Internal padding: p-6 (24px standard), p-8 (32px hero)

### 6. **Filter Pills / Toggles**

```tsx
<div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
  <button className="px-4 py-2 rounded-full bg-emerald-500 text-white shadow-sm">
    This Month
  </button>
  <button className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900">
    Last Quarter
  </button>
</div>
```

**Properties:**
- Container: White background, rounded-full, subtle shadow
- Active state: Emerald background, white text, shadow
- Inactive state: Gray text, hover effect
- Smooth transitions

### 7. **Stat Cards**

```tsx
<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="p-6">
    <div className="flex items-start justify-between mb-3">
      <div className="text-sm text-gray-600">Label</div>
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <div className="text-2xl mb-1">Value</div>
    <div className="text-xs text-gray-500">Sublabel</div>
  </CardContent>
</Card>
```

**Structure:**
1. Top row: Label (left) + Icon (right)
2. Large value in the middle
3. Small sublabel at bottom
4. Minimal decoration, clean hierarchy

### 8. **Icons**

**Size Guide:**
- Small icons: h-4 w-4 (16px) - In text
- Medium icons: h-5 w-5 (20px) - Card headers, buttons
- Large icons: h-8 w-8 (32px) - Hero sections

**Colors:**
- Active/Primary: emerald-500, blue-600
- Inactive/Secondary: gray-400, gray-500
- Status: red-600 (alert), yellow-600 (warning), green-600 (success)

**Usage:**
- Always paired with text or context
- Right-aligned in card headers
- Left-aligned in lists/alerts
- Icon-only buttons must be rounded-full

### 9. **Alert/Info Boxes**

```tsx
<div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <p className="text-sm text-gray-700">Message</p>
  </div>
</div>
```

**Color Variants:**
- Error/Alert: bg-red-50, border-red-100, text-red-600
- Warning: bg-yellow-50, border-yellow-100, text-yellow-600
- Info: bg-blue-50, border-blue-100, text-blue-600
- Success: bg-green-50, border-green-100, text-green-600

### 10. **Charts & Visualizations**

#### Simple SVG Charts
- Use native SVG for simple charts
- Soft emerald/teal colors (#10b981)
- Gradient fills with low opacity (0.05-0.3)
- Smooth rounded lines (strokeLinecap="round")
- Clear axis labels in gray-400
- Minimal grid lines with dashed style

#### Donut Chart Colors
```css
Primary segment: #10b981 (emerald)
Secondary: #a5b4fc (indigo-300)
Tertiary: #e5e7eb (gray-200)
```

### 11. **Input Fields**

```tsx
<input
  type="text"
  placeholder="Enter value"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-emerald-500 
             focus:border-transparent"
/>
```

**Properties:**
- Rounded-lg (8px border radius)
- Gray border (border-gray-300)
- Emerald focus ring
- Clear placeholder text
- Consistent padding (px-4 py-2)

### 12. **Shadows**

```css
shadow-sm    /* Subtle shadow for cards */
shadow-md    /* Medium shadow for hero cards */
shadow-lg    /* Not used in minimal design */
hover:shadow-md  /* Hover effect for cards */
```

**Philosophy:**
- Less is more
- Shadows should be barely noticeable
- Used for depth, not decoration
- Consistent across all cards

### 13. **Spacing Scale**

```css
gap-2: 8px   /* Tight spacing (button groups) */
gap-3: 12px  /* Small spacing (icon + text) */
gap-4: 16px  /* Medium spacing (small cards) */
gap-6: 24px  /* Large spacing (main cards) */

p-4: 16px    /* Small padding (alerts, inputs) */
p-6: 24px    /* Standard padding (cards) */
p-8: 32px    /* Large padding (hero cards) */

space-y-3: 12px  /* Vertical rhythm (lists) */
space-y-4: 16px  /* Vertical rhythm (sections) */
space-y-6: 24px  /* Vertical rhythm (page sections) */
```

## 📐 Page Layout Templates

### Dashboard/Overview Page
```
[Header with filters]
  
[Hero Card (lg:col-span-2)] | [Stat Grid (2x2)]
                             |

[Chart Card (lg:col-span-2)] | [Side Card]

[Action Cards (grid)]
```

### List Page (Expenses, etc.)
```
[Header with actions]

[Stats Row (3-4 cards)]

[Filters/Search]

[List/Table with cards]
```

### Detail Page
```
[Header with back button]

[Main Content Card]

[Related Info Grid]

[Actions at bottom]
```

## 🎯 Component Patterns

### Standard Stat Card
- Small label (gray-600, text-sm)
- Icon (gray-400, right-aligned)
- Large value (text-2xl)
- Small sublabel (gray-500, text-xs)

### Hero/Featured Card
- Gradient background (very subtle)
- Large value (text-5xl)
- Medium title (text-2xl)
- Description text (text-sm, gray-600)
- CTA button (emerald, rounded-full)

### Alert/Insight Card
- Icon on left (colored based on severity)
- Text content
- Optional action button below
- Soft colored background matching severity

### Chart Card
- Title at top
- Chart visualization (SVG)
- Legend below or beside
- Minimal styling, focus on data

## 🚫 What to Avoid

1. **Heavy gradients** - Use only very subtle ones
2. **Multiple shadows** - Stick to shadow-sm and shadow-md
3. **Bright colors** - Use soft, muted tones
4. **Complex borders** - Simple 1px borders only
5. **Over-decoration** - Less is more
6. **Inconsistent spacing** - Use the scale
7. **Too many font weights** - Regular and medium only
8. **Clashing colors** - Stick to the palette
9. **Heavy animations** - Subtle transitions only
10. **Overcrowded layouts** - White space is good

## ✅ Checklist for Each Page

- [ ] Uses max-w-7xl container
- [ ] Consistent gap-6 spacing
- [ ] All cards have border-gray-200
- [ ] All buttons are rounded-full
- [ ] Icons are consistent size (h-5 w-5)
- [ ] Text uses gray scale (gray-600, gray-700)
- [ ] Hover effects on interactive elements
- [ ] Responsive grid layouts
- [ ] Proper heading hierarchy
- [ ] Minimal, purposeful shadows
- [ ] Clean, uncluttered design
- [ ] Follows stat card pattern
- [ ] Uses emerald for primary actions
- [ ] White card backgrounds
- [ ] Consistent padding (p-6, p-8)

## 🎨 Color Reference

### Primary Colors
```
Emerald 500: #10b981
Teal 50: #f0fdfa
Cyan 50: #ecfeff
```

### Gray Scale
```
Gray 200: #e5e7eb (borders)
Gray 300: #d1d5db (disabled)
Gray 400: #9ca3af (icons)
Gray 500: #6b7280 (sublabels)
Gray 600: #4b5563 (labels)
Gray 700: #374151 (body text)
Gray 900: #111827 (headings)
```

### Status Colors
```
Red 50: #fef2f2 (alert bg)
Red 100: #fee2e2 (alert border)
Red 600: #dc2626 (alert text/icon)

Yellow 50: #fefce8 (warning bg)
Yellow 100: #fef3c7 (warning border)
Yellow 600: #ca8a04 (warning text/icon)

Blue 600: #2563eb (info/special actions)
Green 600: #16a34a (success)
```

This design system ensures consistency, cleanliness, and a professional appearance across all pages! 🎨✨

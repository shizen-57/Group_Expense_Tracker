# AI Insights Page - Design System

## 🎨 Color Palette

### Primary Gradients

#### AI Branding
```css
/* Main AI Theme */
from-purple-600 via-pink-600 to-blue-600  /* Hero banner */
from-purple-500 to-pink-600              /* Active nav button */
from-purple-50 to-pink-50                /* AI summary background */

/* Purple hover states */
text-purple-600 hover:text-purple-700 hover:bg-purple-50
```

#### Severity Colors

**Alert (High Priority)**
```css
from-red-500 to-pink-600        /* Gradient */
bg-red-100 text-red-700         /* Badge */
text-red-600                    /* Icon */
```

**Warning (Medium Priority)**
```css
from-yellow-500 to-orange-600   /* Gradient */
bg-yellow-100 text-yellow-700   /* Badge */
text-yellow-600                 /* Icon */
```

**Info (Low Priority)**
```css
from-blue-500 to-cyan-600       /* Gradient */
from-green-500 to-emerald-600   /* Success variant */
bg-green-100 text-green-700     /* Badge */
```

#### Stats Cards
```css
from-emerald-500 to-teal-600    /* This month */
from-blue-500 to-cyan-600       /* Last month */
from-red-500 to-pink-600        /* Increase trend */
from-green-500 to-emerald-600   /* Decrease trend */
```

#### Predictions
```css
from-blue-600 via-cyan-600 to-teal-600  /* Prediction card */
bg-white/20                              /* Glass effect */
```

## 📐 Layout Grid

### Responsive Breakpoints
```css
/* Mobile first approach */
grid-cols-1              /* Mobile: stack everything */
md:grid-cols-2           /* Tablet: 2 columns for cards */
md:grid-cols-3           /* Desktop: 3 columns for stats */
```

### Spacing Scale
```css
gap-3   /* Small gaps (12px) */
gap-4   /* Medium gaps (16px) */
gap-6   /* Large gaps (24px) */
space-y-4  /* Vertical spacing (16px) */
space-y-6  /* Vertical spacing (24px) */
```

### Padding Scale
```css
p-3     /* Small padding (12px) */
p-4     /* Medium padding (16px) */
p-6     /* Large padding (24px) */
p-8     /* Extra large padding (32px) */
```

## 🎯 Card Styles

### Base Card
```css
border-0                    /* No border */
shadow-xl                   /* Large shadow */
bg-white                    /* White background */
overflow-hidden             /* Clip overflow */
hover:shadow-2xl            /* Larger shadow on hover */
transition-shadow           /* Smooth shadow transition */
```

### Gradient Cards
```css
/* With gradient overlay */
relative
bg-gradient-to-br from-purple-50 to-pink-50
```

### Glass Cards
```css
/* Glassmorphism effect */
bg-white/20
backdrop-blur-sm
border border-white/40
```

## 📏 Typography

### Headings
```css
text-4xl               /* Hero title (36px) */
text-3xl               /* Large stat (30px) */
text-2xl               /* Section title (24px) */
text-xl                /* Card title (20px) */
font-bold              /* Bold weight */
```

### Body Text
```css
text-sm                /* Small text (14px) */
leading-relaxed        /* Comfortable line height */
text-muted-foreground  /* Secondary text color */
```

### Special Text
```css
gradient-text          /* Gradient text effect */
text-5xl               /* Huge numbers (48px) */
```

## 🎪 Component Patterns

### Icon Container
```html
<div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
  <Icon className="h-6 w-6 text-white" />
</div>
```

### Stat Card
```html
<Card className="border-0 shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-shadow">
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
  <CardContent className="p-6 relative">
    <!-- Icon + Emoji -->
    <!-- Label -->
    <!-- Value -->
  </CardContent>
</Card>
```

### Badge
```html
<Badge className="bg-red-100 text-red-700">
  HIGH PRIORITY
</Badge>
```

### Insight Card
```html
<Card className="border-0 shadow-lg bg-white overflow-hidden hover:shadow-xl transition-shadow">
  <div className="h-2 bg-gradient-to-r from-red-500 to-pink-600" />
  <CardContent className="p-6">
    <!-- Icon + Content -->
  </CardContent>
</Card>
```

## ✨ Animations

### Page Entry
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 * index }}
```

### Loading State
```css
animate-pulse     /* Pulsing icon */
animate-spin      /* Spinning refresh */
```

### Hover Effects
```css
hover:scale-105
hover:shadow-2xl
group-hover:translate-x-1
transition-all
```

## 🎁 Emoji Stickers

### Usage Guidelines
- Use 2-4xl sized emojis (text-2xl to text-4xl)
- Place in top-right corner or as accent
- Relevant to card content:
  - 📊 Stats and analytics
  - 💰 Money and amounts
  - 📈📉 Trends
  - 🔥 High priority
  - ⚡ Medium priority
  - 💡 Ideas/low priority
  - 🎯 Targets and goals
  - 🔮 Predictions
  - 🏦 Savings
  - ✨ AI/magic features

## 🖼️ Visual Hierarchy

### Z-Index Layers
```css
z-10      /* Content layer */
-z-10     /* Background effects */
z-50      /* Navigation */
```

### Shadow System
```css
shadow-lg     /* Base card shadow */
shadow-xl     /* Enhanced shadow */
shadow-2xl    /* Maximum shadow */
shadow-purple-500/30   /* Colored shadow (30% opacity) */
```

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Full width cards
- Stacked stats
- Larger touch targets

### Tablet (768px - 1024px)
- 2-column grids
- Medium-sized cards
- Adaptive spacing

### Desktop (> 1024px)
- 3-column stat grid
- 2-column insight grid
- Full layout width (max-w-7xl)

## 🎨 Background Effects

### Grid Pattern
```css
bg-grid-white/10    /* Subtle grid overlay */
```

### Glowing Orbs
```css
absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl
```

### Gradient Overlay
```css
absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5
```

## 🔄 Transition System

### Duration Scale
```css
duration-300   /* Fast transition */
duration-500   /* Medium transition */
duration-600   /* Slow transition */
```

### Easing
```css
transition-all         /* All properties */
transition-shadow      /* Shadow only */
transition-transform   /* Transform only */
```

### Spring Animations
```typescript
transition={{ 
  type: "spring", 
  bounce: 0.2, 
  duration: 0.6 
}}
```

## 🎯 Accessibility

### Color Contrast
- All text meets WCAG AA standards
- White text on gradient backgrounds
- Dark text on light backgrounds

### Interactive Elements
- Minimum 44px touch targets
- Clear focus states
- Hover feedback
- Loading indicators

### Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support

---

This design system ensures consistency, accessibility, and visual appeal throughout the AI Insights page! 🚀

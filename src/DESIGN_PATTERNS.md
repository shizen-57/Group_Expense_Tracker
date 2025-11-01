# Software Design Patterns Used in SplitWise App

This document outlines the software design patterns implemented in the SplitWise expense-splitting application.

---

## 1. **Custom Hooks Pattern** (React Pattern)
**Location:** `/hooks/useAuth.ts`, `/hooks/useGroups.ts`, `/hooks/useFriends.ts`, `/hooks/useDashboard.ts`, `/hooks/useActivity.ts`

**Purpose:** Extract and reuse stateful logic across components.

**Implementation:**
- `useAuth` - Manages authentication state and operations
- `useGroups` - Manages group-related state and CRUD operations
- `useFriends` - Manages friend-related state and operations
- `useDashboard` - Manages dashboard data fetching
- `useActivity` - Manages activity feed data

**Benefits:**
- Code reusability and separation of concerns
- Cleaner component code
- Easier testing and maintenance

---

## 2. **Container/Presentational Pattern** (Component Pattern)
**Location:** `/components/pages/*` (Containers) and `/components/*` (Presentational)

**Purpose:** Separate data management logic from UI rendering.

**Implementation:**
- **Container Components (Smart):** `DashboardPage`, `GroupsPage`, `FriendsPage`, `ActivityPage`, `ProfilePage`
  - Handle data and business logic
  - Pass data and callbacks to presentational components
  
- **Presentational Components (Dumb):** `GroupList`, `FriendList`, `ActivityList`, `ProfileCard`, etc.
  - Focus only on UI rendering
  - Receive data via props

**Benefits:**
- Clear separation of concerns
- Easier to test presentational components
- Reusable UI components

---

## 3. **Facade Pattern** (Structural Pattern)
**Location:** `/utils/api.ts`

**Purpose:** Provide a simplified interface to complex subsystems (backend API calls).

**Implementation:**
```typescript
// api.ts provides a simple interface hiding complex HTTP logic
export const api = {
  login: async (email, password) => { /* ... */ },
  signup: async (data) => { /* ... */ },
  getGroups: async (token) => { /* ... */ },
  // ...
}
```

**Benefits:**
- Simplified API consumption
- Centralized error handling
- Easy to mock for testing

---

## 4. **Singleton Pattern** (Creational Pattern)
**Location:** `/utils/supabase/client.ts`

**Purpose:** Ensure a single instance of Supabase client throughout the application.

**Implementation:**
```typescript
export const createClient = () => {
  // Returns a singleton Supabase client instance
}
```

**Benefits:**
- Prevents multiple database connections
- Consistent configuration
- Memory efficiency

---

## 5. **Strategy Pattern** (Behavioral Pattern)
**Location:** `/supabase/functions/server/index.tsx` (Payment methods, settlement strategies)

**Purpose:** Define a family of algorithms (payment methods) and make them interchangeable.

**Implementation:**
- Different payment/settlement methods: `cash`, `upi`, `bank_transfer`, `simplify`
- Each can be selected at runtime without changing the settlement logic

**Benefits:**
- Easy to add new payment methods
- Flexible and extensible
- Clean separation of algorithms

---

## 6. **Observer Pattern** (Behavioral Pattern)
**Location:** React's `useEffect` hooks throughout the application

**Purpose:** Automatically update components when dependent state changes.

**Implementation:**
```typescript
useEffect(() => {
  // Observers react to changes in currentPage and accessToken
  fetchData()
}, [currentPage, accessToken])
```

**Benefits:**
- Automatic UI updates
- Loose coupling between data and UI
- Reactive programming model

---

## 7. **Module Pattern** (Structural Pattern)
**Location:** All TypeScript/JavaScript modules using ES6 imports/exports

**Purpose:** Encapsulate code and expose only necessary parts.

**Implementation:**
```typescript
// Each file exports specific functionality
export function useAuth() { /* ... */ }
export { Button, buttonVariants }
```

**Benefits:**
- Namespace management
- Encapsulation and information hiding
- Clear dependencies

---

## 8. **Composition Pattern** (React Pattern)
**Location:** Throughout component hierarchy, especially in layout components

**Purpose:** Build complex UIs from smaller, reusable components.

**Implementation:**
```typescript
<AuthLayout>
  <LoginForm />
  <SignupForm />
</AuthLayout>
```

**Benefits:**
- High reusability
- Flexible component combinations
- Clear component hierarchy

---

## 9. **Higher-Order Component (HOC) Pattern** (React Pattern)
**Location:** Radix UI components in `/components/ui/*`

**Purpose:** Enhance components with additional functionality.

**Implementation:**
- ShadCN components wrap Radix UI primitives
- `React.forwardRef` pattern for ref forwarding

**Benefits:**
- Code reuse without duplication
- Cross-cutting concerns (accessibility, styling)
- Consistent behavior across components

---

## 10. **Repository Pattern** (Architectural Pattern)
**Location:** `/supabase/functions/server/kv_store.tsx`

**Purpose:** Abstract data access logic from business logic.

**Implementation:**
```typescript
// kv_store.tsx provides abstraction over database operations
kv.get(key)
kv.set(key, value)
kv.del(key)
// etc.
```

**Benefits:**
- Centralized data access
- Easy to swap data sources
- Testability

---

## 11. **Middleware Pattern** (Architectural Pattern)
**Location:** `/supabase/functions/server/index.tsx` (Hono middleware)

**Purpose:** Add cross-cutting functionality to request/response pipeline.

**Implementation:**
```typescript
app.use('*', cors())
app.use('*', logger(console.log))
```

**Benefits:**
- Separation of cross-cutting concerns
- Reusable request processing
- Clean request flow

---

## 12. **Factory Pattern** (Creational Pattern)
**Location:** Component creation in `/components/ui/*`

**Purpose:** Create objects without specifying exact classes.

**Implementation:**
```typescript
const Comp = asChild ? Slot : "button"
return <Comp {...props} />
```

**Benefits:**
- Flexible object creation
- Reduced coupling
- Easy to extend

---

## 13. **Decorator Pattern** (Structural Pattern)
**Location:** Motion/Framer Motion animations wrapping components

**Purpose:** Add behavior to components without modifying them.

**Implementation:**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  <Component />
</motion.div>
```

**Benefits:**
- Add features without changing component code
- Composable enhancements
- Single responsibility principle

---

## 14. **Command Pattern** (Behavioral Pattern)
**Location:** Event handlers throughout the application

**Purpose:** Encapsulate requests as objects.

**Implementation:**
```typescript
const handleLogin = async (email, password) => { /* ... */ }
const handleCreateGroup = async (data) => { /* ... */ }
```

**Benefits:**
- Decoupled request sender and receiver
- Easy to queue, log, or undo operations
- Consistent interface

---

## 15. **Builder Pattern** (Creational Pattern)
**Location:** Class variance authority (CVA) in button variants

**Purpose:** Construct complex objects step by step.

**Implementation:**
```typescript
const buttonVariants = cva(baseStyles, {
  variants: { variant: {...}, size: {...} },
  defaultVariants: {...}
})
```

**Benefits:**
- Flexible object construction
- Clear configuration
- Reusable configurations

---

## 16. **Adapter Pattern** (Structural Pattern)
**Location:** `/components/figma/ImageWithFallback.tsx`

**Purpose:** Convert one interface to another expected by clients.

**Implementation:**
- Wraps native `img` tag with fallback functionality
- Adapts image loading to provide error handling

**Benefits:**
- Interface compatibility
- Legacy code integration
- Flexible component usage

---

## Summary

The application uses **16 distinct design patterns** that work together to create:
- **Maintainable** code through separation of concerns
- **Scalable** architecture with modular design
- **Testable** components with dependency injection
- **Reusable** logic through hooks and composition
- **Type-safe** implementations with TypeScript

These patterns follow **SOLID principles** and **React best practices**, making the codebase professional, enterprise-ready, and easy to extend.

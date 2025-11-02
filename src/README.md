# Personal Expense Manager with AI

A comprehensive personal expense management application with AI-powered features, built with React, TypeScript, Tailwind CSS, Supabase backend, and Google Gemini AI.

## ✨ AI-Powered Features

### 🤖 Smart Natural Language Search
Search your expenses using plain English queries:
- "coffee expenses last week"
- "groceries over ৳500"
- "food spending this month"
- "transportation costs"

Powered by **Google Gemini Pro 2.0** - understands dates, categories, amounts, and context!

### 📸 AI Receipt Scanner
Upload receipt photos and let AI extract:
- ✅ Total amount
- ✅ Merchant/store name
- ✅ Date (if visible)
- ✅ Items purchased
- ✅ Auto-categorization
- ✅ Currency detection

Powered by **Gemini Vision API** - real OCR, not mock data!

## Features

### 🎯 Core Features

#### Dashboard
- **Comprehensive Analytics Dashboard** with visual charts
  - Quick stats cards (Total Balance, Active Groups, Total Expenses, Friends)
  - Interactive Pie Chart for expense breakdown by category
  - Bar Chart showing top spending categories
  - Recent activity feed with category icons
  - CSV export functionality for dashboard data

#### Groups Management
- Create and manage expense groups
- Add members to groups by username
- Track group expenses with detailed information
- View member list and group balances
- Simplify debts within groups using smart algorithms
- Export group expenses to CSV

#### Expense Tracking
- Add expenses with detailed information:
  - Description and amount
  - Payment person
  - Split between multiple members
  - Category selection (10 categories)
  - Optional notes
- **10 Expense Categories** with color-coded icons:
  - Food & Dining
  - Groceries
  - Transport
  - Entertainment
  - Utilities
  - Housing
  - Travel
  - Gifts
  - Healthcare
  - Other

#### Advanced Features
- **Search & Filter**: Search expenses by description or payer, filter by category
- **Smart Debt Simplification**: Minimize number of transactions needed to settle debts
- **Real-time Balance Tracking**: Automatic calculation of who owes whom
- **Export Capabilities**: Export expenses and dashboard data to CSV

#### Friends Management
- Add friends by username
- Search for users with autocomplete suggestions
- View balances with each friend
- Settle debts with multiple payment methods (Cash, UPI, Bank Transfer)
- Track overall money owed and owed to you

#### Activity Feed
- View all recent expenses across all groups
- See balance summaries (total balance, total owed, total receiving)
- Click through to groups for more details
- Time-based activity display (Today, Yesterday, X days ago)

#### User Profile
- View profile information
- Manage account details
- Secure logout

### 🎨 UI/UX Features

- **Modern, Responsive Design**: Works seamlessly on desktop and mobile
- **Intuitive Navigation**: Easy-to-use navigation bar with active page highlighting
- **Color-coded Categories**: Visual distinction between expense types
- **Interactive Charts**: Built with Recharts for beautiful data visualization
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Clear loading indicators for better UX

### 🔐 Security & Authentication

- Secure user authentication with Supabase Auth
- Email-based signup and login
- Protected routes and API endpoints
- Session management with automatic token refresh

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Shadcn/ui** - Component library
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database (Key-Value Store)
  - Edge Functions (Hono server)
  - Authentication
- **Hono** - Web framework for edge functions
- **Deno** - Runtime for edge functions

### AI/ML
- **Google Gemini Pro 2.0 Flash** - Natural language understanding
- **Gemini Vision API** - OCR and image analysis

## Architecture

The application follows a three-tier architecture:

```
Frontend (React) → Server (Hono Edge Function) → Database (Supabase KV Store)
```

### Key Design Decisions

1. **Key-Value Store**: Uses Supabase's PostgreSQL as a flexible KV store for rapid prototyping
2. **Edge Functions**: Serverless backend with Hono for efficient request handling
3. **Component-Based**: Modular React components for maintainability
4. **Type Safety**: Full TypeScript coverage for reduced bugs

## Data Models

### User
- id, name, email, phone, username
- groups, friends, notifications, balances

### Group
- id, name, description, createdBy, createdAt
- members, expenses, balances

### Expense
- id, groupId, description, amount, paidBy, splitWith
- category, notes, createdBy, createdAt

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Sign in

### Profile
- `GET /profile` - Get user profile

### Groups
- `GET /groups` - List all user's groups
- `POST /groups` - Create new group
- `GET /groups/:id` - Get group details
- `POST /groups/:id/members` - Add member to group
- `POST /groups/:id/expenses` - Add expense to group
- `POST /groups/:id/simplify` - Simplify group debts

### Friends
- `GET /friends` - List all friends
- `POST /friends/add` - Add friend
- `GET /friends/suggestions` - Search users
- `POST /friends/settle` - Settle debt with friend

### Activity
- `GET /activity` - Get recent activity
- `GET /dashboard` - Get dashboard statistics

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Supabase project with environment variables configured
- Google Gemini API key (for AI features)

### Installation

1. Clone the repository
2. The application is already configured with Supabase integration
3. Set up AI features:
   ```bash
   # Set Gemini API key
   supabase secrets set GEMINI_API_KEY=your_api_key_here
   
   # Deploy Edge Function
   supabase functions deploy make-server-f573a585
   ```
   
   See `GEMINI_AI_SETUP.md` for detailed setup instructions.

4. Start using the app by signing up for an account

### First Steps

1. **Sign Up**: Create an account with email, username, and password
2. **Create a Group**: Start by creating a group for your expenses
3. **Add Members**: Invite friends by their username
4. **Add Expenses**: Start tracking expenses with categories and notes
5. **View Dashboard**: Check your analytics and expense breakdown

## Usage Guide

### Creating an Expense

1. Navigate to a group
2. Click "Add Expense"
3. Fill in:
   - Description (e.g., "Dinner at restaurant")
   - Amount
   - Category (e.g., "Food & Dining")
   - Who paid
   - Who to split with (select multiple members)
   - Optional notes
4. Click "Add Expense"

### Simplifying Debts

1. Go to a group with existing expenses
2. View the "Balances" card
3. Click "Simplify Debts"
4. The algorithm will minimize the number of transactions needed

### Exporting Data

**Dashboard Export:**
- Click "Export" button on dashboard
- Downloads CSV with all statistics and category breakdown

**Group Expenses Export:**
- Go to any group
- Click "Export" button in the Expenses section
- Downloads CSV with all group expenses

## Best Practices

1. **Use Categories**: Properly categorize expenses for better analytics
2. **Add Notes**: Include context for expenses (e.g., restaurant name, trip purpose)
3. **Simplify Regularly**: Use debt simplification to reduce complexity
4. **Review Dashboard**: Check weekly to track spending patterns

## Feature Roadmap

Potential future enhancements:
- Bill splitting with custom ratios (not just equal splits)
- Recurring expenses
- Group expense limits and budgets
- Receipt image uploads
- Multi-currency support
- Monthly/yearly spending reports
- Expense categories customization
- Mobile app (React Native)

## Support

For issues or questions:
1. Check the dashboard for balance discrepancies
2. Use the export feature to audit expenses
3. Simplify debts if balances seem complex

## License

This project is built as a prototype application for expense management.

## Credits

Built with modern web technologies and design patterns for optimal user experience.

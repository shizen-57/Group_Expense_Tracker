# API and Features Implementation Guide

This document explains how each feature is implemented and which external APIs (if any) are used.

## Table of Contents
1. [Smart Search / Natural Language Search](#smart-search--natural-language-search)
2. [AI Receipt Scanner](#ai-receipt-scanner)
3. [External APIs Used](#external-apis-used)
4. [Backend Implementation](#backend-implementation)
5. [How to Add Real AI Features](#how-to-add-real-ai-features)

---

## Smart Search / Natural Language Search

### Current Implementation: ❌ NO AI API USED

**Location**: 
- Frontend: `/components/expenses/NaturalLanguageSearch.tsx`
- Backend: `/supabase/functions/server/index.tsx` (line 1346)

**How it works**:
The "Natural Language Search" is actually a **simple keyword-based search**, NOT true AI/NLP. Here's what it does:

```typescript
// Backend implementation (line 1354-1358)
const results = expenseList.filter((exp: any) => {
  const searchText = `${exp.description} ${exp.category} ${exp.notes}`.toLowerCase()
  return searchText.includes(query)
})
```

**Process**:
1. User types a query like "coffee expenses"
2. Backend converts query to lowercase
3. Searches through all expenses' description, category, and notes fields
4. Returns expenses where ANY of these fields contain the search term

**Why it appears "smart"**:
- The UI is designed to look AI-powered with gradient colors and "Sparkles" icon
- Has suggested queries like "coffee expenses" and "groceries last week"
- But it's just a simple `includes()` string match

**Limitations**:
- ❌ No understanding of dates ("last week", "this month")
- ❌ No understanding of context or intent
- ❌ No synonym matching (searching "lunch" won't find "dinner")
- ❌ No spending calculations (can't answer "how much did I spend on coffee?")
- ✅ Only finds exact keyword matches

---

## AI Receipt Scanner

### Current Implementation: ❌ NO AI API USED (MOCK ONLY)

**Location**: `/components/expenses/ReceiptScannerDialog.tsx`

**How it works**:
The "AI Receipt Scanner" is a **complete simulation/mock**, NOT real AI. Here's what it does:

```typescript
// Lines 34-46 - This is just a mock!
try {
  // Simulate AI receipt scanning
  // In a real app, this would call an OCR API like Google Vision, AWS Textract, etc.
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock scanned data with smart categorization
  const mockData = {
    description: 'Receipt scan',
    amount: (Math.random() * 100 + 10).toFixed(2), // Random amount!
    category: suggestCategory(file.name),
    notes: `Scanned from ${file.name}`
  }
  
  setScannedData(mockData)
}
```

**"Smart" category suggestion** (Lines 54-61):
```typescript
const suggestCategory = (filename: string): string => {
  const lower = filename.toLowerCase()
  if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('restaurant')) return 'food'
  if (lower.includes('grocery') || lower.includes('market')) return 'groceries'
  if (lower.includes('uber') || lower.includes('taxi') || lower.includes('gas')) return 'transport'
  if (lower.includes('movie') || lower.includes('game')) return 'entertainment'
  return 'other'
}
```

**Process**:
1. User uploads an image
2. Shows "scanning" animation for 2 seconds
3. Generates random amount between ৳10-110
4. Guesses category based on **filename only** (not image content!)
5. Returns mock data for user to edit

**What it DOESN'T do**:
- ❌ No actual image processing
- ❌ No OCR (Optical Character Recognition)
- ❌ No text extraction from receipt
- ❌ No amount detection
- ❌ No date detection
- ❌ No merchant name detection
- ❌ Doesn't even look at the image content!

**Why it exists**:
- Demonstrates the UI/UX flow
- Perfect for prototyping
- Shows how real integration would work
- Allows testing without API costs

---

## External APIs Used

### Currently: ✅ ZERO External APIs

The entire application uses **ZERO external APIs** except for:
1. **Supabase** - For database, auth, and backend hosting (infrastructure, not AI)
2. That's it!

### No AI APIs Used:
- ❌ No OpenAI GPT
- ❌ No Anthropic Claude
- ❌ No Google Gemini
- ❌ No Google Vision API (OCR)
- ❌ No AWS Textract (OCR)
- ❌ No Azure Computer Vision
- ❌ No Natural Language Processing APIs

### No Other APIs:
- ❌ No payment processing APIs
- ❌ No SMS/Email services
- ❌ No third-party analytics
- ❌ No cloud storage (uses Supabase Storage if needed)

**Why no external APIs?**
1. **Cost** - Most AI APIs charge per request
2. **Simplicity** - Easier to set up and run locally
3. **Prototyping** - Focus on features, not integrations
4. **Privacy** - All data stays in your Supabase instance

---

## Backend Implementation

### Technology Stack:
- **Supabase Edge Functions** - Serverless backend
- **Hono** - Web framework (like Express.js)
- **Deno** - Runtime environment
- **Key-Value Store** - Simple database (uses Postgres table)

### Data Storage:
All data is stored in a single Postgres table called `kv_store_f573a585` as JSON:

```
Key Pattern: user:{userId}:personal_expenses
Value: Array of expense objects

Key Pattern: user:{userId}:budgets
Value: Array of budget objects

etc.
```

### Authentication:
- Uses **Supabase Auth** (built-in)
- No external auth services (Google, Facebook, etc.) unless you configure them

### File Storage:
- Can use **Supabase Storage** for receipt images
- Currently, receipt images are uploaded but not actually processed

---

## How to Add Real AI Features

If you want to make these features actually "AI-powered", here's how:

### 1. Real Natural Language Search with OpenAI

**Install OpenAI SDK**:
```bash
npm install openai
```

**Update backend** (`/supabase/functions/server/index.tsx`):
```typescript
import OpenAI from 'npm:openai'

app.get('/make-server-f573a585/search', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const query = c.req.query('q') || ''
    
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const expenseList = expenses.value || []
    
    // Use OpenAI to understand the query
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    })
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a financial assistant. Convert natural language queries into search filters. Return JSON with category, dateRange, minAmount, maxAmount."
      }, {
        role: "user",
        content: `Query: "${query}". Available categories: food, groceries, transport, entertainment, utilities, shopping, health, education, other.`
      }],
      response_format: { type: "json_object" }
    })
    
    const filters = JSON.parse(response.choices[0].message.content)
    
    // Apply AI-parsed filters
    const results = expenseList.filter((exp: any) => {
      if (filters.category && exp.category !== filters.category) return false
      if (filters.minAmount && exp.amount < filters.minAmount) return false
      if (filters.maxAmount && exp.amount > filters.maxAmount) return false
      if (filters.dateRange) {
        const expDate = new Date(exp.createdAt)
        // Apply date range logic
      }
      return true
    })
    
    return c.json(results)
  } catch (error) {
    console.log('Error searching expenses:', error)
    return c.json({ error: 'Failed to search expenses' }, 500)
  }
})
```

**Set API Key**:
```bash
supabase secrets set OPENAI_API_KEY=sk-...your-key...
```

**Cost**: ~$0.01-0.03 per search query with GPT-4

### 2. Real Receipt Scanning with Google Vision API

**Install Google Cloud Vision**:
```bash
npm install @google-cloud/vision
```

**Update backend**:
```typescript
import vision from '@google-cloud/vision'

app.post('/make-server-f573a585/scan-receipt', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.parseBody()
    const imageFile = body.image as File
    
    // Convert to buffer
    const buffer = await imageFile.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)
    
    // Initialize Vision client
    const client = new vision.ImageAnnotatorClient({
      credentials: JSON.parse(Deno.env.get('GOOGLE_CREDENTIALS'))
    })
    
    // Perform text detection
    const [result] = await client.textDetection(imageBuffer)
    const detections = result.textAnnotations
    const text = detections[0]?.description || ''
    
    // Parse receipt data (you'll need custom logic here)
    const lines = text.split('\n')
    let amount = 0
    let merchantName = ''
    let date = new Date()
    
    // Simple parsing (you'd want more sophisticated logic)
    for (const line of lines) {
      // Look for amount (matches ৳XX.XX or $XX.XX)
      const amountMatch = line.match(/[৳$]?(\d+\.?\d{0,2})/)
      if (amountMatch) {
        const parsedAmount = parseFloat(amountMatch[1])
        if (parsedAmount > amount) amount = parsedAmount
      }
      
      // Look for merchant name (usually first line)
      if (!merchantName && line.trim().length > 0) {
        merchantName = line.trim()
      }
    }
    
    // Suggest category using OpenAI
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
    const categoryResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Categorize this expense. Return only one word: food, groceries, transport, entertainment, utilities, shopping, health, education, or other."
      }, {
        role: "user",
        content: `Merchant: ${merchantName}, Amount: ${amount}`
      }]
    })
    
    const category = categoryResponse.choices[0].message.content.toLowerCase()
    
    return c.json({
      description: merchantName,
      amount: amount,
      category: category,
      notes: `Scanned receipt - ${new Date().toLocaleDateString()}`,
      rawText: text
    })
  } catch (error) {
    console.log('Error scanning receipt:', error)
    return c.json({ error: 'Failed to scan receipt' }, 500)
  }
})
```

**Set API Keys**:
```bash
# Get Google Cloud credentials from console.cloud.google.com
supabase secrets set GOOGLE_CREDENTIALS='{"type":"service_account",...}'
supabase secrets set OPENAI_API_KEY=sk-...
```

**Cost**: 
- Google Vision: ~$1.50 per 1000 requests
- OpenAI categorization: ~$0.001 per receipt

### 3. Alternative: Use AWS Textract

**Better for receipts** than Google Vision:
```bash
npm install @aws-sdk/client-textract
```

**Benefits**:
- Specifically designed for documents/receipts
- Better at detecting line items, totals, dates
- Can extract structured data automatically

**Cost**: ~$1.50 per 1000 pages

### 4. Cheaper Alternative: Tesseract.js (Free OCR)

**For basic OCR without API costs**:
```bash
npm install tesseract.js
```

**Frontend implementation** (runs in browser):
```typescript
import Tesseract from 'tesseract.js'

const handleFileSelect = async (file: File) => {
  const { data: { text } } = await Tesseract.recognize(file, 'eng')
  // Parse text to extract amount, etc.
}
```

**Pros**:
- ✅ Free
- ✅ No API keys needed
- ✅ Runs offline

**Cons**:
- ❌ Less accurate
- ❌ Slower
- ❌ No structured data extraction

---

## Summary

### Current State:
```
✅ Smart Search: Simple keyword matching (no AI)
✅ Receipt Scanner: Mock/simulation (no AI)
✅ External APIs: ZERO (only Supabase infrastructure)
✅ Cost: FREE (except Supabase hosting)
```

### What You Get:
- Fully functional UI/UX
- Perfect for prototyping and demos
- No API costs during development
- Easy to test locally

### To Add Real AI:
1. Choose your OCR provider (Google Vision, AWS Textract, or free Tesseract)
2. Choose your NLP provider (OpenAI, Anthropic Claude, Google Gemini)
3. Update backend Edge Functions with API calls
4. Set environment variables with API keys
5. Budget for API costs ($10-50/month for moderate use)

### Recommended Approach:
**Start without AI** (current state) → **Test with users** → **Add AI only where it provides real value** → **Start with cheapest options** (GPT-3.5, Tesseract) → **Upgrade if needed**

---

## Environment Variables Needed for Real AI

```env
# For OpenAI (Natural Language Search)
OPENAI_API_KEY=sk-...

# For Google Vision (Receipt Scanning)
GOOGLE_CREDENTIALS={"type":"service_account",...}

# For AWS Textract (Alternative Receipt Scanning)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# For Anthropic Claude (Alternative to OpenAI)
ANTHROPIC_API_KEY=sk-ant-...
```

Add these to Supabase:
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GOOGLE_CREDENTIALS='...'
```

---

## Cost Estimation (if you add real AI)

### Low Usage (100 searches + 50 receipts per month):
- OpenAI GPT-3.5: ~$1-2/month
- Google Vision: ~$0.10/month
- **Total: ~$2-3/month**

### Medium Usage (1000 searches + 500 receipts per month):
- OpenAI GPT-3.5: ~$10-15/month
- Google Vision: ~$1/month
- **Total: ~$12-20/month**

### High Usage (10,000 searches + 5000 receipts per month):
- OpenAI GPT-4: ~$150-200/month
- AWS Textract: ~$7-10/month
- **Total: ~$160-210/month**

---

**Bottom Line**: The app is designed to LOOK like it uses AI, but currently uses simple algorithms. This is intentional for cost savings and easier local development. You can add real AI later when/if needed!

// Temporary file to hold the fixed AI insights endpoint

// AI-Powered Spending Insights
app.get('/make-server-f573a585/ai/insights', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const expenses = await kv.get(`user:${userId}:personal_expenses`)
    const budgets = await kv.get(`user:${userId}:budgets`)
    const expenseList = expenses.value || []
    const budgetList = budgets.value || []
    
    if (expenseList.length === 0) {
      return c.json({
        insights: [],
        summary: 'No expenses yet. Start tracking to get personalized insights!',
        recommendations: []
      })
    }
    
    // Calculate statistics
    const now = new Date()
    const thisMonth = expenseList.filter((exp: any) => {
      const expDate = new Date(exp.createdAt)
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    
    const lastMonth = expenseList.filter((exp: any) => {
      const expDate = new Date(exp.createdAt)
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear()
    })
    
    const categoryTotals: any = {}
    thisMonth.forEach((exp: any) => {
      const cat = exp.category || 'other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount
    })
    
    const totalThisMonth = thisMonth.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const totalLastMonth = lastMonth.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const avgExpense = thisMonth.length > 0 ? totalThisMonth / thisMonth.length : 0
    
    // Build context for AI
    const context = `User's Expense Data:
- Total expenses this month: ৳${totalThisMonth.toFixed(2)} (${thisMonth.length} expenses)
- Total last month: ৳${totalLastMonth.toFixed(2)} (${lastMonth.length} expenses)
- Average expense: ৳${avgExpense.toFixed(2)}
- Category breakdown: ${JSON.stringify(categoryTotals)}
- Active budgets: ${budgetList.map((b: any) => `${b.category}: ৳${b.limit}`).join(', ')}

Top 5 Recent Expenses:
${expenseList.slice(0, 5).map((exp: any) => `- ${exp.description} (${exp.category}): ৳${exp.amount}`).join('\n')}`

    const systemInstruction = `You are a personal finance advisor analyzing a user's spending patterns. 
Provide actionable insights and recommendations in JSON format.

Return this structure:
{
  "insights": [
    {"type": "spending_trend", "severity": "info|warning|alert", "message": "insight text", "value": number},
    {"type": "category_alert", "severity": "info|warning|alert", "message": "insight text", "category": "category_name"},
    {"type": "budget_status", "severity": "info|warning|alert", "message": "insight text", "percentage": number}
  ],
  "summary": "brief overall summary (2-3 sentences)",
  "recommendations": [
    {"priority": "high|medium|low", "action": "specific recommendation", "potential_savings": number}
  ],
  "patterns": [
    {"pattern": "pattern description", "suggestion": "what to do about it"}
  ],
  "predictions": {
    "month_end_total": estimated_total,
    "confidence": "high|medium|low",
    "reasoning": "why this prediction"
  }
}

Focus on:
1. Spending trends (increasing/decreasing)
2. Budget overspending warnings
3. Unusual expenses or patterns
4. Category-specific insights
5. Savings opportunities
6. Comparison with previous month
7. Predictions for month-end

Be specific, actionable, and supportive. Use Bangladeshi Taka (৳) for amounts.`

    const prompt = `Analyze this user's spending and provide insights:\n\n${context}\n\nReturn JSON only, no markdown.`
    
    let insights: any = {}
    
    try {
      const aiResponse = await callGeminiAPI(prompt, systemInstruction)
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      insights = JSON.parse(cleanResponse)
      console.log('AI Insights generated:', insights)
    } catch (aiError) {
      console.log('AI generation failed, using fallback insights:', aiError)
      // Provide fallback insights based on data analysis
      const topCategory = Object.entries(categoryTotals).sort(([, a]: any, [, b]: any) => b - a)[0]
      const monthChange = totalThisMonth - totalLastMonth
      const monthChangePercent = totalLastMonth > 0 ? (monthChange / totalLastMonth * 100) : 0
      
      insights = {
        insights: [
          totalThisMonth > totalLastMonth ? {
            type: 'spending_trend',
            severity: monthChangePercent > 20 ? 'warning' : 'info',
            message: `Your spending increased by ${monthChangePercent.toFixed(1)}% compared to last month`,
            value: monthChange
          } : {
            type: 'spending_trend',
            severity: 'info',
            message: `Your spending decreased by ${Math.abs(monthChangePercent).toFixed(1)}% compared to last month`,
            value: monthChange
          },
          topCategory ? {
            type: 'category_alert',
            severity: 'info',
            message: `${topCategory[0]} is your highest spending category this month`,
            category: topCategory[0],
            value: topCategory[1]
          } : null
        ].filter(Boolean),
        summary: `You've spent ৳${totalThisMonth.toFixed(2)} this month across ${thisMonth.length} transactions. ${monthChange > 0 ? 'Spending increased' : 'Spending decreased'} by ৳${Math.abs(monthChange).toFixed(2)} compared to last month.`,
        recommendations: [
          {
            priority: 'medium',
            action: 'Review your recurring expenses and identify areas where you can reduce spending',
            potential_savings: totalThisMonth * 0.1
          }
        ],
        patterns: []
      }
    }
    
    return c.json({
      ...insights,
      generatedAt: new Date().toISOString(),
      stats: {
        thisMonth: totalThisMonth,
        lastMonth: totalLastMonth,
        change: totalThisMonth - totalLastMonth,
        changePercentage: totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth * 100) : 0
      }
    })
  } catch (error) {
    console.log('Error generating insights:', error)
    return c.json({ error: 'Failed to generate insights' }, 500)
  }
})

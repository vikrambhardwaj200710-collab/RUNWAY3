// RUNWAY Financial Engine
// Central mathematical calculations for 30-day survival budget (₹10,000)

/**
 * Calculate comprehensive financial metrics for the current state
 * 
 * Rules:
 * 1. Current cash = starting budget + income received - actual expenses
 * 2. Spendable balance = current cash - unpaid future commitments - savings reserved
 * 3. Safe daily allowance = spendable balance / days remaining (0 if negative/zero days)
 * 4. Forecast = current cash + expected future income - future unpaid commitments - projected variable spending
 */
export function calculateFinancials({
  budget = 10000,
  transactions = [],
  commitments = [],
  savingsGoals = [],
  currentDay = 1,
  totalDays = 30,
}) {
  const safeCurrentDay = Math.min(Math.max(1, Number(currentDay) || 1), totalDays)
  // Days remaining includes the current day (e.g. Day 9 of 30 has 30 - 9 + 1 = 22 days remaining)
  const daysRemaining = Math.max(0, totalDays - safeCurrentDay + 1)
  const daysElapsed = safeCurrentDay

  // 1. Transactions breakdown
  let incomeReceived = 0
  let actualExpenses = 0
  const categorySpending = {}

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0
    if (tx.type === 'income') {
      incomeReceived += amount
    } else {
      actualExpenses += amount
      const cat = tx.category || 'Other'
      categorySpending[cat] = (categorySpending[cat] || 0) + amount
    }
  })

  // 2. Current Cash
  // Starting budget + income - actual expenses
  const currentCash = budget + incomeReceived - actualExpenses

  // 3. Savings Reserved
  // Funds that have been set aside into savings goals (not an expense, but ring-fenced from daily spending)
  const savingsReserved = savingsGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0)
  const savingsTargetTotal = savingsGoals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0)

  // 4. Commitments Breakdown
  // Only count unpaid commitments that fall in the remaining days of the 30-day challenge window
  let upcomingUnpaidCommitments = 0
  let totalCommitmentsAmount = 0
  let paidCommitmentsAmount = 0

  commitments.forEach((bill) => {
    const amount = Number(bill.amount) || 0
    totalCommitmentsAmount += amount
    
    if (bill.isPaid) {
      paidCommitmentsAmount += amount
    } else {
      // Unpaid commitment
      const dueDay = Number(bill.dueDay) || 1
      // If recurring or due day is within challenge window and hasn't passed or is due now/future
      if (dueDay >= safeCurrentDay && dueDay <= totalDays) {
        upcomingUnpaidCommitments += amount
      } else if (dueDay < safeCurrentDay) {
        // Overdue unpaid bill still threatens current cash
        upcomingUnpaidCommitments += amount
      }
    }
  })

  // 5. Spendable Balance
  // Cash minus unpaid commitments minus savings set aside
  const spendableBalance = currentCash - upcomingUnpaidCommitments - savingsReserved

  // 6. Safe Daily Allowance
  const safeDailyAllowance = daysRemaining > 0 
    ? (spendableBalance > 0 ? Math.floor(spendableBalance / daysRemaining) : 0)
    : 0

  // 7. Spending Pace & Velocity
  // How much spent per day so far
  const dailyAverageSpent = daysElapsed > 0 ? (actualExpenses / daysElapsed) : 0
  // Ideal linear daily budget across entire 30 days
  const baseDailyBudget = budget / totalDays // ₹333.33/day
  // Ideal cumulative spend cap at current day
  const idealBurnToDate = baseDailyBudget * daysElapsed
  // Burn status: are we over or under the linear schedule?
  const burnVariance = actualExpenses - idealBurnToDate // positive = overspending, negative = under budget

  // 8. Projected Variable Spending
  // If user has spending history, use a weighted blend of actual daily spend and safe allowance
  let estimatedFutureDailySpend = 0
  if (daysElapsed > 2 && actualExpenses > 0) {
    // 70% actual recent daily average + 30% safe allowance
    estimatedFutureDailySpend = (dailyAverageSpent * 0.7) + (safeDailyAllowance * 0.3)
  } else {
    // Starting out: variable spending is budgeted at the safe daily allowance
    estimatedFutureDailySpend = safeDailyAllowance
  }
  const projectedVariableSpending = Math.round(estimatedFutureDailySpend * daysRemaining)

  // 9. Projected Month-End Balance
  // Cash + expected future income - upcoming unpaid commitments - projected variable spending
  const expectedFutureIncome = 0 // can be extended if scheduled income is added
  const projectedMonthEndBalance = Math.round(
    currentCash + expectedFutureIncome - upcomingUnpaidCommitments - projectedVariableSpending
  )

  // 10. Financial Health Score (0 - 100)
  const healthMetrics = calculateHealthScore({
    currentCash,
    spendableBalance,
    upcomingUnpaidCommitments,
    savingsReserved,
    savingsTargetTotal,
    actualExpenses,
    idealBurnToDate,
    safeDailyAllowance,
    projectedMonthEndBalance,
    daysRemaining,
    budget,
  })

  // 11. Financial Risk Score (0 - 100) & Level
  const riskMetrics = calculateRiskScore({
    currentCash,
    spendableBalance,
    upcomingUnpaidCommitments,
    safeDailyAllowance,
    dailyAverageSpent,
    projectedMonthEndBalance,
    daysRemaining,
    budget,
  })

  // 12. Smart Contextual Insights
  const insights = generateInsights({
    currentCash,
    spendableBalance,
    safeDailyAllowance,
    dailyAverageSpent,
    upcomingUnpaidCommitments,
    commitments,
    savingsGoals,
    savingsReserved,
    projectedMonthEndBalance,
    burnVariance,
    safeCurrentDay,
    daysRemaining,
    healthScore: healthMetrics.score,
    riskScore: riskMetrics.score,
  })

  return {
    budget,
    currentDay: safeCurrentDay,
    totalDays,
    daysRemaining,
    daysElapsed,
    incomeReceived,
    actualExpenses,
    currentCash,
    savingsReserved,
    savingsTargetTotal,
    upcomingUnpaidCommitments,
    totalCommitmentsAmount,
    paidCommitmentsAmount,
    spendableBalance,
    safeDailyAllowance,
    dailyAverageSpent,
    idealBurnToDate,
    burnVariance,
    projectedVariableSpending,
    projectedMonthEndBalance,
    categorySpending,
    health: healthMetrics,
    risk: riskMetrics,
    insights,
  }
}

/**
 * Calculate Financial Health Score (0 - 100)
 * Uses 4 transparent pillars:
 * 1. Budget Adherence (35 pts)
 * 2. Commitment Coverage (25 pts)
 * 3. Daily Allowance Sufficiency (25 pts)
 * 4. Savings Cushion (15 pts)
 */
function calculateHealthScore({
  currentCash,
  spendableBalance,
  upcomingUnpaidCommitments,
  savingsReserved,
  savingsTargetTotal,
  actualExpenses,
  idealBurnToDate,
  safeDailyAllowance,
  _projectedMonthEndBalance,
  _daysRemaining,
  _budget,
}) {
  let budgetScore = 35
  let commitmentScore = 25
  let allowanceScore = 25
  let savingsScore = 15

  const factors = []

  // 1. Budget Adherence (0 - 35)
  if (actualExpenses > idealBurnToDate * 1.3) {
    budgetScore = 12
    factors.push({ name: 'Budget Pace', impact: 'negative', text: 'Spending is running significantly ahead of timeline' })
  } else if (actualExpenses > idealBurnToDate) {
    budgetScore = 24
    factors.push({ name: 'Budget Pace', impact: 'neutral', text: 'Spending slightly ahead of standard burn line' })
  } else {
    budgetScore = 35
    factors.push({ name: 'Budget Pace', impact: 'positive', text: 'Spending is disciplined and below linear cap' })
  }

  // 2. Commitment Coverage (0 - 25)
  if (upcomingUnpaidCommitments === 0) {
    commitmentScore = 25
    factors.push({ name: 'Bill Coverage', impact: 'positive', text: 'All upcoming bills & subscriptions are fully settled' })
  } else if (currentCash >= upcomingUnpaidCommitments * 1.5) {
    commitmentScore = 25
    factors.push({ name: 'Bill Coverage', impact: 'positive', text: 'Current cash easily covers all upcoming commitments' })
  } else if (currentCash >= upcomingUnpaidCommitments) {
    commitmentScore = 17
    factors.push({ name: 'Bill Coverage', impact: 'neutral', text: 'Upcoming bills can be met, but buffer is tight' })
  } else {
    commitmentScore = 5
    factors.push({ name: 'Bill Coverage', impact: 'negative', text: 'Current cash is insufficient for upcoming commitments!' })
  }

  // 3. Daily Allowance Sufficiency (0 - 25)
  if (spendableBalance < 0) {
    allowanceScore = 0
    factors.push({ name: 'Daily Runway', impact: 'negative', text: 'Spendable balance is in deficit' })
  } else if (safeDailyAllowance >= 300) {
    allowanceScore = 25
    factors.push({ name: 'Daily Runway', impact: 'positive', text: `Safe daily allowance is comfortable (₹${safeDailyAllowance}/day)` })
  } else if (safeDailyAllowance >= 180) {
    allowanceScore = 18
    factors.push({ name: 'Daily Runway', impact: 'neutral', text: `Safe daily allowance is moderate (₹${safeDailyAllowance}/day)` })
  } else if (safeDailyAllowance >= 80) {
    allowanceScore = 10
    factors.push({ name: 'Daily Runway', impact: 'negative', text: `Safe daily allowance is constrained (₹${safeDailyAllowance}/day)` })
  } else {
    allowanceScore = 4
    factors.push({ name: 'Daily Runway', impact: 'negative', text: `Critical daily allowance squeeze (< ₹80/day)` })
  }

  // 4. Savings Cushion (0 - 15)
  if (savingsTargetTotal > 0) {
    const ratio = savingsReserved / savingsTargetTotal
    if (ratio >= 0.75) {
      savingsScore = 15
      factors.push({ name: 'Savings Cushion', impact: 'positive', text: 'Savings goal is 75%+ funded' })
    } else if (ratio >= 0.4) {
      savingsScore = 10
      factors.push({ name: 'Savings Cushion', impact: 'positive', text: 'Good savings progress towards target' })
    } else if (savingsReserved > 0) {
      savingsScore = 6
      factors.push({ name: 'Savings Cushion', impact: 'neutral', text: 'Some emergency buffer reserved' })
    } else {
      savingsScore = 2
      factors.push({ name: 'Savings Cushion', impact: 'neutral', text: 'No emergency buffer reserved yet' })
    }
  } else {
    savingsScore = 10
  }

  const totalScore = Math.min(100, Math.max(0, budgetScore + commitmentScore + allowanceScore + savingsScore))
  
  let grade = 'Excellent'
  let color = 'text-emerald-400'
  if (totalScore < 40) {
    grade = 'Critical'
    color = 'text-rose-400'
  } else if (totalScore < 60) {
    grade = 'Vulnerable'
    color = 'text-amber-400'
  } else if (totalScore < 80) {
    grade = 'Stable'
    color = 'text-lime-400'
  }

  return {
    score: totalScore,
    grade,
    color,
    factors,
    breakdown: { budgetScore, commitmentScore, allowanceScore, savingsScore }
  }
}

/**
 * Calculate Financial Risk Score (0 - 100) & Risk Level
 * Higher score = higher risk of running out of money before Day 30
 */
function calculateRiskScore({
  currentCash,
  spendableBalance,
  upcomingUnpaidCommitments,
  safeDailyAllowance,
  dailyAverageSpent,
  projectedMonthEndBalance,
  _daysRemaining,
  _budget,
}) {
  let riskScore = 0
  const riskFactors = []

  // Factor 1: Deficit or Negative Spendable (Up to 40 pts)
  if (spendableBalance < 0) {
    riskScore += 40
    riskFactors.push({ title: 'Spendable Deficit', severity: 'high', text: `Spendable cash is short by ₹${Math.abs(spendableBalance)}` })
  } else if (spendableBalance < 800) {
    riskScore += 25
    riskFactors.push({ title: 'Low Spendable Buffer', severity: 'medium', text: 'Less than ₹800 uncommitted cash remaining' })
  } else if (spendableBalance < 2000) {
    riskScore += 12
  }

  // Factor 2: Burn rate overshoot (Up to 25 pts)
  if (dailyAverageSpent > safeDailyAllowance * 1.5 && dailyAverageSpent > 0) {
    riskScore += 25
    riskFactors.push({ title: 'Accelerated Burn', severity: 'high', text: `Daily burn (₹${Math.round(dailyAverageSpent)}) is 50%+ above safe rate` })
  } else if (dailyAverageSpent > safeDailyAllowance && safeDailyAllowance > 0) {
    riskScore += 15
    riskFactors.push({ title: 'Elevated Burn', severity: 'medium', text: 'Recent daily spend exceeds safe daily allowance' })
  }

  // Factor 3: Bill exposure ratio (Up to 20 pts)
  if (currentCash > 0) {
    const commitmentRatio = upcomingUnpaidCommitments / currentCash
    if (commitmentRatio > 0.7) {
      riskScore += 20
      riskFactors.push({ title: 'Heavy Bill Exposure', severity: 'high', text: 'Upcoming bills claim >70% of current cash' })
    } else if (commitmentRatio > 0.45) {
      riskScore += 10
      riskFactors.push({ title: 'Moderate Bill Exposure', severity: 'medium', text: 'Upcoming bills claim >45% of current cash' })
    }
  } else {
    riskScore += 20
  }

  // Factor 4: Projected Month-End Shortfall (Up to 15 pts)
  if (projectedMonthEndBalance < 0) {
    riskScore += 15
    riskFactors.push({ title: 'Month-End Shortfall', severity: 'high', text: `Projected month-end deficit of ₹${Math.abs(projectedMonthEndBalance)}` })
  } else if (projectedMonthEndBalance < 300) {
    riskScore += 8
    riskFactors.push({ title: 'Paper-Thin Month-End Cushion', severity: 'low', text: 'Projected month-end balance under ₹300' })
  }

  const score = Math.min(100, Math.max(5, riskScore))

  let level = 'Low'
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (score >= 70) {
    level = 'Critical'
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  } else if (score >= 45) {
    level = 'High'
    badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  } else if (score >= 25) {
    level = 'Moderate'
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }

  return {
    score,
    level,
    badgeColor,
    factors: riskFactors,
  }
}

/**
 * Generate dynamic, actionable contextual insights based on actual calculations
 */
function generateInsights({
  _currentCash,
  spendableBalance,
  safeDailyAllowance,
  dailyAverageSpent,
  _upcomingUnpaidCommitments,
  commitments,
  savingsGoals,
  _savingsReserved,
  projectedMonthEndBalance,
  burnVariance,
  safeCurrentDay,
  daysRemaining,
  _healthScore,
  _riskScore,
}) {
  const insights = []

  // Check 1: Impending commitments in next 5 days
  const soonBills = commitments.filter(
    (c) => !c.isPaid && c.dueDay >= safeCurrentDay && c.dueDay <= safeCurrentDay + 5
  )
  if (soonBills.length > 0) {
    const soonTotal = soonBills.reduce((s, b) => s + Number(b.amount || 0), 0)
    insights.push({
      id: 'upcoming-bills-soon',
      type: 'warning',
      title: `${soonBills.length} Bill${soonBills.length > 1 ? 's' : ''} Due in Next 5 Days`,
      message: `Totaling ₹${soonTotal.toLocaleString('en-IN')}. Ensure your spendable cash doesn't dip into this bill envelope.`,
      action: 'View Commitments',
      actionTab: 'commitments',
    })
  }

  // Check 2: Month-end shortfall prediction
  if (projectedMonthEndBalance < 0) {
    insights.push({
      id: 'projected-shortfall',
      type: 'danger',
      title: 'Projected Month-End Deficit Warning',
      message: `At current pace, you will finish Day 30 with a ₹${Math.abs(projectedMonthEndBalance).toLocaleString('en-IN')} deficit. Reduce daily spending by ₹${Math.ceil(Math.abs(projectedMonthEndBalance) / daysRemaining)} to break even.`,
      action: 'Simulate Cutbacks',
      actionTab: 'simulator',
    })
  } else if (burnVariance < -300) {
    insights.push({
      id: 'budget-surplus-pace',
      type: 'success',
      title: 'Ahead of Target Burn Rate',
      message: `You are ₹${Math.abs(burnVariance).toLocaleString('en-IN')} below linear budget schedule! Keep this pace to build a bonus buffer.`,
    })
  }

  // Check 3: Daily burn vs safe allowance
  if (dailyAverageSpent > safeDailyAllowance * 1.25 && dailyAverageSpent > 0 && daysRemaining > 3) {
    insights.push({
      id: 'burn-exceeds-allowance',
      type: 'warning',
      title: 'Daily Spending Exceeds Safe Cap',
      message: `Recent average is ₹${Math.round(dailyAverageSpent)}/day vs safe limit of ₹${safeDailyAllowance}/day. Trim discretionary spending to stay on track.`,
      action: 'Open Simulator',
      actionTab: 'simulator',
    })
  }

  // Check 4: Savings goal check
  if (savingsGoals.length > 0) {
    const mainGoal = savingsGoals[0]
    const remaining = Math.max(0, mainGoal.targetAmount - mainGoal.currentAmount)
    if (remaining > 0 && spendableBalance > remaining * 1.5) {
      insights.push({
        id: 'savings-opportunity',
        type: 'info',
        title: `Opportunity to Top Up "${mainGoal.title}"`,
        message: `You have sufficient spendable cash buffer to contribute towards your remaining ₹${remaining.toLocaleString('en-IN')} goal.`,
        action: 'View Savings',
        actionTab: 'savings',
      })
    }
  }

  // Fallback insight if none triggered
  if (insights.length === 0) {
    insights.push({
      id: 'steady-runway',
      type: 'success',
      title: 'Runway is Balanced',
      message: `Safe daily allowance is ₹${safeDailyAllowance}/day with ${daysRemaining} days remaining in the ₹10,000 challenge.`,
    })
  }

  return insights
}

/**
 * Purchase Simulator: "Can I afford this?"
 * Simulates financial outcome before committing
 */
export function simulatePurchase({
  baseFinancials,
  amount = 0,
  category = 'Discretionary',
  name = 'Simulated Item',
}) {
  const purchaseAmount = Number(amount) || 0
  if (purchaseAmount <= 0) {
    return null
  }

  const {
    currentCash,
    spendableBalance,
    upcomingUnpaidCommitments,
    savingsReserved,
    savingsTargetTotal,
    daysRemaining,
    daysElapsed,
    actualExpenses,
    idealBurnToDate,
    budget,
  } = baseFinancials

  // Projected metrics
  const projectedCash = currentCash - purchaseAmount
  const projectedSpendable = spendableBalance - purchaseAmount
  const projectedSafeDaily = daysRemaining > 0
    ? (projectedSpendable > 0 ? Math.floor(projectedSpendable / daysRemaining) : 0)
    : 0

  const projectedExpenses = actualExpenses + purchaseAmount
  const projectedMonthEnd = baseFinancials.projectedMonthEndBalance - purchaseAmount

  // Recalculate health & risk for simulated state
  const projectedHealth = calculateHealthScore({
    currentCash: projectedCash,
    spendableBalance: projectedSpendable,
    upcomingUnpaidCommitments,
    savingsReserved,
    savingsTargetTotal,
    actualExpenses: projectedExpenses,
    idealBurnToDate,
    safeDailyAllowance: projectedSafeDaily,
    projectedMonthEndBalance: projectedMonthEnd,
    daysRemaining,
    budget,
  })

  const projectedRisk = calculateRiskScore({
    currentCash: projectedCash,
    spendableBalance: projectedSpendable,
    upcomingUnpaidCommitments,
    safeDailyAllowance: projectedSafeDaily,
    dailyAverageSpent: (projectedExpenses / (daysElapsed || 1)),
    projectedMonthEndBalance: projectedMonthEnd,
    daysRemaining,
    budget,
  })

  // Evaluate Verdict based on mathematical thresholds
  let verdictType = 'affordable'
  let verdictTitle = 'Affordable within the current budget'
  let verdictColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  let reasoning = ''
  let recommendation = ''

  if (projectedSpendable < 0 || projectedCash < upcomingUnpaidCommitments) {
    verdictType = 'shortfall'
    verdictTitle = 'Not affordable without a shortfall'
    verdictColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    const shortfallAmt = Math.abs(projectedSpendable)
    reasoning = `Making this purchase creates an immediate ₹${shortfallAmt.toLocaleString('en-IN')} spendable deficit and leaves unpaid commitments without cash coverage.`
    recommendation = 'Postpone this purchase until the next budget cycle or cancel non-essential commitments.'
  } else if (projectedSafeDaily < 100 || projectedRisk.score >= 60 || projectedMonthEnd < 0) {
    verdictType = 'risky'
    verdictTitle = 'Risky: may threaten upcoming commitments'
    verdictColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    reasoning = `Your safe daily allowance collapses to just ₹${projectedSafeDaily}/day for the remaining ${daysRemaining} days. Any minor surprise expense will trigger a deficit.`
    recommendation = 'High risk. Look for cheaper alternatives under ₹' + Math.floor(baseFinancials.safeDailyAllowance * 1.5).toLocaleString('en-IN') + ' or wait until Day 25.'
  } else if (projectedSafeDaily < baseFinancials.safeDailyAllowance * 0.75) {
    verdictType = 'compromise'
    verdictTitle = 'Affordable, but requires reduced spending elsewhere'
    verdictColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    const dailyDrop = baseFinancials.safeDailyAllowance - projectedSafeDaily
    reasoning = `You can buy this without defaulting on bills, but your daily allowance drops from ₹${baseFinancials.safeDailyAllowance}/day to ₹${projectedSafeDaily}/day (a ₹${dailyDrop}/day sacrifice).`
    recommendation = `Compromise required: Cut daily dining/transport expenses by ₹${dailyDrop} every day for the next ${daysRemaining} days.`
  } else {
    verdictType = 'affordable'
    verdictTitle = 'Affordable within the current budget'
    verdictColor = 'text-lime-400 bg-lime-500/10 border-lime-500/20'
    reasoning = `Your runway remains healthy. Spendable cash stays positive (₹${projectedSpendable.toLocaleString('en-IN')}), commitments remain 100% funded, and daily allowance remains ₹${projectedSafeDaily}/day.`
    recommendation = 'Safe to proceed. It fits within your 30-day budget plan without compromising bills.'
  }

  // Savings goal achievability
  const savingsAchievable = projectedSpendable >= 0 && projectedMonthEnd >= 0

  return {
    item: { name, amount: purchaseAmount, category },
    current: {
      cash: currentCash,
      spendable: spendableBalance,
      dailyAllowance: baseFinancials.safeDailyAllowance,
      monthEnd: baseFinancials.projectedMonthEndBalance,
      healthScore: baseFinancials.health.score,
      riskLevel: baseFinancials.risk.level,
      riskScore: baseFinancials.risk.score,
    },
    simulated: {
      cash: projectedCash,
      spendable: projectedSpendable,
      dailyAllowance: projectedSafeDaily,
      monthEnd: projectedMonthEnd,
      healthScore: projectedHealth.score,
      riskLevel: projectedRisk.level,
      riskScore: projectedRisk.score,
    },
    delta: {
      cash: -purchaseAmount,
      spendable: -purchaseAmount,
      dailyAllowance: projectedSafeDaily - baseFinancials.safeDailyAllowance,
      monthEnd: -purchaseAmount,
      healthScore: projectedHealth.score - baseFinancials.health.score,
      riskScore: projectedRisk.score - baseFinancials.risk.score,
    },
    verdict: {
      type: verdictType,
      title: verdictTitle,
      color: verdictColor,
      reasoning,
      recommendation,
      savingsAchievable,
    }
  }
}

/**
 * Emergency Simulator: test sudden shock expense
 */
export function simulateEmergency({ baseFinancials, amount }) {
  return simulatePurchase({
    baseFinancials,
    amount,
    category: 'Emergency',
    name: `Surprise Expense (₹${amount})`,
  })
}

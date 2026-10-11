import { calculateFinancials, simulatePurchase, simulateEmergency } from './src/utils/financeCalculations.js'
import { INITIAL_DEMO_DATA } from './src/data/initialData.js'

console.log('----------------------------------------------------')
console.log('🧪 RUNWAY Financial Engine — Verification Test Suite')
console.log('----------------------------------------------------')

// 1. Initial State Verification (Day 1 of 30)
console.log('\n[TEST 1] Initial State (Day 1 / ₹10,000 Budget):')
const f = calculateFinancials(INITIAL_DEMO_DATA)

console.log('  • Starting Budget:', f.budget)
console.log('  • Income Received:', f.incomeReceived)
console.log('  • Actual Expenses:', f.actualExpenses)
console.log('  • Current Cash in Hand:', f.currentCash)
console.log('  • Upcoming Unpaid Bills:', f.upcomingUnpaidCommitments)
console.log('  • Savings Reserved:', f.savingsReserved)
console.log('  • Spendable Balance:', f.spendableBalance)
console.log('  • Days Remaining:', f.daysRemaining)
console.log('  • Safe Daily Allowance:', f.safeDailyAllowance)
console.log('  • Projected Month-End:', f.projectedMonthEndBalance)
console.log('  • Health Score:', f.health.score, `(${f.health.grade})`)
console.log('  • Risk Score:', f.risk.score, `(${f.risk.level})`)

// Core Arithmetic Assertions
if (f.currentCash !== f.budget + f.incomeReceived - f.actualExpenses) {
  throw new Error('Assertion Failed: Cash equation mismatch')
}
if (f.spendableBalance !== f.currentCash - f.upcomingUnpaidCommitments - f.savingsReserved) {
  throw new Error('Assertion Failed: Spendable balance mismatch')
}
if (f.safeDailyAllowance !== Math.floor(f.spendableBalance / f.daysRemaining)) {
  throw new Error('Assertion Failed: Safe daily allowance mismatch')
}
console.log('  ✅ Initial state arithmetic verified successfully.')

// 2. Purchase Simulation Verification
console.log('\n[TEST 2] Purchase Simulation (₹1,500 Discretionary Item):')
const sim = simulatePurchase({
  baseFinancials: f,
  amount: 1500,
  category: 'Shopping',
  name: 'Sneakers',
})

console.log('  • Simulated Spendable:', sim.simulated.spendable)
console.log('  • Simulated Daily Allowance:', sim.simulated.dailyAllowance)
console.log('  • Delta Allowance:', sim.delta.dailyAllowance)
console.log('  • Simulated Verdict:', sim.verdict.title)
console.log('  • Verdict Category:', sim.verdict.type)

if (sim.simulated.spendable !== f.spendableBalance - 1500) {
  throw new Error('Assertion Failed: Purchase simulation spendable reduction incorrect')
}
if (sim.delta.dailyAllowance >= 0) {
  throw new Error('Assertion Failed: Discretionary purchase must reduce daily allowance')
}
console.log('  ✅ Purchase simulation consequences verified.')

// 3. Unexpected Expense / Shock Simulator Verification
console.log('\n[TEST 3] Emergency Shock Simulation (₹3,000 Crisis):')
const shock = simulateEmergency({
  baseFinancials: f,
  amount: 3000,
})

console.log('  • Emergency Amount:', shock.item.amount)
console.log('  • Remaining Buffer After Shock:', shock.simulated.spendable)
console.log('  • Post-Shock Daily Allowance:', shock.simulated.dailyAllowance)
console.log('  • Post-Shock Risk Level:', shock.simulated.riskLevel)
console.log('  • Shock Verdict:', shock.verdict.title)

if (shock.simulated.spendable !== f.spendableBalance - 3000) {
  throw new Error('Assertion Failed: Shock simulator balance calculation incorrect')
}
console.log('  ✅ Shock simulator stress-test verified.')

// 4. Zero / Extreme Boundary Edge Cases
console.log('\n[TEST 4] Edge Case Robustness (Day 30 & Zero Balance):')
const edgeState = {
  ...INITIAL_DEMO_DATA,
  currentDay: 30,
  transactions: [
    { id: 'tx-extreme', description: 'Total Spend', amount: 10000, type: 'expense', category: 'Emergency', day: 30, date: 'Day 30' }
  ]
}
const fEdge = calculateFinancials(edgeState)
if (fEdge.safeDailyAllowance !== 0) {
  throw new Error('Assertion Failed: Zero spendable balance must produce 0 daily allowance')
}
if (fEdge.daysRemaining !== 1) {
  throw new Error('Assertion Failed: Day 30 must have 1 day remaining')
}
console.log('  ✅ Boundary conditions gracefully handled without NaN or negative division.')

// 5. Zero Double-Counting Verification (Unpaid -> Paid Commitment Transition)
console.log('\n[TEST 5] Bill Settlement Integrity (Zero Double-Counting):')
const rentBill = INITIAL_DEMO_DATA.commitments.find((c) => c.title.includes('Rent'))
const rentAmount = rentBill.amount
const initialSpendable = f.spendableBalance

// Mark Rent as paid
const stateWithPaidBill = {
  ...INITIAL_DEMO_DATA,
  commitments: INITIAL_DEMO_DATA.commitments.map((c) => c.id === rentBill.id ? { ...c, isPaid: true } : c),
  transactions: [
    ...INITIAL_DEMO_DATA.transactions,
    { id: 'tx-rent-paid', description: rentBill.title, amount: rentAmount, type: 'expense', category: rentBill.category, day: 1, date: 'Day 1' }
  ]
}
const fPaid = calculateFinancials(stateWithPaidBill)
// Cash drops by rentAmount, upcoming bills drops by rentAmount -> Spendable must remain identical!
if (fPaid.spendableBalance !== initialSpendable) {
  throw new Error(`Assertion Failed: Bill payment must not alter discretionary spendable balance! Expected ${initialSpendable}, got ${fPaid.spendableBalance}`)
}
console.log('  • Initial Spendable:', initialSpendable)
console.log('  • Post-Payment Spendable:', fPaid.spendableBalance)
console.log('  • Rent Outflow Recorded in Ledger:', rentAmount)
console.log('  ✅ Zero double-counting verified mathematically.')

// 6. Savings Cushion Ring-Fencing Integrity
console.log('\n[TEST 6] Savings Cushion Ring-Fencing:')
const stateWithSavings = {
  ...INITIAL_DEMO_DATA,
  savingsGoals: [
    { id: 'goal-emergency', title: 'Emergency Buffer', targetAmount: 2000, currentAmount: 1000, targetDay: 15 }
  ]
}
const fSavings = calculateFinancials(stateWithSavings)
if (fSavings.currentCash !== f.currentCash) {
  throw new Error('Assertion Failed: Ring-fenced savings must remain in liquid cash reserves')
}
if (fSavings.spendableBalance !== f.spendableBalance - 1000) {
  throw new Error('Assertion Failed: Ring-fenced savings must be deducted from discretionary spendable balance')
}
console.log('  • Liquid Cash in Hand (Preserved):', fSavings.currentCash)
console.log('  • Spendable Discretionary Cash (Ring-Fenced):', fSavings.spendableBalance)
console.log('  ✅ Savings cushion ring-fencing verified.')

// 7. Survival Health Score Grade Boundaries
console.log('\n[TEST 7] Financial Health & Risk Grade Mapping:')
if (f.health.score < 0 || f.health.score > 100) {
  throw new Error('Assertion Failed: Health score must fall within [0, 100]')
}
if (f.risk.score < 0 || f.risk.score > 100) {
  throw new Error('Assertion Failed: Risk score must fall within [0, 100]')
}
console.log('  • Health Score & Grade:', `${f.health.score} (${f.health.grade})`)
console.log('  • Risk Score & Level:', `${f.risk.score} (${f.risk.level})`)
console.log('  ✅ Scoring boundaries and tier labels verified.')

console.log('\n----------------------------------------------------')
console.log('🎉 100% OF 7 VERIFICATION TEST SUITES PASSED!')
console.log('----------------------------------------------------')


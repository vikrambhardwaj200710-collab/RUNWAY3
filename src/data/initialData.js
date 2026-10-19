// RUNWAY Initial State — Starts fresh on Day 1 of 30
// Challenge: "Broke But Functional — Survive the Month"
// Budget: ₹10,000 | 30-Day Simulation

export const INITIAL_DEMO_DATA = {
  budget: 10000,
  currentDay: 1, // Starts clean from Day 1
  totalDays: 30,
  transactions: [], // Clean ledger from Day 1 — zero unnecessary pre-spent dummy entries
  commitments: [
    {
      id: 'com-1',
      title: 'Room Rent / PG Share',
      amount: 3500,
      category: 'Housing',
      dueDay: 15,
      frequency: 'Monthly',
      isRecurring: true,
      isPaid: false,
      notes: 'Must pay roommates before 15th to avoid late fee',
    },
    {
      id: 'com-2',
      title: '5G Mobile Prepaid Plan',
      amount: 479,
      category: 'Utilities',
      dueDay: 12,
      frequency: 'Monthly',
      isRecurring: true,
      isPaid: false,
      notes: 'Monthly high-speed data & calling recharge',
    },
    {
      id: 'com-3',
      title: 'Broadband Wi-Fi Split',
      amount: 400,
      category: 'Utilities',
      dueDay: 20,
      frequency: 'Monthly',
      isRecurring: true,
      isPaid: false,
      notes: 'Monthly flat Wi-Fi share',
    },
  ],
  savingsGoals: [
    {
      id: 'sav-1',
      title: 'Emergency Safety Cushion',
      targetAmount: 2000,
      currentAmount: 0,
      targetDay: 30,
      category: 'Safety Net',
      color: '#10b981',
      notes: 'Rainy day fund to prevent borrowing at month end',
    },
  ],
}

export const TRANSACTION_CATEGORIES = [
  'Food & Groceries',
  'Transport',
  'Housing',
  'Utilities',
  'Subscription',
  'Entertainment',
  'Health & Fitness',
  'Education',
  'Freelance',
  'Shopping',
  'Emergency',
  'Other',
]

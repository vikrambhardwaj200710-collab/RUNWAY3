import React, { useState, useEffect, useMemo } from 'react'
import { INITIAL_DEMO_DATA } from '../data/initialData'
import { calculateFinancials, simulatePurchase, simulateEmergency } from '../utils/financeCalculations'
import { FinanceContext } from './financeContextDef'

const STORAGE_KEY = 'runway_finance_state_v2'

export function FinanceProvider({ children }) {
  // Load initial state with safe fallback
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Basic validation
        if (parsed && typeof parsed.budget === 'number' && Array.isArray(parsed.transactions)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved RUNWAY state, resetting to demo data:', err)
    }
    return INITIAL_DEMO_DATA
  })

  const [activeTab, setActiveTab] = useState('dashboard')
  const [notification, setNotification] = useState(null)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('runway_theme_mode') || 'light'
    } catch {
      return 'light'
    }
  })

  // Sync theme with document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('runway_theme_mode', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    notify(`Switched to ${theme === 'light' ? 'Night (Dark)' : 'Day (Light)'} Mode`, 'info')
  }

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save to localStorage:', err)
    }
  }, [data])

  // Central Financial Metrics derived continuously
  const financials = useMemo(() => {
    return calculateFinancials({
      budget: data.budget,
      transactions: data.transactions,
      commitments: data.commitments,
      savingsGoals: data.savingsGoals,
      currentDay: data.currentDay,
      totalDays: data.totalDays,
    })
  }, [data])

  // Show a toast-like notification
  const notify = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() })
    setTimeout(() => {
      setNotification((current) => (current?.message === message ? null : current))
    }, 4000)
  }

  // --- ACTIONS ---

  // 1. Transactions
  const addTransaction = (tx) => {
    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: tx.description.trim(),
      amount: Math.abs(Number(tx.amount)),
      type: tx.type || 'expense',
      category: tx.category || 'Other',
      day: Number(tx.day) || data.currentDay,
      date: tx.date || new Date().toISOString().split('T')[0],
      linkedCommitmentId: tx.linkedCommitmentId || null,
    }

    setData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }))

    notify(
      `${newTx.type === 'income' ? 'Income' : 'Expense'} of ₹${newTx.amount.toLocaleString('en-IN')} added`,
      newTx.type === 'income' ? 'success' : 'info'
    )
    return newTx
  }

  const deleteTransaction = (id) => {
    const tx = data.transactions.find((t) => t.id === id)
    if (!tx) return

    setData((prev) => {
      // If transaction was linked to a paid commitment, mark the commitment as unpaid
      let updatedCommitments = prev.commitments
      if (tx.linkedCommitmentId) {
        updatedCommitments = prev.commitments.map((c) =>
          c.id === tx.linkedCommitmentId ? { ...c, isPaid: false } : c
        )
      }

      return {
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
        commitments: updatedCommitments,
      }
    })

    notify(`Removed "${tx.description}"`, 'info')
  }

  // 2. Commitments & Subscriptions
  const addCommitment = (com) => {
    const newCom = {
      id: `com-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: com.title.trim(),
      amount: Math.abs(Number(com.amount)),
      category: com.category || 'Bills',
      dueDay: Math.min(Math.max(1, Number(com.dueDay) || 1), data.totalDays),
      frequency: com.frequency || 'Monthly',
      isRecurring: com.isRecurring !== undefined ? Boolean(com.isRecurring) : true,
      isPaid: false,
      notes: com.notes || '',
    }

    setData((prev) => ({
      ...prev,
      commitments: [...prev.commitments, newCom],
    }))

    notify(`Commitment "${newCom.title}" (₹${newCom.amount.toLocaleString('en-IN')}) added`, 'success')
  }

  const editCommitment = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      commitments: prev.commitments.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
    }))
    notify('Commitment updated', 'info')
  }

  const deleteCommitment = (id) => {
    const com = data.commitments.find((c) => c.id === id)
    if (!com) return

    setData((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c) => c.id !== id),
      // Also un-link any transactions
      transactions: prev.transactions.filter((t) => t.linkedCommitmentId !== id),
    }))

    notify(`Removed commitment "${com.title}"`, 'info')
  }

  // Toggle Paid status: prevents double counting
  const toggleCommitmentPaid = (id) => {
    const com = data.commitments.find((c) => c.id === id)
    if (!com) return

    if (!com.isPaid) {
      // Mark as paid: create a linked expense transaction so cash reflects the payment
      const newTx = {
        id: `tx-bill-${Date.now()}`,
        description: `Bill Payment: ${com.title}`,
        amount: com.amount,
        type: 'expense',
        category: com.category,
        day: data.currentDay,
        date: new Date().toISOString().split('T')[0],
        linkedCommitmentId: com.id,
      }

      setData((prev) => ({
        ...prev,
        commitments: prev.commitments.map((c) => (c.id === id ? { ...c, isPaid: true } : c)),
        transactions: [newTx, ...prev.transactions],
      }))

      notify(`Paid "${com.title}" (₹${com.amount.toLocaleString('en-IN')}). Recorded in expenses.`, 'success')
    } else {
      // Revert to unpaid: remove the linked expense transaction
      setData((prev) => ({
        ...prev,
        commitments: prev.commitments.map((c) => (c.id === id ? { ...c, isPaid: false } : c)),
        transactions: prev.transactions.filter((t) => t.linkedCommitmentId !== id),
      }))

      notify(`Marked "${com.title}" as unpaid. Reinstated to upcoming bills.`, 'info')
    }
  }

  // 3. Savings Goals
  const addSavingsGoal = (goal) => {
    const newGoal = {
      id: `sav-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: goal.title.trim(),
      targetAmount: Math.abs(Number(goal.targetAmount)),
      currentAmount: Math.abs(Number(goal.currentAmount) || 0),
      targetDay: Math.min(Math.max(1, Number(goal.targetDay) || data.totalDays), data.totalDays),
      category: goal.category || 'General',
      color: goal.color || '#10b981',
      notes: goal.notes || '',
    }

    setData((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, newGoal],
    }))

    notify(`Savings Goal "${newGoal.title}" created`, 'success')
  }

  const contributeToSavings = (goalId, amount) => {
    const amt = Math.abs(Number(amount))
    if (!amt || amt <= 0) return

    if (financials.spendableBalance < amt) {
      notify(`Cannot contribute ₹${amt.toLocaleString('en-IN')}: exceeds available spendable cash!`, 'danger')
      return false
    }

    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amt } : g
      ),
    }))

    notify(`Transferred ₹${amt.toLocaleString('en-IN')} to savings cushion`, 'success')
    return true
  }

  const withdrawFromSavings = (goalId, amount) => {
    const amt = Math.abs(Number(amount))
    if (!amt || amt <= 0) return

    const goal = data.savingsGoals.find((g) => g.id === goalId)
    if (!goal || goal.currentAmount < amt) {
      notify(`Cannot withdraw ₹${amt.toLocaleString('en-IN')}: exceeds currently saved amount`, 'danger')
      return false
    }

    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amt) } : g
      ),
    }))

    notify(`Released ₹${amt.toLocaleString('en-IN')} back to spendable cash`, 'info')
    return true
  }

  const deleteSavingsGoal = (goalId) => {
    const goal = data.savingsGoals.find((g) => g.id === goalId)
    if (!goal) return

    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== goalId),
    }))

    notify(`Removed savings goal "${goal.title}"`, 'info')
  }

  // 4. Timeline & Day Progression
  const advanceDay = (days = 1) => {
    setData((prev) => {
      const nextDay = Math.min(prev.totalDays, prev.currentDay + days)
      if (nextDay === prev.currentDay) {
        notify('Already at Day 30 (End of Challenge Timeline)', 'info')
        return prev
      }
      return {
        ...prev,
        currentDay: nextDay,
      }
    })
    notify(`Advanced to Day ${Math.min(data.totalDays, data.currentDay + days)} of 30`, 'info')
  }

  const setDay = (day) => {
    const safeDay = Math.min(Math.max(1, Number(day)), data.totalDays)
    setData((prev) => ({
      ...prev,
      currentDay: safeDay,
    }))
    notify(`Timeline set to Day ${safeDay} of 30`, 'info')
  }

  // 5. Reset Demo Data
  const resetDemoData = () => {
    setData(INITIAL_DEMO_DATA)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA))
    } catch {
      // ignore
    }
    notify('Reset to original ₹10,000 baseline budget', 'success')
  }

  // 6. Export / Import Data
  const exportData = () => {
    try {
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `runway-finance-day${data.currentDay}-backup.json`
      a.click()
      URL.revokeObjectURL(url)
      notify('Exported financial backup JSON file', 'success')
    } catch {
      notify('Failed to export data', 'danger')
    }
  }

  const importData = (imported) => {
    try {
      if (imported && typeof imported.budget === 'number' && Array.isArray(imported.transactions)) {
        setData(imported)
        notify('Successfully imported financial state!', 'success')
        return true
      } else {
        notify('Invalid backup JSON format', 'danger')
        return false
      }
    } catch {
      notify('Failed to import data', 'danger')
      return false
    }
  }

  return (
    <FinanceContext.Provider
      value={{
        data,
        financials,
        activeTab,
        setActiveTab,
        notification,
        notify,
        addTransaction,
        deleteTransaction,
        addCommitment,
        editCommitment,
        deleteCommitment,
        toggleCommitmentPaid,
        addSavingsGoal,
        contributeToSavings,
        withdrawFromSavings,
        deleteSavingsGoal,
        advanceDay,
        setDay,
        resetDemoData,
        exportData,
        importData,
        theme,
        toggleTheme,
        // Expose simulation helper with current financials attached
        runPurchaseSimulation: (item) => simulatePurchase({ baseFinancials: financials, ...item }),
        runEmergencySimulation: (amount) => simulateEmergency({ baseFinancials: financials, amount }),
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}


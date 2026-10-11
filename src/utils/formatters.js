// Formatting utilities for RUNWAY Indian Rupee fintech presentation

/**
 * Format a number as Indian Rupee currency (e.g. ₹1,500 or ₹10,000)
 * @param {number} amount
 * @param {boolean} includeDecimals
 * @returns {string}
 */
export function formatCurrency(amount, includeDecimals = false) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0'
  }
  
  const isNegative = amount < 0
  const absAmount = Math.abs(amount)
  
  // Format according to Indian Numbering System (en-IN)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(absAmount)

  return isNegative ? `-₹${formatted}` : `₹${formatted}`
}

/**
 * Format number as compact currency (e.g. ₹1.5k, ₹10k)
 */
export function formatCompactCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0'
  const isNegative = amount < 0
  const abs = Math.abs(amount)

  if (abs >= 100000) {
    return `${isNegative ? '-' : ''}₹${(abs / 100000).toFixed(1)}L`
  }
  if (abs >= 1000) {
    return `${isNegative ? '-' : ''}₹${(abs / 1000).toFixed(1)}k`
  }
  return formatCurrency(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === undefined || value === null || isNaN(value)) return '0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * Format challenge day string
 */
export function formatDayString(day, totalDays = 30) {
  return `Day ${day} of ${totalDays}`
}

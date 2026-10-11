import React, { useState } from 'react'
import Modal from './Modal'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'

export default function SavingsActionModal({ isOpen, onClose, goal, mode = 'deposit' }) {
  const { contributeToSavings, withdrawFromSavings, financials } = useFinance()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (!goal) return null

  const isDeposit = mode === 'deposit'
  const maxAvailable = isDeposit ? financials.spendableBalance : goal.currentAmount

  const handleSubmit = (e) => {
    e.preventDefault()
    const num = Number(amount)
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (isDeposit) {
      if (num > financials.spendableBalance) {
        setError(`Cannot exceed available spendable balance of ${formatCurrency(financials.spendableBalance)}`)
        return
      }
      contributeToSavings(goal.id, num)
    } else {
      if (num > goal.currentAmount) {
        setError(`Cannot withdraw more than currently saved (${formatCurrency(goal.currentAmount)})`)
        return
      }
      withdrawFromSavings(goal.id, num)
    }

    setAmount('')
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeposit ? `Deposit to ${goal.title}` : `Withdraw from ${goal.title}`}
      subtitle={
        isDeposit
          ? `Transfers funds from Spendable Cash to your ring-fenced savings cushion`
          : `Releases saved funds back into your daily Spendable Cash`
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <span>{isDeposit ? 'Available Spendable Cash:' : 'Currently Saved in Goal:'}</span>
            <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(maxAvailable)}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sav-action-amount">Amount (₹) *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontWeight: 600 }} aria-hidden="true">
              ₹
            </span>
            <input
              id="sav-action-amount"
              type="number"
              min="1"
              max={maxAvailable}
              className="form-input font-mono"
              style={{ paddingLeft: '28px' }}
              placeholder={isDeposit ? '500' : '200'}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError('')
              }}
              aria-required="true"
              autoFocus
            />
          </div>
          {error && (
            <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }}>
              {error}
            </p>
          )}
        </div>

        {/* Quick fill buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[100, 250, 500, 1000].map((preset) => {
            if (preset > maxAvailable && maxAvailable > 0) return null
            return (
              <button
                key={preset}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setAmount(String(preset))}
              >
                ₹{preset}
              </button>
            )
          })}
          {maxAvailable > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => setAmount(String(maxAvailable))}
            >
              Max ({formatCurrency(maxAvailable)})
            </button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`btn ${isDeposit ? 'btn-primary' : 'btn-secondary'}`}>
            {isDeposit ? 'Confirm Deposit' : 'Confirm Withdrawal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

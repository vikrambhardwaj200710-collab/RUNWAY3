import React, { useState } from 'react'
import Modal from './Modal'
import { TRANSACTION_CATEGORIES } from '../data/initialData'
import { useFinance } from '../context/useFinance'

export default function AddTransactionModal({ isOpen, onClose }) {
  const { addTransaction, data } = useFinance()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food & Groceries')
  const [day, setDay] = useState(data.currentDay)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!description.trim()) {
      errs.description = 'Description is required'
    }
    const numAmount = Number(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than ₹0'
    }
    const numDay = Number(day)
    if (isNaN(numDay) || numDay < 1 || numDay > 30) {
      errs.day = 'Day must be between 1 and 30'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    addTransaction({
      description,
      amount: Number(amount),
      type,
      category,
      day: Number(day),
    })

    // Reset & Close
    setDescription('')
    setAmount('')
    setType('expense')
    setCategory('Food & Groceries')
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Financial Entry" subtitle="Add an expense or income to your 30-day ledger">
      <form onSubmit={handleSubmit} noValidate>
        {/* Type selector */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }} role="group" aria-label="Transaction Type">
          <button
            type="button"
            className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => {
              setType('expense')
              if (category === 'Freelance') setCategory('Food & Groceries')
            }}
            aria-pressed={type === 'expense'}
          >
            Expense (-)
          </button>
          <button
            type="button"
            className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => {
              setType('income')
              setCategory('Freelance')
            }}
            aria-pressed={type === 'income'}
          >
            Income (+)
          </button>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="tx-desc">Description *</label>
          <input
            id="tx-desc"
            type="text"
            className="form-input"
            placeholder={type === 'expense' ? 'e.g. Lunch, metro recharge, course fee' : 'e.g. Freelance gig, stipend, tutoring'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.description)}
            autoFocus
          />
          {errors.description && (
            <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }} role="alert">
              {errors.description}
            </p>
          )}
        </div>

        {/* Amount & Day */}
        <div className="form-row-responsive" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="tx-amount">Amount (₹) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontWeight: 600 }} aria-hidden="true">
                ₹
              </span>
              <input
                id="tx-amount"
                type="number"
                step="any"
                min="1"
                className="form-input font-mono"
                style={{ paddingLeft: '28px' }}
                placeholder="250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.amount)}
              />
            </div>
            {errors.amount && (
              <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }} role="alert">
                {errors.amount}
              </p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="tx-day">Day of Month (1-30) *</label>
            <input
              id="tx-day"
              type="number"
              min="1"
              max="30"
              className="form-input font-mono"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.day)}
            />
            {errors.day && (
              <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }} role="alert">
                {errors.day}
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="tx-category">Category *</label>
          <select
            id="tx-category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-required="true"
          >
            {TRANSACTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Record {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

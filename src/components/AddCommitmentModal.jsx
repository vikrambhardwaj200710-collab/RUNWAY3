import React, { useState } from 'react'
import Modal from './Modal'
import { useFinance } from '../context/useFinance'

const COMMITMENT_CATEGORIES = [
  'Housing',
  'Utilities',
  'Subscription',
  'Health & Fitness',
  'Education',
  'Transport Pass',
  'Other Bills',
]

export default function AddCommitmentModal({ isOpen, onClose }) {
  const { addCommitment } = useFinance()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Housing')
  const [dueDay, setDueDay] = useState(15)
  const [frequency, setFrequency] = useState('Monthly')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!title.trim()) {
      errs.title = 'Title is required'
    }
    const numAmount = Number(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid amount'
    }
    const numDay = Number(dueDay)
    if (isNaN(numDay) || numDay < 1 || numDay > 30) {
      errs.dueDay = 'Due day must be between 1 and 30'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    addCommitment({
      title,
      amount: Number(amount),
      category,
      dueDay: Number(dueDay),
      frequency,
      isRecurring: frequency === 'Monthly',
      notes,
    })

    setTitle('')
    setAmount('')
    setCategory('Housing')
    setDueDay(15)
    setFrequency('Monthly')
    setNotes('')
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Fixed Commitment / Bill" subtitle="Ensure upcoming obligations are reserved from spendable cash">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="com-title">Commitment Name *</label>
          <input
            id="com-title"
            type="text"
            className="form-input"
            placeholder="e.g. Room Rent, Wi-Fi split, Jio plan, Netflix"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.title)}
            autoFocus
          />
          {errors.title && (
            <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }} role="alert">
              {errors.title}
            </p>
          )}
        </div>

        <div className="form-row-responsive" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="com-amount">Amount (₹) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontWeight: 600 }} aria-hidden="true">
                ₹
              </span>
              <input
                id="com-amount"
                type="number"
                min="1"
                className="form-input font-mono"
                style={{ paddingLeft: '28px' }}
                placeholder="1500"
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
            <label className="form-label" htmlFor="com-due-day">Due Day of Month (1-30) *</label>
            <input
              id="com-due-day"
              type="number"
              min="1"
              max="30"
              className="form-input font-mono"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.dueDay)}
            />
            {errors.dueDay && (
              <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }} role="alert">
                {errors.dueDay}
              </p>
            )}
          </div>
        </div>

        <div className="form-row-responsive" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="com-category">Category</label>
            <select
              id="com-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {COMMITMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="com-freq">Frequency</label>
            <select
              id="com-freq"
              className="form-select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="Monthly">Monthly Recurring</option>
              <option value="One-time">One-Time Bill</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="com-notes">Notes (Optional)</label>
          <input
            id="com-notes"
            type="text"
            className="form-input"
            placeholder="e.g. Split with roommates via UPI"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Commitment
          </button>
        </div>
      </form>
    </Modal>
  )
}

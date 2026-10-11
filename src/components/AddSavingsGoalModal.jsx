import React, { useState } from 'react'
import Modal from './Modal'
import { useFinance } from '../context/useFinance'

export default function AddSavingsGoalModal({ isOpen, onClose }) {
  const { addSavingsGoal } = useFinance()
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialDeposit, setInitialDeposit] = useState('0')
  const [targetDay, setTargetDay] = useState(30)
  const [category, setCategory] = useState('Safety Net')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Goal name is required'
    const target = Number(targetAmount)
    if (!targetAmount || isNaN(target) || target <= 0) {
      errs.targetAmount = 'Enter a target amount greater than ₹0'
    }
    const deposit = Number(initialDeposit)
    if (isNaN(deposit) || deposit < 0) {
      errs.initialDeposit = 'Deposit cannot be negative'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    addSavingsGoal({
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(initialDeposit) || 0,
      targetDay: Number(targetDay) || 30,
      category,
      notes,
    })

    setTitle('')
    setTargetAmount('')
    setInitialDeposit('0')
    setTargetDay(30)
    setCategory('Safety Net')
    setNotes('')
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Savings Goal" subtitle="Ring-fence funds to protect against month-end deficit traps">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="sav-title">Goal Title *</label>
          <input
            id="sav-title"
            type="text"
            className="form-input"
            placeholder="e.g. Rainy Day Buffer, Tech Tools, Skill Certification"
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
            <label className="form-label" htmlFor="sav-target">Target Amount (₹) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontWeight: 600 }} aria-hidden="true">
                ₹
              </span>
              <input
                id="sav-target"
                type="number"
                min="1"
                className="form-input font-mono"
                style={{ paddingLeft: '28px' }}
                placeholder="2000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.targetAmount)}
              />
            </div>
            {errors.targetAmount && (
              <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }} role="alert">
                {errors.targetAmount}
              </p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="sav-deposit">Initial Deposit (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontWeight: 600 }} aria-hidden="true">
                ₹
              </span>
              <input
                id="sav-deposit"
                type="number"
                min="0"
                className="form-input font-mono"
                style={{ paddingLeft: '28px' }}
                placeholder="0"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
              />
            </div>
            {errors.initialDeposit && (
              <p style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '4px' }} role="alert">
                {errors.initialDeposit}
              </p>
            )}
          </div>
        </div>

        <div className="form-row-responsive" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="sav-category">Category</label>
            <select
              id="sav-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Safety Net">Safety Net / Emergency</option>
              <option value="Gadgets">Gadgets / Tech</option>
              <option value="Events">Events / Travel</option>
              <option value="Career">Education & Career</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="sav-target-day">Target Day (1-30)</label>
            <input
              id="sav-target-day"
              type="number"
              min="1"
              max="30"
              className="form-input font-mono"
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sav-notes">Notes (Optional)</label>
          <input
            id="sav-notes"
            type="text"
            className="form-input"
            placeholder="e.g. Set aside for sudden unexpected expenses"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Goal
          </button>
        </div>
      </form>
    </Modal>
  )
}

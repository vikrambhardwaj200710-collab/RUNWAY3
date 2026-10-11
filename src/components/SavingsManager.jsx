import React, { useState } from 'react'
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
} from 'lucide-react'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'
import AddSavingsGoalModal from './AddSavingsGoalModal'
import SavingsActionModal from './SavingsActionModal'
import ConfirmDialog from './ConfirmDialog'

export default function SavingsManager() {
  const { data, financials, deleteSavingsGoal } = useFinance()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [actionModal, setActionModal] = useState({ isOpen: false, goal: null, mode: 'deposit' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '22px 24px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <PiggyBank size={20} style={{ color: 'var(--accent-lime)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Savings Goals & Safety Cushions
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Reserved savings are protected funds: they reduce your daily spendable allowance so you don’t blow them, but stay in your cash reserve.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-3">
        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Ring-Fenced Cushion
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {formatCurrency(financials.savingsReserved)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Safe from impulse spending
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Savings Target
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatCurrency(financials.savingsTargetTotal)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across {data.savingsGoals.length} active goals
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Available Spendable to Top Up
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-lime)', marginTop: '4px' }}>
            {formatCurrency(financials.spendableBalance)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Uncommitted cash ready to deposit
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {data.savingsGoals.map((goal) => {
          const progress = goal.targetAmount > 0
            ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            : 0
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

          // Likelihood assessment: can user fund this by target day?
          const daysLeftForGoal = Math.max(1, goal.targetDay - data.currentDay)
          const neededPerDay = remaining / daysLeftForGoal
          const isLikely = financials.spendableBalance >= remaining || financials.safeDailyAllowance >= neededPerDay

          return (
            <div
              key={goal.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderTop: `4px solid ${goal.color || 'var(--accent-lime)'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {goal.title}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {goal.category} • Target: Day {goal.targetDay}
                    </span>
                  </div>

                  <span
                    className={`badge ${isLikely ? 'badge-emerald' : 'badge-warning'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {isLikely ? 'Likely to Reach' : 'At Risk'}
                  </span>
                </div>

                {goal.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {goal.notes}
                  </p>
                )}

                {/* Amount Progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {' '}of {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-lime)' }}>
                    {progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="progress-bar-track"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${goal.title} savings progress`}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: goal.color || 'var(--accent-lime)',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>₹{remaining.toLocaleString('en-IN')} remaining</span>
                  <span>{daysLeftForGoal} days until deadline</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setActionModal({ isOpen: true, goal, mode: 'deposit' })}
                >
                  <ArrowDownLeft size={15} />
                  <span>Deposit</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  disabled={goal.currentAmount <= 0}
                  onClick={() => setActionModal({ isOpen: true, goal, mode: 'withdraw' })}
                >
                  <ArrowUpRight size={15} />
                  <span>Withdraw</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px', color: 'var(--text-muted)' }}
                  onClick={() => setDeleteTarget(goal)}
                  aria-label="Delete goal"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      <AddSavingsGoalModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* Action (Deposit / Withdraw) Modal */}
      <SavingsActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, goal: null, mode: 'deposit' })}
        goal={actionModal.goal}
        mode={actionModal.mode}
      />

      {/* Delete Goal Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteSavingsGoal(deleteTarget.id)
          setDeleteTarget(null)
        }}
        title="Delete Savings Goal?"
        message={`Confirm deletion of "${deleteTarget?.title}". Any reserved funds (₹${deleteTarget?.currentAmount?.toLocaleString('en-IN')}) will immediately become available in your spendable cash balance.`}
        confirmText="Delete Goal"
        danger={true}
      />
    </div>
  )
}

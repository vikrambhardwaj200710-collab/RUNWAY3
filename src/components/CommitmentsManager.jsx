import React, { useState } from 'react'
import {
  Receipt,
  Plus,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'
import AddCommitmentModal from './AddCommitmentModal'
import ConfirmDialog from './ConfirmDialog'
import CategoryBadge from './CategoryBadge'
import { getCategoryMeta } from '../utils/categoryIcons'

export default function CommitmentsManager() {
  const { data, financials, toggleCommitmentPaid, deleteCommitment } = useFinance()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [filter, setFilter] = useState('all') // all, unpaid, paid
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredCommitments = data.commitments.filter((c) => {
    if (filter === 'unpaid') return !c.isPaid
    if (filter === 'paid') return c.isPaid
    return true
  })

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
            <Receipt size={20} style={{ color: 'var(--accent-lime)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Fixed Commitments & Subscriptions
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            These bills are automatically reserved from your cash so you don't accidentally spend rent or recharge money.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-cols-3">
        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Upcoming Unpaid Bills
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-warning)', marginTop: '4px' }}>
            {formatCurrency(financials.upcomingUnpaidCommitments)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Reserved from your spendable cash
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Already Paid This Month
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-lime)', marginTop: '4px' }}>
            {formatCurrency(financials.paidCommitmentsAmount)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Logged in actual expenses ledger
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total 30-Day Obligations
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatCurrency(financials.totalCommitmentsAmount)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {data.commitments.length} total active commitments
          </span>
        </div>
      </div>

      {/* Commitments Table / Cards */}
      <div className="card">
        {/* Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'unpaid', 'paid'].map((f) => (
              <button
                key={f}
                type="button"
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All Obligations' : f === 'unpaid' ? 'Pending Unpaid' : 'Settled Paid'}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Current Simulation Day: <strong style={{ color: 'var(--accent-lime)' }}>Day {data.currentDay}</strong>
          </span>
        </div>

        {/* Commitment List */}
        {filteredCommitments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCommitments.map((com) => {
              const isDueSoon = !com.isPaid && com.dueDay >= data.currentDay && com.dueDay <= data.currentDay + 5
              const isOverdue = !com.isPaid && com.dueDay < data.currentDay

              return (
                <div
                  key={com.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid',
                    borderColor: isOverdue
                      ? 'rgba(239, 68, 68, 0.3)'
                      : isDueSoon
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: com.isPaid ? 'rgba(16, 185, 129, 0.12)' : getCategoryMeta(com.category).bgColor,
                        color: com.isPaid ? 'var(--accent-emerald)' : getCategoryMeta(com.category).color,
                        border: `1px solid ${com.isPaid ? 'rgba(16, 185, 129, 0.25)' : getCategoryMeta(com.category).borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {com.isPaid ? <CheckCircle2 size={20} /> : React.createElement(getCategoryMeta(com.category).icon, { size: 20 })}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {com.title}
                        </span>
                        <CategoryBadge category={com.category} size={12} />
                        <span className={`badge ${com.isPaid ? 'badge-emerald' : isOverdue ? 'badge-danger' : isDueSoon ? 'badge-warning' : 'badge-neutral'}`}>
                          {com.isPaid ? 'Paid' : isOverdue ? `Overdue (Day ${com.dueDay})` : `Due Day ${com.dueDay}`}
                        </span>
                        {com.isRecurring && (
                          <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                            Recurring
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {com.notes ? <span>{com.notes}</span> : <span>Due by challenge Day {com.dueDay}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Amount */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'right' }}>
                      {formatCurrency(com.amount)}
                    </div>

                    <button
                      type="button"
                      className={`btn btn-sm ${com.isPaid ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleCommitmentPaid(com.id)}
                    >
                      {com.isPaid ? 'Mark Unpaid' : 'Mark as Paid'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '8px', color: 'var(--text-muted)' }}
                      onClick={() => setDeleteTarget(com)}
                      aria-label="Delete commitment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No commitments found in this view.
          </div>
        )}
      </div>

      {/* Add Commitment Modal */}
      <AddCommitmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCommitment(deleteTarget.id)
          setDeleteTarget(null)
        }}
        title="Delete Commitment?"
        message={`Are you sure you want to remove "${deleteTarget?.title}"? Unpaid amounts will no longer be reserved from your spendable cash.`}
        confirmText="Delete Commitment"
        danger={true}
      />
    </div>
  )
}

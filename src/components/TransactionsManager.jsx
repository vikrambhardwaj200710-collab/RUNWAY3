import React, { useState } from 'react'
import {
  ArrowLeftRight,
  Plus,
  Search,
  Trash2,
  ArrowDownLeft,
} from 'lucide-react'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'
import { TRANSACTION_CATEGORIES } from '../data/initialData'
import ConfirmDialog from './ConfirmDialog'
import CategoryBadge from './CategoryBadge'
import { getCategoryMeta } from '../utils/categoryIcons'

export default function TransactionsManager({ onOpenAddTx }) {
  const { data, financials, deleteTransaction } = useFinance()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // all, expense, income
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredTransactions = data.transactions.filter((tx) => {
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchDesc = (tx.description || '').toLowerCase().includes(q)
      const matchCat = (tx.category || '').toLowerCase().includes(q)
      if (!matchDesc && !matchCat) return false
    }

    // Type filter
    if (typeFilter !== 'all' && tx.type !== typeFilter) {
      return false
    }

    // Category filter
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
      return false
    }

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
            <ArrowLeftRight size={20} style={{ color: 'var(--accent-lime)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Transaction Ledger
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Every entry immediately updates your safe daily allowance, burn rate, and financial health score.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={onOpenAddTx}>
          <Plus size={16} />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid-cols-3">
        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Actual Expenses
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatCurrency(financials.actualExpenses)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Logged across Day 1 to {data.currentDay}
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Additional Income Received
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-lime)', marginTop: '4px' }}>
            +{formatCurrency(financials.incomeReceived)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Added to initial ₹10,000 budget
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Net Ledger Cash
          </span>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {formatCurrency(financials.currentCash)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Starting ₹10K + income - expenses
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search descriptions, categories..."
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTypeFilter(t)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t === 'all' ? 'All Types' : t === 'expense' ? 'Expenses Only' : 'Income Only'}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '170px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {TRANSACTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Table / List */}
          {filteredTransactions.length > 0 ? (
            <>
              {/* Desktop / Tablet Table View */}
              <div className="desktop-table-view table-responsive" style={{ marginTop: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 14px' }}>Transaction</th>
                      <th style={{ padding: '12px 14px' }}>Category</th>
                      <th style={{ padding: '12px 14px' }}>Timeline</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: tx.type === 'income' ? 'var(--accent-lime-muted)' : getCategoryMeta(tx.category).bgColor,
                                color: tx.type === 'income' ? 'var(--accent-lime)' : getCategoryMeta(tx.category).color,
                                border: `1px solid ${tx.type === 'income' ? 'rgba(163, 230, 53, 0.25)' : getCategoryMeta(tx.category).borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {tx.type === 'income' ? <ArrowDownLeft size={17} /> : React.createElement(getCategoryMeta(tx.category).icon, { size: 17 })}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {tx.description}
                              </span>
                              {tx.linkedCommitmentId && (
                                <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
                                  Bill Paid
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <CategoryBadge category={tx.category} />
                        </td>

                        <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Day {tx.day} • {tx.date}
                        </td>

                        <td
                          className="font-mono"
                          style={{
                            padding: '14px',
                            textAlign: 'right',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: tx.type === 'income' ? 'var(--accent-lime)' : 'var(--text-primary)',
                          }}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>

                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 8px', color: 'var(--text-muted)' }}
                            onClick={() => setDeleteTarget(tx)}
                            aria-label={`Delete entry ${tx.description}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (<680px) */}
              <div className="mobile-card-list" style={{ marginTop: '8px' }}>
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="panel-subtle"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: tx.type === 'income' ? 'var(--accent-lime-muted)' : getCategoryMeta(tx.category).bgColor,
                          color: tx.type === 'income' ? 'var(--accent-lime)' : getCategoryMeta(tx.category).color,
                          border: `1px solid ${tx.type === 'income' ? 'rgba(163, 230, 53, 0.25)' : getCategoryMeta(tx.category).borderColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {tx.type === 'income' ? <ArrowDownLeft size={16} /> : React.createElement(getCategoryMeta(tx.category).icon, { size: 16 })}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Day {tx.day}</span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>•</span>
                          <CategoryBadge category={tx.category} size={11} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span
                        className="font-mono"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: tx.type === 'income' ? 'var(--accent-lime)' : 'var(--text-primary)',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 7px', color: 'var(--text-muted)' }}
                        onClick={() => setDeleteTarget(tx)}
                        aria-label={`Delete transaction ${tx.description}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No transactions match your current filters.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteTransaction(deleteTarget.id)
          setDeleteTarget(null)
        }}
        title="Delete Transaction?"
        message={`Confirm deletion of "${deleteTarget?.description}" (${formatCurrency(deleteTarget?.amount)}). Your balance and risk calculations will adjust immediately.`}
        confirmText="Delete Transaction"
        danger={true}
      />
    </div>
  )
}

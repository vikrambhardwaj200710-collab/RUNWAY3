import React, { useState, useMemo } from 'react'
import {
  HelpCircle,
  Zap,
  ShoppingBag,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'
import { simulatePurchase } from '../utils/financeCalculations'
import { TRANSACTION_CATEGORIES } from '../data/initialData'
import ConfirmDialog from './ConfirmDialog'

const PRESETS = [
  { name: 'Weekend Movie & Popcorn', amount: 350, category: 'Entertainment' },
  { name: 'Swiggy Dinner Feast', amount: 650, category: 'Food & Groceries' },
  { name: 'Brand Sneakers / Shoes', amount: 1500, category: 'Shopping' },
  { name: 'Weekend Roadtrip Split', amount: 2400, category: 'Transport' },
  { name: 'Noise-Cancelling Headphones', amount: 3200, category: 'Shopping' },
]

export default function PurchaseSimulator() {
  const { financials, addTransaction, data } = useFinance()

  const [itemName, setItemName] = useState('Campus Sneakers')
  const [amount, setAmount] = useState('1500')
  const [category, setCategory] = useState('Shopping')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Real-time calculation of simulated state
  const simulation = useMemo(() => {
    const num = Number(amount)
    if (!amount || isNaN(num) || num <= 0) return null

    return simulatePurchase({
      baseFinancials: financials,
      amount: num,
      category,
      name: itemName || 'Simulated Item',
    })
  }, [financials, amount, category, itemName])

  // Execute purchase into real database/state
  const handleConfirmPurchase = () => {
    if (!simulation) return

    addTransaction({
      description: itemName.trim() || 'Simulated Purchase',
      amount: simulation.item.amount,
      type: 'expense',
      category: simulation.item.category,
      day: data.currentDay,
    })

    // Confetti if affordable
    if (simulation.verdict.type === 'affordable') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        })
      } catch {
        // ignore
      }
    }

    setConfirmOpen(false)
  }

  const applyPreset = (preset) => {
    setItemName(preset.name)
    setAmount(String(preset.amount))
    setCategory(preset.category)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Card */}
      <div className="card" style={{ background: 'var(--hero-gradient)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-lime-muted)',
              color: 'var(--accent-lime)',
              display: 'flex',
            }}
          >
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              “Can I Afford This?” — Purchase Simulator
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Test any expense against your ₹10,000 budget before spending a single rupee. Previewing never alters your real balance.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', marginBottom: '8px' }}>
            Quick Test Scenarios:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => applyPreset(p)}
                style={{ fontSize: '0.775rem' }}
              >
                <span>{p.name}</span>
                <span className="font-mono" style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>
                  ₹{p.amount.toLocaleString('en-IN')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Simulator Controls */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Configure Potential Purchase
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sim-item-name">Item / Service Name</label>
            <input
              id="sim-item-name"
              type="text"
              className="form-input"
              placeholder="e.g. Running Shoes, Concert, Cafe Date"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sim-item-amount">Purchase Price (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontWeight: 600 }} aria-hidden="true">
                ₹
              </span>
              <input
                id="sim-item-amount"
                type="number"
                min="10"
                step="10"
                className="form-input font-mono"
                style={{ paddingLeft: '28px', fontSize: '1.05rem', fontWeight: 700 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sim-item-category">Spending Category</label>
            <select
              id="sim-item-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {TRANSACTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Slider for quick interactive test */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <label htmlFor="sim-price-slider">Interactive Slider: Adjust Price</label>
            <span className="font-mono">Range: ₹50 — ₹5,000</span>
          </div>
          <input
            id="sim-price-slider"
            type="range"
            min="50"
            max="5000"
            step="50"
            value={Number(amount) || 0}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Adjust simulated purchase price"
            style={{
              width: '100%',
              accentColor: 'var(--accent-lime)',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* Dynamic Results & Side-by-Side Comparison */}
      {simulation ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dynamic Verdict Banner */}
          <div
            className="card"
            style={{
              padding: '24px',
              borderLeft: `6px solid ${
                simulation.verdict.type === 'shortfall'
                  ? 'var(--status-danger)'
                  : simulation.verdict.type === 'risky'
                  ? 'var(--status-warning)'
                  : simulation.verdict.type === 'compromise'
                  ? 'var(--status-warning)'
                  : 'var(--accent-lime)'
              }`,
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className={`badge ${
                  simulation.verdict.type === 'shortfall'
                    ? 'badge-danger'
                    : simulation.verdict.type === 'risky'
                    ? 'badge-warning'
                    : simulation.verdict.type === 'compromise'
                    ? 'badge-warning'
                    : 'badge-lime'
                }`} style={{ fontSize: '0.8rem', padding: '4px 12px', marginBottom: '8px' }}>
                  DECISION ENGINE VERDICT
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                  {simulation.verdict.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5, maxWidth: '850px' }}>
                  {simulation.verdict.reasoning}
                </p>
                <div className="panel-subtle" style={{ marginTop: '12px' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.825rem' }}>Strategic Recommendation: </strong>
                  <span style={{ color: 'var(--accent-lime)', fontSize: '0.825rem' }}>
                    {simulation.verdict.recommendation}
                  </span>
                </div>
              </div>

              {/* Commit Purchase CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                <button
                  type="button"
                  className={`btn btn-lg ${
                    simulation.verdict.type === 'shortfall'
                      ? 'btn-danger'
                      : simulation.verdict.type === 'risky'
                      ? 'btn-secondary'
                      : 'btn-primary'
                  }`}
                  style={{ width: '100%' }}
                  onClick={() => setConfirmOpen(true)}
                >
                  <ShoppingBag size={18} />
                  <span>Commit Purchase</span>
                </button>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Requires explicit confirmation
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Impact Matrix */}
          <div className="card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Side-by-Side Consequence Analysis
            </h4>

            {/* Desktop / Tablet Table View */}
            <div className="desktop-table-view table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.775rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>Financial Dimension</th>
                    <th style={{ padding: '12px 14px' }}>Current State</th>
                    <th style={{ padding: '12px 14px' }}>After Purchase</th>
                    <th style={{ padding: '12px 14px' }}>Net Impact (Delta)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Remaining Cash */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Remaining Cash in Hand
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {formatCurrency(simulation.current.cash)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(simulation.simulated.cash)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--status-danger)', fontWeight: 600 }}>
                      -{formatCurrency(simulation.item.amount)}
                    </td>
                  </tr>

                  {/* Row 2: Spendable Balance */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Spendable Balance (Uncommitted)
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {formatCurrency(simulation.current.spendable)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px', fontWeight: 700, color: simulation.simulated.spendable >= 0 ? 'var(--accent-lime)' : 'var(--status-danger)' }}>
                      {formatCurrency(simulation.simulated.spendable)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--status-danger)', fontWeight: 600 }}>
                      -{formatCurrency(simulation.item.amount)}
                    </td>
                  </tr>

                  {/* Row 3: Safe Daily Allowance */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Safe Daily Spending Allowance
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {formatCurrency(simulation.current.dailyAllowance)}/day
                    </td>
                    <td className="font-mono" style={{ padding: '14px', fontWeight: 700, color: simulation.simulated.dailyAllowance >= 150 ? 'var(--accent-lime)' : 'var(--status-warning)' }}>
                      {formatCurrency(simulation.simulated.dailyAllowance)}/day
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--status-danger)', fontWeight: 600 }}>
                      {simulation.delta.dailyAllowance} / day
                    </td>
                  </tr>

                  {/* Row 4: Projected Month-End */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Projected Day 30 Balance
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {formatCurrency(simulation.current.monthEnd)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px', fontWeight: 700, color: simulation.simulated.monthEnd >= 0 ? 'var(--accent-lime)' : 'var(--status-danger)' }}>
                      {formatCurrency(simulation.simulated.monthEnd)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--status-danger)', fontWeight: 600 }}>
                      -{formatCurrency(simulation.item.amount)}
                    </td>
                  </tr>

                  {/* Row 5: Financial Health */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Financial Health Score
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {simulation.current.healthScore}/100
                    </td>
                    <td className="font-mono" style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {simulation.simulated.healthScore}/100
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: simulation.delta.healthScore < 0 ? 'var(--status-danger)' : 'var(--accent-lime)', fontWeight: 600 }}>
                      {simulation.delta.healthScore} pts
                    </td>
                  </tr>

                  {/* Row 6: Financial Risk Level */}
                  <tr>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Financial Risk Level
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {simulation.current.riskLevel} ({simulation.current.riskScore}/100)
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: simulation.simulated.riskScore >= 60 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                      {simulation.simulated.riskLevel} ({simulation.simulated.riskScore}/100)
                    </td>
                    <td className="font-mono" style={{ padding: '14px', color: simulation.delta.riskScore > 0 ? 'var(--status-danger)' : 'var(--accent-lime)', fontWeight: 600 }}>
                      +{simulation.delta.riskScore} risk pts
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (<680px) */}
            <div className="mobile-card-list">
              {[
                { label: 'Remaining Cash', cur: formatCurrency(simulation.current.cash), sim: formatCurrency(simulation.simulated.cash), delta: `-${formatCurrency(simulation.item.amount)}` },
                { label: 'Spendable Balance', cur: formatCurrency(simulation.current.spendable), sim: formatCurrency(simulation.simulated.spendable), delta: `-${formatCurrency(simulation.item.amount)}` },
                { label: 'Safe Daily Allowance', cur: `${formatCurrency(simulation.current.dailyAllowance)}/day`, sim: `${formatCurrency(simulation.simulated.dailyAllowance)}/day`, delta: `${simulation.delta.dailyAllowance}/day` },
                { label: 'Projected Month-End', cur: formatCurrency(simulation.current.monthEnd), sim: formatCurrency(simulation.simulated.monthEnd), delta: `-${formatCurrency(simulation.item.amount)}` },
                { label: 'Financial Health', cur: `${simulation.current.healthScore}/100`, sim: `${simulation.simulated.healthScore}/100`, delta: `${simulation.delta.healthScore} pts` },
              ].map((row, idx) => (
                <div key={idx} className="panel-subtle" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{row.label}</span>
                    <span className="badge badge-danger font-mono" style={{ fontSize: '0.7rem' }}>{row.delta}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Before: <strong className="font-mono" style={{ color: 'var(--text-secondary)' }}>{row.cur}</strong></span>
                    <span>After: <strong className="font-mono" style={{ color: 'var(--accent-lime)' }}>{row.sim}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Savings Goal Feasibility Status */}
            <div style={{ marginTop: '20px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={18} style={{ color: simulation.verdict.savingsAchievable ? 'var(--accent-lime)' : 'var(--status-warning)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Savings Goal Feasibility:
                </span>
                <strong style={{ fontSize: '0.85rem', color: simulation.verdict.savingsAchievable ? 'var(--accent-lime)' : 'var(--status-warning)' }}>
                  {simulation.verdict.savingsAchievable ? 'Goals Remain Achievable' : 'May Delay Savings Targets'}
                </strong>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ring-fenced reserves (₹{financials.savingsReserved.toLocaleString('en-IN')}) stay protected
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter an amount above to see instant mathematical decision analysis.
          </p>
        </div>
      )}

      {/* Confirmation Dialog before committing purchase */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmPurchase}
        title="Commit Simulated Purchase?"
        message={`Are you sure you want to commit this ₹${Number(amount).toLocaleString('en-IN')} expense for "${itemName}"? This will officially deduct it from your Day ${data.currentDay} cash balance.`}
        confirmText="Yes, Record Expense"
        danger={simulation?.verdict?.type === 'shortfall'}
      />
    </div>
  )
}

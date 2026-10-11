import React, { useState, useMemo } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Stethoscope,
  Wrench,
  AlertCircle,
} from 'lucide-react'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'
import { simulateEmergency } from '../utils/financeCalculations'
import ConfirmDialog from './ConfirmDialog'

const EMERGENCY_PRESETS = [
  {
    amount: 500,
    title: 'Minor Surprise',
    example: 'Urgent Pharmacy Medicine or Lost Metro Card',
    icon: Stethoscope,
    severity: 'Mild',
  },
  {
    amount: 1500,
    title: 'Moderate Shock',
    example: 'Laptop Charger Replacement or Auto Breakdown',
    icon: Wrench,
    severity: 'Elevated',
  },
  {
    amount: 3000,
    title: 'Major Crisis',
    example: 'Urgent Medical Scan, Room Security Deposit',
    icon: ShieldAlert,
    severity: 'Severe',
  },
]

export default function UnexpectedExpenseSimulator() {
  const { financials, addTransaction, data } = useFinance()
  const [selectedAmount, setSelectedAmount] = useState(1500)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const activeAmount = isCustom ? Number(customAmount) || 0 : selectedAmount

  const simulation = useMemo(() => {
    if (!activeAmount || activeAmount <= 0) return null
    return simulateEmergency({
      baseFinancials: financials,
      amount: activeAmount,
    })
  }, [financials, activeAmount])

  const handleApplyEmergency = () => {
    if (!simulation) return

    addTransaction({
      description: `Emergency Shock Expense (₹${activeAmount})`,
      amount: activeAmount,
      type: 'expense',
      category: 'Emergency',
      day: data.currentDay,
    })

    setConfirmOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Card */}
      <div className="card" style={{ background: 'var(--hero-gradient)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-warning-muted)',
              color: 'var(--status-warning)',
              display: 'flex',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Unexpected Expense Simulator (Stress Test)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Life happens. Stress-test how your ₹10,000 monthly runway absorbs unexpected shocks without going into debt.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Cards & Custom Input */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.02em' }}>
          Select Stress Test Magnitude
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {EMERGENCY_PRESETS.map((preset) => {
            const Icon = preset.icon
            const isCurrent = !isCustom && selectedAmount === preset.amount
            return (
              <div
                key={preset.amount}
                className="card"
                onClick={() => {
                  setIsCustom(false)
                  setSelectedAmount(preset.amount)
                }}
                style={{
                  cursor: 'pointer',
                  border: isCurrent ? '2px solid var(--status-warning)' : '1px solid var(--border-subtle)',
                  backgroundColor: isCurrent ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)',
                  transform: isCurrent ? 'scale(1.02)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} style={{ color: 'var(--status-warning)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {preset.title}
                    </span>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                    {preset.severity}
                  </span>
                </div>

                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  ₹{preset.amount.toLocaleString('en-IN')}
                </div>

                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {preset.example}
                </p>
              </div>
            )
          })}

          {/* Custom Card */}
          <div
            className="card"
            onClick={() => setIsCustom(true)}
            style={{
              cursor: 'pointer',
              border: isCustom ? '2px solid var(--accent-lime)' : '1px solid var(--border-subtle)',
              backgroundColor: isCustom ? 'rgba(163, 230, 53, 0.05)' : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Custom Shock
              </span>
              <span className="badge badge-lime" style={{ fontSize: '0.7rem' }}>Custom</span>
            </div>

            <div style={{ position: 'relative', marginTop: '6px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                ₹
              </span>
              <input
                type="number"
                min="10"
                step="50"
                placeholder="Enter amount"
                className="form-input font-mono"
                style={{ paddingLeft: '28px' }}
                value={customAmount}
                onChange={(e) => {
                  setIsCustom(true)
                  setCustomAmount(e.target.value)
                }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Simulate any arbitrary emergency expense
            </p>
          </div>
        </div>
      </div>

      {/* Stress Test Impact Display */}
      {simulation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Verdict */}
          <div
            className="card"
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: `6px solid ${
                simulation.simulated.spendable < 0
                  ? 'var(--status-danger)'
                  : simulation.simulated.dailyAllowance < 100
                  ? 'var(--status-warning)'
                  : 'var(--accent-lime)'
              }`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className={`badge ${
                  simulation.simulated.spendable < 0 ? 'badge-danger' : 'badge-warning'
                }`}>
                  SIMULATION PREVIEW ONLY
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                  Impact of Sudden ₹{activeAmount.toLocaleString('en-IN')} Expense
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '800px', lineHeight: 1.5 }}>
                  {simulation.simulated.spendable < 0
                    ? `FATAL BLOW: This shock will wipe out your spendable cash and leave you short by ₹${Math.abs(simulation.simulated.spendable).toLocaleString('en-IN')} on upcoming bills. You would need emergency borrowing or dipping into your ₹${financials.savingsReserved.toLocaleString('en-IN')} savings cushion.`
                    : `SURVIVABLE: Your budget can absorb this shock. Your daily allowance will adjust from ₹${simulation.current.dailyAllowance}/day down to ₹${simulation.simulated.dailyAllowance}/day for the remaining ${financials.daysRemaining} days.`}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-danger btn-lg"
                onClick={() => setConfirmOpen(true)}
              >
                <AlertCircle size={18} />
                <span>Apply Shock to Budget</span>
              </button>
            </div>
          </div>

          {/* Impact Comparison Cards */}
          <div className="grid-cols-4">
            <div className="card">
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Remaining Spendable
              </span>
              <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: simulation.simulated.spendable >= 0 ? 'var(--accent-lime)' : 'var(--status-danger)', marginTop: '6px' }}>
                {formatCurrency(simulation.simulated.spendable)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>
                Was {formatCurrency(simulation.current.spendable)} (-₹{activeAmount.toLocaleString('en-IN')})
              </span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                New Daily Allowance
              </span>
              <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                {formatCurrency(simulation.simulated.dailyAllowance)}/day
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>
                Drops by {Math.abs(simulation.delta.dailyAllowance)}/day
              </span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                New Health Score
              </span>
              <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                {simulation.simulated.healthScore}/100
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>
                {simulation.delta.healthScore} pts penalty
              </span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Risk Level Shift
              </span>
              <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: simulation.simulated.riskScore >= 60 ? 'var(--status-danger)' : 'var(--status-warning)', marginTop: '6px' }}>
                {simulation.simulated.riskLevel}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>
                Score: {simulation.simulated.riskScore}/100 (+{simulation.delta.riskScore})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleApplyEmergency}
        title="Apply Unexpected Shock Expense?"
        message={`Confirm adding a sudden emergency expense of ₹${activeAmount.toLocaleString('en-IN')}. This will be logged to your actual ledger on Day ${data.currentDay}.`}
        confirmText="Confirm Emergency Expense"
        danger={true}
      />
    </div>
  )
}

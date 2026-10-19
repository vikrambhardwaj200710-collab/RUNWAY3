import React from 'react'
import {
  LayoutDashboard,
  HelpCircle,
  AlertTriangle,
  Receipt,
  ArrowLeftRight,
  PiggyBank,
  LineChart,
  RotateCcw,
  FastForward,
  X,
} from 'lucide-react'
import { useFinance } from '../context/useFinance'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'simulator', label: 'Can I Afford This?', icon: HelpCircle, badge: 'Key Feature' },
  { id: 'emergency', label: 'Shock Simulator', icon: AlertTriangle },
  { id: 'commitments', label: 'Bills & Subscriptions', icon: Receipt },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
  { id: 'forecast', label: 'Forecast & Trends', icon: LineChart },
]

export default function Sidebar({ mobileOpen, setMobileOpen, onResetClick }) {
  const { activeTab, setActiveTab, data, financials, advanceDay, setDay } = useFinance()
  const daysProgress = Math.round((data.currentDay / data.totalDays) * 100)

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-lime)',
              color: '#090c10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.15rem',
              boxShadow: 'var(--shadow-glow-lime)',
            }}
          >
            R
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                RUNWAY
              </span>
              <span className="badge badge-lime" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                ₹10K
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
              Survive the 30-Day Month
            </p>
          </div>
        </div>

        {/* Mobile Close Drawer Button */}
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          aria-label="Close navigation drawer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }} aria-label="Main Navigation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id)
                  if (setMobileOpen) setMobileOpen(false)
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--accent-lime)' : 'var(--text-muted)' }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    className="badge badge-lime"
                    style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* 30-Day Timeline Widget */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--sidebar-timeline-bg)',
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              CHALLENGE TIMELINE
            </span>
            <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-lime)' }}>
              Day {data.currentDay}/30
            </span>
          </div>

          {/* Interactive day slider */}
          <input
            type="range"
            min="1"
            max="30"
            value={data.currentDay}
            onChange={(e) => setDay(Number(e.target.value))}
            aria-label="Simulation day slider (Day 1 to 30)"
            aria-valuenow={data.currentDay}
            aria-valuemin={1}
            aria-valuemax={30}
            style={{
              width: '100%',
              accentColor: 'var(--accent-lime)',
              cursor: 'pointer',
              height: '5px',
              display: 'block',
              margin: '6px 0',
            }}
            title="Drag to simulate day progression across the month"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>{financials.daysRemaining} days left</span>
            <span>{daysProgress}% elapsed</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, padding: '7px 8px', fontSize: '0.75rem' }}
            onClick={() => advanceDay(1)}
            title="Advance the challenge simulation by 1 day"
            aria-label="Advance simulation by 1 day"
          >
            <FastForward size={14} />
            +1 Day
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '7px 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            onClick={onResetClick}
            title="Reset demo data to initial ₹10,000 state"
            aria-label="Reset demo data to initial ₹10,000 state"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

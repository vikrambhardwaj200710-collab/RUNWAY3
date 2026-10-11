import React from 'react'
import { Menu, Plus, HelpCircle, Download, Sun, Moon } from 'lucide-react'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'

export default function Navbar({ onOpenMobileMenu, onOpenAddTx }) {
  const { data, financials, activeTab, setActiveTab, exportData, theme, toggleTheme } = useFinance()

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Financial Command Center'
      case 'simulator':
        return 'Can I Afford This? — Decision Engine'
      case 'emergency':
        return 'Surprise Shock Simulator'
      case 'commitments':
        return 'Fixed Commitments & Subscriptions'
      case 'transactions':
        return 'Transaction Ledger'
      case 'savings':
        return 'Targeted Savings Cushion'
      case 'forecast':
        return 'Monthly Trajectory & Burn Forecast'
      default:
        return 'RUNWAY'
    }
  }

  return (
    <header className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation Menu"
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {getPageTitle()}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Budget: ₹10,000 | Challenge Day {data.currentDay} of 30 ({financials.daysRemaining} days left)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Spendable Buffer Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
          }}
          className="hidden-mobile"
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spendable:</span>
          <span
            className="font-mono"
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: financials.spendableBalance >= 0 ? 'var(--accent-lime)' : 'var(--status-danger)',
            }}
          >
            {formatCurrency(financials.spendableBalance)}
          </span>
        </div>

        {/* Quick Simulator CTA */}
        {activeTab !== 'simulator' && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('simulator')}
          >
            <HelpCircle size={15} style={{ color: 'var(--accent-lime)' }} />
            <span>Simulate</span>
          </button>
        )}

        {/* Export JSON backup button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={exportData}
          title="Export and download JSON state backup"
        >
          <Download size={15} />
          <span className="hidden-mobile">Backup</span>
        </button>

        {/* Day / Night Mode Toggle */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Night (Dark)' : 'Day (Light)'} Mode`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {theme === 'light' ? (
            <Moon size={15} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Sun size={15} style={{ color: 'var(--accent-lime)' }} />
          )}
          <span className="hidden-mobile" style={{ fontSize: '0.8rem' }}>
            {theme === 'light' ? 'Night' : 'Day'}
          </span>
        </button>

        {/* Add Transaction Button */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenAddTx}
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .hidden-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}

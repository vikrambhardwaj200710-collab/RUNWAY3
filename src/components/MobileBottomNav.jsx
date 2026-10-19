import React, { useState } from 'react'
import {
  LayoutDashboard,
  HelpCircle,
  Receipt,
  ArrowLeftRight,
  MoreHorizontal,
  AlertTriangle,
  PiggyBank,
  LineChart,
  X,
} from 'lucide-react'
import { useFinance } from '../context/useFinance'

const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'simulator', label: 'Simulate', icon: HelpCircle },
  { id: 'commitments', label: 'Bills', icon: Receipt },
  { id: 'transactions', label: 'Ledger', icon: ArrowLeftRight },
]

const SECONDARY_TABS = [
  { id: 'emergency', label: 'Shock Simulator', icon: AlertTriangle, desc: 'Emergency expense stress tests' },
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank, desc: 'Ring-fenced financial cushions' },
  { id: 'forecast', label: 'Forecast & Trends', icon: LineChart, desc: '30-day burn rate & trajectory' },
]

export default function MobileBottomNav() {
  const { activeTab, setActiveTab } = useFinance()
  const [moreOpen, setMoreOpen] = useState(false)

  const isSecondaryActive = SECONDARY_TABS.some((tab) => tab.id === activeTab)

  return (
    <>
      {/* Mobile Bottom Sheet Overlay for 'More' */}
      {moreOpen && (
        <div
          className="mobile-more-overlay"
          onClick={() => setMoreOpen(false)}
          role="presentation"
        >
          <div
            className="mobile-more-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="More Features"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Additional Financial Modules
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SECONDARY_TABS.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id)
                      setMoreOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--accent-lime-muted)' : 'var(--bg-elevated)',
                      border: '1px solid',
                      borderColor: isActive ? 'rgba(22, 163, 74, 0.3)' : 'var(--border-subtle)',
                      color: isActive ? 'var(--accent-lime)' : 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <Icon size={20} style={{ color: isActive ? 'var(--accent-lime)' : 'var(--text-muted)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Dock */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {PRIMARY_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id)
                setMoreOpen(false)
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={19} />
              <span>{tab.label}</span>
            </button>
          )
        })}

        {/* More Button */}
        <button
          type="button"
          className={`mobile-tab-btn ${isSecondaryActive || moreOpen ? 'active' : ''}`}
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          aria-label="More navigation options"
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <MoreHorizontal size={19} />
            {isSecondaryActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-3px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-lime)',
                }}
              />
            )}
          </div>
          <span>More</span>
        </button>

        <style>{`
          .mobile-bottom-nav {
            display: none;
          }
          .mobile-more-overlay {
            display: none;
          }
          @media (max-width: 768px) {
            .mobile-bottom-nav {
              display: flex;
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 64px;
              background-color: var(--bg-surface);
              backdrop-filter: blur(16px);
              border-top: 1px solid var(--border-subtle);
              align-items: center;
              justify-content: space-around;
              z-index: 50;
              padding: 0 8px;
              padding-bottom: env(safe-area-inset-bottom, 0px);
            }
            .mobile-tab-btn {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 4px;
              background: transparent;
              border: none;
              color: var(--text-muted);
              font-size: 0.72rem;
              font-weight: 500;
              cursor: pointer;
              padding: 8px 4px;
              min-height: 48px;
              min-width: 48px;
              flex: 1;
              transition: color 0.15s ease;
            }
            .mobile-tab-btn.active {
              color: var(--accent-lime);
              font-weight: 700;
            }
            .mobile-tab-btn:focus-visible {
              outline: 2px solid var(--accent-lime);
              outline-offset: -2px;
            }
            .mobile-more-overlay {
              display: flex;
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.55);
              backdrop-filter: blur(4px);
              z-index: 60;
              align-items: flex-end;
              animation: appleFadeIn 0.2s ease;
            }
            .mobile-more-sheet {
              width: 100%;
              background-color: var(--bg-card);
              border-top: 1px solid var(--border-medium);
              border-radius: var(--radius-xl) var(--radius-xl) 0 0;
              padding: 20px 18px;
              padding-bottom: 84px;
              box-shadow: var(--shadow-lg);
              animation: appleScaleUp 0.25s var(--ease-apple);
            }
          }
        `}</style>
      </nav>
    </>
  )
}


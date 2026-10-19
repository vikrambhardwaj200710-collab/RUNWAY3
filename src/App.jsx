import React, { useState, Suspense, lazy } from 'react'
import { FinanceProvider } from './context/FinanceContext'
import { useFinance } from './context/useFinance'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import AddTransactionModal from './components/AddTransactionModal'
import ConfirmDialog from './components/ConfirmDialog'
import Toast from './components/Toast'
import MobileBottomNav from './components/MobileBottomNav'

// Lazy-load non-critical views so above-the-fold Dashboard renders instantly with minimal bundle payload
const PurchaseSimulator = lazy(() => import('./components/PurchaseSimulator'))
const UnexpectedExpenseSimulator = lazy(() => import('./components/UnexpectedExpenseSimulator'))
const CommitmentsManager = lazy(() => import('./components/CommitmentsManager'))
const TransactionsManager = lazy(() => import('./components/TransactionsManager'))
const SavingsManager = lazy(() => import('./components/SavingsManager'))
const ForecastAnalytics = lazy(() => import('./components/ForecastAnalytics'))

// Minimal accessible loading fallback for lazy-loaded sections
function SectionLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '320px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            border: '2px solid var(--border-medium)',
            borderTopColor: 'var(--accent-lime)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
        <span>Loading financial module...</span>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function AppContent() {
  const { activeTab, resetDemoData } = useFinance()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [addTxOpen, setAddTxOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenAddTx={() => setAddTxOpen(true)} />
      case 'simulator':
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <PurchaseSimulator />
          </Suspense>
        )
      case 'emergency':
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <UnexpectedExpenseSimulator />
          </Suspense>
        )
      case 'commitments':
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <CommitmentsManager />
          </Suspense>
        )
      case 'transactions':
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <TransactionsManager onOpenAddTx={() => setAddTxOpen(true)} />
          </Suspense>
        )
      case 'savings':
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <SavingsManager />
          </Suspense>
        )
      case 'forecast':
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <ForecastAnalytics />
          </Suspense>
        )
      default:
        return <Dashboard onOpenAddTx={() => setAddTxOpen(true)} />
    }
  }

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onResetClick={() => setResetConfirmOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenAddTx={() => setAddTxOpen(true)}
        />

        <main className="content-body" id="main-content" tabIndex={-1}>
          {renderActiveScreen()}
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileBottomNav />

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={addTxOpen}
        onClose={() => setAddTxOpen(false)}
      />

      {/* Reset Demo Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset to Day 1 Baseline?"
        message="This will restore the initial ₹10,000 budget, reset the timeline to Day 1, and clear custom transactions. Your essential commitments will remain ready to track."
        confirmText="Reset to Day 1"
        danger={false}
      />

      {/* Action Toast Notifications */}
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}

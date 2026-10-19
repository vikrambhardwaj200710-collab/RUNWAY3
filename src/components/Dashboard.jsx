import React from 'react'
import {
  Wallet,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ArrowDownLeft,
  Sparkles,
  HelpCircle,
  Plus,
  Flame,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'
import MetricCard from './MetricCard'
import { getCategoryMeta } from '../utils/categoryIcons'

export default function Dashboard({ onOpenAddTx }) {
  const { financials, data, setActiveTab, toggleCommitmentPaid } = useFinance()

  // Burn pace calculation
  const burnRatio = financials.idealBurnToDate > 0
    ? Math.round((financials.actualExpenses / financials.idealBurnToDate) * 100)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Banner / Headline */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--hero-gradient)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-lime">Challenge Active</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Day {data.currentDay} of 30
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Survival Status: {financials.health.grade}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            You have <strong style={{ color: 'var(--accent-lime)' }}>{formatCurrency(financials.spendableBalance)}</strong> free to spend over the remaining <strong style={{ color: 'var(--text-primary)' }}>{financials.daysRemaining} days</strong>.
          </p>
        </div>

        {/* Quick Decision CTA */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveTab('simulator')}
            style={{ boxShadow: 'var(--shadow-glow-lime)' }}
          >
            <HelpCircle size={16} />
            <span>Can I Afford This?</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenAddTx}
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 30-Day Survival Streak & Discipline Engine (Signature Innovation) */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: burnRatio <= 100 ? 'var(--accent-lime-muted)' : 'var(--status-warning-muted)',
              color: burnRatio <= 100 ? 'var(--accent-lime)' : 'var(--status-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            <Flame size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Day {data.currentDay} Survival Streak
              </span>
              <span className={`badge ${burnRatio <= 100 ? 'badge-lime' : 'badge-warning'}`}>
                {burnRatio <= 100 ? 'Disciplined Burn' : 'Pacing Alert'}
              </span>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {data.currentDay < 7
                ? 'Level 1: Budget Recruit — Building daily survival habit'
                : data.currentDay < 15
                ? 'Level 2: Spartan Pacer — Successfully navigating initial commitments'
                : data.currentDay < 25
                ? 'Level 3: Strategic Survivor — Deep runway discipline achieved'
                : 'Level 4: Runway Master — Approaching month-end victory!'}
            </p>
          </div>
        </div>

        {/* Gamified Achievement Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            className="badge badge-neutral"
            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="All bills due to date are fully settled or accounted for"
          >
            <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Bill Shield</span>
          </div>

          <div
            className="badge badge-neutral"
            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Safe daily spending allowance meets survival threshold"
          >
            <CheckCircle size={14} style={{ color: financials.safeDailyAllowance >= 120 ? 'var(--accent-lime)' : 'var(--status-warning)' }} />
            <span>{financials.safeDailyAllowance >= 120 ? 'Viable Runway' : 'Tight Pacing'}</span>
          </div>

          <div
            className="badge badge-neutral font-mono"
            style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-lime)' }}
          >
            {financials.daysRemaining} Days to Victory
          </div>
        </div>
      </div>

      {/* 4 Core Hero Metric Cards */}
      <div className="grid-cols-4">
        <MetricCard
          title="Spendable Balance"
          value={formatCurrency(financials.spendableBalance)}
          subtext={`After bills & savings ring-fence`}
          badge={financials.spendableBalance >= 0 ? 'Safe Buffer' : 'In Deficit'}
          badgeType={financials.spendableBalance >= 0 ? 'lime' : 'danger'}
          icon={Wallet}
          iconColor="var(--accent-lime)"
          highlight={true}
          tooltip="Cash left after deducting all upcoming unpaid bills and reserved savings"
        />

        <MetricCard
          title="Safe Daily Allowance"
          value={`${formatCurrency(financials.safeDailyAllowance)}/day`}
          subtext={`Over next ${financials.daysRemaining} days`}
          badge={financials.safeDailyAllowance >= 180 ? 'Comfortable' : 'Paced'}
          badgeType={financials.safeDailyAllowance >= 180 ? 'emerald' : 'warning'}
          icon={CalendarCheck}
          iconColor="var(--accent-emerald)"
          tooltip="Max spendable amount per remaining day to survive the ₹10,000 challenge without going broke"
        />

        <MetricCard
          title="Current Cash in Hand"
          value={formatCurrency(financials.currentCash)}
          subtext={`₹${financials.budget.toLocaleString('en-IN')} start + ₹${financials.incomeReceived.toLocaleString('en-IN')} in`}
          badge={`-₹${financials.actualExpenses.toLocaleString('en-IN')} spent`}
          badgeType="neutral"
          icon={TrendingUp}
          iconColor="var(--status-info)"
          tooltip="Starting budget + actual income received - actual expenses recorded"
        />

        <MetricCard
          title="Projected Month-End"
          value={formatCurrency(financials.projectedMonthEndBalance)}
          subtext={`Estimated balance on Day 30`}
          badge={financials.projectedMonthEndBalance >= 0 ? 'Surplus' : 'Deficit Risk'}
          badgeType={financials.projectedMonthEndBalance >= 0 ? 'lime' : 'danger'}
          icon={ShieldCheck}
          iconColor={financials.projectedMonthEndBalance >= 0 ? 'var(--accent-lime)' : 'var(--status-danger)'}
          tooltip="Current cash + expected income - unpaid bills - projected variable spending"
        />
      </div>

      {/* Financial Health & Risk Intelligence Section */}
      <div className="grid-cols-2">
        {/* Financial Health Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                FINANCIAL HEALTH SCORE
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {financials.health.score}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>/ 100</span>
                <span className={`badge ${financials.health.score >= 70 ? 'badge-emerald' : financials.health.score >= 50 ? 'badge-warning' : 'badge-danger'}`} style={{ marginLeft: '6px' }}>
                  {financials.health.grade}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SURVIVAL CHANCE</span>
              <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-lime)' }}>
                {Math.min(99, Math.max(10, financials.health.score + 5))}%
              </div>
            </div>
          </div>

          {/* Progress bar with WCAG AA track contrast */}
          <div
            className="progress-bar-track"
            style={{ marginBottom: '16px' }}
            role="progressbar"
            aria-valuenow={financials.health.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Financial Health Score Progress"
          >
            <div
              style={{
                width: `${financials.health.score}%`,
                height: '100%',
                backgroundColor: financials.health.score >= 70 ? 'var(--accent-emerald)' : financials.health.score >= 50 ? 'var(--status-warning)' : 'var(--status-danger)',
                borderRadius: '999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Health Contributing Factors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {financials.health.factors.map((f, i) => (
              <div
                key={i}
                className="panel-subtle"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: f.impact === 'positive' ? 'var(--accent-lime)' : f.impact === 'negative' ? 'var(--status-danger)' : 'var(--status-warning)',
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>{f.text}</span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {f.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Risk & Burn Pace Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                FINANCIAL RISK EVALUATION
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {financials.risk.level}
                </span>
                <span className={`badge ${financials.risk.level === 'Low' ? 'badge-emerald' : financials.risk.level === 'Moderate' ? 'badge-warning' : 'badge-danger'}`}>
                  Risk Score: {financials.risk.score}/100
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: financials.risk.level === 'Low' ? 'var(--accent-emerald-muted)' : 'var(--status-warning-muted)',
                color: financials.risk.level === 'Low' ? 'var(--accent-emerald)' : 'var(--status-warning)',
              }}
            >
              <AlertTriangle size={22} />
            </div>
          </div>

          {/* Burn rate linear benchmark comparison */}
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} style={{ color: 'var(--status-warning)' }} />
                Actual Burn vs Day {data.currentDay} Benchmark
              </span>
              <span className="font-mono" style={{ fontWeight: 700, color: burnRatio <= 100 ? 'var(--accent-lime)' : 'var(--status-danger)' }}>
                {formatCurrency(financials.actualExpenses)} / {formatCurrency(financials.idealBurnToDate)} ({burnRatio}%)
              </span>
            </div>

            <div
              className="progress-bar-track-sm"
              role="progressbar"
              aria-valuenow={Math.min(100, burnRatio)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Linear Burn Comparison Progress"
            >
              <div
                style={{
                  width: `${Math.min(100, burnRatio)}%`,
                  height: '100%',
                  backgroundColor: burnRatio <= 100 ? 'var(--accent-lime)' : 'var(--status-danger)',
                  borderRadius: '999px',
                }}
              />
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {financials.burnVariance <= 0
                ? `Under linear budget schedule by ${formatCurrency(Math.abs(financials.burnVariance))}. Great spending discipline!`
                : `Over linear budget schedule by ${formatCurrency(financials.burnVariance)}. Burn rate needs cooling.`}
            </p>
          </div>

          {/* Key Risk Flags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {financials.risk.factors.length > 0 ? (
              financials.risk.factors.map((rf, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ color: 'var(--status-danger)' }}>{rf.text}</span>
                  <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                    {rf.title}
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  fontSize: '0.8rem',
                  color: 'var(--accent-emerald)',
                }}
              >
                <CheckCircle size={15} />
                <span>No high risk vulnerabilities identified. Budget is stable.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Contextual Insights */}
      {financials.insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-lime)' }} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Actionable Intelligence & Recommendations
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {financials.insights.map((ins) => (
              <div
                key={ins.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  backgroundColor: 'var(--bg-surface)',
                  borderLeft: `4px solid ${
                    ins.type === 'danger'
                      ? 'var(--status-danger)'
                      : ins.type === 'warning'
                      ? 'var(--status-warning)'
                      : 'var(--accent-lime)'
                  }`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {ins.title}
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {ins.message}
                  </p>
                </div>
                {ins.action && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                    onClick={() => setActiveTab(ins.actionTab || 'simulator')}
                  >
                    <span>{ins.action}</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Section: Upcoming Bills & Recent Transactions */}
      <div className="grid-cols-2">
        {/* Upcoming Bills Widget */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Upcoming Commitments
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {formatCurrency(financials.upcomingUnpaidCommitments)} pending in remaining {financials.daysRemaining} days
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('commitments')}
            >
              Manage Bills
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.commitments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active commitments configured.
              </div>
            ) : (
              data.commitments.slice(0, 4).map((bill) => (
              <div
                key={bill.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {bill.title}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      Day {bill.dueDay}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {bill.category} • {bill.frequency}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(bill.amount)}
                  </span>
                  <button
                    type="button"
                    className={`btn btn-sm ${bill.isPaid ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => toggleCommitmentPaid(bill.id)}
                  >
                    {bill.isPaid ? 'Paid' : 'Mark Paid'}
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Recent Transactions Widget */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Transactions
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Latest spending activity from Day 1 to {data.currentDay}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('transactions')}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No spending activity recorded yet.
              </div>
            ) : (
              data.transactions.slice(0, 4).map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
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
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {tx.type === 'income' ? <ArrowDownLeft size={17} /> : React.createElement(getCategoryMeta(tx.category).icon, { size: 17 })}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {tx.description}
                      </div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        Day {tx.day} • {tx.category}
                      </span>
                    </div>
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontWeight: 700,
                      fontSize: '0.925rem',
                      color: tx.type === 'income' ? 'var(--accent-lime)' : 'var(--text-primary)',
                    }}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

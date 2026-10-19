import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { LineChart } from 'lucide-react'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'

const CATEGORY_COLORS = [
  '#a3e635', // lime
  '#38bdf8', // sky
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f97316', // orange
  '#64748b', // slate
]

// Custom Recharts Tooltip declared outside component to avoid re-creation on render
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: '0.8rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color, display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            <span>{entry.name}:</span>
            <strong className="font-mono">₹{entry.value?.toLocaleString('en-IN')}</strong>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ForecastAnalytics() {
  const { financials, data, theme } = useFinance()

  const actualColorHex = theme === 'dark' ? '#a3e635' : '#16a34a'
  const projectedColorHex = theme === 'dark' ? '#38bdf8' : '#0284c7'

  // 1. Generate 30-Day Cumulative Burn Trajectory Data
  const trajectoryData = useMemo(() => {
    const points = []
    let cumulativeActual = 0

    // Map actual expenses by day
    const dayExpenses = {}
    data.transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        dayExpenses[tx.day] = (dayExpenses[tx.day] || 0) + Number(tx.amount || 0)
      }
    })

    const baseDaily = financials.budget / financials.totalDays // ₹333.33/day

    for (let day = 1; day <= financials.totalDays; day++) {
      const idealBurn = Math.round(baseDaily * day)

      if (day <= data.currentDay) {
        cumulativeActual += dayExpenses[day] || 0
        points.push({
          day: `Day ${day}`,
          dayNumber: day,
          idealBurn,
          actualSpend: cumulativeActual,
          projectedSpend: cumulativeActual,
        })
      } else {
        // Projected future trajectory
        const projectedDaily = (financials.projectedVariableSpending / Math.max(1, financials.daysRemaining))
        const futureSpend = Math.round(cumulativeActual + (projectedDaily * (day - data.currentDay)))
        points.push({
          day: `Day ${day}`,
          dayNumber: day,
          idealBurn,
          projectedSpend: futureSpend,
        })
      }
    }
    return points
  }, [data, financials])

  // 2. Category Breakdown Chart Data
  const categoryData = useMemo(() => {
    const list = Object.entries(financials.categorySpending).map(([name, value]) => ({
      name,
      amount: value,
    }))
    return list.sort((a, b) => b.amount - a.amount)
  }, [financials.categorySpending])

  // Top category for dynamic optimization advice
  const topCategory = categoryData[0]

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
            <LineChart size={20} style={{ color: 'var(--accent-lime)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              30-Day Budget Burn & Forecast Engine
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Transparent financial trajectory showing where your ₹10,000 will land on Day 30 based on velocity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="badge badge-lime font-mono" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Safe Burn: {formatCurrency(financials.safeDailyAllowance)}/day
          </div>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Cumulative Spending vs Ideal 30-Day Benchmark
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Solid curve = Actual spend to date • Dashed curve = Projected trajectory to Day 30 • Line = Linear ₹10,000 guide
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--accent-lime)' }} />
              Actual Spend
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--status-info)' }} />
              Projected Spend
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '12px', height: '1px', backgroundColor: 'var(--text-muted)' }} />
              Linear Cap (₹10,000)
            </span>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={actualColorHex} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={actualColorHex} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="projectedColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={projectedColorHex} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={projectedColorHex} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} interval={3} />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="idealBurn"
                name="Linear Benchmark"
                stroke="var(--text-disabled)"
                strokeDasharray="4 4"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="projectedSpend"
                name="Projected Trajectory"
                stroke={projectedColorHex}
                fillOpacity={1}
                fill="url(#projectedColor)"
              />
              <Area
                type="monotone"
                dataKey="actualSpend"
                name="Actual Spend"
                stroke={actualColorHex}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#actualColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Category Breakdown & Forecast Math Reconciliation */}
      <div className="grid-cols-2">
        {/* Category Breakdown Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Spending Distribution by Category
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Total actual expenditure: {formatCurrency(financials.actualExpenses)}
          </p>

          {categoryData.length > 0 ? (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Spent" radius={[0, 6, 6, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No expenses recorded yet.
            </div>
          )}

          {/* Actionable Category Trim Insight */}
          {topCategory && (
            <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--accent-lime)', fontWeight: 600 }}>Smart Cutback Opportunity: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Your highest expense category is <strong>{topCategory.name}</strong> ({formatCurrency(topCategory.amount)}). A 20% cutback here would save <strong>{formatCurrency(Math.round(topCategory.amount * 0.2))}</strong>, expanding your daily allowance by +{formatCurrency(Math.floor((topCategory.amount * 0.2) / financials.daysRemaining))}/day!
              </span>
            </div>
          )}
        </div>

        {/* Forecast Math Reconciliation Table */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Day 30 Balance Reconciliation
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Mathematical breakdown of your end-of-month financial position
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Initial Starting Budget</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(financials.budget)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(+) Income Received</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-lime)' }}>
                +{formatCurrency(financials.incomeReceived)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(-) Actual Expenses to Day {data.currentDay}</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--status-danger)' }}>
                -{formatCurrency(financials.actualExpenses)}
              </span>
            </div>

            <div className="panel-subtle" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>(=) Current Cash in Hand</strong>
              <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(financials.currentCash)}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(-) Future Unpaid Commitments</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--status-warning)' }}>
                -{formatCurrency(financials.upcomingUnpaidCommitments)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(-) Estimated Variable Spending (Days {data.currentDay}–30)</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                -{formatCurrency(financials.projectedVariableSpending)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: financials.projectedMonthEndBalance >= 0 ? 'var(--accent-lime-muted)' : 'var(--status-danger-muted)', border: `1px solid ${financials.projectedMonthEndBalance >= 0 ? 'rgba(163, 230, 53, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>
                  (=) Estimated Day 30 Balance
                </strong>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {financials.projectedMonthEndBalance >= 0 ? 'Comfortable buffer' : 'Projected broke / shortfall'}
                </span>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: financials.projectedMonthEndBalance >= 0 ? 'var(--accent-lime)' : 'var(--status-danger)',
                }}
              >
                {formatCurrency(financials.projectedMonthEndBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

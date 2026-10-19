import React from 'react'

export default function MetricCard({
  title,
  value,
  subtext,
  badge,
  badgeType = 'neutral', // lime, emerald, warning, danger, info, neutral
  icon: Icon,
  iconColor = 'var(--text-secondary)',
  tooltip,
  highlight = false,
  className = '',
}) {
  return (
    <div
      className={`card ${highlight ? 'card-interactive' : ''} ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...(highlight ? { borderColor: 'rgba(163, 230, 53, 0.3)' } : {}),
      }}
      title={tooltip}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <div
          className="font-mono"
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '8px',
          }}
        >
          {value}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          {subtext && (
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              {subtext}
            </span>
          )}
          {badge && (
            <span className={`badge badge-${badgeType}`} style={{ marginLeft: 'auto' }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

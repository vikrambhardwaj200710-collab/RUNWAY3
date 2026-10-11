import React from 'react'
import { getCategoryMeta } from '../utils/categoryIcons'

export default function CategoryBadge({ category, size = 14 }) {
  const meta = getCategoryMeta(category)
  const Icon = meta.icon

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.725rem',
        fontWeight: 600,
        backgroundColor: meta.bgColor,
        color: meta.color,
        border: `1px solid ${meta.borderColor}`,
      }}
    >
      <Icon size={size} />
      <span>{category}</span>
    </span>
  )
}

import React from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { useFinance } from '../context/useFinance'

export default function Toast() {
  const { notification } = useFinance()
  if (!notification) return null

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--accent-lime)' }} />
      case 'danger':
        return <AlertCircle size={18} style={{ color: 'var(--status-danger)' }} />
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--status-warning)' }} />
      default:
        return <Info size={18} style={{ color: 'var(--status-info)' }} />
    }
  }

  return (
    <div className="toast-container">
      <div className="toast">
        {getIcon()}
        <span>{notification.message}</span>
      </div>
    </div>
  )
}

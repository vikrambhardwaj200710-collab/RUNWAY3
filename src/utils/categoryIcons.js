import {
  Utensils,
  Car,
  Home,
  Zap,
  Tv,
  Gamepad2,
  Dumbbell,
  GraduationCap,
  Laptop,
  ShoppingBag,
  AlertTriangle,
  CircleDollarSign,
  Heart,
  Briefcase,
} from 'lucide-react'

export const CATEGORY_META = {
  'Food & Groceries': {
    icon: Utensils,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  'Transport': {
    icon: Car,
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  'Housing': {
    icon: Home,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  'Utilities': {
    icon: Zap,
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.25)',
  },
  'Subscription': {
    icon: Tv,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.25)',
  },
  'Entertainment': {
    icon: Gamepad2,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  'Health & Fitness': {
    icon: Dumbbell,
    color: '#10b981',
    bgColor: 'rgba(160, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  'Education': {
    icon: GraduationCap,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  'Freelance': {
    icon: Briefcase,
    color: '#a3e635',
    bgColor: 'rgba(163, 230, 53, 0.12)',
    borderColor: 'rgba(163, 230, 53, 0.25)',
  },
  'Shopping': {
    icon: ShoppingBag,
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  'Emergency': {
    icon: AlertTriangle,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  'Safety Net': {
    icon: Heart,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  'Gear': {
    icon: Laptop,
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.12)',
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
}

export function getCategoryMeta(categoryName) {
  return (
    CATEGORY_META[categoryName] || {
      icon: CircleDollarSign,
      color: '#94a3b8',
      bgColor: 'rgba(148, 163, 184, 0.12)',
      borderColor: 'rgba(148, 163, 184, 0.25)',
    }
  )
}

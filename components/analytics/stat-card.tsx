'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  color?: string
  bgColor?: string
  subtitle?: string
  trend?: {
    value: number
    label: string
  }
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-primary',
  bgColor = 'bg-primary/10',
  subtitle,
  trend
}: StatCardProps) {
  return (
    <div className="border-2 border-black rounded-lg p-4 bg-card hover:shadow-md transition-shadow active:scale-[0.98]">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {trend && (
          <div className="text-right">
            <p className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </p>
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl md:text-4xl font-bold ${color}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  )
}

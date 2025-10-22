'use client'

interface CircularProgressProps {
  value: number // 0-100
  max: number
  label: string
  count: string
  color: string
  size?: number
}

export function CircularProgress({
  value,
  max,
  label,
  count,
  color,
  size = 120
}: CircularProgressProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Percentage in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-2xl font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{count}</p>
      </div>
    </div>
  )
}

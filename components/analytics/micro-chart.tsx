'use client'

interface MicroChartProps {
  data: Array<{
    date: string
    value: number
  }>
  color?: string
  height?: number
  showGradient?: boolean
}

export function MicroChart({
  data,
  color = 'hsl(var(--primary))',
  height = 60,
  showGradient = true
}: MicroChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm" style={{ height }}>
        No data
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  // Calculate points for SVG path
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 100
    return `${x},${y}`
  }).join(' ')

  // Create path string
  const pathPoints = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 100
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  // Create area path (for gradient fill)
  const areaPath = `${pathPoints} L 100 100 L 0 100 Z`

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="microGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Gradient fill area */}
        {showGradient && (
          <path
            d={areaPath}
            fill="url(#microGradient)"
          />
        )}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          )
        })}
      </svg>
    </div>
  )
}

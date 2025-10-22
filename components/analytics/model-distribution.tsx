'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ModelDistributionProps {
  data: Array<{
    model: string
    cost: number
    count: number
  }>
}

const COLORS = [
  'hsl(221, 83%, 53%)', // Blue
  'hsl(142, 71%, 45%)', // Green
  'hsl(45, 93%, 47%)', // Yellow
  'hsl(271, 81%, 56%)', // Purple
  'hsl(0, 84%, 60%)', // Red
  'hsl(174, 72%, 56%)', // Cyan
  'hsl(25, 95%, 53%)', // Orange
  'hsl(295, 69%, 61%)', // Pink
]

export function ModelDistribution({ data }: ModelDistributionProps) {
  // Calculate percentages
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0)
  const chartData = data.map((item) => ({
    ...item,
    percentage: totalCost > 0 ? (item.cost / totalCost) * 100 : 0,
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{item.model}</p>
          <p className="text-sm text-primary font-bold">${item.cost.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">{item.count} sessions</p>
          <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  // Custom label for desktop
  const renderLabel = (entry: any) => {
    if (entry.percentage < 5) return '' // Hide label if too small
    return `${entry.percentage.toFixed(0)}%`
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderLabel}
            outerRadius={60}
            fill="#8884d8"
            dataKey="cost"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry: any) => {
              const item = chartData.find((d) => d.model === value)
              return `${value} (${item?.count || 0})`
            }}
            wrapperStyle={{ fontSize: '10px' }}
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

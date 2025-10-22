'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CostChartProps {
  data: Array<{
    date: string
    cost: number
  }>
}

export function CostChart({ data }: CostChartProps) {
  // Format date for display (MM/DD)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // Format cost for tooltip
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
          <p className="text-sm text-primary font-bold">{formatCost(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            fontSize={10}
            tickMargin={5}
          />
          <YAxis
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            stroke="#6b7280"
            fontSize={10}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#000000"
            strokeWidth={2}
            dot={{ fill: '#000000', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

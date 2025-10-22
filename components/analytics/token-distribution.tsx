'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TokenDistributionProps {
  inputTokens: number
  outputTokens: number
  cachedTokens: number
}

export function TokenDistribution({ inputTokens, outputTokens, cachedTokens }: TokenDistributionProps) {
  const data = [
    {
      name: 'Input',
      tokens: inputTokens,
      fill: 'hsl(221, 83%, 53%)', // Blue
    },
    {
      name: 'Output',
      tokens: outputTokens,
      fill: 'hsl(142, 71%, 45%)', // Green
    },
    {
      name: 'Cached',
      tokens: cachedTokens,
      fill: 'hsl(45, 93%, 47%)', // Yellow
    },
  ]

  // Format large numbers with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.name} Tokens</p>
          <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={10}
          />
          <YAxis
            tickFormatter={formatNumber}
            stroke="#6b7280"
            fontSize={10}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
          <Bar dataKey="tokens" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} dataKey="tokens" fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

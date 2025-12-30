import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePortfolio } from '@/hooks/usePortfolio'
import { formatUSD, formatDate } from '@/lib/utils'

type TimeRange = '7d' | '30d' | '90d' | 'all'

export function NetWorthChart() {
  const { isConnected } = useAccount()
  const { history, summary, saveSnapshot } = usePortfolio()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  if (!isConnected) {
    return null
  }

  const now = Date.now()
  const ranges: Record<TimeRange, number> = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    'all': Infinity,
  }

  const filteredHistory = history.filter((snapshot) => {
    if (timeRange === 'all') return true
    return now - snapshot.timestamp < ranges[timeRange]
  })

  // Add current value as the latest point
  const chartData = [
    ...filteredHistory.map((snapshot) => ({
      date: formatDate(snapshot.timestamp),
      timestamp: snapshot.timestamp,
      value: snapshot.totalValue,
    })),
    {
      date: 'Now',
      timestamp: now,
      value: summary.totalValue,
    },
  ].sort((a, b) => a.timestamp - b.timestamp)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{data.date}</p>
          <p className="font-semibold">{formatUSD(data.value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card id="history">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Net Worth History</CardTitle>
          <div className="flex gap-2">
            <div className="flex gap-1">
              {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === 'all' ? 'All' : range}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={saveSnapshot}>
              Save Snapshot
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length <= 1 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No history data yet</p>
              <p className="text-sm">Click "Save Snapshot" to record your current portfolio value</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

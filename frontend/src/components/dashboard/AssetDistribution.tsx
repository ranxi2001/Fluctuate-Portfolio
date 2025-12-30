import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { usePortfolio } from '@/hooks/usePortfolio'
import { formatUSD } from '@/lib/utils'

export function AssetDistribution() {
  const { isConnected } = useAccount()
  const { summary } = usePortfolio()

  if (!isConnected || summary.distribution.length === 0) {
    return null
  }

  const data = summary.distribution.map((item) => ({
    name: item.symbol,
    value: item.value,
    percentage: item.percentage,
    color: item.color,
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof data[0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatUSD(item.value)} ({item.percentage.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          {summary.distribution.slice(0, 5).map((item) => (
            <div key={item.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.symbol}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{formatUSD(item.value)}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

import { TrendingUp, TrendingDown, DollarSign, PieChart, Wallet } from 'lucide-react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatUSD, formatPercentage } from '@/lib/utils'
import { usePortfolio } from '@/hooks/usePortfolio'

export function PortfolioSummary() {
  const { isConnected } = useAccount()
  const { summary, assets } = usePortfolio()

  if (!isConnected) {
    return null
  }

  const stats = [
    {
      title: 'Total Value',
      value: formatUSD(summary.totalValue),
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Total Assets',
      value: assets.length.toString(),
      icon: Wallet,
      color: 'text-blue-500',
    },
    {
      title: 'Total P/L',
      value: formatUSD(Math.abs(summary.profitLoss)),
      subValue: formatPercentage(summary.profitLossPercent),
      icon: summary.profitLoss >= 0 ? TrendingUp : TrendingDown,
      color: summary.profitLoss >= 0 ? 'text-success' : 'text-error',
      isProfit: summary.profitLoss >= 0,
    },
    {
      title: 'Top Asset',
      value: summary.distribution[0]?.symbol || '-',
      subValue: summary.distribution[0]
        ? `${summary.distribution[0].percentage.toFixed(1)}%`
        : '',
      icon: PieChart,
      color: 'text-purple-500',
    },
  ]

  return (
    <div id="dashboard" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.isProfit !== undefined ? stat.color : ''}`}>
              {stat.isProfit === false && '-'}{stat.value}
            </div>
            {stat.subValue && (
              <p className={`text-xs ${stat.isProfit !== undefined ? stat.color : 'text-muted-foreground'}`}>
                {stat.subValue}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

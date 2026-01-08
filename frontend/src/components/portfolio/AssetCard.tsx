import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatUSD, formatNumber, formatPercentage } from '@/lib/utils'
import { SUPPORTED_ASSETS } from '@/lib/constants'
import type { AssetWithPrice } from '@/types/asset'

interface AssetCardProps {
  asset: AssetWithPrice
  onEdit: () => void
  onDelete: () => void
  categoryColor: string
}

export function AssetCard({ asset, onEdit, onDelete, categoryColor }: AssetCardProps) {
  const hasProfitLoss = asset.profitLoss !== undefined

  // Find icon for preset assets
  const assetConfig = SUPPORTED_ASSETS.find(a => a.symbol === asset.symbol)
  const iconUrl = assetConfig?.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt={asset.symbol}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to initials on image load error
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${iconUrl ? 'hidden' : ''}`}
              style={{ backgroundColor: categoryColor }}
            >
              {asset.symbol.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold">{asset.symbol}</h3>
              <p className="text-sm text-muted-foreground">{asset.name}</p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-medium">{formatNumber(asset.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-medium">{formatUSD(asset.currentPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="font-semibold text-lg">{formatUSD(asset.value)}</p>
          </div>
          {hasProfitLoss && (
            <div>
              <p className="text-xs text-muted-foreground">P/L</p>
              <div className={`flex items-center gap-1 ${asset.profitLoss! >= 0 ? 'text-success' : 'text-error'
                }`}>
                {asset.profitLoss! >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {formatUSD(Math.abs(asset.profitLoss!))}
                </span>
                <span className="text-xs">
                  ({formatPercentage(asset.profitLossPercent!)})
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

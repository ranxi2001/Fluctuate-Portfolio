import type { Asset, AssetWithPrice } from './asset'

export interface Portfolio {
  assets: Asset[]
  lastUpdated: number
}

export interface PortfolioSnapshot {
  timestamp: number
  totalValue: number
  assetValues: Record<string, number>
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  profitLoss: number
  profitLossPercent: number
  assets: AssetWithPrice[]
  distribution: {
    symbol: string
    name: string
    value: number
    percentage: number
    color: string
  }[]
}

export interface PortfolioHistory {
  snapshots: PortfolioSnapshot[]
}

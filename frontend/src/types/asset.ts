export type AssetCategory = 'crypto' | 'stablecoin' | 'rwa' | 'fiat' | 'custom'

export interface Asset {
  id: string
  symbol: string
  name: string
  amount: number
  buyPrice?: number
  category: AssetCategory
  customPrice?: number
  addedAt: number
}

export interface AssetWithPrice extends Asset {
  currentPrice: number
  value: number
  profitLoss?: number
  profitLossPercent?: number
}

export interface AssetConfig {
  symbol: string
  name: string
  category: AssetCategory
  decimals: number
  hasPriceFeed: boolean
  fixedPrice?: number
}

export interface PriceData {
  symbol: string
  price: number
  timestamp: number
}

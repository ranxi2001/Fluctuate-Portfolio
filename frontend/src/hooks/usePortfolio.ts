import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useLocalStorage } from './useLocalStorage'
import type { Asset, AssetWithPrice } from '@/types/asset'
import type { Portfolio, PortfolioSnapshot, PortfolioSummary } from '@/types/portfolio'
import { CHART_COLORS, ASSET_CATEGORIES, SUPPORTED_ASSETS } from '@/lib/constants'

const STORAGE_KEY_PREFIX = 'fluctuate_portfolio_'
const HISTORY_KEY_PREFIX = 'fluctuate_history_'

export function usePortfolio() {
  const { address } = useAccount()
  const storageKey = address ? `${STORAGE_KEY_PREFIX}${address}` : STORAGE_KEY_PREFIX
  const historyKey = address ? `${HISTORY_KEY_PREFIX}${address}` : HISTORY_KEY_PREFIX

  const [portfolio, setPortfolio] = useLocalStorage<Portfolio>(storageKey, {
    assets: [],
    lastUpdated: Date.now(),
  })

  const [history, setHistory] = useLocalStorage<PortfolioSnapshot[]>(historyKey, [])
  const [prices, setPrices] = useState<Record<string, number>>({})

  const fetchPrices = useCallback(async () => {
    const newPrices: Record<string, number> = {}

    // Fetch crypto prices from CryptoCompare
    try {
      const cryptoSymbols = ['BTC', 'ETH', 'MNT'].join(',')
      const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptoSymbols}&tsyms=USD`)
      const data = await response.json()

      // CryptoCompare format: { BTC: { USD: 123 }, ETH: { USD: 456 } }
      Object.entries(data).forEach(([symbol, rates]: [string, any]) => {
        if (rates.USD) {
          newPrices[symbol] = rates.USD
        }
      })
    } catch (error) {
      console.warn('Failed to fetch crypto prices:', error)
    }

    // Fetch gold price from metals.live API (free, no auth required)
    // Price is per troy ounce, convert to per gram (1 troy oz = 31.1035g)
    const TROY_OZ_TO_GRAM = 31.1035
    try {
      const goldResponse = await fetch('https://api.metals.live/v1/spot/gold')
      const goldData = await goldResponse.json()
      // metals.live returns array: [{ price: 2650.5, ... }] in USD per troy ounce
      if (Array.isArray(goldData) && goldData.length > 0 && goldData[0].price) {
        newPrices['XAU'] = goldData[0].price / TROY_OZ_TO_GRAM
      }
    } catch (error) {
      console.warn('Failed to fetch gold price, using fallback:', error)
      // Fallback to approximate gold price per gram (~$85)
      newPrices['XAU'] = 85
    }

    setPrices(prev => ({ ...prev, ...newPrices }))
  }, [])

  // Initial fetch and interval
  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [fetchPrices])

  const updatePrices = useCallback((newPrices: Record<string, number>) => {
    setPrices(prev => ({ ...prev, ...newPrices }))
  }, [])

  const getAssetPrice = useCallback((asset: Asset): number => {
    if (asset.customPrice !== undefined) {
      return asset.customPrice
    }
    if (prices[asset.symbol]) {
      return prices[asset.symbol]
    }
    const config = SUPPORTED_ASSETS.find(a => a.symbol === asset.symbol) as { fixedPrice?: number } | undefined
    if (config?.fixedPrice !== undefined) {
      return config.fixedPrice
    }
    return 0
  }, [prices])

  const assetsWithPrices: AssetWithPrice[] = useMemo(() => {
    return portfolio.assets.map(asset => {
      const currentPrice = getAssetPrice(asset)
      const value = asset.amount * currentPrice
      const cost = asset.buyPrice ? asset.amount * asset.buyPrice : undefined
      const profitLoss = cost !== undefined ? value - cost : undefined
      const profitLossPercent = cost !== undefined && cost > 0
        ? ((value - cost) / cost) * 100
        : undefined

      return {
        ...asset,
        currentPrice,
        value,
        profitLoss,
        profitLossPercent,
      }
    })
  }, [portfolio.assets, getAssetPrice])

  const summary: PortfolioSummary = useMemo(() => {
    const totalValue = assetsWithPrices.reduce((sum, a) => sum + a.value, 0)
    const totalCost = assetsWithPrices.reduce((sum, a) => {
      if (a.buyPrice) {
        return sum + (a.amount * a.buyPrice)
      }
      return sum
    }, 0)
    const profitLoss = totalValue - totalCost
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

    const distribution = assetsWithPrices
      .filter(a => a.value > 0)
      .map((asset, index) => ({
        symbol: asset.symbol,
        name: asset.name,
        value: asset.value,
        percentage: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)

    return {
      totalValue,
      totalCost,
      profitLoss,
      profitLossPercent,
      assets: assetsWithPrices,
      distribution,
    }
  }, [assetsWithPrices])

  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'addedAt'>) => {
    const newAsset: Asset = {
      ...asset,
      id: `${asset.symbol}_${Date.now()}`,
      addedAt: Date.now(),
    }
    setPortfolio(prev => ({
      assets: [...prev.assets, newAsset],
      lastUpdated: Date.now(),
    }))
  }, [setPortfolio])

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setPortfolio(prev => ({
      assets: prev.assets.map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
      lastUpdated: Date.now(),
    }))
  }, [setPortfolio])

  const removeAsset = useCallback((id: string) => {
    setPortfolio(prev => ({
      assets: prev.assets.filter(a => a.id !== id),
      lastUpdated: Date.now(),
    }))
  }, [setPortfolio])

  const saveSnapshot = useCallback(() => {
    const snapshot: PortfolioSnapshot = {
      timestamp: Date.now(),
      totalValue: summary.totalValue,
      assetValues: Object.fromEntries(
        assetsWithPrices.map(a => [a.symbol, a.value])
      ),
    }
    setHistory(prev => [...prev, snapshot])
  }, [summary.totalValue, assetsWithPrices, setHistory])

  const clearPortfolio = useCallback(() => {
    setPortfolio({
      assets: [],
      lastUpdated: Date.now(),
    })
  }, [setPortfolio])

  const setAssets = useCallback((newAssets: Asset[]) => {
    setPortfolio({
      assets: newAssets,
      lastUpdated: Date.now(),
    })
  }, [setPortfolio])

  const getCategoryInfo = useCallback((category: string) => {
    return ASSET_CATEGORIES[category as keyof typeof ASSET_CATEGORIES] || ASSET_CATEGORIES.custom
  }, [])

  return {
    portfolio,
    assets: assetsWithPrices,
    summary,
    history,
    prices,
    updatePrices,
    addAsset,
    setAssets, // Export new method
    updateAsset,
    removeAsset,
    saveSnapshot,
    clearPortfolio,
    getCategoryInfo,
  }
}

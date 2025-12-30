import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { CHAINLINK_FEEDS } from '@/lib/constants'
import { mantleTestnet } from '@/lib/wagmi'

const AGGREGATOR_V3_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

type PriceFeedSymbol = keyof typeof CHAINLINK_FEEDS

export function useChainlinkPrice(symbol: PriceFeedSymbol) {
  const feedAddress = CHAINLINK_FEEDS[symbol]

  const { data: roundData, isLoading: isLoadingPrice, error: priceError } = useReadContract({
    address: feedAddress as `0x${string}`,
    abi: AGGREGATOR_V3_ABI,
    functionName: 'latestRoundData',
    chainId: mantleTestnet.id,
    query: {
      enabled: feedAddress !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 60000, // Refetch every minute
    },
  })

  const { data: decimals } = useReadContract({
    address: feedAddress as `0x${string}`,
    abi: AGGREGATOR_V3_ABI,
    functionName: 'decimals',
    chainId: mantleTestnet.id,
    query: {
      enabled: feedAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  const price = roundData && decimals
    ? Number(formatUnits(roundData[1], decimals))
    : null

  const updatedAt = roundData
    ? new Date(Number(roundData[3]) * 1000)
    : null

  return {
    price,
    updatedAt,
    isLoading: isLoadingPrice,
    error: priceError,
  }
}

export function usePrices() {
  const btc = useChainlinkPrice('BTC/USD')
  const eth = useChainlinkPrice('ETH/USD')
  const xau = useChainlinkPrice('XAU/USD')

  const prices: Record<string, number> = {}

  if (btc.price) prices['BTC'] = btc.price
  if (eth.price) prices['ETH'] = eth.price
  if (xau.price) prices['XAU'] = xau.price

  // Add stablecoin prices
  prices['USDT'] = 1
  prices['USDC'] = 1
  prices['USD'] = 1

  const isLoading = btc.isLoading || eth.isLoading || xau.isLoading

  return {
    prices,
    isLoading,
    btc,
    eth,
    xau,
  }
}

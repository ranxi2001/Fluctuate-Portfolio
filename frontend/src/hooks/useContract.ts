import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import { FLUCTUATE_PORTFOLIO_ABI } from '@/lib/abi'
import { mantleTestnet } from '@/lib/wagmi'
import type { Asset } from '@/types/asset'

// 将前端 Asset 转换为合约格式
function toContractAsset(asset: Asset) {
  return {
    symbol: asset.symbol,
    amount: parseUnits(asset.amount.toString(), 18),
    buyPrice: asset.buyPrice ? parseUnits(asset.buyPrice.toString(), 18) : BigInt(0),
  }
}

// 将合约格式转换为前端 Asset
function fromContractAsset(contractAsset: { symbol: string; amount: bigint; buyPrice: bigint }, index: number): Asset {
  return {
    id: `${contractAsset.symbol}_${index}`,
    symbol: contractAsset.symbol,
    name: contractAsset.symbol,
    amount: Number(contractAsset.amount) / 1e18,
    buyPrice: Number(contractAsset.buyPrice) > 0 ? Number(contractAsset.buyPrice) / 1e18 : undefined,
    category: 'custom',
    addedAt: Date.now(),
  }
}

export function useContractPortfolio() {
  const { address } = useAccount()

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: FLUCTUATE_PORTFOLIO_ABI,
    functionName: 'getPortfolio',
    args: address ? [address] : undefined,
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  })

  const assets: Asset[] = data
    ? (data[0] as Array<{ symbol: string; amount: bigint; buyPrice: bigint }>).map((a, i) => fromContractAsset(a, i))
    : []

  const lastUpdated = data ? Number(data[1]) * 1000 : 0

  return {
    assets,
    lastUpdated,
    isLoading,
    error,
    refetch,
  }
}

export function useSaveToChain() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  })

  // Explicitly check for successful transaction status
  const isMined = isSuccess && receipt?.status === 'success'

  if (hash) {
    console.log('Transaction Hash:', hash)
  }

  const saveToChain = async (assets: Asset[]) => {
    if (assets.length === 0) {
      throw new Error('Cannot save empty portfolio')
    }

    const contractAssets = assets.map(toContractAsset)
    console.log('Using contract address:', CONTRACT_ADDRESS)
    console.log('Saving assets to chain:', contractAssets)

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLUCTUATE_PORTFOLIO_ABI,
      functionName: 'updatePortfolio',
      args: [contractAssets],
      chainId: mantleTestnet.id,
    })
  }

  return {
    saveToChain,
    hash,
    isPending,
    isConfirming,
    isSuccess: isMined, // Override with actual status check
    receipt, // Expose receipt for debugging
    error,
  }
}

export function useDeleteFromChain() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const deleteFromChain = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLUCTUATE_PORTFOLIO_ABI,
      functionName: 'deletePortfolio',
      chainId: mantleTestnet.id,
    })
  }

  return {
    deleteFromChain,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useHasPortfolio() {
  const { address } = useAccount()

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: FLUCTUATE_PORTFOLIO_ABI,
    functionName: 'hasUserPortfolio',
    args: address ? [address] : undefined,
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  })

  return {
    hasPortfolio: !!data,
    isLoading,
  }
}

export function useTotalUsers() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: FLUCTUATE_PORTFOLIO_ABI,
    functionName: 'getTotalUsers',
    chainId: mantleTestnet.id,
  })

  return {
    totalUsers: data ? Number(data) : 0,
    isLoading,
  }
}

import { useState } from 'react'
import { Plus, Wallet, Upload, Download, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { AssetCard } from './AssetCard'
import { AddAssetModal } from './AddAssetModal'
import { EditAssetModal } from './EditAssetModal'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useSaveToChain, useContractPortfolio } from '@/hooks/useContract'
import type { AssetWithPrice, AssetCategory } from '@/types/asset'

export function AssetList() {
  const { isConnected } = useAccount()
  const { assets, addAsset, updateAsset, removeAsset, getCategoryInfo, setAssets } = usePortfolio()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetWithPrice | null>(null)
  const [isLoadingFromChain, setIsLoadingFromChain] = useState(false)
  const [loadMessage, setLoadMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const { saveToChain, isPending, isConfirming, isSuccess, error, receipt } = useSaveToChain()
  const { refetch: refetchChain } = useContractPortfolio()

  const handleAdd = (asset: {
    symbol: string
    name: string
    amount: number
    buyPrice?: number
    category: AssetCategory
    customPrice?: number
  }) => {
    addAsset(asset)
  }

  const handleEdit = (id: string, updates: { amount?: number; buyPrice?: number; customPrice?: number }) => {
    updateAsset(id, updates)
    setEditingAsset(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      removeAsset(id)
    }
  }

  const handleSaveToChain = async () => {
    try {
      await saveToChain(assets)
    } catch (err) {
      console.error('Failed to save to chain:', err)
    }
  }

  const handleLoadFromChain = async () => {
    setIsLoadingFromChain(true)
    setLoadMessage(null)
    try {
      const result = await refetchChain()
      console.log('Refetch result:', result)
      console.log('Result data:', result.data)

      // The contract returns [assets[], lastUpdated] tuple
      // result.data is already this tuple
      const rawData = result.data as readonly [
        readonly { symbol: string; amount: bigint; buyPrice: bigint }[],
        bigint
      ] | undefined

      const loadedAssets = rawData?.[0]
      console.log('Loaded assets:', loadedAssets)

      if (loadedAssets && loadedAssets.length > 0) {
        // Bulk convert assets
        const newAssets = loadedAssets.map((contractAsset) => ({
          symbol: contractAsset.symbol,
          name: contractAsset.symbol,
          amount: Number(contractAsset.amount) / 1e18,
          buyPrice: Number(contractAsset.buyPrice) > 0 ? Number(contractAsset.buyPrice) / 1e18 : undefined,
          category: 'custom' as const,
          addedAt: Date.now(),
          id: `${contractAsset.symbol}_${Date.now()}_${Math.random().toString(36).substring(7)}` // Add randomness to prevent ID collision in bulk add
        }))

        // Atomic update of all assets
        setAssets(newAssets)

        setLoadMessage({ type: 'success', text: `Loaded ${loadedAssets.length} assets from blockchain!` })
      } else {
        setLoadMessage({ type: 'info', text: 'No portfolio found on chain. Save your assets first!' })
      }
    } catch (err) {
      console.error('Failed to load from chain:', err)
      setLoadMessage({ type: 'error', text: 'Failed to load from chain. Make sure you are connected to Mantle Sepolia.' })
    } finally {
      setIsLoadingFromChain(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground">
          Connect your wallet to start tracking your portfolio
        </p>
      </div>
    )
  }

  return (
    <div id="assets">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Assets</h2>
        <div className="flex gap-2">
          {assets.length > 0 && (
            <Button
              variant="outline"
              onClick={handleSaveToChain}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isPending ? 'Confirming...' : isConfirming ? 'Saving...' : 'Save to Chain'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleLoadFromChain}
            disabled={isLoadingFromChain}
          >
            {isLoadingFromChain ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isLoadingFromChain ? 'Loading...' : 'Load from Chain'}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {loadMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${loadMessage.type === 'success' ? 'bg-success/10 text-success' :
          loadMessage.type === 'error' ? 'bg-error/10 text-error' :
            'bg-blue-500/10 text-blue-600'
          }`}>
          {loadMessage.text}
        </div>
      )}

      {isSuccess && (
        <div className="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm">
          Portfolio saved to blockchain successfully!
        </div>
      )}

      {/* Show error if transaction failed or reverted */}
      {(error || (receipt?.status === 'reverted')) && (
        <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm">
          {error?.message || 'Transaction reverted on chain. Please check your wallet for details or ensure you have enough gas.'}
        </div>
      )}

      {assets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Assets Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first asset to track
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Asset
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEdit={() => setEditingAsset(asset)}
              onDelete={() => handleDelete(asset.id)}
              categoryColor={getCategoryInfo(asset.category).color}
            />
          ))}
        </div>
      )}

      <AddAssetModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />

      {editingAsset && (
        <EditAssetModal
          open={true}
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={(updates) => handleEdit(editingAsset.id, updates)}
        />
      )}
    </div>
  )
}

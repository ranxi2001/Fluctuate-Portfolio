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
  const { assets, addAsset, updateAsset, removeAsset, getCategoryInfo } = usePortfolio()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetWithPrice | null>(null)

  const { saveToChain, isPending, isConfirming, isSuccess, error } = useSaveToChain()
  const { assets: chainAssets, refetch: refetchChain } = useContractPortfolio()

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
    await refetchChain()
    if (chainAssets.length > 0) {
      chainAssets.forEach((asset) => {
        addAsset({
          symbol: asset.symbol,
          name: asset.name,
          amount: asset.amount,
          buyPrice: asset.buyPrice,
          category: asset.category,
        })
      })
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
          >
            <Download className="h-4 w-4 mr-2" />
            Load from Chain
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {isSuccess && (
        <div className="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm">
          Portfolio saved to blockchain successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm">
          Error: {error.message}
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

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SUPPORTED_ASSETS, ASSET_CATEGORIES } from '@/lib/constants'
import type { AssetCategory } from '@/types/asset'

interface AddAssetModalProps {
  open: boolean
  onClose: () => void
  onAdd: (asset: {
    symbol: string
    name: string
    amount: number
    buyPrice?: number
    category: AssetCategory
    customPrice?: number
  }) => void
}

export function AddAssetModal({ open, onClose, onAdd }: AddAssetModalProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [customSymbol, setCustomSymbol] = useState('')
  const [customName, setCustomName] = useState('')
  const [amount, setAmount] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [category, setCategory] = useState<AssetCategory>('custom')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'preset' && selectedSymbol) {
      const config = SUPPORTED_ASSETS.find(a => a.symbol === selectedSymbol)
      if (config) {
        onAdd({
          symbol: config.symbol,
          name: config.name,
          amount: parseFloat(amount) || 0,
          buyPrice: buyPrice ? parseFloat(buyPrice) : undefined,
          category: config.category,
        })
      }
    } else if (mode === 'custom' && customSymbol) {
      onAdd({
        symbol: customSymbol.toUpperCase(),
        name: customName || customSymbol.toUpperCase(),
        amount: parseFloat(amount) || 0,
        buyPrice: buyPrice ? parseFloat(buyPrice) : undefined,
        category,
        customPrice: customPrice ? parseFloat(customPrice) : undefined,
      })
    }

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setSelectedSymbol('')
    setCustomSymbol('')
    setCustomName('')
    setAmount('')
    setBuyPrice('')
    setCustomPrice('')
    setCategory('custom')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Asset
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'preset' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setMode('preset')}
              >
                Preset Assets
              </Button>
              <Button
                type="button"
                variant={mode === 'custom' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setMode('custom')}
              >
                Custom Asset
              </Button>
            </div>

            {mode === 'preset' ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Asset</label>
                <Select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  required
                >
                  <option value="">Choose an asset...</option>
                  {SUPPORTED_ASSETS.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {asset.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Symbol</label>
                  <Input
                    placeholder="e.g., AAPL"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    placeholder="e.g., Apple Inc."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssetCategory)}
                  >
                    {Object.entries(ASSET_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Price (USD)</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Buy Price (Optional)</label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your average buy price to track profit/loss
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Asset
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

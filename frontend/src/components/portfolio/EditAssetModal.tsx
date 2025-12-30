import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { AssetWithPrice } from '@/types/asset'

interface EditAssetModalProps {
  open: boolean
  asset: AssetWithPrice
  onClose: () => void
  onSave: (updates: { amount?: number; buyPrice?: number; customPrice?: number }) => void
}

export function EditAssetModal({ open, asset, onClose, onSave }: EditAssetModalProps) {
  const [amount, setAmount] = useState(asset.amount.toString())
  const [buyPrice, setBuyPrice] = useState(asset.buyPrice?.toString() || '')
  const [customPrice, setCustomPrice] = useState(asset.customPrice?.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      amount: parseFloat(amount) || 0,
      buyPrice: buyPrice ? parseFloat(buyPrice) : undefined,
      customPrice: customPrice ? parseFloat(customPrice) : undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <Edit2 className="h-5 w-5" />
          Edit {asset.symbol}
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Asset</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <span className="font-semibold">{asset.symbol}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-muted-foreground">{asset.name}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <Input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Buy Price (USD)</label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Average buy price for P/L calculation
              </p>
            </div>

            {asset.category === 'custom' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Custom Price (USD)</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current market price for this asset
                </p>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

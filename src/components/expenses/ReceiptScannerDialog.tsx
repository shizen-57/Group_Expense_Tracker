import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Upload, Camera, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { expenseCategories } from '../groups/ExpenseCategories'

interface ReceiptScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (file: File) => Promise<any>
  onCreate: (data: any) => Promise<any>
}

export function ReceiptScannerDialog({ open, onOpenChange, onScan, onCreate }: ReceiptScannerDialogProps) {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setSelectedFile(file)
    setScanning(true)
    setError(null)
    setScannedData(null)

    try {
      // Convert image to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      const base64Image = await base64Promise
      
      // Call the AI receipt scanning API
      const scannedResult = await onScan(file)
      
      if (scannedResult && scannedResult.amount !== undefined) {
        setScannedData({
          description: scannedResult.description || 'Receipt scan',
          amount: scannedResult.amount.toFixed(2),
          category: scannedResult.category || 'other',
          notes: scannedResult.notes || `Scanned from ${file.name}`
        })
      } else {
        throw new Error('Invalid response from receipt scanner')
      }
    } catch (err: any) {
      console.error('Receipt scanning error:', err)
      setError(err.message || 'Failed to scan receipt. Please try again or enter details manually.')
    } finally {
      setScanning(false)
    }
  }

  const suggestCategory = (filename: string): string => {
    const lower = filename.toLowerCase()
    if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('restaurant')) return 'food'
    if (lower.includes('grocery') || lower.includes('market')) return 'groceries'
    if (lower.includes('uber') || lower.includes('taxi') || lower.includes('gas')) return 'transport'
    if (lower.includes('movie') || lower.includes('game')) return 'entertainment'
    return 'other'
  }

  const handleConfirm = async () => {
    if (!scannedData) return

    try {
      await onCreate({
        description: scannedData.description,
        amount: parseFloat(scannedData.amount),
        category: scannedData.category,
        notes: scannedData.notes
      })
      
      handleClose()
    } catch (error) {
      console.error('Failed to create expense:', error)
    }
  }

  const handleClose = () => {
    setScanning(false)
    setScannedData(null)
    setError(null)
    setSelectedFile(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            AI Receipt Scanner
          </DialogTitle>
          <DialogDescription>
            Upload a receipt image and let AI automatically extract the expense details.
          </DialogDescription>
        </DialogHeader>

        {!scannedData && !scanning && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center hover:border-emerald-500 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
                  <Upload className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upload Receipt</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI will automatically extract amount and categorize
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                    Smart AI Features
                  </h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Automatic amount extraction</li>
                    <li>• Intelligent category suggestion</li>
                    <li>• Date recognition</li>
                    <li>• Merchant name detection</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950 p-4 rounded-xl">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {scanning && (
          <div className="py-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-6">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scanning Receipt...</h3>
            <p className="text-muted-foreground">AI is analyzing your receipt</p>
          </div>
        )}

        {scannedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 text-green-600 bg-green-50 dark:bg-green-950 p-4 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-medium">Receipt scanned successfully!</span>
            </div>

            <Card className="border-2 border-emerald-200 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={scannedData.description}
                    onChange={(e) => setScannedData({ ...scannedData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={scannedData.amount}
                    onChange={(e) => setScannedData({ ...scannedData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category (AI Suggested)</Label>
                  <Select 
                    value={scannedData.category} 
                    onValueChange={(value) => setScannedData({ ...scannedData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <cat.icon className={`h-4 w-4 ${cat.color}`} />
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={scannedData.notes}
                    onChange={(e) => setScannedData({ ...scannedData, notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                Add Expense
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
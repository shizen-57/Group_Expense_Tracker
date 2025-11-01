import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { UserPlus, Search, Mail, QrCode, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner@2.0.3'

interface Suggestion {
  id: string
  name: string
  username: string
  email: string
}

interface AddFriendDialogProps {
  onAddFriend: (username: string) => Promise<void>
  onAddFriendByEmail: (email: string) => Promise<void>
  onAddFriendByCode: (code: string) => Promise<void>
  onSearchSuggestions: (query: string) => Promise<Suggestion[]>
  userFriendCode: string
  variant?: 'default' | 'outline'
}

export function AddFriendDialog({ 
  onAddFriend, 
  onAddFriendByEmail,
  onAddFriendByCode,
  onSearchSuggestions, 
  userFriendCode,
  variant = 'default' 
}: AddFriendDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')

    try {
      const results = await onSearchSuggestions(searchQuery)
      setSuggestions(results)
    } catch (err: any) {
      setError(err.message || 'Failed to search')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async (username: string) => {
    setLoading(true)
    setError('')

    try {
      await onAddFriend(username)
      setSearchQuery('')
      setSuggestions([])
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to add friend')
    } finally {
      setLoading(false)
    }
  }

  const handleAddByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return

    setLoading(true)
    setError('')

    try {
      await onAddFriendByEmail(emailInput)
      setEmailInput('')
      setOpen(false)
      toast.success('Friend added successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to add friend')
    } finally {
      setLoading(false)
    }
  }

  const handleAddByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeInput.trim()) return

    setLoading(true)
    setError('')

    try {
      await onAddFriendByCode(codeInput)
      setCodeInput('')
      setOpen(false)
      toast.success('Friend added successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to add friend')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err) {
        // Silently fall back to alternative method
      }
    }
    
    // Fallback method that works in all browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      textArea.remove()
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      textArea.remove()
      return false
    }
  }

  const handleCopyCode = async () => {
    const success = await copyToClipboard(userFriendCode)
    if (success) {
      setCopied(true)
      toast.success('Friend code copied!')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('Failed to copy code')
    }
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}?friendCode=${userFriendCode}`
    const success = await copyToClipboard(link)
    if (success) {
      toast.success('Friend link copied!')
    } else {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'outline' ? (
          <Button variant="outline" className="border-teal-500/20 hover:bg-teal-50 dark:hover:bg-teal-950">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        ) : (
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Choose how you'd like to add a friend
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-1" />
              Search
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-1" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by username or name</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Enter username or name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <Label>Suggestions</Label>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950 dark:hover:to-teal-950 transition-all"
                    >
                      <div>
                        <p className="font-medium">{suggestion.name}</p>
                        <p className="text-sm text-muted-foreground">@{suggestion.username}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddFriend(suggestion.username)}
                        disabled={loading}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length === 0 && searchQuery && !loading && (
              <p className="text-sm text-gray-500 text-center py-4">
                No users found. Try a different search term.
              </p>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <form onSubmit={handleAddByEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Friend's Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter the email address they used to sign up
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Friend'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Friend Code</Label>
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                  <QRCodeSVG 
                    value={userFriendCode} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Share this QR code with friends to connect instantly
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or scan a friend's code
                  </span>
                </div>
              </div>

              <form onSubmit={handleAddByCode} className="space-y-2">
                <Label htmlFor="code">Enter Friend Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="Paste friend code here"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    Add
                  </Button>
                </div>
              </form>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

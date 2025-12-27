import { useState, useRef } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { UserCircle2, Mail, Phone, AtSign, LogOut, Camera, Upload, X } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  username: string
  avatarUrl?: string
}

interface ProfileCardProps {
  user: User
  onLogout: () => void
  onUpdateAvatar?: (file: File) => Promise<void>
}

export function ProfileCard({ user, onLogout, onUpdateAvatar }: ProfileCardProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showAvatarOptions, setShowAvatarOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload if handler provided
    if (onUpdateAvatar) {
      setUploading(true)
      try {
        await onUpdateAvatar(file)
      } catch (error) {
        console.error('Failed to upload avatar:', error)
        setAvatarPreview(null)
      } finally {
        setUploading(false)
      }
    }
    setShowAvatarOptions(false)
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setShowAvatarOptions(false)
  }

  const currentAvatar = avatarPreview || user.avatarUrl

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Profile Picture with Upload */}
            <div className="relative group">
              <div 
                className={`w-20 h-20 rounded-full overflow-hidden ${
                  currentAvatar ? '' : 'bg-emerald-100'
                } flex items-center justify-center cursor-pointer transition-all hover:ring-4 hover:ring-emerald-200`}
                onClick={() => setShowAvatarOptions(!showAvatarOptions)}
              >
                {currentAvatar ? (
                  <img 
                    src={currentAvatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="h-12 w-12 text-emerald-600" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Camera badge */}
              <button 
                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 rounded-full text-white shadow-lg hover:bg-emerald-700 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>

              {/* Avatar options dropdown */}
              {showAvatarOptions && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload photo
                  </button>
                  {currentAvatar && (
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-4 w-4" />
                      Remove photo
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            <div>
              <h2 className="text-2xl mb-1">{user.name}</h2>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <AtSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Username</p>
              <p className="text-sm">@{user.username}</p>
            </div>
          </div>
        </div>

        <Button 
          variant="outline"
          className="w-full rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </CardContent>
    </Card>
  )
}

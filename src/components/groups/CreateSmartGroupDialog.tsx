import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import { motion } from 'motion/react'
import { 
  Plane, 
  PartyPopper, 
  Home, 
  Heart, 
  Briefcase, 
  MoreHorizontal,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Sparkles,
  X
} from 'lucide-react'
import { format } from 'date-fns'

interface CreateSmartGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: {
    name: string
    description: string
    type: string
    startDate?: Date
    endDate?: Date
    location?: string
    participants?: string[]
    metadata?: any
  }) => void
}

const GROUP_TYPES = [
  { value: 'trip', label: 'Trip', icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50', description: 'Vacation, getaway, or travel' },
  { value: 'event', label: 'Event', icon: PartyPopper, color: 'text-purple-500', bg: 'bg-purple-50', description: 'Party, wedding, or gathering' },
  { value: 'home', label: 'Shared Home', icon: Home, color: 'text-orange-500', bg: 'bg-orange-50', description: 'Roommates or household expenses' },
  { value: 'couple', label: 'Couple Budget', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', description: 'Shared finances with partner' },
  { value: 'project', label: 'Project', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50', description: 'Work or business expenses' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-50', description: 'Custom group type' },
]

export function CreateSmartGroupDialog({ open, onOpenChange, onCreate }: CreateSmartGroupDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<string>('trip')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [location, setLocation] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const selectedType = GROUP_TYPES.find(t => t.value === type) || GROUP_TYPES[0]
  const Icon = selectedType.icon

  const handleCreate = () => {
    if (!name.trim()) return

    onCreate({
      name: name.trim(),
      description: description.trim(),
      type,
      startDate,
      endDate,
      location: location.trim() || undefined,
      metadata: {
        createdAt: new Date().toISOString(),
        fairnessScore: 100,
        autoArchive: type === 'trip' || type === 'event',
      }
    })

    // Reset form
    setName('')
    setDescription('')
    setType('trip')
    setStartDate(undefined)
    setEndDate(undefined)
    setLocation('')
    setShowAdvanced(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl ${selectedType.bg}`}>
              <Icon className={`h-6 w-6 ${selectedType.color}`} />
            </div>
            <div>
              <DialogTitle className="text-2xl">Create Smart Group</DialogTitle>
              <DialogDescription>
                {selectedType.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Group Type Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Group Type
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {GROUP_TYPES.map((groupType) => {
                const TypeIcon = groupType.icon
                return (
                  <motion.button
                    key={groupType.value}
                    type="button"
                    onClick={() => setType(groupType.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      type === groupType.value
                        ? `${groupType.bg} border-current ${groupType.color}`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TypeIcon className={`h-6 w-6 mx-auto mb-2 ${
                      type === groupType.value ? groupType.color : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      type === groupType.value ? groupType.color : 'text-gray-600'
                    }`}>
                      {groupType.label}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                placeholder={
                  type === 'trip' ? "Cox's Bazar Trip 2024" :
                  type === 'event' ? "Birthday Party" :
                  type === 'home' ? "Apartment 3B" :
                  type === 'couple' ? "Our Budget" :
                  "Project Alpha"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about this group..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Context-Specific Fields */}
          {(type === 'trip' || type === 'event') && (
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-4 w-4 text-emerald-600" />
                <Label className="text-emerald-900">Timeline & Location</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-emerald-700">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left bg-white">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-emerald-700">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left bg-white">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => startDate ? date < startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-emerald-700 flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                <Input
                  placeholder={type === 'trip' ? "Cox's Bazar, Bangladesh" : "Event venue"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          )}

          {/* Smart Features Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="h-3 w-3" />
              AI-Powered Fair Splits
            </Badge>
            {(type === 'trip' || type === 'event') && (
              <Badge variant="secondary" className="gap-1.5">
                <CalendarIcon className="h-3 w-3" />
                Auto-Archive After End
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3 w-3" />
              Smart Member Suggestions
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Smart Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

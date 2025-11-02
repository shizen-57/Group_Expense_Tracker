import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Textarea } from '../ui/textarea'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { 
  Heart, 
  ThumbsUp, 
  Smile, 
  PartyPopper, 
  HandHeart,
  MessageCircle,
  Send,
  X
} from 'lucide-react'

const REACTIONS = [
  { emoji: '❤️', label: 'Thanks', icon: Heart, color: 'text-red-500' },
  { emoji: '👍', label: 'Got it', icon: ThumbsUp, color: 'text-blue-500' },
  { emoji: '😅', label: 'Oops', icon: Smile, color: 'text-yellow-500' },
  { emoji: '🎉', label: 'Nice', icon: PartyPopper, color: 'text-purple-500' },
  { emoji: '🙏', label: 'Grateful', icon: HandHeart, color: 'text-emerald-500' },
]

interface Reaction {
  userId: string
  userName: string
  emoji: string
  timestamp: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: string
}

interface ExpenseReactionsProps {
  expenseId: string
  reactions: Reaction[]
  comments: Comment[]
  currentUserId: string
  currentUserName: string
  onAddReaction: (emoji: string) => void
  onRemoveReaction: (emoji: string) => void
  onAddComment: (text: string) => void
  compact?: boolean
}

export function ExpenseReactions({
  expenseId,
  reactions,
  comments,
  currentUserId,
  currentUserName,
  onAddReaction,
  onRemoveReaction,
  onAddComment,
  compact = false
}: ExpenseReactionsProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {} as Record<string, Reaction[]>)

  const userReactions = reactions.filter(r => r.userId === currentUserId).map(r => r.emoji)

  const handleReactionClick = (emoji: string) => {
    if (userReactions.includes(emoji)) {
      onRemoveReaction(emoji)
    } else {
      onAddReaction(emoji)
    }
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim())
      setCommentText('')
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Reaction Summary */}
        {Object.entries(groupedReactions).length > 0 && (
          <div className="flex items-center gap-1">
            {Object.entries(groupedReactions).slice(0, 3).map(([emoji, reacts]) => (
              <Badge 
                key={emoji} 
                variant="secondary" 
                className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-gray-200"
                onClick={() => handleReactionClick(emoji)}
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{reacts.length}</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Comment Count */}
        {comments.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {comments.length}
          </Button>
        )}

        {/* Quick React */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Smile className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-1">
              {REACTIONS.map((reaction) => (
                <motion.button
                  key={reaction.emoji}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    userReactions.includes(reaction.emoji) ? 'bg-emerald-50 ring-2 ring-emerald-500' : ''
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-xl">{reaction.emoji}</span>
                </motion.button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Reactions */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Existing Reactions */}
        {Object.entries(groupedReactions).map(([emoji, reacts]) => {
          const hasReacted = reacts.some(r => r.userId === currentUserId)
          const names = reacts.map(r => r.userName).join(', ')
          
          return (
            <Popover key={emoji}>
              <PopoverTrigger asChild>
                <motion.button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all ${
                    hasReacted 
                      ? 'bg-emerald-50 border-emerald-500' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleReactionClick(emoji)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-base">{emoji}</span>
                  <span className={`text-sm font-medium ${
                    hasReacted ? 'text-emerald-700' : 'text-gray-600'
                  }`}>
                    {reacts.length}
                  </span>
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <p className="text-sm font-medium mb-2">{emoji} Reactions</p>
                <div className="space-y-1 max-w-xs">
                  {reacts.map((react, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {react.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{react.userName}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )
        })}

        {/* Add Reaction */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5">
              <Smile className="h-4 w-4" />
              React
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="grid grid-cols-3 gap-2">
              {REACTIONS.map((reaction) => {
                const Icon = reaction.icon
                const hasReacted = userReactions.includes(reaction.emoji)
                
                return (
                  <motion.button
                    key={reaction.emoji}
                    onClick={() => handleReactionClick(reaction.emoji)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      hasReacted 
                        ? 'bg-emerald-50 border-emerald-500' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl">{reaction.emoji}</span>
                    <span className={`text-xs font-medium ${
                      hasReacted ? 'text-emerald-700' : 'text-gray-600'
                    }`}>
                      {reaction.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Comments Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="rounded-full gap-1.5"
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length > 0 && <span>{comments.length}</span>}
        </Button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t"
          >
            {/* Existing Comments */}
            {comments.length > 0 && (
              <ScrollArea className="max-h-48">
                <div className="space-y-3 pr-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <Avatar className="h-8 w-8 mt-0.5">
                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                          {comment.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2">
                          <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                          <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-4">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Add Comment */}
            <div className="flex gap-2">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                  {currentUserName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

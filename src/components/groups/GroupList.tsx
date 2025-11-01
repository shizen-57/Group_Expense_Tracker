import { Users, Receipt } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  expenseCount: number
}

interface GroupListProps {
  groups: Group[]
  onSelectGroup: (groupId: string) => void
}

export function GroupList({ groups, onSelectGroup }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900 dark:to-teal-800 mb-6 shadow-lg">
          <Users className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
        <p className="text-muted-foreground mb-6">Create your first group to start splitting expenses!</p>
        
        <div className="max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-3 text-emerald-600 dark:text-emerald-400">Getting Started</h4>
          <div className="text-left space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">1</div>
              <p>Click "Add Friend" to add friends to your network</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs">2</div>
              <p>Click "Create Group" to start a new expense group</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</div>
              <p>Add members and start tracking shared expenses!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, index) => (
        <Card
          key={group.id}
          className="cursor-pointer card-hover border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative group"
          onClick={() => onSelectGroup(group.id)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${
                index % 3 === 0 ? 'from-emerald-500 to-teal-600' :
                index % 3 === 1 ? 'from-blue-500 to-indigo-600' :
                'from-purple-500 to-pink-600'
              } shadow-lg`}>
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{group.name}</h3>
            {group.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{group.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium">{group.memberCount}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">{group.expenseCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

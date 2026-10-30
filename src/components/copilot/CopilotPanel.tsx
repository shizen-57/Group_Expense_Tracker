import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, Check, Loader2, Mic, MicOff, Play, SendHorizontal, Sparkles, Trash2, Zap } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { api } from '../../utils/api'
import { executeAgentAction, type AgentAction, type AppPage } from '../../utils/ai/agentActions'

type ActionStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped'

interface TrackedAction extends AgentAction {
  status: ActionStatus
  error?: string
}

interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: TrackedAction[]
  suggestions?: string[]
  aiPowered?: boolean
}

interface CopilotContextValue {
  openCopilot: (prompt?: string) => void
}

const CopilotContext = createContext<CopilotContextValue>({ openCopilot: () => {} })

export const useCopilot = () => useContext(CopilotContext)

const STORAGE_KEY = 'expenseflow_copilot_thread_v1'
const MAX_STORED = 30

const STARTERS = [
  'Who owes me money?',
  'I spent 450 on lunch',
  'Settle all my debts',
  'How much did I spend this month?',
  'Set my food budget to 5000',
  'Create a group called Weekend Trip',
]

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

function loadThread(): CopilotMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const messages: CopilotMessage[] = JSON.parse(raw)
    // A reload interrupts in-flight actions; let the user retry them
    return messages.map((m) => ({
      ...m,
      actions: m.actions?.map((a) => (a.status === 'running' ? { ...a, status: 'pending' as const } : a)),
    }))
  } catch {
    return []
  }
}

function saveThread(messages: CopilotMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
  } catch {
    // Storage unavailable (private mode, quota) — the thread just won't persist
  }
}

// Minimal, safe markdown: **bold**, "- " bullets and line breaks
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        const bullet = /^\s*[-•]\s+/.test(line)
        const body = line.replace(/^\s*[-•]\s+/, '')
        const parts = body.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>,
        )
        if (!line.trim()) return <div key={i} className="h-1" />
        return bullet ? (
          <div key={i} className="flex gap-2 pl-1"><span className="text-emerald-500">•</span><span>{parts}</span></div>
        ) : (
          <p key={i}>{parts}</p>
        )
      })}
    </div>
  )
}

function ActionCard({ action, onRun, onSkip }: { action: TrackedAction; onRun: () => void; onSkip: () => void }) {
  const tone: Record<ActionStatus, string> = {
    pending: 'border-emerald-200 bg-white',
    running: 'border-emerald-300 bg-emerald-50',
    done: 'border-emerald-300 bg-emerald-50',
    failed: 'border-red-200 bg-red-50',
    skipped: 'border-gray-200 bg-gray-50 opacity-60',
  }
  return (
    <div className={`rounded-2xl border p-3 text-sm transition-colors ${tone[action.status]}`}>
      <div className="flex items-start gap-2">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="flex-1 text-gray-800">{action.summary}</p>
      </div>
      {action.error && <p className="mt-2 text-xs text-red-600">{action.error}</p>}
      <div className="mt-2 flex items-center justify-end gap-2">
        {action.status === 'pending' || action.status === 'failed' ? (
          <>
            <button onClick={onSkip} className="rounded-full px-3 py-1 text-xs text-gray-500 hover:bg-gray-100">Skip</button>
            <button onClick={onRun} className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800">
              <Play className="h-3 w-3" /> {action.status === 'failed' ? 'Retry' : 'Run'}
            </button>
          </>
        ) : action.status === 'running' ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><Loader2 className="h-3 w-3 animate-spin" /> Running…</span>
        ) : action.status === 'done' ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><Check className="h-3 w-3" /> Done</span>
        ) : (
          <span className="text-xs text-gray-500">Skipped</span>
        )}
      </div>
    </div>
  )
}

interface CopilotProviderProps {
  accessToken: string
  currentPage: string
  navigate: (page: AppPage, groupId?: string) => void
  children: ReactNode
}

export function CopilotProvider({ accessToken, currentPage, navigate, children }: CopilotProviderProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<CopilotMessage[]>(loadThread)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesRef = useRef(messages)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    messagesRef.current = messages
    saveThread(messages)
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Ctrl/⌘ + K toggles the copilot from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const updateAction = useCallback((messageId: string, actionId: string, patch: Partial<TrackedAction>) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, actions: m.actions?.map((a) => (a.id === actionId ? { ...a, ...patch } : a)) } : m,
      ),
    )
  }, [])

  const runAction = useCallback(
    async (messageId: string, action: TrackedAction) => {
      updateAction(messageId, action.id, { status: 'running', error: undefined })
      try {
        await executeAgentAction(accessToken, action, { queryClient, navigate })
        updateAction(messageId, action.id, { status: 'done' })
        if (action.type !== 'navigate') toast.success(action.summary)
      } catch (error: any) {
        updateAction(messageId, action.id, { status: 'failed', error: error?.message || 'Action failed' })
      }
    },
    [accessToken, navigate, queryClient, updateAction],
  )

  const runAll = async (message: CopilotMessage) => {
    // Sequential: later actions may depend on earlier ones (e.g. balances)
    for (const action of message.actions || []) {
      if (action.status === 'pending' || action.status === 'failed') await runAction(message.id, action)
    }
  }

  const send = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || thinking) return
      const userMessage: CopilotMessage = { id: newId(), role: 'user', content }
      const history = [...messagesRef.current, userMessage]
      setMessages(history)
      setInput('')
      setThinking(true)
      try {
        const result = await api.aiAgent(
          accessToken,
          history.map((m) => ({ role: m.role, content: m.content })),
          currentPage,
        )
        const assistant: CopilotMessage = {
          id: newId(),
          role: 'assistant',
          content: result.reply || 'Done.',
          actions: (result.actions || []).map((a: AgentAction) => ({ ...a, status: 'pending' as const })),
          suggestions: result.suggestions || [],
          aiPowered: !!result.aiPowered,
        }
        setMessages((prev) => [...prev, assistant])
        // Navigation is harmless, so it happens immediately
        for (const action of assistant.actions || []) {
          if (action.risk === 'safe') runAction(assistant.id, action)
        }
      } catch (error: any) {
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: 'assistant', content: `Sorry, I couldn't reach the Copilot service. ${error?.message || ''}`.trim() },
        ])
      } finally {
        setThinking(false)
      }
    },
    [accessToken, currentPage, runAction, thinking],
  )

  const openCopilot = useCallback(
    (prompt?: string) => {
      setOpen(true)
      if (prompt) send(prompt)
    },
    [send],
  )

  const SpeechRecognition = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null

  const toggleVoice = () => {
    if (!SpeechRecognition) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('')
      setInput(transcript)
      if (event.results[event.results.length - 1].isFinal) send(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
  const suggestions = !messages.length ? STARTERS : lastAssistant?.suggestions || []

  return (
    <CopilotContext.Provider value={{ openCopilot }}>
      {children}

      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI Copilot"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gray-900 via-indigo-950 to-emerald-900 px-5 py-3 text-sm font-medium text-white shadow-2xl shadow-emerald-500/30 transition-transform hover:scale-105"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Copilot</span>
        <kbd className="hidden rounded bg-white/15 px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 bg-gray-50 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-gray-200 bg-gradient-to-br from-gray-900 via-indigo-950 to-emerald-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2"><Bot className="h-5 w-5" /></div>
              <div className="flex-1">
                <SheetTitle className="text-white">ExpenseFlow Copilot</SheetTitle>
                <SheetDescription className="text-xs text-white/60">
                  Ask anything or tell me what to do — I'll handle groups, splits, debts and budgets.
                </SheetDescription>
              </div>
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} className="mr-6 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Clear conversation">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {!messages.length && (
              <div className="rounded-3xl border border-emerald-100 bg-white p-5 text-sm text-gray-600">
                <p className="font-medium text-gray-900">Hi! I run your money on autopilot.</p>
                <p className="mt-2">
                  Say things like <em>"I paid 1200 for dinner in Goa Trip, split with Rahim and Karim"</em> or{' '}
                  <em>"settle up with everyone"</em>. I'll show you exactly what I'm about to do before anything changes.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'space-y-2'}>
                {m.role === 'user' ? (
                  <div className="max-w-[85%] rounded-3xl rounded-br-md bg-gray-900 px-4 py-2.5 text-sm text-white">{m.content}</div>
                ) : (
                  <>
                    <div className="max-w-[95%] rounded-3xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
                      <RichText text={m.content} />
                      {m.aiPowered !== undefined && (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                          {m.aiPowered ? 'AI reasoning' : 'Offline engine'}
                        </p>
                      )}
                    </div>
                    {!!m.actions?.length && (
                      <div className="space-y-2">
                        {m.actions.map((a) => (
                          <ActionCard
                            key={a.id}
                            action={a}
                            onRun={() => runAction(m.id, a)}
                            onSkip={() => updateAction(m.id, a.id, { status: 'skipped' })}
                          />
                        ))}
                        {m.actions.filter((a) => a.status === 'pending').length > 1 && (
                          <Button size="sm" onClick={() => runAll(m)} className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                            <Zap className="mr-1 h-4 w-4" /> Run all {m.actions.filter((a) => a.status === 'pending').length} actions
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {thinking && (
              <div className="inline-flex items-center gap-2 rounded-3xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Thinking across all your groups…
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            {!thinking && suggestions.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 hover:bg-emerald-100">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? 'Listening…' : 'Ask or command anything…'}
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                autoFocus
              />
              {SpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                  className={`rounded-full p-2.5 ${listening ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label="Send"
                className="rounded-full bg-gray-900 p-2.5 text-white disabled:opacity-40"
              >
                {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </CopilotContext.Provider>
  )
}


import { Send, Sparkles } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { aiChatSeed, nextAiReply } from "@/data/mockData"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types"

export function AdminAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(aiChatSeed)
  const [draft, setDraft] = useState("")
  const [turn, setTurn] = useState(0)

  const send = () => {
    if (!draft.trim()) return
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: draft.trim(),
      timestamp: "Just now",
    }
    const reply: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: "assistant",
      content: nextAiReply(turn),
      timestamp: "Just now",
    }
    setMessages((prev) => [...prev, userMsg, reply])
    setTurn((t) => t + 1)
    setDraft("")
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div>
        <h1 className="text-3xl">AI Assistant</h1>
        <p className="mt-1 text-muted-foreground">Ask about candidates, jobs, matching, or platform activity.</p>
      </div>

      <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex items-start gap-3", m.role === "user" && "flex-row-reverse")}>
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className={m.role === "assistant" ? "bg-secondary text-secondary-foreground" : undefined}>
                  {m.role === "assistant" ? <Sparkles className="size-4" /> : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[70%] rounded-lg px-4 py-2.5 text-sm", m.role === "assistant" ? "bg-muted" : "bg-secondary text-secondary-foreground")}>
                <p>{m.content}</p>
                <p className={cn("mt-1 text-[11px]", m.role === "assistant" ? "text-muted-foreground" : "text-white/60")}>{m.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="flex items-end gap-3 border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask the AI assistant..."
            className="min-h-11 flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!draft.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

import { Bot, Loader2, Send, User } from "lucide-react"
import type { RefObject } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { JdChatMsg } from "@/lib/useJdAiChat"

/**
 * Scrolling transcript plus composer for the job-description AI assistant.
 * Presentation only — conversation state lives in `useJdAiChat`.
 */
export function JdChatThread({
  messages,
  input,
  onInputChange,
  isSending,
  missingFields,
  showMissingFields,
  starters,
  emptyState,
  onSend,
  scrollRef,
  className,
}: {
  messages: JdChatMsg[]
  input: string
  onInputChange: (value: string) => void
  isSending: boolean
  missingFields: string[]
  showMissingFields: boolean
  starters: string[]
  emptyState: string
  onSend: (text?: string) => void
  scrollRef: RefObject<HTMLDivElement | null>
  className?: string
}) {
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{emptyState}</p>
            <div className="flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={cn("flex items-start gap-2.5", m.role === "user" && "flex-row-reverse")}>
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className={m.role === "assistant" ? "bg-secondary text-secondary-foreground" : undefined}>
                {m.role === "assistant" ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "rounded-tr-sm bg-secondary text-secondary-foreground" : "rounded-tl-sm bg-muted",
                m.isError && "ring-1 ring-destructive/40"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <Bot className="size-3.5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
            </div>
          </div>
        )}
      </div>

      {missingFields.length > 0 && showMissingFields && (
        <p className="px-5 pb-1 text-xs text-muted-foreground">Still needed: {missingFields.join(", ")}</p>
      )}

      <form
        className="flex items-center gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
      >
        <Input value={input} onChange={(e) => onInputChange(e.target.value)} placeholder="Type a message…" disabled={isSending} />
        <Button type="submit" size="icon" disabled={isSending || !input.trim()}>
          {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  )
}

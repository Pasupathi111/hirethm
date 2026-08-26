import { Loader2, PartyPopper, RotateCcw, Sparkles } from "lucide-react"
import { useState } from "react"

import { JdChatThread } from "@/components/common/JdChatThread"
import { JdDraftEditor } from "@/components/forms/JdDraftEditor"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useJdAiChat, type JdAiDraft } from "@/lib/useJdAiChat"
import { cn } from "@/lib/utils"

const STARTERS = [
  "Senior Backend Engineer, remote, full-time",
  "Marketing Manager for our growing SaaS team",
  "Entry-level Customer Support Representative, hybrid",
]

const EMPTY_STATE =
  "Tell me about the role in your own words — title, team, location, whatever you have. I'll ask about anything important that's missing."

export function JobDescriptionAiDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (payload: { mode: "draft" | "open"; draft: JdAiDraft }) => void
}) {
  const chat = useJdAiChat()
  const [applying, setApplying] = useState<"draft" | "open" | null>(null)
  const { draft, isSending } = chat

  const applyDraft = (mode: "draft" | "open") => {
    if (!draft || applying) return
    setApplying(mode)
    onApply({ mode, draft })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isSending) return
        onOpenChange(next)
        if (!next) {
          chat.reset()
          setApplying(null)
        }
      }}
    >
      <DialogContent className="flex max-w-4xl flex-col gap-0 overflow-hidden p-0" style={{ height: "min(85vh, 780px)" }}>
        <DialogHeader className="flex-row items-center gap-2 space-y-0 border-b border-border px-5 py-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
            <Sparkles className="size-4 text-secondary" />
          </div>
          <div>
            <DialogTitle>Create with AI</DialogTitle>
            <DialogDescription>Describe the role — I&apos;ll draft the job description with you.</DialogDescription>
          </div>
        </DialogHeader>

        <div className={cn("grid min-h-0 flex-1 grid-cols-1", draft && "md:grid-cols-[minmax(0,1fr)_minmax(22rem,1fr)]")}>
          <JdChatThread
            className={cn(draft && "border-b border-border md:border-r md:border-b-0")}
            messages={chat.messages}
            input={chat.input}
            onInputChange={chat.setInput}
            isSending={isSending}
            missingFields={chat.missingFields}
            showMissingFields={!draft}
            starters={STARTERS}
            emptyState={EMPTY_STATE}
            onSend={chat.sendMessage}
            scrollRef={chat.scrollRef}
          />

          {draft && (
            <div className="flex min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">Draft — review &amp; edit</p>
                <JdDraftEditor draft={draft} onChange={chat.setDraft} />
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                <Button variant="ghost" size="sm" disabled={isSending} onClick={chat.regenerate}>
                  <RotateCcw className="size-3.5" />
                  Regenerate
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={!!applying} onClick={() => applyDraft("draft")}>
                    Save Draft
                  </Button>
                  <Button variant="dark" size="sm" disabled={!!applying} onClick={() => applyDraft("open")}>
                    {applying ? <Loader2 className="size-3.5 animate-spin" /> : <PartyPopper className="size-3.5" />}
                    Create JD
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

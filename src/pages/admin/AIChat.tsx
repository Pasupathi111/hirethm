import { Loader2, PartyPopper, Plus, RotateCcw, Sparkles } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { JdChatThread } from "@/components/common/JdChatThread"
import { JdDraftEditor } from "@/components/forms/JdDraftEditor"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import { useJdAiChat } from "@/lib/useJdAiChat"
import { cn } from "@/lib/utils"
import type { ApiJob } from "@/types"

const STARTERS = [
  "Senior Backend Engineer, remote, full-time",
  "Marketing Manager for our growing SaaS team",
  "Entry-level Customer Support Representative, hybrid",
]

const EMPTY_STATE =
  "Describe the role you're hiring for — a title is enough to start. I'll fill in the rest and hand you a complete job description to review, edit and publish."

export function AdminAIChat() {
  const navigate = useNavigate()
  const chat = useJdAiChat()
  const [saving, setSaving] = useState<"draft" | "open" | null>(null)
  const [error, setError] = useState("")
  const { draft, isSending } = chat

  /** Create the job straight from the chat — no round-trip through the wizard. */
  const createJob = async (status: "draft" | "open") => {
    if (!draft || saving) return
    const title = draft.title.trim()
    if (!title) {
      setError("The draft needs a job title before it can be created.")
      return
    }

    setError("")
    setSaving(status)
    try {
      const department = draft.department?.trim()
      const job = await api.post<ApiJob>("/api/jobs", {
        title,
        location: draft.location?.trim() || undefined,
        type: draft.employmentType,
        remoteStatus: draft.remoteStatus ?? undefined,
        experienceLevel: draft.experienceLevel ?? undefined,
        salaryMin: draft.salaryMin ?? undefined,
        salaryMax: draft.salaryMax ?? undefined,
        // The job model has no dedicated "department" field — fold it into the
        // description, matching how the manual wizard applies an AI draft.
        description: department ? `**Department:** ${department}\n\n${draft.description}` : draft.description,
        skills: draft.skills,
        status,
      })
      toast.success(status === "open" ? "Job published" : "Draft saved", { description: `${job.title} was created.` })
      navigate(`/admin/jobs/${job.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create job")
    } finally {
      setSaving(null)
    }
  }

  const startNewChat = () => {
    chat.reset()
    setError("")
    setSaving(null)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">AI Assistant</h1>
          <p className="mt-1 text-muted-foreground">
            Create a job description by chatting — describe the role and publish it without filling in the form.
          </p>
        </div>
        {(chat.messages.length > 0 || draft) && (
          <Button variant="outline" size="sm" disabled={isSending || !!saving} onClick={startNewChat}>
            <Plus className="size-3.5" />
            New chat
          </Button>
        )}
      </div>

      {error && <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <div className={cn("grid min-h-0 flex-1 grid-cols-1", draft && "lg:grid-cols-[minmax(0,1fr)_minmax(24rem,1fr)]")}>
          <JdChatThread
            className={cn(draft && "border-b border-border lg:border-r lg:border-b-0")}
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
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Sparkles className="size-4 shrink-0 text-secondary" />
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Generated draft — review &amp; edit</p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <JdDraftEditor draft={draft} onChange={chat.setDraft} descriptionRows={12} />
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                <Button variant="ghost" size="sm" disabled={isSending || !!saving} onClick={chat.regenerate}>
                  <RotateCcw className="size-3.5" />
                  Regenerate
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={!!saving || isSending} onClick={() => createJob("draft")}>
                    {saving === "draft" ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    Save draft
                  </Button>
                  <Button variant="dark" size="sm" disabled={!!saving || isSending} onClick={() => createJob("open")}>
                    {saving === "open" ? <Loader2 className="size-3.5 animate-spin" /> : <PartyPopper className="size-3.5" />}
                    Publish job
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

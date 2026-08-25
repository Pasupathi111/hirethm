import { Bot, Loader2, PartyPopper, RotateCcw, Send, Sparkles, User } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { ApiExperienceLevel, ApiJobType, ApiRemoteStatus } from "@/types"

export interface JdAiDraft {
  title: string
  department: string | null
  location: string | null
  employmentType: ApiJobType
  experienceLevel: ApiExperienceLevel
  remoteStatus: ApiRemoteStatus | null
  skills: string[]
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  salaryNegotiable: boolean
  description: string
}

interface ChatMsg {
  role: "user" | "assistant"
  content: string
  isError?: boolean
}

interface JdChatResponse {
  reply: string
  readyToGenerate: boolean
  missingMandatoryFields: string[]
  jd: JdAiDraft | null
}

const STARTERS = [
  "Senior Backend Engineer, remote, full-time",
  "Marketing Manager for our growing SaaS team",
  "Entry-level Customer Support Representative, hybrid",
]

const EMPLOYMENT_TYPE_OPTIONS: { value: ApiJobType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

export function JobDescriptionAiDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (payload: { mode: "draft" | "open"; draft: JdAiDraft }) => void
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [draft, setDraft] = useState<JdAiDraft | null>(null)
  const [applying, setApplying] = useState<"draft" | "open" | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const reset = () => {
    setMessages([])
    setInput("")
    setMissingFields([])
    setDraft(null)
    setApplying(null)
  }

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isSending) return

    const nextMessages = [...messages, { role: "user" as const, content }]
    setMessages(nextMessages)
    setInput("")
    setIsSending(true)
    scrollToBottom()

    try {
      const turn = await api.post<JdChatResponse>("/api/jobs/ai-chat", {
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
      })
      setMessages((prev) => [...prev, { role: "assistant", content: turn.reply }])
      setMissingFields(turn.missingMandatoryFields ?? [])
      if (turn.jd) setDraft(turn.jd)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.message.includes("AI provider not configured")) {
        toast.warning("AI provider not configured", {
          description: "Set up your AI provider in AI Management before using the AI assistant.",
        })
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I can't reach an AI provider right now — ask an admin to configure one in AI Management.", isError: true },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong generating a response. Please try again.", isError: true },
        ])
        toast.error(err instanceof ApiError ? err.message : "Failed to reach the AI assistant")
      }
    } finally {
      setIsSending(false)
      scrollToBottom()
    }
  }

  const regenerate = () => sendMessage("Please regenerate the draft based on everything discussed so far.")

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
        if (!next) reset()
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
          {/* Chat column */}
          <div className={cn("flex min-h-0 flex-col", draft && "border-b border-border md:border-r md:border-b-0")}>
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Tell me about the role in your own words — title, team, location, whatever you have. I&apos;ll ask about anything important that&apos;s
                    missing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendMessage(s)}
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

            {missingFields.length > 0 && !draft && <p className="px-5 pb-1 text-xs text-muted-foreground">Still needed: {missingFields.join(", ")}</p>}

            <form
              className="flex items-center gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
            >
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" disabled={isSending} />
              <Button type="submit" size="icon" disabled={isSending || !input.trim()}>
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
          </div>

          {/* Draft preview / edit column */}
          {draft && (
            <div className="flex min-h-0 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Draft — review &amp; edit</p>

                <div className="space-y-2">
                  <Label>Job title</Label>
                  <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={draft.department ?? ""} onChange={(e) => setDraft({ ...draft, department: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={draft.location ?? ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Employment type</Label>
                    <Select value={draft.employmentType} onValueChange={(v) => setDraft({ ...draft, employmentType: v as ApiJobType })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience level</Label>
                    <Select value={draft.experienceLevel} onValueChange={(v) => setDraft({ ...draft, experienceLevel: v as ApiExperienceLevel })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Workplace</Label>
                    <Select
                      value={draft.remoteStatus ?? "unspecified"}
                      onValueChange={(v) => setDraft({ ...draft, remoteStatus: v === "unspecified" ? null : (v as ApiRemoteStatus) })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unspecified">Not specified</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salary range</Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={draft.salaryMin ?? ""}
                        onChange={(e) => setDraft({ ...draft, salaryMin: e.target.value ? Number(e.target.value) : null })}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={draft.salaryMax ?? ""}
                        onChange={(e) => setDraft({ ...draft, salaryMax: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required skills</Label>
                  <Input
                    value={draft.skills.join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        skills: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="React, TypeScript, SQL…"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated. Used for AI candidate matching.</p>
                </div>

                <div className="space-y-2">
                  <Label>Full description</Label>
                  <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={10} />
                  <p className="text-xs text-muted-foreground">Includes responsibilities, qualifications, and preferred skills. Edit freely.</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                <Button variant="ghost" size="sm" disabled={isSending} onClick={regenerate}>
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

import { useRef, useState } from "react"
import { toast } from "sonner"

import { ApiError, api } from "@/lib/api"
import type { ApiExperienceLevel, ApiJobType, ApiRemoteStatus } from "@/types"

/** Structured job-description draft returned by POST /api/jobs/ai-chat. */
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

export interface JdChatMsg {
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

/** The backend caps a conversation at 30 messages — warn before the request fails. */
const MAX_MESSAGES = 30

/**
 * Drives one conversational job-description session against `/api/jobs/ai-chat`.
 *
 * Shared by the "Create with AI" dialog on the job wizard and the full-page
 * AI Assistant, so both behave identically and only the layout differs.
 */
export function useJdAiChat() {
  const [messages, setMessages] = useState<JdChatMsg[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [draft, setDraft] = useState<JdAiDraft | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  const reset = () => {
    setMessages([])
    setInput("")
    setMissingFields([])
    setDraft(null)
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isSending) return

    if (messages.length >= MAX_MESSAGES) {
      toast.warning("This conversation is getting long", {
        description: "Start a new chat to keep the assistant responsive.",
      })
      return
    }

    const nextMessages = [...messages, { role: "user" as const, content }]
    setMessages(nextMessages)
    setInput("")
    setIsSending(true)
    scrollToBottom()

    try {
      const turn = await api.post<JdChatResponse>("/api/jobs/ai-chat", {
        // Error bubbles are local UI state — never send them back as context.
        messages: nextMessages.filter((m) => !m.isError).map((m) => ({ role: m.role, content: m.content })),
      })
      setMessages((prev) => [...prev, { role: "assistant", content: turn.reply }])
      setMissingFields(turn.missingMandatoryFields ?? [])
      if (turn.jd) setDraft(turn.jd)
    } catch (err) {
      // 422 is the backend's "no AI provider configured for this org" signal.
      if (err instanceof ApiError && err.status === 422) {
        toast.warning("AI provider not configured", {
          description: "Set up your AI provider in AI Management before using the AI assistant.",
        })
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I can't reach an AI provider right now — ask an admin to configure one in AI Management.",
            isError: true,
          },
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

  return {
    messages,
    input,
    setInput,
    isSending,
    missingFields,
    draft,
    setDraft,
    scrollRef,
    sendMessage,
    regenerate,
    reset,
  }
}

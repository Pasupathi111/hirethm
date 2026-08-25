import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import { ApiError, api } from "@/lib/api"
import type { MyCandidate } from "@/types"

interface CandidateSessionState {
  candidate: MyCandidate | null
  loading: boolean
  error: string
  refetch: () => void
}

const CandidateSessionContext = createContext<CandidateSessionState | null>(null)

export function CandidateSessionProvider({ children }: { children: ReactNode }) {
  const [candidate, setCandidate] = useState<MyCandidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<MyCandidate>("/api/me/candidate")
      .then(setCandidate)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your profile"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <CandidateSessionContext.Provider value={{ candidate, loading, error, refetch: load }}>
      {children}
    </CandidateSessionContext.Provider>
  )
}

export function useMyCandidate() {
  const ctx = useContext(CandidateSessionContext)
  if (!ctx) throw new Error("useMyCandidate must be used within a CandidateSessionProvider")
  return ctx
}

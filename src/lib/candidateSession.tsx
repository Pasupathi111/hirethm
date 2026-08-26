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

/**
 * Same context, but returns null instead of throwing when there is no
 * provider above. For components rendered on BOTH the public marketing routes
 * and the signed-in /app routes (JobApply is the same component in each), so
 * they can prefill from the profile when it exists without crashing when it
 * doesn't.
 */
export function useMyCandidateOptional(): CandidateSessionState | null {
  return useContext(CandidateSessionContext)
}

import { Outlet } from "react-router-dom"

import { CandidateSidebar } from "@/components/layout/CandidateSidebar"
import { CandidateTopbar } from "@/components/layout/CandidateTopbar"
import { CandidateSessionProvider } from "@/lib/candidateSession"

export function CandidateLayout() {
  return (
    <CandidateSessionProvider>
      <div className="flex min-h-screen bg-background">
        <CandidateSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <CandidateTopbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </CandidateSessionProvider>
  )
}

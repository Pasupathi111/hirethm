import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { type PaginatedResponse, api } from "@/lib/api"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiJob } from "@/types"

export function JobApplyConfirmation({ basePath = "/jobs" }: { basePath?: string }) {
  const { id } = useParams()
  const reduced = useReducedMotion()
  const [job, setJob] = useState<ApiJob | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .get<PaginatedResponse<ApiJob>>("/api/public/jobs?limit=100")
      .then((res) => {
        const found = res.data.find((j) => j.id === id)
        if (found) setJob(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) return <Navigate to={basePath} replace />
  if (!job) return null

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <motion.div variants={withReducedMotion(reduced, fadeInUp)} initial="hidden" animate="show">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="mt-5 text-3xl">Application submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Your application to <span className="font-semibold text-foreground">{job.title}</span> has been sent.
          We'll notify you as soon as there's an update.
        </p>

        <div className="mt-8 grid gap-3 rounded-lg border border-border bg-card p-6 text-left text-sm text-muted-foreground">
          <p>1. The employer reviews your application, powered by AI matching.</p>
          <p>2. If shortlisted, you'll receive an interview request in Applications.</p>
          <p>3. Track status anytime from your dashboard.</p>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link to={basePath}>Browse more jobs</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/app">Go to dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

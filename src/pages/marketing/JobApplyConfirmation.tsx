import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { Link, Navigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { jobs } from "@/data/mockData"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function JobApplyConfirmation({ basePath = "/jobs" }: { basePath?: string }) {
  const { id } = useParams()
  const job = jobs.find((j) => j.id === id)
  const reduced = useReducedMotion()

  if (!job) return <Navigate to={basePath} replace />

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <motion.div variants={withReducedMotion(reduced, fadeInUp)} initial="hidden" animate="show">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="mt-5 text-3xl">Application submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Your application to <span className="font-semibold text-foreground">{job.title}</span> at{" "}
          <span className="font-semibold text-foreground">{job.company}</span> has been sent. We'll notify you as soon as there's an update.
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

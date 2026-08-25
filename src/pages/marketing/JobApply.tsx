import { ArrowLeft, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { jobs } from "@/data/mockData"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function JobApply({ basePath = "/jobs" }: { basePath?: string }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const job = jobs.find((j) => j.id === id)
  const reduced = useReducedMotion()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [resumeName, setResumeName] = useState("")
  const [coverNote, setCoverNote] = useState("")

  if (!job) return <Navigate to={basePath} replace />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={`${basePath}/${job.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to job
      </Link>

      <motion.div
        className="mt-6 rounded-lg border border-border bg-card p-6 sm:p-8"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className={`${job.companyColor} text-white`}>{job.companyInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl">Apply to {job.title}</h1>
            <p className="text-sm text-muted-foreground">{job.company} · {job.workMode}</p>
          </div>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            toast.success("Application submitted", { description: `You applied to ${job.title} at ${job.company}.` })
            navigate(`${basePath}/${job.id}/confirmation`)
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <label
              htmlFor="resume"
              className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-foreground/30"
            >
              <span className="flex items-center gap-2">
                <Upload className="size-4" />
                {resumeName || "Upload your resume (PDF)"}
              </span>
              <span className="font-semibold text-primary">Browse</span>
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setResumeName(e.target.files?.[0]?.name ?? "")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverNote">Why are you a fit for this role?</Label>
            <Textarea id="coverNote" value={coverNote} onChange={(e) => setCoverNote(e.target.value)} rows={5} placeholder="Optional" />
          </div>

          <Button type="submit" size="lg" className="w-full">
            Submit application
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

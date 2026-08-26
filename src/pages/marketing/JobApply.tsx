import { ArrowLeft, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { DynamicQuestionField, type JobQuestion, type QuestionValue } from "@/components/forms/DynamicQuestionField"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, type PaginatedResponse, api } from "@/lib/api"
import { useMyCandidateOptional } from "@/lib/candidateSession"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiJob } from "@/types"

interface PublicJobForApply {
  id: string
  title: string
  slug: string
  organizationName: string | null
  phoneRequirement: "hidden" | "optional" | "required"
  requireResume: boolean
  requireCoverLetter: boolean
  questions: JobQuestion[]
}

export function JobApply({ basePath = "/jobs" }: { basePath?: string }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()

  // Null on the public marketing route (no provider); populated inside /app.
  const candidateSession = useMyCandidateOptional()
  const candidate = candidateSession?.candidate ?? null

  const [job, setJob] = useState<PublicJobForApply | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [prefilled, setPrefilled] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("") // honeypot — always left blank by real users
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterText, setCoverLetterText] = useState("")
  const [responses, setResponses] = useState<Record<string, QuestionValue>>({})
  const [questionFiles, setQuestionFiles] = useState<Record<string, File | null>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    // Public apply needs slug + custom questions, neither of which the id-keyed
    // routes expose — resolve id -> slug from the open-jobs list first, same as JobDetail.
    api
      .get<PaginatedResponse<ApiJob>>("/api/public/jobs?limit=100")
      .then((res) => {
        const found = res.data.find((j) => j.id === id)
        if (!found) throw new Error("not found")
        return api.get<PublicJobForApply>(`/api/public/jobs/${found.slug}`)
      })
      .then(setJob)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  // Signed-in candidates shouldn't retype their details for every application —
  // seed the identity fields from the profile once it arrives. Guarded by
  // `prefilled` so it runs a single time and never clobbers edits the user
  // makes afterwards (they can still override anything for one application).
  useEffect(() => {
    if (!candidate || prefilled) return
    setFirstName((v) => v || candidate.firstName || "")
    setLastName((v) => v || candidate.lastName || "")
    setEmail((v) => v || candidate.email || "")
    setPhone((v) => v || candidate.phone || "")
    setPrefilled(true)
  }, [candidate, prefilled])

  if (notFound) return <Navigate to={basePath} replace />

  if (loading || !job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-6 h-[32rem] w-full" />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || !job) return
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)
      formData.append("email", email)
      if (phone) formData.append("phone", phone)
      if (website) formData.append("website", website)
      if (coverLetterText) formData.append("coverLetterText", coverLetterText)
      if (resumeFile) formData.append("resume", resumeFile)

      const responseArray = job.questions
        .filter((q) => q.type !== "file_upload")
        .map((q) => ({ questionId: q.id, value: responses[q.id] }))
        .filter((r) => r.value !== undefined && r.value !== "")
      formData.append("responses", JSON.stringify(responseArray))

      for (const q of job.questions) {
        if (q.type === "file_upload") {
          const file = questionFiles[q.id]
          if (file) formData.append(`file:${q.id}`, file)
        }
      }

      await api.upload(`/api/public/jobs/${job.slug}/apply`, formData)
      toast.success("Application submitted", { description: `You applied to ${job.title}${job.organizationName ? ` at ${job.organizationName}` : ""}.` })
      navigate(`${basePath}/${job.id}/confirmation`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit your application")
    } finally {
      setSubmitting(false)
    }
  }

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
            <AvatarFallback className="bg-slate-800 text-white">{job.title.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl">Apply to {job.title}</h1>
            {job.organizationName && <p className="text-sm text-muted-foreground">{job.organizationName}</p>}
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Honeypot — hidden from real users, bots tend to fill every field */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {candidate && (
            <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              Filled in from your profile — edit anything below if it should differ for this application.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {job.phoneRequirement !== "hidden" && (
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone {job.phoneRequirement === "optional" && <span className="text-muted-foreground">(optional)</span>}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={job.phoneRequirement === "required"}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">
              Resume / CV {job.requireResume && <span className="text-destructive">*</span>}
            </Label>
            <label
              htmlFor="resume"
              className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-foreground/30"
            >
              <span className="flex items-center gap-2">
                <Upload className="size-4" />
                {resumeFile?.name ?? "Upload your resume (PDF, DOC, DOCX)"}
              </span>
              <span className="font-semibold text-primary">Browse</span>
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              required={job.requireResume}
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverNote">
              Why are you a fit for this role? {job.requireCoverLetter && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="coverNote"
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              rows={5}
              placeholder={job.requireCoverLetter ? undefined : "Optional"}
              required={job.requireCoverLetter}
            />
          </div>

          {job.questions.map((q) => (
            <DynamicQuestionField
              key={q.id}
              question={q}
              value={responses[q.id]}
              onChange={(value) => setResponses((prev) => ({ ...prev, [q.id]: value }))}
              onFileChange={(file) => setQuestionFiles((prev) => ({ ...prev, [q.id]: file }))}
            />
          ))}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

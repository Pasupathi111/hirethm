import { Briefcase, FileText, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { EmptyState } from "@/components/feedback/EmptyState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError, api, type PaginatedResponse } from "@/lib/api"
import type { ApiApplication, ApiCandidate, ApiDocument, ApiJob } from "@/types"

interface CandidateApplication {
  id: string
  status: string
  createdAt: string
  job: { id: string; title: string }
}

interface CandidateDocumentSummary {
  id: string
  type: string
  originalFilename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  parsed: boolean
}

interface CandidateDetailResponse extends ApiCandidate {
  applications: CandidateApplication[]
  documents: CandidateDocumentSummary[]
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminCandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<CandidateDetailResponse | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [showApplyPicker, setShowApplyPicker] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)
  const [docDetails, setDocDetails] = useState<Record<string, ApiDocument>>({})
  const [docLoading, setDocLoading] = useState<string | null>(null)

  const toggleDocument = async (docId: string) => {
    if (expandedDocId === docId) {
      setExpandedDocId(null)
      return
    }
    setExpandedDocId(docId)
    if (docDetails[docId]) return
    setDocLoading(docId)
    try {
      const data = await api.get<ApiDocument>(`/api/documents/${docId}`)
      setDocDetails((prev) => ({ ...prev, [docId]: data }))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load parsed resume content")
    } finally {
      setDocLoading(null)
    }
  }

  const load = () => {
    if (!id) return
    api
      .get<CandidateDetailResponse>(`/api/candidates/${id}`)
      .then(setCandidate)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  useEffect(() => {
    api.get<PaginatedResponse<ApiJob>>("/api/jobs?limit=100").then((res) => setJobs(res.data))
  }, [])

  const handleApply = async () => {
    if (!id || !selectedJobId) return
    setIsApplying(true)
    try {
      await api.post<ApiApplication>("/api/applications", { candidateId: id, jobId: selectedJobId })
      toast.success("Application created")
      setShowApplyPicker(false)
      setSelectedJobId("")
      setLoading(true)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create application")
    } finally {
      setIsApplying(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await api.del(`/api/candidates/${id}`)
      toast.success("Candidate deleted", { description: "The candidate was moved to quarantine and can be restored later." })
      navigate("/admin/candidates")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete candidate")
      setIsDeleting(false)
      setShowDelete(false)
    }
  }

  if (notFound) return <Navigate to="/admin/candidates" replace />
  if (loading || !candidate) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const initials = `${candidate.firstName[0] ?? ""}${candidate.lastName[0] ?? ""}`.toUpperCase()
  const appliedJobIds = new Set(candidate.applications.map((a) => a.job.id))
  const availableJobs = jobs.filter((j) => !appliedJobIds.has(j.id))

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/candidates"
        backLabel="Back to candidates"
        initials={initials}
        name={candidate.displayName || `${candidate.firstName} ${candidate.lastName}`}
        meta={`${candidate.email}${candidate.phone ? ` · ${candidate.phone}` : ""} · Created ${new Date(candidate.createdAt).toLocaleDateString()}`}
        actions={
          <>
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => navigate(`/admin/candidates/${id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete this candidate?"
        description={`This removes "${candidate.displayName || `${candidate.firstName} ${candidate.lastName}`}" from active lists. The record is retained and can be restored (GDPR-safe soft delete).`}
        confirmLabel="Delete candidate"
        loading={isDeleting}
        onConfirm={handleDelete}
      />

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2>Applications ({candidate.applications.length})</h2>
          <Button variant="dark" size="sm" onClick={() => setShowApplyPicker((v) => !v)}>
            <Plus className="size-4" /> Apply to Job
          </Button>
        </div>

        {showApplyPicker && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/50 p-3">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a job..." />
              </SelectTrigger>
              <SelectContent>
                {availableJobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" disabled={!selectedJobId || isApplying} onClick={handleApply}>
              {isApplying ? "Applying..." : "Confirm"}
            </Button>
            {availableJobs.length === 0 && <p className="text-xs text-muted-foreground">No other open jobs to apply to.</p>}
          </div>
        )}

        <div className="mt-4">
          {candidate.applications.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No applications yet."
              description="Use Apply to Job above to link this candidate to a role."
            />
          ) : (
            <div className="space-y-2">
              {candidate.applications.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b border-hairline py-3 text-sm last:border-0">
                  <div>
                    <p className="font-semibold">{a.job.title}</p>
                    <p className="text-xs text-muted-foreground">Applied {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2>Documents ({candidate.documents.length})</h2>

        {candidate.documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents uploaded."
            description="Resumes uploaded by the candidate or by your team will show up here."
          />
        ) : (
          <div className="mt-4 space-y-2">
            {candidate.documents.map((doc) => {
              const detail = docDetails[doc.id]
              const isExpanded = expandedDocId === doc.id
              return (
                <div key={doc.id} className="rounded-md border border-hairline">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm"
                    onClick={() => doc.parsed && toggleDocument(doc.id)}
                    disabled={!doc.parsed}
                  >
                    <div>
                      <p className="font-semibold">{doc.originalFilename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(doc.sizeBytes)} · {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {doc.parsed ? (
                      <span className="text-xs font-semibold text-primary">{isExpanded ? "Hide" : "View extracted content"} →</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not parsed</span>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-hairline p-3">
                      {docLoading === doc.id ? (
                        <Skeleton className="h-16 w-full" />
                      ) : detail?.parsedContent ? (
                        <div className="space-y-3">
                          {detail.parsedContent.structured.skills.length > 0 && (
                            <div>
                              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Detected skills</p>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {detail.parsedContent.structured.skills.map((skill) => (
                                  <Badge key={skill} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {(detail.parsedContent.structured.email || detail.parsedContent.structured.phone) && (
                            <p className="text-sm text-muted-foreground">
                              Detected contact:{" "}
                              {[detail.parsedContent.structured.email, detail.parsedContent.structured.phone].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {detail.parsedContent.sections.map((section) => (
                            <div key={section.heading}>
                              <p className="text-xs font-semibold">{section.heading}</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No extracted content available.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {candidate.quickNotes && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2>Notes</h2>
          <p className="mt-2 text-sm text-muted-foreground">{candidate.quickNotes}</p>
        </div>
      )}
    </div>
  )
}

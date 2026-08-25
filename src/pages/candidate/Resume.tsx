import { FileText, Trash2, Upload } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { SectionCard } from "@/components/cards/SectionCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { ApiDocument } from "@/types"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Resume() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<ApiDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<{ data: ApiDocument[] }>("/api/me/documents")
      .then((res) => setDocuments(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your documents"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const uploadFile = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      await api.upload<ApiDocument>("/api/me/documents", formData)
      toast.success("Resume uploaded", { description: "HireThm is analysing your CV." })
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload resume")
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = async (id: string) => {
    const previous = documents
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    try {
      await api.del(`/api/me/documents/${id}`)
      toast.success("Document removed")
    } catch (err) {
      setDocuments(previous)
      toast.error(err instanceof ApiError ? err.message : "Failed to remove document")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Resume</h1>
        <p className="mt-1 text-muted-foreground">
          HireThm reads your CV and shows you exactly what it extracted. Nothing is changed without your approval.
        </p>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card py-16 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) uploadFile(file)
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-lg bg-accent">
          <Upload className="size-6 text-accent-foreground" />
        </div>
        <p className="text-lg font-bold">Upload your resume</p>
        <p className="text-sm text-muted-foreground">PDF, DOC, DOCX · up to 10 MB</p>
        <div className="mt-2 flex gap-3">
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="size-4" />
            {uploading ? "Uploading…" : "Browse files"}
          </Button>
          <Button variant="outline" disabled={uploading}>
            Drag & drop
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
            e.target.value = ""
          }}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : documents.length === 0 ? (
        <EmptyState icon={FileText} title="No resume uploaded yet." description="Upload a resume so HireThm can extract your experience and skills." />
      ) : (
        <SectionCard title="Your documents">
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{doc.originalFilename}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSize(doc.sizeBytes)} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeDocument(doc.id)}>
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {documents.some((d) => d.parsedContent) && (
        <SectionCard title="What HireThm extracted">
          <div className="space-y-6">
            {documents
              .filter((d) => d.parsedContent)
              .map((d) => (
                <div key={d.id}>
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{d.originalFilename}</p>

                  {d.parsedContent!.structured.skills.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Detected skills — already added to your profile:
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {d.parsedContent!.structured.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(d.parsedContent!.structured.email || d.parsedContent!.structured.phone) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Detected contact info: {[d.parsedContent!.structured.email, d.parsedContent!.structured.phone].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  {d.parsedContent!.sections.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {d.parsedContent!.sections.map((section) => (
                        <div key={section.heading}>
                          <p className="text-xs font-semibold text-foreground">{section.heading}</p>
                          <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

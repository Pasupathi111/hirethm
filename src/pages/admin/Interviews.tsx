import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError, api, type PaginatedResponse } from "@/lib/api"
import type { ApiApplication, ApiInterview, ApiInterviewType } from "@/types"

const statusLabel: Record<string, string> = {
  scheduled: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
}

const typeOptions: { value: ApiInterviewType; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video" },
  { value: "in_person", label: "In Person" },
  { value: "panel", label: "Panel" },
  { value: "technical", label: "Technical" },
  { value: "take_home", label: "Take Home" },
]

const columns: AdminColumn<ApiInterview>[] = [
  { header: "Candidate", render: (i) => `${i.candidateFirstName} ${i.candidateLastName}` },
  { header: "Job", render: (i) => i.jobTitle },
  { header: "Title", render: (i) => i.title },
  { header: "Type", render: (i) => i.type.replace("_", " ") },
  { header: "Scheduled", render: (i) => new Date(i.scheduledAt).toLocaleString() },
  { header: "Status", render: (i) => <StatusBadge status={statusLabel[i.status] ?? i.status} /> },
]

function defaultScheduledAt() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  return d.toISOString().slice(0, 16)
}

export function AdminInterviews() {
  const [interviews, setInterviews] = useState<ApiInterview[]>([])
  const [applications, setApplications] = useState<ApiApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showScheduler, setShowScheduler] = useState(false)

  const [applicationId, setApplicationId] = useState("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<ApiInterviewType>("video")
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt())
  const [duration, setDuration] = useState("60")
  const [isScheduling, setIsScheduling] = useState(false)

  const load = () => {
    api
      .get<PaginatedResponse<ApiInterview>>("/api/interviews?limit=100")
      .then((res) => setInterviews(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load interviews"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    api.get<PaginatedResponse<ApiApplication>>("/api/applications?limit=100").then((res) => setApplications(res.data))
  }, [])

  const handleSchedule = async () => {
    if (!applicationId || !title.trim()) return
    setIsScheduling(true)
    try {
      await api.post<ApiInterview>("/api/interviews", {
        applicationId,
        title: title.trim(),
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: Number(duration),
      })
      setShowScheduler(false)
      setApplicationId("")
      setTitle("")
      setScheduledAt(defaultScheduledAt())
      setLoading(true)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule interview")
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="dark" onClick={() => setShowScheduler((v) => !v)}>
          <Plus className="size-4" /> Schedule Interview
        </Button>
      </div>

      {showScheduler && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg">Schedule an interview</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Application *</Label>
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a candidate + job..." />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.candidateFirstName} {a.candidateLastName} — {a.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {applications.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No applications yet — create one from a candidate's "Apply to Job" action first.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewTitle">Title *</Label>
              <Input id="interviewTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Technical Screen" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ApiInterviewType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & time *</Label>
              <Input id="scheduledAt" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowScheduler(false)}>
              Cancel
            </Button>
            <Button disabled={!applicationId || !title.trim() || isScheduling} onClick={handleSchedule}>
              {isScheduling ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </div>
      )}

      <AdminListPage
        title="Interviews"
        subtitle={`${interviews.length} interview${interviews.length === 1 ? "" : "s"} scheduled`}
        tabs={["All", "Upcoming", "Completed", "Cancelled", "No Show"]}
        getTab={(i) => statusLabel[i.status] ?? i.status}
        columns={columns}
        rows={interviews}
        rowHref={(i) => `/admin/interviews/${i.id}`}
        searchPlaceholder="Search interviews..."
        loading={loading}
      />
    </div>
  )
}

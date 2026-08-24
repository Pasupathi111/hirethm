import { Navigate, useParams } from "react-router-dom"

import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jobs } from "@/data/mockData"

export function AdminJobDetail() {
  const { id } = useParams()
  const job = jobs.find((j) => j.id === id)

  if (!job) return <Navigate to="/admin/jobs" replace />

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/jobs"
        backLabel="Back to jobs"
        initials={job.companyInitials}
        name={job.title}
        meta={`${job.reqId} · ${job.company} · Posted ${job.postedAt}`}
        actions={
          <>
            <Button variant="outline">Unpublish</Button>
            <Button variant="dark">Re-run AI</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1"><StatusBadge status={job.status} className="text-base" /></p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">JD completeness</p>
          <p className="mt-1 text-2xl font-extrabold">{job.jdComplete}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Applications</p>
          <p className="mt-1 text-2xl font-extrabold">{job.applications}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">AI matches</p>
          <p className="mt-1 text-2xl font-extrabold">{job.matches}</p>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="ai">AI extraction</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold">About the role</h2>
            <p className="mt-2 text-sm text-muted-foreground">{job.about}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            AI status: <StatusBadge status={job.aiStatus} /> · Extracted {job.requirements.length} requirements and{" "}
            {job.skills.length} skills from the job description.
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {job.applications} applications received · {job.matches} AI matches generated.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

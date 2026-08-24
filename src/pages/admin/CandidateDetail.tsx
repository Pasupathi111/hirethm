import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminCandidates, auditLogs, candidateProfile, consentHistory, jobs, matches } from "@/data/mockData"

export function AdminCandidateDetail() {
  const { id } = useParams()
  const candidate = adminCandidates.find((c) => c.id === id)

  if (!candidate) return <Navigate to="/admin/candidates" replace />

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/candidates"
        backLabel="Back to candidates"
        initials={candidate.initials}
        name={candidate.name}
        meta={`${candidate.id} · ${candidate.email} · ${candidate.location} · Created ${candidate.created}`}
        actions={
          <>
            <Button variant="outline">Message</Button>
            <Button variant="dark">Suspend</Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricTile label="Profile completeness" value={`${candidate.profilePercent}%`} />
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">CV status</p>
              <p className="mt-1 text-2xl font-extrabold">
                <StatusBadge status={candidate.cvStatus} className="text-base" /> <span className="text-base text-muted-foreground">· v3</span>
              </p>
            </div>
            <MetricTile label="Applications" value={candidate.applications} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold">Consent and visibility record</h2>
              <p className="mt-1 text-sm text-muted-foreground">Which employers have been granted visibility, and when.</p>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Employer</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentHistory.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.employer}</TableCell>
                      <TableCell>
                        <StatusBadge status={c.tone === "positive" ? "Accepted" : c.tone === "negative" ? "Rejected" : "Given"} />
                      </TableCell>
                      <TableCell>{c.tone === "positive" ? "Visible" : "Hidden"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.timestamp.split(" · ")[0]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold">Recent activity</h2>
              <ul className="mt-4 space-y-4">
                {auditLogs.slice(0, 4).map((log) => (
                  <li key={log.id}>
                    <p className="text-sm font-semibold">{log.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold">Summary</h2>
            <p className="mt-2 text-sm text-muted-foreground">{candidateProfile.summary}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {candidateProfile.skills.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resume">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            resume-v3.pdf · Analysed on 02 Aug 2026 · Extracted {candidateProfile.experience.length} roles and{" "}
            {candidateProfile.skills.length} skills.
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {candidate.applications} applications submitted, most recently to {jobs[0].title} at {jobs[0].company}.
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-muted-foreground">{m.company}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consent">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Visibility setting: Open to AI matching. 0 consent breaches recorded for this candidate.
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">{log.action}</TableCell>
                  <TableCell>{log.resourceId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { AlertTriangle } from "lucide-react"

import { EditSectionDialog } from "@/components/dialogs/EditSectionDialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { candidateProfile } from "@/data/mockData"

function SectionCard({
  title,
  editValue,
  children,
}: {
  title: string
  editValue: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <EditSectionDialog
          section={title}
          defaultValue={editValue}
          trigger={
            <Button variant="outline" size="sm">
              Edit
            </Button>
          }
        />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

export function Profile() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">{candidateProfile.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">{candidateProfile.name}</h1>
            <p className="text-muted-foreground">
              {candidateProfile.title} · {candidateProfile.location}
            </p>
          </div>
          <div className="w-full sm:w-56">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-2xl font-extrabold">{candidateProfile.completeness}%</span>
              <span className="text-sm text-muted-foreground">complete</span>
            </div>
            <Progress value={candidateProfile.completeness} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-amber-50 p-4 dark:bg-amber-500/10">
        <p className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4" />
          Add 2 more skills to improve your matches. Candidates with 12+ skills receive 40% more matches.
        </p>
        <Button size="sm">Add skills</Button>
      </div>

      <SectionCard title="Personal Information" editValue={candidateProfile.summary}>
        <Row label="Full name" value={candidateProfile.name} />
        <Row label="Email" value={candidateProfile.email} />
        <Row label="Phone" value={candidateProfile.phone} />
        <Row label="Location" value={candidateProfile.location} />
      </SectionCard>

      <SectionCard title="Summary" editValue={candidateProfile.summary}>
        <p className="text-sm text-muted-foreground">{candidateProfile.summary}</p>
      </SectionCard>

      <SectionCard
        title="Experience"
       
        editValue={candidateProfile.experience.map((e) => `${e.role} · ${e.company} · ${e.period}`).join("\n")}
      >
        <div className="space-y-3">
          {candidateProfile.experience.map((exp) => (
            <div key={exp.role} className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0 last:pb-0">
              <div>
                <p className="font-semibold">
                  {exp.role} · {exp.company}
                </p>
              </div>
              <span className="text-muted-foreground">{exp.period}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Education"
       
        editValue={candidateProfile.education.map((e) => `${e.school} · ${e.period}`).join("\n")}
      >
        <div className="space-y-3">
          {candidateProfile.education.map((edu) => (
            <div key={edu.school} className="flex items-center justify-between text-sm">
              <span className="font-semibold">{edu.school}</span>
              <span className="text-muted-foreground">{edu.period}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Skills" editValue={candidateProfile.skills.join(", ")}>
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Core</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {candidateProfile.skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Certifications"
       
        editValue={candidateProfile.certifications.map((c) => `${c.name} · ${c.year}`).join("\n")}
      >
        {candidateProfile.certifications.map((cert) => (
          <div key={cert.name} className="flex items-center justify-between text-sm">
            <span className="font-semibold">{cert.name}</span>
            <span className="text-muted-foreground">{cert.year}</span>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Languages"
       
        editValue={candidateProfile.languages.map((l) => `${l.name} · ${l.level}`).join("\n")}
      >
        <div className="space-y-3">
          {candidateProfile.languages.map((lang) => (
            <div key={lang.name} className="flex items-center justify-between text-sm">
              <span className="font-semibold">{lang.name}</span>
              <span className="text-muted-foreground">{lang.level}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

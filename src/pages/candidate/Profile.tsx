import { motion } from "framer-motion"
import { Pencil, Plus } from "lucide-react"

import { SectionCard } from "@/components/cards/SectionCard"
import { EditSectionDialog } from "@/components/dialogs/EditSectionDialog"
import { Callout } from "@/components/feedback/Callout"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { candidateProfile } from "@/data/mockData"
import { useMyCandidate } from "@/lib/candidateSession"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

function EditableSection({
  title,
  editValue,
  children,
}: {
  title: string
  editValue: string
  children: React.ReactNode
}) {
  return (
    <SectionCard
      title={title}
      actions={
        <EditSectionDialog
          section={title}
          defaultValue={editValue}
          trigger={
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label={`Edit ${title}`}>
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit {title}</TooltipContent>
            </Tooltip>
          }
        />
      }
    >
      {children}
    </SectionCard>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

export function Profile() {
  const reduced = useReducedMotion()
  const { candidate, loading, error, refetch } = useMyCandidate()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={refetch} />
  if (!candidate) return null

  const name = candidate.displayName || `${candidate.firstName} ${candidate.lastName}`
  const initials = `${candidate.firstName[0] ?? ""}${candidate.lastName[0] ?? ""}`.toUpperCase()

  return (
    <div className="space-y-6">
      <motion.div
        className="rounded-lg border border-border bg-card p-6"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-wrap items-center gap-6">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl">{name}</h1>
            <p className="text-muted-foreground">
              {candidate.email}
              {candidate.organization ? ` · Applied to ${candidate.organization.name}` : ""}
            </p>
          </div>
        </div>
      </motion.div>

      <EditableSection title="Personal Information" editValue={candidate.quickNotes ?? ""}>
        <Row label="Full name" value={name} />
        <Row label="Email" value={candidate.email} />
        <Row label="Phone" value={candidate.phone ?? "Not provided"} />
        <Row label="Member since" value={new Date(candidate.createdAt).toLocaleDateString()} />
      </EditableSection>

      {candidate.quickNotes && (
        <EditableSection title="About" editValue={candidate.quickNotes}>
          <p className="text-sm text-muted-foreground">{candidate.quickNotes}</p>
        </EditableSection>
      )}

      <Callout
        tone="warning"
        actions={
          <Button size="sm">
            <Plus className="size-4" />
            Add skills
          </Button>
        }
      >
        The sections below (summary, experience, education, skills) aren't part of your profile data yet — add
        them to make your applications stand out.
      </Callout>

      <EditableSection title="Summary" editValue={candidateProfile.summary}>
        <p className="text-sm text-muted-foreground">{candidateProfile.summary}</p>
      </EditableSection>

      <EditableSection
        title="Experience"
        editValue={candidateProfile.experience.map((e) => `${e.role} · ${e.company} · ${e.period}`).join("\n")}
      >
        <div className="space-y-3">
          {candidateProfile.experience.map((exp) => (
            <div key={exp.role} className="flex items-center justify-between border-b border-hairline pb-3 text-sm last:border-0 last:pb-0">
              <div>
                <p className="font-semibold">
                  {exp.role} · {exp.company}
                </p>
              </div>
              <span className="text-muted-foreground">{exp.period}</span>
            </div>
          ))}
        </div>
      </EditableSection>

      <EditableSection
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
      </EditableSection>

      <EditableSection title="Skills" editValue={candidateProfile.skills.join(", ")}>
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Core</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {candidateProfile.skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </EditableSection>

      <EditableSection
        title="Certifications"
        editValue={candidateProfile.certifications.map((c) => `${c.name} · ${c.year}`).join("\n")}
      >
        {candidateProfile.certifications.map((cert) => (
          <div key={cert.name} className="flex items-center justify-between text-sm">
            <span className="font-semibold">{cert.name}</span>
            <span className="text-muted-foreground">{cert.year}</span>
          </div>
        ))}
      </EditableSection>

      <EditableSection
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
      </EditableSection>
    </div>
  )
}

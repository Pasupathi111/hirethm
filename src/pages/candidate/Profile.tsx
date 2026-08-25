import { motion } from "framer-motion"
import { Pencil } from "lucide-react"

import { SectionCard } from "@/components/cards/SectionCard"
import { EditSectionDialog } from "@/components/dialogs/EditSectionDialog"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/lib/api"
import { useMyCandidate } from "@/lib/candidateSession"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { MyCandidate } from "@/types"

function EditableSection({
  title,
  editValue,
  onSave,
  children,
}: {
  title: string
  editValue: string
  onSave?: (value: string) => Promise<void> | void
  children: React.ReactNode
}) {
  return (
    <SectionCard
      title={title}
      actions={
        <EditSectionDialog
          section={title}
          defaultValue={editValue}
          onSave={onSave}
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
  const skills = candidate.skills ?? []

  const savePersonalInfo = async (value: string) => {
    const [firstName, ...rest] = value.split(" ")
    await api.patch<MyCandidate>("/api/me/candidate", {
      firstName: firstName || candidate.firstName,
      lastName: rest.join(" ") || candidate.lastName,
    })
    refetch()
  }

  const savePhone = async (value: string) => {
    await api.patch<MyCandidate>("/api/me/candidate", { phone: value || null })
    refetch()
  }

  const saveNotes = async (value: string) => {
    await api.patch<MyCandidate>("/api/me/candidate", { quickNotes: value })
    refetch()
  }

  const saveSkills = async (value: string) => {
    const parsed = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    await api.patch<MyCandidate>("/api/me/candidate", { skills: parsed })
    refetch()
  }

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

      <EditableSection title="Personal Information" editValue={name} onSave={savePersonalInfo}>
        <Row label="Full name" value={name} />
        <Row label="Email" value={candidate.email} />
        <Row label="Phone" value={candidate.phone ?? "Not provided"} />
        <Row label="Member since" value={new Date(candidate.createdAt).toLocaleDateString()} />
      </EditableSection>

      <EditableSection title="Phone" editValue={candidate.phone ?? ""} onSave={savePhone}>
        <p className="text-sm text-muted-foreground">{candidate.phone ?? "Not provided"}</p>
      </EditableSection>

      <EditableSection title="About" editValue={candidate.quickNotes ?? ""} onSave={saveNotes}>
        <p className="text-sm text-muted-foreground">{candidate.quickNotes || "No notes added yet."}</p>
      </EditableSection>

      <EditableSection title="Skills" editValue={skills.join(", ")} onSave={saveSkills}>
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Core</p>
        {skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No skills added yet. Use the edit button to add some.</p>
        )}
      </EditableSection>
    </div>
  )
}

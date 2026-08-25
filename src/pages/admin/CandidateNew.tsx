import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ChipGroup } from "@/components/forms/ChipGroup"
import { SectionCard } from "@/components/cards/SectionCard"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const skillOptions = ["React", "TypeScript", "Node.js", "GraphQL", "Python", "AWS", "SQL", "Product Management"]

export function AdminCandidateNew() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [skills, setSkills] = useState<string[]>([])

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/candidates"
        backLabel="Back to candidates"
        initials={name ? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() : "NW"}
        name="New candidate"
        meta="Manually created profile"
        actions={
          <Button
            variant="dark"
            disabled={!name || !email}
            onClick={() => {
              toast.success("Candidate created", { description: `${name} has been added to the platform.` })
              navigate("/admin/candidates")
            }}
          >
            Create candidate
          </Button>
        }
      />

      <SectionCard title="Basic information" animate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Blake" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@email.com" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Austin, TX" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Skills" description="Used for AI matching." animate={false}>
        <ChipGroup
          options={skillOptions}
          selected={skills}
          onToggle={(v) => setSkills((prev) => (prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]))}
        />
      </SectionCard>
    </div>
  )
}

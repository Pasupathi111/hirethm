import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError, api } from "@/lib/api"
import type { ApiCandidate, ApiGender } from "@/types"

const genderOptions: { value: ApiGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

export function AdminCandidateNew() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState<ApiGender | "">("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const canSubmit = firstName.trim() && lastName.trim() && email.trim()

  const handleSubmit = async () => {
    setError("")
    setIsSaving(true)
    try {
      const candidate = await api.post<ApiCandidate>("/api/candidates", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      })
      toast.success("Candidate added", { description: `${candidate.firstName} ${candidate.lastName} was added.` })
      navigate("/admin/candidates")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create candidate")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/candidates"
        backLabel="Back to candidates"
        initials={firstName || lastName ? `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() : "NW"}
        name="Add Candidate"
        meta="Manually created profile"
        actions={
          <Button variant="dark" disabled={!canSubmit || isSaving} onClick={handleSubmit}>
            Add Candidate
          </Button>
        }
      />

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <SectionCard title="Basic information" animate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane.doe@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as ApiGender)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

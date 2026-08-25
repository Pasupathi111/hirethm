import { useState } from "react"

import { SectionCard } from "@/components/cards/SectionCard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ApiGender } from "@/types"

const genderOptions: { value: ApiGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

export interface CandidateFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: ApiGender | ""
  dateOfBirth: string
  quickNotes: string
}

export function useCandidateFormState(initial?: Partial<CandidateFormValues>) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "")
  const [lastName, setLastName] = useState(initial?.lastName ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [gender, setGender] = useState<ApiGender | "">(initial?.gender ?? "")
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? "")
  const [quickNotes, setQuickNotes] = useState(initial?.quickNotes ?? "")

  return {
    values: { firstName, lastName, email, phone, gender, dateOfBirth, quickNotes },
    setFirstName,
    setLastName,
    setEmail,
    setPhone,
    setGender,
    setDateOfBirth,
    setQuickNotes,
  }
}

export function CandidateForm({ state }: { state: ReturnType<typeof useCandidateFormState> }) {
  const { values, setFirstName, setLastName, setEmail, setPhone, setGender, setDateOfBirth, setQuickNotes } = state

  return (
    <SectionCard title="Basic information" animate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" value={values.firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" value={values.lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={values.email} onChange={(e) => setEmail(e.target.value)} placeholder="jane.doe@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={values.phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={values.gender} onValueChange={(v) => setGender(v as ApiGender)}>
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
          <Input id="dob" type="date" value={values.dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="quickNotes">Notes</Label>
          <Textarea
            id="quickNotes"
            value={values.quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
            rows={4}
            placeholder="Current role, experience summary, key skills, expected salary, notice period..."
          />
        </div>
      </div>
    </SectionCard>
  )
}

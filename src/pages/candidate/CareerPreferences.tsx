import { useState } from "react"
import { toast } from "sonner"

import { ChipGroup } from "@/components/forms/ChipGroup"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const roleOptions = ["Senior Frontend Engineer", "Product Engineer", "Frontend Architect", "Engineering Manager", "Full Stack Engineer"]
const skillOptions = ["React", "TypeScript", "Node.js", "GraphQL", "Python", "AWS"]
const industryOptions = ["SaaS", "Fintech", "Healthcare", "Climate", "Public sector"]
const locationOptions = ["Remote (US)", "Austin, TX", "Denver, CO", "New York, NY"]
const workModeOptions = ["Remote", "Hybrid", "On-site", "Full Time", "Contract"]
const availabilityOptions = ["Immediately", "2 weeks", "1 month", "3 months"]

function PreferenceCard({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function CareerPreferences() {
  const [roles, setRoles] = useState<string[]>(["Senior Frontend Engineer", "Product Engineer"])
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js", "GraphQL"])
  const [industries, setIndustries] = useState<string[]>(["SaaS", "Fintech"])
  const [locations, setLocations] = useState<string[]>(["Remote (US)", "Austin, TX"])
  const [workMode, setWorkMode] = useState<string[]>(["Full Time"])
  const [availability, setAvailability] = useState<string[]>(["1 month"])
  const [salary, setSalary] = useState([160000])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Career preferences</h1>
          <p className="mt-1 text-muted-foreground">These preferences help HireThm improve your job recommendations.</p>
        </div>
        <Button onClick={() => toast.success("Preferences saved")}>Save changes</Button>
      </div>

      <PreferenceCard title="Desired roles" hint="Job titles you want to be matched against">
        <ChipGroup options={roleOptions} selected={roles} onToggle={(v) => toggle(roles, setRoles, v)} />
      </PreferenceCard>

      <PreferenceCard title="Skills to be matched on" hint="Weighted highest in the Skills Match criterion">
        <ChipGroup options={skillOptions} selected={skills} onToggle={(v) => toggle(skills, setSkills, v)} />
      </PreferenceCard>

      <PreferenceCard title="Industries" hint="Sectors you want to work in">
        <ChipGroup options={industryOptions} selected={industries} onToggle={(v) => toggle(industries, setIndustries, v)} />
      </PreferenceCard>

      <PreferenceCard title="Preferred locations" hint="Used for the Location Preference criterion">
        <ChipGroup options={locationOptions} selected={locations} onToggle={(v) => toggle(locations, setLocations, v)} />
      </PreferenceCard>

      <PreferenceCard title="Work mode and employment type" hint="Remote preference and contract shape">
        <ChipGroup options={workModeOptions} selected={workMode} onToggle={(v) => toggle(workMode, setWorkMode, v)} />
      </PreferenceCard>

      <PreferenceCard title="Availability" hint="Used for the Availability criterion">
        <ChipGroup options={availabilityOptions} selected={availability} onToggle={(v) => toggle(availability, setAvailability, v)} />
      </PreferenceCard>

      <PreferenceCard title="Salary expectation" hint="Base salary, USD per year. Used for the Salary Fit criterion.">
        <div className="flex items-center gap-4">
          <Slider value={salary} onValueChange={setSalary} min={60000} max={300000} step={5000} className="flex-1" />
          <span className="w-24 shrink-0 text-right font-bold">${(salary[0] / 1000).toFixed(0)}K</span>
        </div>
      </PreferenceCard>
    </div>
  )
}

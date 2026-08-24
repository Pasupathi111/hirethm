import { Check, Upload } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { ChipGroup } from "@/components/forms/ChipGroup"
import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const steps = [
  { number: 1, title: "Account", description: "Name, email, password" },
  { number: 2, title: "Profile", description: "Role, location, summary" },
  { number: 3, title: "Resume", description: "Upload and review extraction" },
  { number: 4, title: "Preferences", description: "Salary, locations, goals" },
  { number: 5, title: "Complete", description: "Start getting matched" },
]

const roleOptions = ["Senior Frontend Engineer", "Product Engineer", "Frontend Architect", "Engineering Manager", "Full Stack Engineer"]
const skillOptions = ["React", "TypeScript", "Node.js", "GraphQL", "Python", "AWS"]
const industryOptions = ["SaaS", "Fintech", "Healthcare", "Climate", "Public sector"]
const locationOptions = ["Remote (US)", "Austin, TX", "Denver, CO", "New York, NY"]
const workModeOptions = ["Remote", "Hybrid", "On-site", "Full Time", "Contract"]
const availabilityOptions = ["Immediately", "2 weeks", "1 month", "3 months"]

function HorizontalStepper({ current }: { current: number }) {
  return (
    <div className="mx-auto flex max-w-2xl items-start justify-between px-4">
      {steps.map((step, i) => (
        <div key={step.number} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-2 text-center">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                step.number < current
                  ? "bg-primary text-primary-foreground"
                  : step.number === current
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {step.number < current ? <Check className="size-4" /> : step.number}
            </div>
            <span className={cn("text-xs font-semibold", step.number <= current ? "text-foreground" : "text-muted-foreground")}>
              {step.title}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("mx-2 h-px flex-1", step.number < current ? "bg-primary" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  )
}

export function CreateProfile() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [agree, setAgree] = useState(true)

  const [roles, setRoles] = useState<string[]>(["Senior Frontend Engineer", "Product Engineer"])
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js"])
  const [industries, setIndustries] = useState<string[]>(["SaaS", "Fintech"])
  const [locations, setLocations] = useState<string[]>(["Remote (US)", "Austin, TX"])
  const [workMode, setWorkMode] = useState<string[]>(["Full Time"])
  const [availability, setAvailability] = useState<string[]>(["1 month"])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const next = () => setStep((s) => Math.min(5, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border px-4 py-4 sm:px-6">
          <Link to="/">
            <Logo />
          </Link>
        </header>

        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <p className="text-xs font-bold tracking-wide text-primary uppercase">Step 1 of 5</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Create your account</h1>
            <p className="mt-3 text-muted-foreground">One profile. Reusable across every employer.</p>

            <form
              className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6"
              onSubmit={(e) => {
                e.preventDefault()
                next()
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" defaultValue="Alex" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" defaultValue="Johnson" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" defaultValue="alex.johnson@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" defaultValue="hirethm2026" required />
                <div className="flex gap-1 pt-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 flex-1 rounded-full bg-primary" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Strong password</p>
              </div>
              <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                I agree that HireThm may analyse my CV to generate matches. Employers see nothing until I accept a
                match.
              </label>
              <Button type="submit" size="lg" className="w-full">
                Create Account
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Onboarding</p>
            <div className="mt-4 space-y-5">
              {steps.map((s, i) => (
                <div key={s.number} className="relative flex gap-3">
                  {i < steps.length - 1 && <span className="absolute top-9 left-[15px] h-full w-px bg-border" />}
                  <div
                    className={cn(
                      "z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      s.number === 1 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s.number}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <p className="text-sm font-semibold text-muted-foreground">Step {step} of 5</p>
        </div>

        <HorizontalStepper current={step} />

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          {step === 2 && (
            <>
              <h2 className="text-2xl font-extrabold">Tell us about your work</h2>
              <p className="mt-2 text-muted-foreground">
                This becomes your reusable HireThm profile. Employers never see it without your consent.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-role">Current role</Label>
                  <Input id="current-role" defaultValue="Senior React Developer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years-exp">Years of experience</Label>
                  <Input id="years-exp" defaultValue="5" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Austin, TX" />
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="summary">Professional summary</Label>
                <Textarea
                  id="summary"
                  rows={3}
                  defaultValue="Senior frontend engineer with 5+ years building production React and TypeScript applications for SaaS products."
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-extrabold">Upload your CV</h2>
              <p className="mt-2 text-muted-foreground">
                HireThm extracts your experience and skills, and shows you exactly what it read.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
                  <Upload className="size-6 text-accent-foreground" />
                </div>
                <p className="font-bold">Upload your resume</p>
                <p className="text-sm text-muted-foreground">PDF, DOC, DOCX</p>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-2xl font-extrabold">What are you looking for?</h2>
              <p className="mt-2 text-muted-foreground">Preferences drive five of the eight Mutual Readiness criteria.</p>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-2 font-semibold">Desired roles</p>
                  <ChipGroup options={roleOptions} selected={roles} onToggle={(v) => toggle(roles, setRoles, v)} />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Skills to be matched on</p>
                  <ChipGroup options={skillOptions} selected={skills} onToggle={(v) => toggle(skills, setSkills, v)} />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Industries</p>
                  <ChipGroup options={industryOptions} selected={industries} onToggle={(v) => toggle(industries, setIndustries, v)} />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Preferred locations</p>
                  <ChipGroup options={locationOptions} selected={locations} onToggle={(v) => toggle(locations, setLocations, v)} />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Work mode and employment type</p>
                  <ChipGroup options={workModeOptions} selected={workMode} onToggle={(v) => toggle(workMode, setWorkMode, v)} />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Availability</p>
                  <ChipGroup
                    options={availabilityOptions}
                    selected={availability}
                    onToggle={(v) => toggle(availability, setAvailability, v)}
                  />
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="py-6 text-center">
              <h2 className="text-2xl font-extrabold">You're all set</h2>
              <p className="mt-2 text-muted-foreground">Your profile is complete and matching is active.</p>

              <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-accent">
                <Check className="size-8 text-accent-foreground" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Your profile is live</h3>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                HireThm will start scoring you against open roles tonight. You will hear about a match before any
                employer sees you.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step === 5 ? (
              <Button size="lg" onClick={() => navigate("/app")}>
                Go to my dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={next}>
                Continue
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={back}>
              Back
            </Button>
            {step < 5 && (
              <button
                type="button"
                onClick={() => navigate("/app")}
                className="ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

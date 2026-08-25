import { motion } from "framer-motion"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Logo } from "@/components/layout/Logo"
import { ChipGroup } from "@/components/forms/ChipGroup"
import { Stepper } from "@/components/forms/Stepper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

const steps = [
  { number: 1, title: "Organization" },
  { number: 2, title: "Industry" },
  { number: 3, title: "Invite team" },
]

const industryOptions = ["SaaS", "Fintech", "Healthcare", "Climate", "Public sector", "E-commerce"]

export function CreateOrg() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState("")
  const [domain, setDomain] = useState("")
  const [industries, setIndustries] = useState<string[]>([])
  const [invites, setInvites] = useState("")

  const toggle = (value: string) => {
    setIndustries((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <Stepper steps={steps} current={step} className="mb-10 w-full max-w-lg" />

      <motion.div
        className="w-full max-w-lg rounded-lg border border-border bg-card p-6"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl">Set up your organization</h1>
              <p className="mt-1 text-sm text-muted-foreground">This is the workspace your team will hire from.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="ABC Technologies" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Company domain</Label>
              <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="abc-tech.com" required />
            </div>
            <Button className="w-full" size="lg" disabled={!orgName || !domain} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl">What industry are you in?</h1>
              <p className="mt-1 text-sm text-muted-foreground">Helps us tune matching for your roles.</p>
            </div>
            <ChipGroup options={industryOptions} selected={industries} onToggle={toggle} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" disabled={industries.length === 0} onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl">Invite your team</h1>
              <p className="mt-1 text-sm text-muted-foreground">Comma-separated emails. You can also do this later.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invites">Teammate emails</Label>
              <Input id="invites" value={invites} onChange={(e) => setInvites(e.target.value)} placeholder="lena@abc-tech.com, david@abc-tech.com" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("Organization created", { description: `Welcome to HireThm, ${orgName}.` })
                  navigate("/admin")
                }}
              >
                Finish setup
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

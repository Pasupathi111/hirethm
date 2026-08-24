import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { ChipGroup } from "@/components/forms/ChipGroup"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

const roleOptions = ["Senior Frontend Engineer", "Product Engineer", "Frontend Architect", "Engineering Manager", "Full Stack Engineer"]
const skillOptions = ["React", "TypeScript", "Node.js", "GraphQL", "Python", "AWS"]
const industryOptions = ["SaaS", "Fintech", "Healthcare", "Climate", "Public sector"]
const locationOptions = ["Remote (US)", "Austin, TX", "Denver, CO", "New York, NY"]
const workModeOptions = ["Remote", "Hybrid", "On-site", "Full Time", "Contract"]
const availabilityOptions = ["Immediately", "2 weeks", "1 month", "3 months"]

export function CareerPreferences() {
  const [roles, setRoles] = useState<string[]>(["Senior Frontend Engineer", "Product Engineer"])
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js", "GraphQL"])
  const [industries, setIndustries] = useState<string[]>(["SaaS", "Fintech"])
  const [locations, setLocations] = useState<string[]>(["Remote (US)", "Austin, TX"])
  const [workMode, setWorkMode] = useState<string[]>(["Full Time"])
  const [availability, setAvailability] = useState<string[]>(["1 month"])
  const [salary, setSalary] = useState([160000])
  const reduced = useReducedMotion()

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

      <motion.div className="space-y-6" variants={withReducedMotion(reduced, staggerContainer)} initial="hidden" animate="show">
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Desired roles" description="Job titles you want to be matched against" animate={false}>
            <ChipGroup options={roleOptions} selected={roles} onToggle={(v) => toggle(roles, setRoles, v)} />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Skills to be matched on" description="Weighted highest in the Skills Match criterion" animate={false}>
            <ChipGroup options={skillOptions} selected={skills} onToggle={(v) => toggle(skills, setSkills, v)} />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Industries" description="Sectors you want to work in" animate={false}>
            <ChipGroup options={industryOptions} selected={industries} onToggle={(v) => toggle(industries, setIndustries, v)} />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Preferred locations" description="Used for the Location Preference criterion" animate={false}>
            <ChipGroup options={locationOptions} selected={locations} onToggle={(v) => toggle(locations, setLocations, v)} />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Work mode and employment type" description="Remote preference and contract shape" animate={false}>
            <ChipGroup options={workModeOptions} selected={workMode} onToggle={(v) => toggle(workMode, setWorkMode, v)} />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Availability" description="Used for the Availability criterion" animate={false}>
            <ChipGroup options={availabilityOptions} selected={availability} onToggle={(v) => toggle(availability, setAvailability, v)} />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Salary expectation" description="Base salary, USD per year. Used for the Salary Fit criterion." animate={false}>
            <div className="flex items-center gap-4">
              <Slider value={salary} onValueChange={setSalary} min={60000} max={300000} step={5000} className="flex-1" />
              <span className="w-24 shrink-0 text-right font-bold">${(salary[0] / 1000).toFixed(0)}K</span>
            </div>
          </SectionCard>
        </motion.div>
      </motion.div>
    </div>
  )
}

import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { ChipGroup } from "@/components/forms/ChipGroup"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ApiError, api } from "@/lib/api"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiPreferences, ApiWorkMode } from "@/types"

const roleOptions = ["Senior Frontend Engineer", "Product Engineer", "Frontend Architect", "Engineering Manager", "Full Stack Engineer"]
const locationOptions = ["Remote (US)", "Austin, TX", "Denver, CO", "New York, NY"]
const workModeOptions: ApiWorkMode[] = ["remote", "hybrid", "onsite", "any"]
const workModeLabel: Record<ApiWorkMode, string> = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site", any: "Any" }
const employmentTypeOptions = ["full_time", "part_time", "contract", "internship"]
const employmentTypeLabel: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
}

const defaultPreferences: ApiPreferences = {
  desiredTitles: [],
  locations: [],
  workMode: "any",
  minSalary: null,
  maxSalary: null,
  employmentTypes: [],
  notifyMatches: true,
  notifyApplications: true,
  notifyInterviews: true,
}

export function CareerPreferences() {
  const [prefs, setPrefs] = useState<ApiPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const reduced = useReducedMotion()

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<ApiPreferences>("/api/me/preferences")
      .then(setPrefs)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your preferences"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const toggle = <T,>(list: T[], key: keyof ApiPreferences, value: T) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.put<ApiPreferences>("/api/me/preferences", prefs)
      setPrefs(updated)
      toast.success("Preferences saved")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Career preferences</h1>
          <p className="mt-1 text-muted-foreground">These preferences help HireThm improve your job recommendations.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <motion.div className="space-y-6" variants={withReducedMotion(reduced, staggerContainer)} initial="hidden" animate="show">
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Desired roles" description="Job titles you want to be matched against" animate={false}>
            <ChipGroup
              options={roleOptions}
              selected={prefs.desiredTitles}
              onToggle={(v) => toggle(prefs.desiredTitles, "desiredTitles", v)}
            />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Preferred locations" description="Used for the Location Preference criterion" animate={false}>
            <ChipGroup
              options={locationOptions}
              selected={prefs.locations}
              onToggle={(v) => toggle(prefs.locations, "locations", v)}
            />
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Work mode" description="Remote preference" animate={false}>
            <div className="flex flex-wrap gap-2">
              {workModeOptions.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPrefs((prev) => ({ ...prev, workMode: mode }))}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    prefs.workMode === mode
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {workModeLabel[mode]}
                </button>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Employment type" description="Contract shape you're open to" animate={false}>
            <div className="flex flex-wrap gap-2">
              {employmentTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggle(prefs.employmentTypes, "employmentTypes", type)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    prefs.employmentTypes.includes(type)
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {employmentTypeLabel[type]}
                </button>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <SectionCard title="Salary expectation" description="Base salary, USD per year. Used for the Salary Fit criterion." animate={false}>
            <div className="flex items-center gap-4">
              <Slider
                value={[prefs.minSalary ?? 60000]}
                onValueChange={(v) => setPrefs((prev) => ({ ...prev, minSalary: v[0] }))}
                min={60000}
                max={300000}
                step={5000}
                className="flex-1"
              />
              <span className="w-24 shrink-0 text-right font-display font-semibold tracking-[-0.02em]">
                ${((prefs.minSalary ?? 60000) / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Slider
                value={[prefs.maxSalary ?? 160000]}
                onValueChange={(v) => setPrefs((prev) => ({ ...prev, maxSalary: v[0] }))}
                min={60000}
                max={300000}
                step={5000}
                className="flex-1"
              />
              <span className="w-24 shrink-0 text-right font-display font-semibold tracking-[-0.02em]">
                ${((prefs.maxSalary ?? 160000) / 1000).toFixed(0)}K
              </span>
            </div>
          </SectionCard>
        </motion.div>
      </motion.div>
    </div>
  )
}

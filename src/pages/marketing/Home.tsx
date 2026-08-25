import { ArrowRight, Check, UserPlus } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { PublicJobCard } from "@/components/cards/PublicJobCard"
import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { type PaginatedResponse, api } from "@/lib/api"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiJob } from "@/types"

const howItWorks = [
  {
    step: 1,
    title: "Build your profile",
    description: "Upload a CV. HireThm extracts your experience and shows you exactly what it read.",
  },
  {
    step: 2,
    title: "Set your intent",
    description: "Roles, locations, salary, availability and where you want your career to go.",
  },
  {
    step: 3,
    title: "Get matched first",
    description: "A Mutual Readiness Score is computed against live roles. You are notified before the employer.",
  },
  {
    step: 4,
    title: "Choose your interview",
    description: "Accept a match and pick a slot that suits you. Decline and nothing is shared.",
  },
]

const consentPoints = [
  "Your profile belongs to you, not to an employer's database.",
  "Employers cannot bypass consent through search.",
  "Contact details stay private until you accept a match.",
  "Every consent and visibility change is recorded in an audit trail.",
]

const consentStates = [
  { key: "MATCH_CREATED", label: "AI computes Mutual Readiness", status: "done" },
  { key: "NOTIFIED", label: "Candidate is told first", status: "done" },
  { key: "ACCEPTED", label: "Candidate consents", status: "done" },
  { key: "VISIBLE", label: "Employer can now see the profile", status: "current" },
  { key: "SHORTLISTED", label: "Employer shortlists", status: "upcoming" },
  { key: "INTERVIEW_SCHEDULED", label: "Candidate picks the slot", status: "upcoming" },
] as const

export function Home() {
  const reduced = useReducedMotion()
  const [featuredJobs, setFeaturedJobs] = useState<ApiJob[]>([])

  useEffect(() => {
    api
      .get<PaginatedResponse<ApiJob>>("/api/public/jobs?limit=3")
      .then((res) => setFeaturedJobs(res.data))
      .catch(() => setFeaturedJobs([]))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_var(--color-accent),_transparent_55%)] opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <motion.div variants={withReducedMotion(reduced, fadeInUp)} initial="hidden" animate="show">
            <Badge variant="primary" className="mb-6">
              <span className="size-1.5 rounded-full bg-primary" /> Candidate-first matching
            </Badge>
            <h1 className="text-5xl text-balance sm:text-6xl">
              Find work that fits you.
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-70">
              Discover opportunities matched to your skills, experience and career goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/jobs">Find Jobs</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/create-profile">
                  <UserPlus className="size-4" />
                  Create Profile
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={withReducedMotion(reduced, fadeInUp)}
            initial="hidden"
            animate="show"
            className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow">Mutual Readiness</p>
              <p className="text-xs text-muted-foreground">Match #8291</p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <ReadinessRing value={91} label="Ready" size={88} strokeWidth={7} />
              <div>
                <h3 className="text-lg">Senior Product Engineer</h3>
                <p className="text-sm text-muted-foreground">ABC Technologies · Remote</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "Node.js"].map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ["Skills match", 95],
                ["Experience", 90],
                ["Career goals", 88],
                ["Salary fit", 80],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}%</span>
                  </div>
                  <Progress value={value as number} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow">How HireThm works</p>
          <h2 className="mt-2 max-w-2xl text-4xl text-balance">
            A profile you own, matched to work worth your time.
          </h2>

          <motion.div
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            variants={withReducedMotion(reduced, staggerContainer)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {howItWorks.map((item) => (
              <motion.div key={item.step} variants={withReducedMotion(reduced, fadeInUp)} className="rounded-lg border border-border bg-card p-6">
                <div className="font-display flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Consent */}
      <section id="for-candidates" className="border-t border-border py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <h2 className="text-4xl text-balance">
              Nothing happens until you say yes.
            </h2>
            <p className="mt-4 text-ink-70">
              HireThm notifies you of a match before the employer receives any visibility into your profile. Consent
              is a recorded step in the hiring process, not a setting buried in an account page.
            </p>
            <ul className="mt-6 space-y-3">
              {consentPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-secondary p-6 text-secondary-foreground">
            <p className="text-xs font-bold tracking-wide text-mint uppercase">Consent state machine</p>
            <div className="mt-4 space-y-5">
              {consentStates.map((state, i) => (
                <div key={state.key} className="relative flex gap-3 pl-1">
                  {i < consentStates.length - 1 && (
                    <span className="absolute top-4 left-[7px] h-full w-px bg-white/15" />
                  )}
                  <span
                    className={
                      state.status === "current"
                        ? "z-10 mt-1 size-3.5 shrink-0 rounded-full bg-white"
                        : state.status === "done"
                          ? "z-10 mt-1 size-3.5 shrink-0 rounded-full bg-primary"
                          : "z-10 mt-1 size-3.5 shrink-0 rounded-full bg-white/20"
                    }
                  />
                  <div>
                    <p
                      className={
                        state.status === "upcoming"
                          ? "font-mono text-sm font-bold tracking-tight text-white/40"
                          : "font-mono text-sm font-bold tracking-tight text-primary"
                      }
                    >
                      {state.key}
                    </p>
                    <p className="text-sm text-white/60">{state.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured jobs</p>
              <h2 className="mt-2 text-4xl">Roles hiring this week</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/jobs">
                View all jobs <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <motion.div
            className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            variants={withReducedMotion(reduced, staggerContainer)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {featuredJobs.map((job) => (
              <motion.div key={job.id} variants={withReducedMotion(reduced, fadeInUp)}>
                <PublicJobCard job={job} viewHref={`/jobs/${job.id}`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-secondary p-10 sm:p-14">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-lg">
              <h2 className="text-3xl text-white sm:text-4xl">
                Build the profile once. Get matched for years.
              </h2>
              <p className="mt-3 text-white/60">Free for candidates. Your data, your decisions, always.</p>
            </div>
            <Button asChild size="lg">
              <Link to="/create-profile">
                <UserPlus className="size-4" />
                Create your profile
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

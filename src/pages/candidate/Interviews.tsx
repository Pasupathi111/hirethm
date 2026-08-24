import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/EmptyState"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { interviews as allInterviews } from "@/data/mockData"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { Interview } from "@/types"

const tabs: Interview["status"][] = ["Upcoming", "Completed", "Cancelled"]

export function Interviews() {
  const [tab, setTab] = useState<Interview["status"]>("Upcoming")
  const [interviews, setInterviews] = useState(allInterviews)
  const reduced = useReducedMotion()
  const filtered = interviews.filter((i) => i.status === tab)

  const confirm = (id: string) => {
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, slotConfirmed: true } : i)))
    toast.success("Slot confirmed")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My interviews</h1>
        <p className="mt-1 text-muted-foreground">You choose the slot. Nothing is booked without your confirmation.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Interview["status"])}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <motion.div
        className="space-y-4"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {filtered.map((interview) => (
          <motion.div
            key={interview.id}
            variants={withReducedMotion(reduced, fadeInUp)}
            className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <span className="text-lg font-extrabold leading-none">{interview.date.split(" ")[0]}</span>
              <span className="text-[10px] font-bold tracking-wide uppercase">{interview.date.split(" ")[1]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold text-primary">{interview.type}</p>
                <StatusBadge status={interview.status} />
              </div>
              <h2 className="text-lg font-bold">{interview.title}</h2>
              <p className="text-sm text-muted-foreground">
                {interview.company} · {interview.date} 2026 · {interview.time} · {interview.location}
              </p>
            </div>
            {interview.status === "Upcoming" && (
              <div className="flex shrink-0 gap-2">
                {interview.slotConfirmed ? (
                  <Button disabled variant="secondary">
                    Slot confirmed
                  </Button>
                ) : (
                  <Button onClick={() => confirm(interview.id)}>Confirm Slot</Button>
                )}
                <Button variant="outline" onClick={() => toast("Pick a new time", { description: "Reschedule requests notify the employer." })}>
                  Change Slot
                </Button>
              </div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && <EmptyState title={`No ${tab.toLowerCase()} interviews.`} description="Interviews you schedule will show up here." />}
      </motion.div>
    </div>
  )
}

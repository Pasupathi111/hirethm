import { FileText } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

const reports = [
  { name: "Weekly platform summary", period: "17–23 Aug 2026", generated: "23 Aug 2026" },
  { name: "Consent and visibility audit", period: "Jul 2026", generated: "01 Aug 2026" },
  { name: "Employer billing statement", period: "Aug 2026", generated: "01 Aug 2026" },
  { name: "Candidate funnel conversion", period: "Q2 2026", generated: "05 Jul 2026" },
]

export function AdminReports() {
  const reduced = useReducedMotion()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Reports</h1>
        <p className="mt-1 text-muted-foreground">Generated exports for finance, compliance and growth teams.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <motion.div
          className="divide-y divide-border"
          variants={withReducedMotion(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          {reports.map((r) => (
            <motion.div key={r.name} variants={withReducedMotion(reduced, fadeInUp)} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.period} · Generated {r.generated}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast("Preparing download", { description: `${r.name} will download shortly.` })}
              >
                Download
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

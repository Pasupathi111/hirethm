import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function MetricTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  icon?: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: "default" | "positive" | "negative"
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      variants={withReducedMotion(reduced, fadeInUp)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20px" }}
      className={cn("rounded-2xl border border-border bg-card p-5", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      </div>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs font-semibold",
            tone === "positive" && "text-emerald-600",
            tone === "negative" && "text-red-600",
            tone === "default" && "text-muted-foreground"
          )}
        >
          {hint}
        </p>
      )}
    </motion.div>
  )
}

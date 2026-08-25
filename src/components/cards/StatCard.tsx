import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function StatCard({
  icon: Icon,
  iconClassName,
  value,
  label,
  hint,
  hintClassName,
}: {
  icon?: LucideIcon
  iconClassName?: string
  value: React.ReactNode
  label: string
  hint?: string
  hintClassName?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {Icon && (
        <div className={cn("mb-3 flex size-9 items-center justify-center rounded-md bg-muted", iconClassName)}>
          <Icon className="size-4.5" />
        </div>
      )}
      <p className="font-display text-3xl font-semibold tracking-[-0.02em]">{value}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      {hint && <p className={cn("mt-0.5 text-xs text-muted-foreground", hintClassName)}>{hint}</p>}
    </div>
  )
}

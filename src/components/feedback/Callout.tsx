import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const toneStyles = {
  warning: "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  info: "bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300",
  ai: "bg-violet-50 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300",
  success: "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
} as const

type Tone = keyof typeof toneStyles

const toneIcons: Record<Tone, LucideIcon> = {
  warning: AlertTriangle,
  info: Info,
  ai: Sparkles,
  success: CheckCircle2,
}

export function Callout({
  tone = "warning",
  icon,
  children,
  actions,
  className,
}: {
  tone?: Tone
  icon?: LucideIcon
  children: ReactNode
  actions?: ReactNode
  className?: string
}) {
  const Icon = icon ?? toneIcons[tone]
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4", toneStyles[tone], className)}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 shrink-0" />
        {children}
      </p>
      {actions}
    </div>
  )
}

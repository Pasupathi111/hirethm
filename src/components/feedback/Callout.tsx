import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const toneStyles = {
  warning: "bg-warning/15 text-warning-foreground",
  info: "bg-info/10 text-info",
  ai: "bg-ai/10 text-ai",
  success: "bg-accent text-accent-foreground",
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
    <div className={cn("flex flex-wrap items-center justify-between gap-4 rounded-lg p-4", toneStyles[tone], className)}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 shrink-0" />
        {children}
      </p>
      {actions}
    </div>
  )
}

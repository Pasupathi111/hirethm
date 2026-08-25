import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  animate = true,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  animate?: boolean
}) {
  const reduced = useReducedMotion()
  const hasHeader = Boolean(title || description || actions)

  if (!animate) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
        {hasHeader && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {title && <h2 className="text-lg">{title}</h2>}
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions}
          </div>
        )}
        <div className={cn(hasHeader && "mt-4")}>{children}</div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn("rounded-lg border border-border bg-card p-6", className)}
      variants={withReducedMotion(reduced, fadeInUp)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn(hasHeader && "mt-4")}>{children}</div>
    </motion.div>
  )
}

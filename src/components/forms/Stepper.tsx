import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StepperStep {
  number: number
  title: string
  description?: string
}

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  className,
}: {
  steps: StepperStep[]
  current: number
  orientation?: "horizontal" | "vertical"
  className?: string
}) {
  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-5", className)}>
        {steps.map((step, i) => (
          <div key={step.number} className="relative flex gap-3">
            {i < steps.length - 1 && <span className="absolute top-9 left-[15px] h-full w-px bg-border" />}
            <div
              className={cn(
                "z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                step.number < current
                  ? "bg-primary text-primary-foreground"
                  : step.number === current
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {step.number < current ? <Check className="size-4" /> : step.number}
            </div>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("mx-auto flex max-w-2xl items-start justify-between px-4", className)}>
      {steps.map((step, i) => (
        <div key={step.number} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-2 text-center">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                step.number < current
                  ? "bg-primary text-primary-foreground"
                  : step.number === current
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {step.number < current ? <Check className="size-4" /> : step.number}
            </div>
            <span className={cn("text-xs font-semibold", step.number <= current ? "text-foreground" : "text-muted-foreground")}>
              {step.title}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("mx-2 h-px flex-1 transition-colors", step.number < current ? "bg-primary" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  )
}

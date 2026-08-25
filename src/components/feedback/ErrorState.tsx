import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-12 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <div>
        <p className="font-display font-semibold tracking-[-0.02em]">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-1">
          Try Again
        </Button>
      )}
    </div>
  )
}

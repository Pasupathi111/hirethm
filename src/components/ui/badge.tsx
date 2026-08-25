import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap w-fit shrink-0",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground border-transparent",
        primary: "bg-accent text-accent-foreground border-transparent",
        dark: "bg-secondary text-secondary-foreground border-transparent",
        success: "bg-accent text-accent-foreground border-transparent",
        warning: "bg-warning/15 text-warning-foreground border-transparent",
        destructive: "bg-destructive/10 text-destructive border-transparent",
        info: "bg-info/10 text-info border-transparent",
        ai: "bg-ai/10 text-ai border-transparent",
        outline: "text-foreground border-border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

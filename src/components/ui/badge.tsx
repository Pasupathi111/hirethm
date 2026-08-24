import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap w-fit shrink-0",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border-transparent",
        primary: "bg-accent text-accent-foreground border-transparent",
        dark: "bg-secondary text-secondary-foreground border-transparent",
        success: "bg-emerald-50 text-emerald-700 border-transparent dark:bg-emerald-500/15 dark:text-emerald-400",
        warning: "bg-amber-50 text-amber-700 border-transparent dark:bg-amber-500/15 dark:text-amber-400",
        destructive: "bg-red-50 text-red-700 border-transparent dark:bg-red-500/15 dark:text-red-400",
        info: "bg-blue-50 text-blue-700 border-transparent dark:bg-blue-500/15 dark:text-blue-400",
        ai: "bg-violet-50 text-violet-700 border-transparent dark:bg-violet-500/15 dark:text-violet-400",
        purple: "bg-purple-50 text-purple-700 border-transparent dark:bg-purple-500/15 dark:text-purple-400",
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

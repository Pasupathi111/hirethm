import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-extrabold text-lg", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <span className="size-3 rounded-[3px] bg-white" />
      </span>
      HireThm
    </div>
  )
}

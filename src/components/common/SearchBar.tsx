import { Search } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export function SearchBar({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"input"> & { containerClassName?: string }) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        data-slot="search-bar"
        className={cn(
          "h-9 w-full min-w-0 rounded-full border border-input bg-card py-2 pr-3.5 pl-9 text-sm text-foreground shadow-xs transition-colors duration-200 outline-none placeholder:text-ink-40 selection:bg-primary selection:text-primary-foreground",
          "focus-visible:border-primary",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

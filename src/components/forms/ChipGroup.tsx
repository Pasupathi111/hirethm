import { motion } from "framer-motion"

import { DURATION, useReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
}) {
  const reduced = useReducedMotion()

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={isSelected}
            whileTap={reduced ? undefined : { scale: 0.94 }}
            transition={{ duration: DURATION.fast }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              isSelected
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {option}
          </motion.button>
        )
      })}
    </div>
  )
}

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
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={isSelected}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              isSelected
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

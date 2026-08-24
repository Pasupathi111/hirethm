import { cn } from "@/lib/utils"

export function ReadinessRing({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  className,
}: {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-muted)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold leading-none">{value}%</span>
        {label && <span className="mt-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">{label}</span>}
      </div>
    </div>
  )
}

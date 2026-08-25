import type { ReactNode } from "react"

export function SettingRow({
  label,
  description,
  control,
}: {
  label: ReactNode
  description: ReactNode
  control: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline py-4 last:border-0">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {control}
    </div>
  )
}

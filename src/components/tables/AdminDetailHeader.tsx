import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AdminDetailHeader({
  backHref,
  backLabel,
  initials,
  name,
  meta,
  actions,
}: {
  backHref: string
  backLabel: string
  initials: string
  name: string
  meta: string
  actions?: React.ReactNode
}) {
  return (
    <div>
      <Link to={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {backLabel}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl">{name}</h1>
            <p className="text-sm text-muted-foreground">{meta}</p>
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}

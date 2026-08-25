import { Bell, Menu } from "lucide-react"
import { Link } from "react-router-dom"

import { SearchBar } from "@/components/common/SearchBar"
import { CandidateSidebarContent } from "@/components/layout/CandidateSidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { notifications } from "@/data/mockData"
import { useMyCandidate } from "@/lib/candidateSession"

export function CandidateTopbar() {
  const unread = notifications.filter((n) => n.unread).length
  const { candidate } = useMyCandidate()
  const name = candidate ? candidate.displayName || `${candidate.firstName} ${candidate.lastName}` : "…"
  const initials = candidate ? `${candidate.firstName[0] ?? ""}${candidate.lastName[0] ?? ""}`.toUpperCase() : "…"

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <CandidateSidebarContent />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-3">
        <SearchBar placeholder="Search jobs, companies..." containerClassName="hidden max-w-sm sm:block" />
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/app/profile">Complete Profile</Link>
        </Button>
        <Link to="/app/notifications" className="relative">
          <Button variant="outline" size="icon">
            <Bell className="size-4.5" />
          </Button>
          {unread > 0 && (
            <Badge
              variant="success"
              className="absolute -top-1.5 -right-1.5 h-5 min-w-5 justify-center rounded-full p-0 text-[10px]"
            >
              {unread}
            </Badge>
          )}
        </Link>
        <Link to="/app/profile" className="flex items-center gap-2.5">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{candidate?.email ?? ""}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}

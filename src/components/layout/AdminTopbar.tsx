import { AlertTriangle, Menu } from "lucide-react"

import { SearchBar } from "@/components/common/SearchBar"
import { AdminSidebarContent } from "@/components/layout/AdminSidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

export function AdminTopbar({ title }: { title?: string }) {
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
          <AdminSidebarContent />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-4">
        <SearchBar
          placeholder={title ? `Search ${title.toLowerCase()}...` : "Search candidates, employers, jobs..."}
          containerClassName="hidden max-w-sm md:block"
        />
        <span className="hidden items-center gap-1.5 text-sm font-semibold text-warning sm:flex">
          <AlertTriangle className="size-4" />
          2 services degraded
        </span>
        <Avatar>
          <AvatarFallback className="bg-secondary text-white">OP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

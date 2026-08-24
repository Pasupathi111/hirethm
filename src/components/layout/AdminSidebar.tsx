import { LogOut } from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { adminNav } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-secondary text-secondary-foreground">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <span className="size-3 rounded-[3px] bg-white" />
        </span>
        <span className="text-lg font-extrabold">HireThm</span>
        <Badge variant="dark" className="border border-white/20 bg-white/10 text-[10px] text-emerald-300">
          ADMIN
        </Badge>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {adminNav.map((group, i) => (
          <div key={i} className={cn(i > 0 && "border-t border-white/10 pt-4")}>
            {group.label && (
              <p className="mb-2 px-3 text-xs font-bold tracking-wide text-white/40 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  <item.icon className="size-4.5 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link
          to="/admin/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4.5" />
          Sign out
        </Link>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block">
      <AdminSidebarContent />
    </aside>
  )
}

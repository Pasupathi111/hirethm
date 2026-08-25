import { LogOut, Sparkles } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/authClient"
import { candidateNav } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function CandidateSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    onNavigate?.()
    navigate("/sign-in")
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="px-6 py-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        {candidateNav.map((group, i) => (
          <div key={i} className={cn(i > 0 && "border-t border-sidebar-border pt-4")}>
            {group.label && (
              <p className="mb-2 px-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/app"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
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
      <div className="space-y-3 p-4">
        <div className="rounded-xl bg-secondary p-4 text-secondary-foreground">
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-mint">
            <Sparkles className="size-3.5" /> Free Plan
          </p>
          <p className="mt-2 text-xs text-white/70">3 of 5 profile views used this month</p>
          <Button size="sm" className="mt-3 w-full">
            Upgrade
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </div>
  )
}

export function CandidateSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-sidebar-border lg:block">
      <CandidateSidebarContent />
    </aside>
  )
}

import { LogOut } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { signOut, useSession } from "@/lib/authClient"
import { adminNav } from "@/lib/navigation"
import { useActiveOrganization } from "@/lib/useActiveOrganization"
import { usePlatformAdmin } from "@/lib/usePlatformAdmin"
import { cn } from "@/lib/utils"

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { isPlatformAdmin } = usePlatformAdmin()
  const { data: session } = useSession()
  const hasOrg = Boolean(session?.session.activeOrganizationId)
  const { organization, isPending: orgPending } = useActiveOrganization()

  // Filter both ways so nobody is shown a link that only ever leads to a
  // redirect or a 403. Cross-tenant destinations need the platform-admin flag
  // (issue #43); org-scoped destinations need an active organization, which
  // HireThm staff don't have. Groups that end up empty are dropped entirely so
  // no stray section headers are left behind.
  const visibleNav = adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (isPlatformAdmin || !item.platformAdminOnly) && (hasOrg || !item.orgOnly),
      ),
    }))
    .filter((group) => group.items.length > 0)

  const handleSignOut = async () => {
    await signOut()
    onNavigate?.()
    navigate("/employer/sign-in")
  }

  return (
    <div className="flex h-full flex-col bg-secondary text-secondary-foreground">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary">
          <span className="size-3 rounded-[3px] bg-white" />
        </span>
        <span className="font-display text-lg font-semibold tracking-[-0.02em]">HireThm</span>
        <Badge variant="dark" className="border border-white/20 bg-white/10 text-[10px] text-mint">
          ADMIN
        </Badge>
      </div>

      {/* Which company this session is acting as. Platform admins belong to no
          organization, so this block is simply absent for them rather than
          showing a misleading placeholder. */}
      {hasOrg && (
        <div className="-mt-2 mb-2 px-6">
          <p className="text-[10px] font-bold tracking-wide text-slate-label uppercase">Organization</p>
          {orgPending ? (
            <span className="mt-1 block h-4 w-28 animate-pulse rounded bg-white/10" />
          ) : (
            <p className="truncate text-sm font-semibold" title={organization?.name ?? undefined}>
              {organization?.name ?? "Unknown organization"}
            </p>
          )}
        </div>
      )}
      <nav className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {visibleNav.map((group, i) => (
          <div key={i} className={cn(i > 0 && "border-t border-white/10 pt-4")}>
            {group.label && (
              <p className="mb-2 px-3 text-xs font-bold tracking-wide text-slate-label uppercase">
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
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
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
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4.5" />
          Sign out
        </button>
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

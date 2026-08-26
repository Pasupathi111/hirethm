import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Banknote,
  Bell,
  BookUser,
  Briefcase,
  Building2,
  CalendarCheck2,
  FileText,
  Gauge,
  History,
  KeyRound,
  LayoutGrid,
  ListChecks,
  Loader2,
  MessageCircle,
  Puzzle,
  Radar,
  Rss,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react"

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /**
   * Cross-tenant platform-admin destination (issue #43). Hidden from users
   * without the HireThm-internal isPlatformAdmin flag, so recruiters aren't
   * shown links that only ever lead to a redirect.
   */
  platformAdminOnly?: boolean
  /**
   * Org-scoped destination: its API requires an active organization and
   * returns 403 "No active organization" without one. Hidden from platform
   * admins, who are HireThm staff belonging to no client org — the inverse
   * of platformAdminOnly.
   */
  orgOnly?: boolean
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const candidateNav: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", to: "/app", icon: LayoutGrid },
      { label: "Find Jobs", to: "/app/jobs", icon: Search },
      { label: "Recommended", to: "/app/recommended", icon: Sparkles },
      { label: "My Matches", to: "/app/matches", icon: ListChecks },
      { label: "Applications", to: "/app/applications", icon: Briefcase },
      { label: "Interviews", to: "/app/interviews", icon: CalendarCheck2 },
    ],
  },
  {
    items: [
      { label: "My Profile", to: "/app/profile", icon: UserCircle },
      { label: "Resume", to: "/app/resume", icon: FileText },
      { label: "Career Preferences", to: "/app/preferences", icon: Sliders },
    ],
  },
  {
    items: [
      { label: "Notifications", to: "/app/notifications", icon: Bell },
      { label: "Settings", to: "/app/settings", icon: Settings },
    ],
  },
]

export const adminNav: NavGroup[] = [
  { items: [{ label: "Dashboard", to: "/admin", icon: Gauge }] },
  {
    label: "Users",
    items: [
      { label: "Candidates", to: "/admin/candidates", icon: BookUser, orgOnly: true },
      { label: "Employers", to: "/admin/employers", icon: Building2, platformAdminOnly: true },
      { label: "Recruiters", to: "/admin/recruiters", icon: Users, platformAdminOnly: true },
      { label: "Hiring Managers", to: "/admin/hiring-managers", icon: UserCircle, platformAdminOnly: true },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { label: "Jobs", to: "/admin/jobs", icon: Briefcase, orgOnly: true },
      { label: "Applications", to: "/admin/applications", icon: FileText, orgOnly: true },
      { label: "Matches", to: "/admin/matches", icon: ListChecks, orgOnly: true },
      { label: "Interviews", to: "/admin/interviews", icon: CalendarCheck2, orgOnly: true },
      { label: "Interview Templates", to: "/admin/interview-templates", icon: ScrollText, orgOnly: true },
      { label: "Source Tracking", to: "/admin/source-tracking", icon: Radar, orgOnly: true },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Plans", to: "/admin/plans", icon: Puzzle, platformAdminOnly: true },
      { label: "Payments", to: "/admin/payments", icon: Banknote, platformAdminOnly: true },
      { label: "Usage", to: "/admin/usage", icon: Activity, platformAdminOnly: true },
    ],
  },
  {
    label: "AI",
    items: [
      { label: "AI Assistant", to: "/admin/ai-chat", icon: MessageCircle, orgOnly: true },
      { label: "AI Management", to: "/admin/ai-management", icon: Sparkles },
      { label: "Matching Rules", to: "/admin/matching-rules", icon: Loader2 },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Timeline", to: "/admin/timeline", icon: History, orgOnly: true },
      { label: "Updates", to: "/admin/updates", icon: Rss },
      { label: "Reports", to: "/admin/reports", icon: ScrollText },
      { label: "Audit Logs", to: "/admin/audit-logs", icon: ShieldCheck, orgOnly: true },
      { label: "Roles & Permissions", to: "/admin/roles-permissions", icon: KeyRound },
      { label: "Platform Settings", to: "/admin/platform-settings", icon: Settings, orgOnly: true },
      { label: "System Health", to: "/admin/system-health", icon: Activity },
    ],
  },
]

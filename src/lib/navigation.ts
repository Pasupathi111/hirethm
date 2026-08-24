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
  KeyRound,
  LayoutGrid,
  ListChecks,
  Loader2,
  Puzzle,
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
      { label: "Candidates", to: "/admin/candidates", icon: BookUser },
      { label: "Employers", to: "/admin/employers", icon: Building2 },
      { label: "Recruiters", to: "/admin/recruiters", icon: Users },
      { label: "Hiring Managers", to: "/admin/hiring-managers", icon: UserCircle },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { label: "Jobs", to: "/admin/jobs", icon: Briefcase },
      { label: "Applications", to: "/admin/applications", icon: FileText },
      { label: "Matches", to: "/admin/matches", icon: ListChecks },
      { label: "Interviews", to: "/admin/interviews", icon: CalendarCheck2 },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Plans", to: "/admin/plans", icon: Puzzle },
      { label: "Payments", to: "/admin/payments", icon: Banknote },
      { label: "Usage", to: "/admin/usage", icon: Activity },
    ],
  },
  {
    label: "AI",
    items: [
      { label: "AI Management", to: "/admin/ai-management", icon: Sparkles },
      { label: "Matching Rules", to: "/admin/matching-rules", icon: Loader2 },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Reports", to: "/admin/reports", icon: ScrollText },
      { label: "Audit Logs", to: "/admin/audit-logs", icon: ShieldCheck },
      { label: "Roles & Permissions", to: "/admin/roles-permissions", icon: KeyRound },
      { label: "Platform Settings", to: "/admin/platform-settings", icon: Settings },
      { label: "System Health", to: "/admin/system-health", icon: Activity },
    ],
  },
]

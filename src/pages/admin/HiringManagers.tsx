import { PlatformMembersList } from "@/pages/admin/PlatformMembersList"

export function AdminHiringManagers() {
  return (
    <PlatformMembersList
      role="admin"
      title="Hiring managers"
      subtitleNoun="hiring managers"
      rowBasePath="/admin/hiring-managers"
    />
  )
}

import { PlatformMembersList } from "@/pages/admin/PlatformMembersList"

export function AdminRecruiters() {
  return (
    <PlatformMembersList
      role="member"
      title="Recruiters"
      subtitleNoun="recruiter seats"
      rowBasePath="/admin/recruiters"
    />
  )
}

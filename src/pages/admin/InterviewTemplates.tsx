import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { interviewTemplates } from "@/data/mockData"
import type { InterviewTemplate } from "@/types"

const columns: AdminColumn<InterviewTemplate>[] = [
  { header: "Template", render: (t) => t.name },
  { header: "Type", render: (t) => t.type },
  { header: "Questions", render: (t) => t.questionCount },
  { header: "Duration", render: (t) => t.duration },
  { header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  { header: "Updated", render: (t) => t.updated },
]

export function AdminInterviewTemplates() {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="dark" onClick={() => navigate("/admin/interview-templates/new")}>
          <Plus className="size-4" /> New template
        </Button>
      </div>
      <AdminListPage
        title="Interview templates"
        subtitle={`${interviewTemplates.length} reusable interview question sets`}
        tabs={["All", "Active", "Draft", "Archived"]}
        getTab={(t) => t.status}
        columns={columns}
        rows={interviewTemplates}
        rowHref={(t) => `/admin/interview-templates/${t.id}`}
        searchPlaceholder="Search templates..."
      />
    </div>
  )
}

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { ApiInterviewTemplate } from "@/types"

const columns: AdminColumn<ApiInterviewTemplate>[] = [
  { header: "Template", render: (t) => t.name },
  { header: "Type", render: (t) => t.type.replace("_", " ") },
  { header: "Questions", render: (t) => t.questions.length },
  { header: "Duration", render: (t) => `${t.duration} min` },
  { header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  { header: "Updated", render: (t) => new Date(t.updatedAt).toLocaleDateString() },
]

export function AdminInterviewTemplates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<ApiInterviewTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ data: ApiInterviewTemplate[] }>("/api/interview-templates")
      .then((res) => setTemplates(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="dark" onClick={() => navigate("/admin/interview-templates/new")}>
          <Plus className="size-4" /> New template
        </Button>
      </div>
      <AdminListPage
        title="Interview templates"
        subtitle={loading ? "Loading…" : `${templates.length} reusable interview question set${templates.length === 1 ? "" : "s"}`}
        tabs={["All", "active", "draft", "archived"]}
        getTab={(t) => t.status}
        columns={columns}
        rows={templates}
        loading={loading}
        rowHref={(t) => `/admin/interview-templates/${t.id}`}
        searchPlaceholder="Search templates..."
      />
    </div>
  )
}

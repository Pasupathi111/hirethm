import { useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { api } from "@/lib/api"
import type { ApiPayment } from "@/types"

function formatAmount(p: ApiPayment) {
  return `${(p.amountCents / 100).toLocaleString(undefined, { style: "currency", currency: p.currency })}`
}

const columns: AdminColumn<ApiPayment>[] = [
  { header: "Payment", render: (p) => <span className="font-mono text-xs font-semibold">{p.id.slice(0, 8)}</span> },
  { header: "Employer", render: (p) => p.organization.name },
  { header: "Plan", render: (p) => p.plan?.name ?? "—" },
  { header: "Amount", render: (p) => <span className="font-semibold">{formatAmount(p)}</span> },
  { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
  { header: "Date", render: (p) => new Date(p.createdAt).toLocaleDateString() },
]

export function AdminPayments() {
  const [payments, setPayments] = useState<ApiPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ data: ApiPayment[] }>("/api/platform/payments?limit=100")
      .then((res) => setPayments(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminListPage
      title="Payments"
      subtitle={loading ? "Loading…" : `${payments.length} transaction${payments.length === 1 ? "" : "s"}`}
      tabs={["All", "pending", "paid", "failed", "refunded"]}
      getTab={(p) => p.status}
      columns={columns}
      rows={payments}
      loading={loading}
      rowHref={(p) => `/admin/payments/${p.id}`}
      searchPlaceholder="Search payments..."
    />
  )
}

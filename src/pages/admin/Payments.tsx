import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { payments } from "@/data/mockData"
import type { Payment } from "@/types"

const columns: AdminColumn<Payment>[] = [
  { header: "Payment", render: (p) => <span className="font-mono text-xs font-semibold">{p.id}</span> },
  { header: "Employer", render: (p) => p.employer },
  { header: "Plan", render: (p) => p.plan },
  { header: "Amount", render: (p) => <span className="font-semibold">{p.amount}</span> },
  { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
  { header: "Date", render: (p) => p.date },
]

export function AdminPayments() {
  return (
    <AdminListPage
      title="Payments"
      subtitle={`${payments.length} recent transactions`}
      tabs={["All", "Paid", "Failed", "Refunded", "Pending"]}
      getTab={(p) => p.status}
      columns={columns}
      rows={payments}
      searchPlaceholder="Search payments..."
    />
  )
}

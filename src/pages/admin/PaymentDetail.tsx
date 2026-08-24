import { Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { MetricTile } from "@/components/cards/MetricTile"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { adminEmployers, payments } from "@/data/mockData"

export function AdminPaymentDetail() {
  const { id } = useParams()
  const payment = payments.find((p) => p.id === id)

  if (!payment) return <Navigate to="/admin/payments" replace />

  const employer = adminEmployers.find((e) => e.company === payment.employer)

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/payments"
        backLabel="Back to payments"
        initials={payment.employer.slice(0, 2).toUpperCase()}
        name={payment.employer}
        meta={`${payment.id} · ${payment.plan} plan · ${payment.date}`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast("Preparing receipt", { description: "You'll get a download link shortly." })}>
              Download receipt
            </Button>
            {payment.status === "Paid" && (
              <Button variant="dark" onClick={() => toast("Refund requested", { description: "Finance will review this within 2 business days." })}>
                Refund
              </Button>
            )}
            {payment.status === "Failed" && (
              <Button variant="dark" onClick={() => toast("Retrying payment", { description: "We'll notify the employer if it fails again." })}>
                Retry payment
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1">
            <StatusBadge status={payment.status} className="text-base" />
          </p>
        </div>
        <MetricTile label="Amount" value={payment.amount} />
        <MetricTile label="Plan" value={payment.plan} />
      </div>

      {employer && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-bold">Employer account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {employer.domain} · {employer.recruiters} recruiters · {employer.activeJobs} active jobs · {employer.usage}% of plan quota used
          </p>
        </div>
      )}
    </div>
  )
}

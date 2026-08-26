import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { ApiError, api } from "@/lib/api"
import type { ApiPayment } from "@/types"

export function AdminPaymentDetail() {
  const { id } = useParams()
  const [payment, setPayment] = useState<ApiPayment | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<ApiPayment>(`/api/platform/payments/${id}`)
      .then(setPayment)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/admin/payments" replace />
  if (loading || !payment) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const amount = (payment.amountCents / 100).toLocaleString(undefined, { style: "currency", currency: payment.currency })

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/payments"
        backLabel="Back to payments"
        initials={payment.organization.name.slice(0, 2).toUpperCase()}
        name={payment.organization.name}
        meta={`${payment.id} · ${payment.plan?.name ?? "No plan"} · ${new Date(payment.createdAt).toLocaleDateString()}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1">
            <StatusBadge status={payment.status} className="text-base" />
          </p>
        </div>
        <MetricTile label="Amount" value={amount} />
        <MetricTile label="Plan" value={payment.plan?.name ?? "—"} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2>Transaction details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provider: {payment.provider} · Transaction ID: {payment.providerTransactionId ?? "—"}
          {payment.settledAt && <> · Settled {new Date(payment.settledAt).toLocaleString()}</>}
        </p>
      </div>
    </div>
  )
}

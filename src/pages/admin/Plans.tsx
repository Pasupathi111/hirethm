import { Check, Pencil, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { PlanFormDialog } from "@/components/dialogs/PlanFormDialog"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiPlan } from "@/types"

function formatPrice(plan: ApiPlan) {
  if (plan.priceMonthlyCents == null) return { amount: "Custom", period: "" }
  if (plan.priceMonthlyCents === 0) return { amount: "$0", period: "/month" }
  return { amount: `$${(plan.priceMonthlyCents / 100).toLocaleString()}`, period: "/month" }
}

export function AdminPlans() {
  const reduced = useReducedMotion()
  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<{ data: ApiPlan[] }>("/api/platform/plans")
      .then((res) => setPlans(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load plans"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleDelete = async (plan: ApiPlan) => {
    try {
      await api.del(`/api/platform/plans/${plan.id}`)
      toast.success(`${plan.name} deleted`)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete plan")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Plans</h1>
          <p className="mt-1 text-muted-foreground">Commercial plans available to employer organizations.</p>
        </div>
        <PlanFormDialog
          onSaved={load}
          trigger={
            <Button variant="dark">
              <Plus className="size-4" /> New plan
            </Button>
          }
        />
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <motion.div
          className="grid gap-5 md:grid-cols-3"
          variants={withReducedMotion(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          {plans.map((plan) => {
            const price = formatPrice(plan)
            return (
              <motion.div key={plan.id} variants={withReducedMotion(reduced, fadeInUp)} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{plan.name}</p>
                    {!plan.isActive && <Badge variant="warning">Inactive</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <PlanFormDialog
                      plan={plan}
                      onSaved={load}
                      trigger={
                        <Button variant="outline" size="icon" aria-label={`Edit ${plan.name} plan`}>
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <p className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em]">
                  {price.amount}
                  <span className="text-base font-medium text-muted-foreground">{price.period}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.subscriberCount ?? 0} employer{plan.subscriberCount === 1 ? "" : "s"} on this plan
                </p>
                {plan.features.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
                {(plan.subscriberCount ?? 0) === 0 && (
                  <Button variant="outline" size="sm" className="mt-4 w-full text-destructive" onClick={() => handleDelete(plan)}>
                    Delete plan
                  </Button>
                )}
              </motion.div>
            )
          })}
          {plans.length === 0 && (
            <p className="col-span-full rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No plans yet — create your first one.
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}

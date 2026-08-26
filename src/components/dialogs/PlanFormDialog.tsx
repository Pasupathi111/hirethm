import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError, api } from "@/lib/api"
import type { ApiPlan, ApiPlanTier } from "@/types"

interface PlanFormValues {
  name: string
  tier: ApiPlanTier
  priceMonthlyCents: string
  activeJobLimit: string
  profileViewQuota: string
  features: string
  isActive: boolean
}

function toFormValues(plan?: ApiPlan): PlanFormValues {
  return {
    name: plan?.name ?? "",
    tier: plan?.tier ?? "free",
    priceMonthlyCents: plan?.priceMonthlyCents != null ? String(plan.priceMonthlyCents / 100) : "",
    activeJobLimit: plan?.activeJobLimit != null ? String(plan.activeJobLimit) : "",
    profileViewQuota: plan?.profileViewQuota != null ? String(plan.profileViewQuota) : "",
    features: plan?.features.join("\n") ?? "",
    isActive: plan?.isActive ?? true,
  }
}

export function PlanFormDialog({
  plan,
  trigger,
  onSaved,
}: {
  /** Omit to create a new plan; pass an existing plan to edit it. */
  plan?: ApiPlan
  trigger: React.ReactNode
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<PlanFormValues>(() => toFormValues(plan))
  const [saving, setSaving] = useState(false)

  const isEdit = !!plan

  const handleSave = async () => {
    if (!values.name.trim()) {
      toast.error("Plan name is required")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: values.name.trim(),
        tier: values.tier,
        priceMonthlyCents: values.priceMonthlyCents.trim() ? Math.round(Number(values.priceMonthlyCents) * 100) : null,
        activeJobLimit: values.activeJobLimit.trim() ? Number(values.activeJobLimit) : null,
        profileViewQuota: values.profileViewQuota.trim() ? Number(values.profileViewQuota) : null,
        features: values.features.split("\n").map((f) => f.trim()).filter(Boolean),
        isActive: values.isActive,
      }
      if (isEdit) {
        await api.patch(`/api/platform/plans/${plan.id}`, payload)
        toast.success("Plan updated")
      } else {
        await api.post("/api/platform/plans", payload)
        toast.success("Plan created")
      }
      setOpen(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to ${isEdit ? "update" : "create"} plan`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setValues(toFormValues(plan))
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${plan.name}` : "New plan"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Name</Label>
            <Input id="plan-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-tier">Tier</Label>
              <Select value={values.tier} onValueChange={(v) => setValues((s) => ({ ...s, tier: v as ApiPlanTier }))}>
                <SelectTrigger id="plan-tier" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-price">Price / month ($, blank = custom)</Label>
              <Input
                id="plan-price"
                type="number"
                min="0"
                value={values.priceMonthlyCents}
                onChange={(e) => setValues((v) => ({ ...v, priceMonthlyCents: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-jobs">Active job limit (blank = unlimited)</Label>
              <Input
                id="plan-jobs"
                type="number"
                min="0"
                value={values.activeJobLimit}
                onChange={(e) => setValues((v) => ({ ...v, activeJobLimit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-quota">Profile view quota / mo (blank = unlimited)</Label>
              <Input
                id="plan-quota"
                type="number"
                min="0"
                value={values.profileViewQuota}
                onChange={(e) => setValues((v) => ({ ...v, profileViewQuota: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-features">Features (one per line)</Label>
            <textarea
              id="plan-features"
              value={values.features}
              onChange={(e) => setValues((v) => ({ ...v, features: e.target.value }))}
              rows={4}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

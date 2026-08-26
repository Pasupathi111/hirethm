import { Badge, type badgeVariants } from "@/components/ui/badge"
import type { VariantProps } from "class-variance-authority"

type Variant = VariantProps<typeof badgeVariants>["variant"]

const statusMap: Record<string, Variant> = {
  // positive / active
  active: "success",
  analysed: "success",
  published: "success",
  accepted: "success",
  healthy: "success",
  new: "warning",
  locked: "success",
  // in-progress / info
  processing: "info",
  queued: "info",
  "under review": "info",
  interview: "info",
  "in progress": "info",
  trial: "info",
  upcoming: "info",
  invited: "info",
  // warning / attention
  "needs attention": "warning",
  "waiting for decision": "warning",
  shortlisted: "warning",
  degraded: "warning",
  "past due": "warning",
  "quota reached": "warning",
  "enhancement offered": "warning",
  warning: "warning",
  pending: "warning",
  draft: "default",
  // negative
  failed: "destructive",
  rejected: "destructive",
  suspended: "destructive",
  closed: "destructive",
  down: "destructive",
  "ai failed": "destructive",
  critical: "destructive",
  error: "destructive",
  // neutral
  applied: "default",
  // A dependency that was never set up — distinct from one that is failing.
  "not configured": "default",
  free: "default",
  completed: "default",
  cancelled: "default",
  read: "info",
  full: "success",
  none: "default",
  paid: "success",
  refunded: "default",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = statusMap[status.toLowerCase()] ?? "default"
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}

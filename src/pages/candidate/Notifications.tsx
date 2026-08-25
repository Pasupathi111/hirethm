import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError, api } from "@/lib/api"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiNotification } from "@/types"

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Notifications() {
  const [tab, setTab] = useState("All")
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const reduced = useReducedMotion()

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<{ data: ApiNotification[] }>("/api/me/notifications")
      .then((res) => setNotifications(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load notifications"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const categories = Array.from(new Set(notifications.map((n) => n.category)))
  const tabs = ["All", ...categories]
  const filtered = tab === "All" ? notifications : notifications.filter((n) => n.category === tab)

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    try {
      await api.patch(`/api/me/notifications/${id}`, { isRead: true })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update notification")
    }
  }

  const markAllRead = async () => {
    const previous = notifications
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await api.post("/api/me/notifications/mark-all-read")
      toast.success("All notifications marked as read")
    } catch (err) {
      setNotifications(previous)
      toast.error(err instanceof ApiError ? err.message : "Failed to mark notifications as read")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">Notifications</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <motion.div
          className="space-y-3"
          variants={withReducedMotion(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          {filtered.map((n) => (
            <motion.div
              key={n.id}
              variants={withReducedMotion(reduced, fadeInUp)}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-5"
            >
              {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-primary" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{n.category}</Badge>
                  <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1 font-bold">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => markRead(n.id)}>
                {n.actionLabel}
              </Button>
            </motion.div>
          ))}

          {filtered.length === 0 && <EmptyState title={`No notifications in "${tab}".`} description="You're all caught up." />}
        </motion.div>
      )}
    </div>
  )
}

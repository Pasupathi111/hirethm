import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notifications as allNotifications } from "@/data/mockData"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { NotificationItem } from "@/types"

const tabs: (NotificationItem["category"] | "All")[] = ["All", "Matches", "Applications", "Interviews", "Profile", "System"]

export function Notifications() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All")
  const [notifications, setNotifications] = useState(allNotifications)
  const reduced = useReducedMotion()

  const filtered = tab === "All" ? notifications : notifications.filter((n) => n.category === tab)

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
    toast(notifications.find((n) => n.id === id)?.action)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">Notifications</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
            toast.success("All notifications marked as read")
          }}
        >
          Mark all as read
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
            {n.unread && <span className="size-2 shrink-0 rounded-full bg-primary" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{n.category}</Badge>
                <span className="text-xs text-muted-foreground">{n.timeAgo}</span>
              </div>
              <p className="mt-1 font-bold">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => markRead(n.id)}>
              {n.action}
            </Button>
          </motion.div>
        ))}

        {filtered.length === 0 && <EmptyState title={`No notifications in "${tab}".`} description="You're all caught up." />}
      </motion.div>
    </div>
  )
}

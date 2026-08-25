import { Badge } from "@/components/ui/badge"
import { updateItems } from "@/data/mockData"

const tagVariant: Record<string, "success" | "info" | "warning"> = {
  Feature: "success",
  Improvement: "info",
  Fix: "warning",
}

export function AdminUpdates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Updates</h1>
        <p className="mt-1 text-muted-foreground">What's new on the HireThm platform.</p>
      </div>

      <div className="space-y-4">
        {updateItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={tagVariant[item.tag]}>{item.tag}</Badge>
              <span className="text-sm text-muted-foreground">{item.date}</span>
            </div>
            <h2 className="mt-3 text-lg font-bold">{item.title}</h2>
            <p className="mt-1 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

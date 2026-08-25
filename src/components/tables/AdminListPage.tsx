import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/EmptyState"
import { SkeletonListRow } from "@/components/feedback/Skeleton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface AdminColumn<T> {
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

export function AdminListPage<T extends { id: string }>({
  title,
  subtitle,
  tabs,
  getTab,
  columns,
  rows,
  rowHref,
  searchPlaceholder,
}: {
  title: string
  subtitle: string
  tabs?: string[]
  getTab?: (row: T) => string
  columns: AdminColumn<T>[]
  rows: T[]
  rowHref?: (row: T) => string
  searchPlaceholder?: string
}) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(tabs?.[0] ?? "All")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    let result = rows
    if (tabs && getTab && tab !== "All") {
      result = result.filter((r) => getTab(r) === tab)
    }
    if (query.trim()) {
      result = result.filter((r) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()))
    }
    return result
  }, [rows, tab, tabs, getTab, query])

  const allSelected = filtered.length > 0 && selected.length === filtered.length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("CSV export started", { description: "You'll get a download link shortly." })}>
            Export CSV
          </Button>
          <Button
            variant="dark"
            disabled={selected.length === 0}
            onClick={() => toast(`${selected.length} rows selected`, { description: "Choose a bulk action to apply." })}
          >
            Bulk actions
          </Button>
        </div>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
        className="max-w-sm"
      />

      {tabs && (
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                tab === t ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => setSelected(v ? filtered.map((r) => r.id) : [])}
                  />
                </TableHead>
                {columns.map((col) => (
                  <TableHead key={col.header} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  className={rowHref ? "cursor-pointer" : undefined}
                  onClick={() => rowHref && navigate(rowHref(row))}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.includes(row.id)}
                      onCheckedChange={(v) =>
                        setSelected((prev) => (v ? [...prev, row.id] : prev.filter((id) => id !== row.id)))
                      }
                    />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtered.length === 0 && (
            <div className="p-4">
              <EmptyState title="No results match your search." description="Try a different search term or clear your filters." />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

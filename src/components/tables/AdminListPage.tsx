import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { isValidElement, useEffect, useMemo, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { SearchBar } from "@/components/common/SearchBar"
import { EmptyState } from "@/components/feedback/EmptyState"
import { SkeletonListRow } from "@/components/feedback/Skeleton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface AdminColumn<T> {
  header: string
  render: (row: T) => React.ReactNode
  className?: string
  /** Enables click-to-sort on this column's header. */
  sortValue?: (row: T) => string | number
  /**
   * Overrides what this column contributes to a CSV export. Only needed when
   * the rendered cell has no meaningful text (an icon-only cell), or when the
   * export should carry more precision than the display — a raw ISO date where
   * the table shows "3 days ago", for instance.
   */
  exportValue?: (row: T) => string | number | null | undefined
}

const PAGE_SIZE = 10

/**
 * Flatten a rendered cell to plain text for CSV export.
 *
 * Columns render arbitrary JSX (badges, links, icon + label pairs), so the
 * export walks the element tree and keeps the text nodes. This means export
 * needs no per-column configuration and cannot silently drift from what the
 * table shows. A column whose cell carries no text at all can still opt in
 * explicitly via `exportValue`.
 */
function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join(" ")
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeToText(node.props.children)
  return ""
}

/** RFC 4180 quoting: double the quotes, wrap anything containing a delimiter. */
function csvCell(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim()
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized
}

function toCsv<T>(columns: AdminColumn<T>[], rows: T[]): string {
  const header = columns.map((c) => csvCell(c.header)).join(",")
  const body = rows.map((row) =>
    columns
      .map((c) => csvCell(c.exportValue ? String(c.exportValue(row) ?? "") : nodeToText(c.render(row))))
      .join(","),
  )
  return [header, ...body].join("\r\n")
}

/** Trigger a browser download of `content` without round-tripping through a server. */
function downloadCsv(filename: string, content: string) {
  // The BOM makes Excel read the file as UTF-8 instead of the local codepage,
  // which otherwise mangles any non-ASCII name in the export.
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
  loading,
  headerActions,
  onDeleteSelected,
}: {
  title: string
  subtitle: string
  tabs?: string[]
  getTab?: (row: T) => string
  columns: AdminColumn<T>[]
  rows: T[]
  rowHref?: (row: T) => string
  searchPlaceholder?: string
  /** Drives the loading skeleton from the caller's real fetch state. */
  loading: boolean
  /** Extra buttons rendered before the built-in Export CSV button. */
  headerActions?: React.ReactNode
  /** When provided, adds a real "Delete selected" action for the checked rows. */
  onDeleteSelected?: (ids: string[]) => Promise<void> | void
}) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(tabs?.[0] ?? "All")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<{ header: string; direction: "asc" | "desc" } | null>(null)
  const [page, setPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [tab, query, rows])

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

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const column = columns.find((c) => c.header === sort.header)
    if (!column?.sortValue) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = column.sortValue!(a)
      const bv = column.sortValue!(b)
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))
      return sort.direction === "asc" ? cmp : -cmp
    })
    return copy
  }, [filtered, sort, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const allSelected = paginated.length > 0 && paginated.every((r) => selected.includes(r.id))

  const toggleSort = (header: string) => {
    setSort((prev) => {
      if (prev?.header !== header) return { header, direction: "asc" }
      if (prev.direction === "asc") return { header, direction: "desc" }
      return null
    })
  }

  /**
   * Export what the user is actually looking at: the current tab + search +
   * sort, or just the checked rows if any are checked. Pagination is
   * deliberately ignored — exporting only page 1 of a filtered set is the
   * kind of silent truncation that makes an export untrustworthy.
   */
  const handleExportCsv = () => {
    const scope = selected.length > 0 ? sorted.filter((r) => selected.includes(r.id)) : sorted
    if (scope.length === 0) {
      toast("Nothing to export", { description: "No rows match the current filters." })
      return
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`${slug}-${stamp}.csv`, toCsv(columns, scope))
    toast.success(`Exported ${scope.length} row${scope.length === 1 ? "" : "s"}`, {
      description: selected.length > 0 ? "Selected rows only." : "All rows matching the current filters.",
    })
  }

  const handleDeleteSelected = async () => {
    if (!onDeleteSelected || selected.length === 0) return
    setIsDeleting(true)
    try {
      await onDeleteSelected(selected)
      setSelected([])
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          {headerActions}
          <Button variant="outline" onClick={handleExportCsv} disabled={loading}>
            {selected.length > 0 ? `Export CSV (${selected.length})` : "Export CSV"}
          </Button>
          {onDeleteSelected && (
            <Button variant="destructive" disabled={selected.length === 0 || isDeleting} onClick={handleDeleteSelected}>
              {isDeleting ? "Deleting..." : `Delete selected${selected.length ? ` (${selected.length})` : ""}`}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {tabs ? (
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
        ) : (
          <div />
        )}

        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
          containerClassName="ml-auto w-full max-w-sm"
        />
      </div>

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
                    onCheckedChange={(v) =>
                      setSelected((prev) => {
                        const pageIds = paginated.map((r) => r.id)
                        if (v) return Array.from(new Set([...prev, ...pageIds]))
                        return prev.filter((id) => !pageIds.includes(id))
                      })
                    }
                  />
                </TableHead>
                {columns.map((col) => (
                  <TableHead
                    key={col.header}
                    className={`${col.className ?? ""} ${col.sortValue ? "cursor-pointer select-none" : ""}`}
                    onClick={() => col.sortValue && toggleSort(col.header)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortValue &&
                        (sort?.header === col.header ? (
                          sort.direction === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 opacity-40" />
                        ))}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
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

          {sorted.length === 0 && (
            <div className="p-4">
              <EmptyState title="No results match your search." description="Try a different search term or clear your filters." />
            </div>
          )}

          {sorted.length > 0 && (
            <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

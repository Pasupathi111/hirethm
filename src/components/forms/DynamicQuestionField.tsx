import { Upload, X } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type JobQuestionType =
  | "short_text"
  | "long_text"
  | "single_select"
  | "multi_select"
  | "number"
  | "date"
  | "url"
  | "checkbox"
  | "file_upload"

export interface JobQuestion {
  id: string
  type: JobQuestionType
  label: string
  description?: string | null
  required: boolean
  options?: string[] | null
}

export type QuestionValue = string | string[] | number | boolean | undefined

/** Renders a single recruiter-configured custom question as the right form field. */
export function DynamicQuestionField({
  question,
  value,
  onChange,
  onFileChange,
  error,
}: {
  question: JobQuestion
  value: QuestionValue
  onChange: (value: QuestionValue) => void
  onFileChange?: (file: File | null) => void
  error?: string
}) {
  const fieldId = `q-${question.id}`
  const errorClass = error ? "border-destructive" : ""

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>
        {question.label}
        {question.required && <span className="text-destructive"> *</span>}
      </Label>

      {question.type === "short_text" && (
        <Input
          id={fieldId}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className={errorClass}
        />
      )}

      {question.type === "long_text" && (
        <Textarea
          id={fieldId}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          required={question.required}
          className={errorClass}
        />
      )}

      {question.type === "single_select" && (
        <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className={cn("w-full", errorClass)}>
            <SelectValue placeholder="Select an option…" />
          </SelectTrigger>
          <SelectContent>
            {(question.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {question.type === "multi_select" && (
        <div className="mt-1 space-y-2">
          {(question.options ?? []).map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt)
            return (
              <label key={opt} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? [...value] : []
                    onChange(checked === true ? [...current, opt] : current.filter((o) => o !== opt))
                  }}
                />
                <span className="text-sm text-foreground">{opt}</span>
              </label>
            )
          })}
        </div>
      )}

      {question.type === "number" && (
        <Input
          id={fieldId}
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          required={question.required}
          className={errorClass}
        />
      )}

      {question.type === "date" && (
        <Input
          id={fieldId}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className={errorClass}
        />
      )}

      {question.type === "url" && (
        <Input
          id={fieldId}
          type="url"
          placeholder="https://…"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className={errorClass}
        />
      )}

      {question.type === "checkbox" && (
        <label className="mt-1 flex cursor-pointer items-center gap-2">
          <Checkbox checked={(value as boolean) ?? false} onCheckedChange={(checked) => onChange(checked === true)} />
          <span className="text-sm text-foreground">Yes</span>
        </label>
      )}

      {question.type === "file_upload" && (
        <FileQuestionInput
          fieldId={fieldId}
          fileName={typeof value === "string" && value.startsWith("pending:") ? value.slice(8) : null}
          error={!!error}
          onFileChange={(file) => {
            onChange(file ? `pending:${file.name}` : undefined)
            onFileChange?.(file)
          }}
        />
      )}

      {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function FileQuestionInput({
  fieldId,
  fileName,
  error,
  onFileChange,
}: {
  fieldId: string
  fileName: string | null
  error: boolean
  onFileChange: (file: File | null) => void
}) {
  return (
    <div className="mt-1">
      <input
        id={fieldId}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {!fileName ? (
        <label
          htmlFor={fieldId}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm transition-colors",
            error
              ? "border-destructive text-destructive"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
          )}
        >
          <Upload className="size-4" />
          Choose file (PDF, DOC, DOCX — max 10 MB)
        </label>
      ) : (
        <div className={cn("flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm", error ? "border-destructive" : "border-border")}>
          <span className="mr-2 truncate text-foreground">{fileName}</span>
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
            onClick={() => onFileChange(null)}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

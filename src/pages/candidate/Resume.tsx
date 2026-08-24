import { FileText, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { candidateProfile } from "@/data/mockData"

export function Resume() {
  const [fileName, setFileName] = useState<string | null>("alex-johnson-resume-v3.pdf")
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Resume</h1>
        <p className="mt-1 text-muted-foreground">
          HireThm reads your CV and shows you exactly what it extracted. Nothing is changed without your approval.
        </p>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card py-16 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) {
            setFileName(file.name)
            toast.success("Resume uploaded", { description: "HireThm is analysing your CV." })
          }
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
          <Upload className="size-6 text-accent-foreground" />
        </div>
        <p className="text-lg font-bold">Upload your resume</p>
        <p className="text-sm text-muted-foreground">PDF, DOC, DOCX · up to 10 MB</p>
        <div className="mt-2 flex gap-3">
          <Button onClick={() => inputRef.current?.click()}>Browse files</Button>
          <Button variant="outline">Drag & drop</Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setFileName(file.name)
              toast.success("Resume uploaded", { description: "HireThm is analysing your CV." })
            }
          }}
        />
      </div>

      {fileName && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="font-semibold">{fileName}</p>
              <p className="text-sm text-muted-foreground">CV status: Analysed · v3</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFileName(null)}>
            Remove
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">What HireThm extracted</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Experience</p>
            <ul className="mt-2 space-y-1 text-sm">
              {candidateProfile.experience.map((e) => (
                <li key={e.role}>
                  {e.role} · {e.company}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Skills</p>
            <p className="mt-2 text-sm text-muted-foreground">{candidateProfile.skills.join(", ")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

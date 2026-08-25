import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function EditSectionDialog({
  section,
  defaultValue,
  trigger,
  onSave,
}: {
  section: string
  defaultValue: string
  trigger: React.ReactNode
  /** Optional persistence hook. Receives the edited text; return/throw to signal failure (dialog stays open, no success toast). */
  onSave?: (value: string) => Promise<void> | void
}) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!onSave) {
      setOpen(false)
      toast.success(`${section} updated`)
      return
    }
    setSaving(true)
    try {
      await onSave(value)
      setOpen(false)
      toast.success(`${section} updated`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to update ${section}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setValue(defaultValue)
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {section}</DialogTitle>
        </DialogHeader>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

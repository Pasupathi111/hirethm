import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function EditSectionDialog({
  section,
  defaultValue,
  trigger,
}: {
  section: string
  defaultValue: string
  trigger: React.ReactNode
}) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {section}</DialogTitle>
        </DialogHeader>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false)
              toast.success(`${section} updated`)
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

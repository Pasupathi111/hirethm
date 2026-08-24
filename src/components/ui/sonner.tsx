import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card! text-foreground! border-border! rounded-xl! shadow-lg!",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground!",
          cancelButton: "bg-muted! text-muted-foreground!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

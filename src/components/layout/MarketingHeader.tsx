import { Menu } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Find Jobs", to: "/jobs" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "For Candidates", to: "/#for-candidates" },
]

export function MarketingHeader() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className={cn(
                "text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground",
                location.pathname === link.to && "text-primary"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/admin/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            Admin
          </Link>
          <Button asChild variant="outline">
            <Link to="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/create-profile">Create Profile</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.to}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/admin/login" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                Admin
              </Link>
            </div>
            <div className="mt-auto flex flex-col gap-2 p-4">
              <Button asChild variant="outline">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/create-profile">Create Profile</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

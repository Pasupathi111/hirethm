import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/consent-policy" className="hover:text-foreground">Consent policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
        <p className="text-sm text-muted-foreground">© 2026 HireThm</p>
      </div>
    </footer>
  )
}

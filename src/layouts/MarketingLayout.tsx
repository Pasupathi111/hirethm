import { Outlet } from "react-router-dom"

import { MarketingFooter } from "@/components/layout/MarketingFooter"
import { MarketingHeader } from "@/components/layout/MarketingHeader"

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  )
}

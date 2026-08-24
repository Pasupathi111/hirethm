import { Outlet } from "react-router-dom"

import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminTopbar } from "@/components/layout/AdminTopbar"

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

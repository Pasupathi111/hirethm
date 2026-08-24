import { cn } from "@/lib/utils"

const roles = ["Platform Admin", "Operations Admin", "AI Admin", "Finance Admin", "Support Admin", "Read Only Admin"]

const areas: { area: string; access: ("Full" | "Read" | "None")[] }[] = [
  { area: "Candidates", access: ["Full", "Full", "Read", "None", "Read", "Read"] },
  { area: "Employers", access: ["Full", "Full", "None", "Read", "Read", "Read"] },
  { area: "Jobs", access: ["Full", "Full", "None", "None", "Read", "Read"] },
  { area: "Matches", access: ["Full", "Full", "Read", "None", "Read", "Read"] },
  { area: "Consent & visibility", access: ["Full", "Read", "None", "None", "None", "None"] },
  { area: "AI configuration", access: ["Full", "None", "Full", "None", "None", "Read"] },
  { area: "Plans & payments", access: ["Full", "Read", "None", "Full", "None", "Read"] },
  { area: "Platform settings", access: ["Full", "Read", "Read", "None", "None", "Read"] },
]

const tone: Record<string, string> = {
  Full: "text-emerald-600 font-bold",
  Read: "text-blue-600 font-semibold",
  None: "text-muted-foreground",
}

export function AdminRolesPermissions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Roles and permissions</h1>
        <p className="mt-1 text-muted-foreground">
          Role permission is only one half of access. Tenant scope, resource state and consent rules also apply.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Area</th>
              {roles.map((role) => (
                <th key={role} className="p-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {areas.map((row) => (
              <tr key={row.area} className="border-b border-border last:border-0">
                <td className="p-4 font-bold">{row.area}</td>
                {row.access.map((level, i) => (
                  <td key={i} className={cn("p-4", tone[level])}>
                    {level}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

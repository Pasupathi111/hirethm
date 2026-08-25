import { Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { SettingRow } from "@/components/forms/SettingRow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authClient } from "@/lib/authClient"
import { ApiError, api } from "@/lib/api"
import { useMyCandidate } from "@/lib/candidateSession"
import { cn } from "@/lib/utils"
import type { ApiPreferences } from "@/types"

const visibilityOptions = [
  { value: "open", title: "Open to AI matching", description: "HireThm can score you against roles and notify you first" },
  { value: "manual", title: "Only roles I apply to", description: "No AI matches will be generated" },
  { value: "hidden", title: "Hidden", description: "Pause all matching and sourcing" },
]

const defaultPreferences: ApiPreferences = {
  desiredTitles: [],
  locations: [],
  workMode: "any",
  minSalary: null,
  maxSalary: null,
  employmentTypes: [],
  notifyMatches: true,
  notifyApplications: true,
  notifyInterviews: true,
}

export function Settings() {
  const { candidate } = useMyCandidate()
  const [visibility, setVisibility] = useState("open")

  const [prefs, setPrefs] = useState<ApiPreferences>(defaultPreferences)
  const [prefsLoading, setPrefsLoading] = useState(true)
  const [prefsError, setPrefsError] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const loadPreferences = useCallback(() => {
    setPrefsLoading(true)
    setPrefsError("")
    api
      .get<ApiPreferences>("/api/me/preferences")
      .then(setPrefs)
      .catch((err) => setPrefsError(err instanceof ApiError ? err.message : "Failed to load preferences"))
      .finally(() => setPrefsLoading(false))
  }, [])

  useEffect(loadPreferences, [loadPreferences])

  const updatePreference = async (patch: Partial<ApiPreferences>) => {
    const previous = prefs
    const next = { ...prefs, ...patch }
    setPrefs(next)
    try {
      const updated = await api.put<ApiPreferences>("/api/me/preferences", next)
      setPrefs(updated)
    } catch (err) {
      setPrefs(previous)
      toast.error(err instanceof ApiError ? err.message : "Failed to save preference")
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Enter your current and new password")
      return
    }
    setChangingPassword(true)
    try {
      const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
      if (error) throw new Error(error.message ?? "Failed to update password")
      toast.success("Password updated")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // TODO: confirm the actual path/response shape once the backend agent's account-deletion
      // endpoint has landed and been reviewed — wiring it now per the agreed contract.
      await api.post("/api/me/account/delete")
      toast.success("Account deletion requested")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to request account deletion")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="career">Career Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Account</h2>
            <div className="mt-4 divide-y divide-hairline">
              <SettingRow label="Email address" description={candidate?.email ?? ""} control={<Switch checked disabled />} />
              <SettingRow label="Phone number" description={candidate?.phone ?? "Not provided"} control={<Switch checked disabled />} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <Label htmlFor="lang">Language</Label>
              <Input id="lang" defaultValue="English (US)" className="sm:w-56" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg">Password</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-pw">Current password</Label>
                  <Input
                    id="current-pw"
                    type="password"
                    placeholder="••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    placeholder="••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleChangePassword} disabled={changingPassword}>
                {changingPassword ? "Updating…" : "Update password"}
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Two-factor authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" onClick={() => toast("Two-factor setup", { description: "Scan the QR code in your authenticator app." })}>
                  Enable
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          {prefsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : prefsError ? (
            <ErrorState description={prefsError} onRetry={loadPreferences} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg">Notification preferences</h2>
              <div className="mt-4 divide-y divide-hairline">
                <SettingRow
                  label="New match alerts"
                  description="Get notified when a new AI match is found"
                  control={<Switch checked={prefs.notifyMatches} onCheckedChange={(v) => updatePreference({ notifyMatches: v })} />}
                />
                <SettingRow
                  label="Application updates"
                  description="Status changes on roles you applied to"
                  control={<Switch checked={prefs.notifyApplications} onCheckedChange={(v) => updatePreference({ notifyApplications: v })} />}
                />
                <SettingRow
                  label="Interview updates"
                  description="New interview invites and schedule changes"
                  control={<Switch checked={prefs.notifyInterviews} onCheckedChange={(v) => updatePreference({ notifyInterviews: v })} />}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="privacy">
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg">Profile visibility</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your profile is never visible to an employer until you accept a match. This setting controls whether
                you appear in AI sourcing at all.
              </p>
              <RadioGroup value={visibility} onValueChange={setVisibility} className="mt-4 space-y-3">
                {visibilityOptions.map((opt) => (
                  <label
                    key={opt.value}
                    htmlFor={`visibility-${opt.value}`}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-colors",
                      visibility === opt.value ? "border-primary bg-accent" : "border-border hover:bg-muted"
                    )}
                  >
                    <div>
                      <p className="font-semibold">{opt.title}</p>
                      <p className="text-sm text-muted-foreground">{opt.description}</p>
                    </div>
                    <RadioGroupItem value={opt.value} id={`visibility-${opt.value}`} />
                  </label>
                ))}
              </RadioGroup>
              <p className="mt-3 text-xs text-muted-foreground">
                Visibility persistence isn't wired to a backend endpoint yet — this control is currently local to your session.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg">Your data</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => toast("Preparing export", { description: "We'll email a download link shortly." })}>
                  Export my data
                </Button>
                <Button variant="outline" onClick={() => toast("Data sharing", { description: "Manage which employers can see your history." })}>
                  Manage data sharing
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  <Trash2 className="size-4" />
                  {deleting ? "Requesting…" : "Delete account"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="career">
          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
            Manage your role, skill and salary preferences on the{" "}
            <Link to="/app/preferences" className="font-semibold text-primary">
              Career Preferences
            </Link>{" "}
            page.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

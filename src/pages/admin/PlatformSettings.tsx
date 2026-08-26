import { useEffect, useState } from "react"
import { toast } from "sonner"

import { SettingRow } from "@/components/forms/SettingRow"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, api } from "@/lib/api"
import type { ApiCalendarStatus, ApiDateFormat, ApiMatchNotificationChannel, ApiNameDisplayFormat, ApiOrgSettings, ApiSsoProvider } from "@/types"

function GeneralAndRetentionTab() {
  const [settings, setSettings] = useState<ApiOrgSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<ApiOrgSettings>("/api/org-settings").then(setSettings).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const save = async (patch: Partial<ApiOrgSettings>, label: string) => {
    setSaving(true)
    try {
      const updated = await api.patch<ApiOrgSettings>("/api/org-settings", patch)
      setSettings(updated)
      toast.success(`${label} updated`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to update ${label.toLowerCase()}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Display</h2>
        <div className="mt-2">
          <SettingRow
            label="Candidate-first notification"
            description="Candidates are always notified of a match before the employer. Enforced. Cannot be disabled."
            control={<Badge variant="success">Locked on</Badge>}
          />
          <SettingRow
            label="Name display format"
            description="How candidate names are shown across the org's dashboard."
            control={
              <Select
                value={settings.nameDisplayFormat}
                onValueChange={(v) => save({ nameDisplayFormat: v as ApiNameDisplayFormat }, "Name display format")}
                disabled={saving}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_last">First Last</SelectItem>
                  <SelectItem value="last_first">Last, First</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            label="Date format"
            description="How dates are displayed across the org's dashboard."
            control={
              <Select
                value={settings.dateFormat}
                onValueChange={(v) => save({ dateFormat: v as ApiDateFormat }, "Date format")}
                disabled={saving}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Match notifications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How candidates are told about matches against this organization's roles.
        </p>
        <div className="mt-2">
          <SettingRow
            label="Notification channel"
            description="Where a candidate is notified when they reach a qualifying match."
            control={
              <Select
                value={settings.matchNotificationChannel}
                onValueChange={(v) => save({ matchNotificationChannel: v as ApiMatchNotificationChannel }, "Notification channel")}
                disabled={saving}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-app only</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="both">Email + In-app</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            label="Minimum readiness to notify"
            description="Matches scoring below this are never created and never notify the candidate."
            control={
              <Select
                value={String(settings.minReadinessScore)}
                onValueChange={(v) => save({ minReadinessScore: Number(v) }, "Minimum readiness")}
                disabled={saving}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Consent expiry</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidate visibility lapses after a period of inactivity. Nothing is deleted — any new
          activity restores visibility immediately.
        </p>
        <div className="mt-2">
          <SettingRow
            label="Auto-revoke visibility"
            description="Hide inactive candidates from recruiters until their consent is renewed."
            control={
              <Switch
                checked={settings.consentExpiryEnabled}
                onCheckedChange={(v) => save({ consentExpiryEnabled: v }, "Consent expiry")}
                disabled={saving}
              />
            }
          />
          <SettingRow
            label="Consent window"
            description="Days of inactivity before visibility is revoked."
            control={
              <Select
                value={String(settings.consentExpiryDays)}
                onValueChange={(v) => save({ consentExpiryDays: Number(v) }, "Consent window")}
                disabled={saving || !settings.consentExpiryEnabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Data retention</h2>
        <div className="mt-2">
          <SettingRow
            label="Enable retention & auto-purge"
            description="Quarantines inactive candidates, then permanently erases them after the quarantine window. Runs nightly."
            control={
              <Switch
                checked={settings.retentionEnabled}
                onCheckedChange={(v) => save({ retentionEnabled: v }, "Retention")}
                disabled={saving}
              />
            }
          />
          <SettingRow
            label="Retention period"
            description="How long a candidate can be inactive before quarantine begins."
            control={
              <Select
                value={String(settings.retentionMonths)}
                onValueChange={(v) => save({ retentionMonths: Number(v) }, "Retention period")}
                disabled={saving || !settings.retentionEnabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            label="Quarantine window"
            description="Days a candidate stays quarantined (recoverable) before permanent erasure."
            control={
              <Select
                value={String(settings.quarantineDays)}
                onValueChange={(v) => save({ quarantineDays: Number(v) }, "Quarantine window")}
                disabled={saving || !settings.retentionEnabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Application-form privacy notice</h2>
        <p className="mt-1 text-sm text-muted-foreground">Shown to candidates on this org's public job application forms.</p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="privacy-url">Privacy policy URL</label>
            <Input
              id="privacy-url"
              defaultValue={settings.privacyPolicyUrl ?? ""}
              placeholder="https://example.com/privacy"
              onBlur={(e) => {
                if (e.target.value !== (settings.privacyPolicyUrl ?? "")) save({ privacyPolicyUrl: e.target.value || null }, "Privacy policy URL")
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="privacy-contact">Privacy contact email</label>
            <Input
              id="privacy-contact"
              defaultValue={settings.privacyContactEmail ?? ""}
              placeholder="privacy@example.com"
              onBlur={(e) => {
                if (e.target.value !== (settings.privacyContactEmail ?? "")) save({ privacyContactEmail: e.target.value || null }, "Privacy contact email")
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="privacy-text">Additional notice text</label>
            <Textarea
              id="privacy-text"
              rows={4}
              defaultValue={settings.privacyPolicyText ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (settings.privacyPolicyText ?? "")) save({ privacyPolicyText: e.target.value || null }, "Privacy notice text")
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SsoTab() {
  const [providers, setProviders] = useState<ApiSsoProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ providerId: "", issuer: "", domain: "", clientId: "", clientSecret: "" })

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<ApiSsoProvider[]>("/api/sso/providers")
      .then(setProviders)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load SSO providers"))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await api.post("/api/sso/providers", form)
      toast.success("SSO provider registered")
      setShowForm(false)
      setForm({ providerId: "", issuer: "", domain: "", clientId: "", clientSecret: "" })
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to register SSO provider")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (provider: ApiSsoProvider) => {
    try {
      await api.del(`/api/sso/providers/${provider.id}`)
      toast.success(`${provider.providerId} removed`)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove provider")
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg">Single sign-on (OIDC)</h2>
          <p className="mt-1 text-sm text-muted-foreground">Users signing in with an email at a registered domain are routed through that provider.</p>
        </div>
        <Button variant="dark" size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Add provider"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-4 space-y-3 rounded-md border border-border p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Provider ID (e.g. okta)" value={form.providerId} onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))} />
            <Input placeholder="Domain (e.g. company.com)" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} />
          </div>
          <Input placeholder="Issuer URL (OIDC discovery)" value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Client ID" value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} />
            <Input type="password" placeholder="Client secret" value={form.clientSecret} onChange={(e) => setForm((f) => ({ ...f, clientSecret: e.target.value }))} />
          </div>
          <Button size="sm" onClick={handleCreate} disabled={saving}>
            {saving ? "Registering…" : "Register provider"}
          </Button>
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : error ? (
          <ErrorState description={error} onRetry={load} />
        ) : providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No SSO providers registered for this org.</p>
        ) : (
          providers.map((p) => (
            <SettingRow
              key={p.id}
              label={p.providerId}
              description={`Domain: ${p.domain} · Issuer: ${p.issuer}`}
              control={
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(p)}>
                  Remove
                </Button>
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

function IntegrationsTab() {
  const [status, setStatus] = useState<ApiCalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get<ApiCalendarStatus>("/api/calendar/status").then(setStatus).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleDisconnect = async () => {
    try {
      await api.post("/api/calendar/disconnect")
      toast.success("Google Calendar disconnected")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to disconnect")
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg">Connected apps</h2>
      <p className="mt-1 text-sm text-muted-foreground">Calendar connections are personal to your signed-in account, used to sync interview slots.</p>
      <div className="mt-2">
        {loading || !status ? (
          <Skeleton className="h-16 w-full" />
        ) : !status.available ? (
          <SettingRow
            label="Google Calendar"
            description="Not configured on this server — Google OAuth credentials have not been provided."
            control={<Badge variant="warning">Unavailable</Badge>}
          />
        ) : status.connected ? (
          <SettingRow
            label="Google Calendar"
            description={`Connected as ${status.accountEmail ?? "unknown account"}`}
            control={
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            }
          />
        ) : (
          <SettingRow
            label="Google Calendar"
            description="Sync interview slots to your calendar."
            control={
              <Button variant="dark" size="sm" onClick={() => { window.location.href = "/api/calendar/google/connect" }}>
                Connect
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}

export function AdminPlatformSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Organization settings</h1>
        <p className="mt-1 text-muted-foreground">Configuration for your active organization — display, retention, SSO, and integrations.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General & Retention</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralAndRetentionTab />
        </TabsContent>

        <TabsContent value="sso">
          <SsoTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

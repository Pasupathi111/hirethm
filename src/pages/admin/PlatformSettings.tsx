import { useState } from "react"
import { toast } from "sonner"

import { SettingRow } from "@/components/forms/SettingRow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const integrations = [
  { name: "Slack", description: "Post new applications and matches to a channel.", connected: true },
  { name: "Google Calendar", description: "Sync interview slots to interviewer calendars.", connected: true },
  { name: "Greenhouse", description: "Two-way sync with your existing ATS.", connected: false },
  { name: "Zapier", description: "Trigger custom workflows on platform events.", connected: false },
]

export function AdminPlatformSettings() {
  const [consentExpiry, setConsentExpiry] = useState("90")
  const [notifyChannel, setNotifyChannel] = useState("email-inapp")
  const [minReadiness, setMinReadiness] = useState("65")
  const [matchWindow, setMatchWindow] = useState("02:00")

  const [connections, setConnections] = useState(integrations)

  const [locale, setLocale] = useState("en-US")
  const [timezone, setTimezone] = useState("America/Chicago")
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY")

  const [retentionPeriod, setRetentionPeriod] = useState("24")
  const [autoPurge, setAutoPurge] = useState(true)
  const [anonymizeInactive, setAnonymizeInactive] = useState(true)

  const [ssoEnabled, setSsoEnabled] = useState(false)
  const [ssoProvider, setSsoProvider] = useState("okta")
  const [ssoDomain, setSsoDomain] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Platform settings</h1>
        <p className="mt-1 text-muted-foreground">Operational configuration for the HireThm marketplace.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Consent and visibility</h2>
            <div className="mt-2">
              <SettingRow
                label="Candidate-first notification"
                description="Enforced. Cannot be disabled."
                control={<Badge variant="success">Locked on</Badge>}
              />
              <SettingRow
                label="Consent expiry"
                description="Visibility revoked automatically after this period of inactivity."
                control={
                  <Select value={consentExpiry} onValueChange={(v) => { setConsentExpiry(v); toast.success("Consent expiry updated") }}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              <SettingRow
                label="Match notification channel"
                description="Channels used to notify the candidate first."
                control={
                  <Select value={notifyChannel} onValueChange={(v) => { setNotifyChannel(v); toast.success("Notification channel updated") }}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email-inapp">Email + In-app</SelectItem>
                      <SelectItem value="email">Email only</SelectItem>
                      <SelectItem value="inapp">In-app only</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Matching</h2>
            <div className="mt-2">
              <SettingRow
                label="Minimum readiness to notify"
                description="Matches below this score are never surfaced."
                control={
                  <Select value={minReadiness} onValueChange={(v) => { setMinReadiness(v); toast.success("Minimum readiness updated") }}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="65">65%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              <SettingRow
                label="Matching window"
                description="Nightly batch run time, platform timezone."
                control={
                  <Select value={matchWindow} onValueChange={(v) => { setMatchWindow(v); toast.success("Matching window updated") }}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01:00">01:00</SelectItem>
                      <SelectItem value="02:00">02:00</SelectItem>
                      <SelectItem value="03:00">03:00</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Connected apps</h2>
            <div className="mt-2">
              {connections.map((app, i) => (
                <SettingRow
                  key={app.name}
                  label={app.name}
                  description={app.description}
                  control={
                    <Button
                      variant={app.connected ? "outline" : "dark"}
                      size="sm"
                      onClick={() => {
                        setConnections((prev) => prev.map((c, idx) => (idx === i ? { ...c, connected: !c.connected } : c)))
                        toast.success(app.connected ? `${app.name} disconnected` : `${app.name} connected`)
                      }}
                    >
                      {app.connected ? "Disconnect" : "Connect"}
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="localization">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Locale and formatting</h2>
            <div className="mt-2">
              <SettingRow
                label="Language"
                description="Default language for platform emails and UI."
                control={
                  <Select value={locale} onValueChange={(v) => { setLocale(v); toast.success("Language updated") }}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              <SettingRow
                label="Timezone"
                description="Used for scheduling and reporting."
                control={
                  <Select value={timezone} onValueChange={(v) => { setTimezone(v); toast.success("Timezone updated") }}>
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              <SettingRow
                label="Date format"
                description="How dates are displayed across the platform."
                control={
                  <Select value={dateFormat} onValueChange={(v) => { setDateFormat(v); toast.success("Date format updated") }}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="retention">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Data retention</h2>
            <div className="mt-2">
              <SettingRow
                label="Retention period"
                description="How long inactive candidate data is kept before purge."
                control={
                  <Select value={retentionPeriod} onValueChange={(v) => { setRetentionPeriod(v); toast.success("Retention period updated") }}>
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
                label="Auto-purge expired data"
                description="Automatically delete data once the retention period elapses."
                control={<Switch checked={autoPurge} onCheckedChange={(v) => { setAutoPurge(v); toast.success("Auto-purge updated") }} />}
              />
              <SettingRow
                label="Anonymize inactive candidates"
                description="Strip PII from candidates inactive for over 12 months instead of deleting."
                control={<Switch checked={anonymizeInactive} onCheckedChange={(v) => { setAnonymizeInactive(v); toast.success("Anonymization policy updated") }} />}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sso">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Single sign-on</h2>
            <div className="mt-2">
              <SettingRow
                label="Enforce SSO"
                description="Require Enterprise-plan employers to sign in via SSO."
                control={<Switch checked={ssoEnabled} onCheckedChange={(v) => { setSsoEnabled(v); toast.success(v ? "SSO enforced" : "SSO enforcement disabled") }} />}
              />
              <SettingRow
                label="Provider"
                description="Identity provider used for SAML/OIDC."
                control={
                  <Select value={ssoProvider} onValueChange={setSsoProvider} disabled={!ssoEnabled}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="okta">Okta</SelectItem>
                      <SelectItem value="azure-ad">Azure AD</SelectItem>
                      <SelectItem value="google">Google Workspace</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              <SettingRow
                label="Allowed domain"
                description="Users with this email domain are routed through SSO."
                control={
                  <Input
                    value={ssoDomain}
                    onChange={(e) => setSsoDomain(e.target.value)}
                    placeholder="abc-tech.com"
                    disabled={!ssoEnabled}
                    className="w-48"
                  />
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { SettingRow } from "@/components/forms/SettingRow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { candidateProfile, consentHistory } from "@/data/mockData"
import { cn } from "@/lib/utils"

const visibilityOptions = [
  { value: "open", title: "Open to AI matching", description: "HireThm can score you against roles and notify you first" },
  { value: "manual", title: "Only roles I apply to", description: "No AI matches will be generated" },
  { value: "hidden", title: "Hidden", description: "Pause all matching and sourcing" },
]

const consentToneVariant = { positive: "success", negative: "destructive", neutral: "default" } as const

export function Settings() {
  const [phone, setPhone] = useState(true)
  const [marketing, setMarketing] = useState(true)
  const [matchAlerts, setMatchAlerts] = useState(true)
  const [appAlerts, setAppAlerts] = useState(true)
  const [visibility, setVisibility] = useState("open")

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
              <SettingRow label="Email address" description={candidateProfile.email} control={<Switch checked disabled />} />
              <SettingRow
                label="Phone number"
                description={candidateProfile.phone}
                control={<Switch checked={phone} onCheckedChange={setPhone} />}
              />
              <SettingRow
                label="Marketing emails"
                description="Product news and tips"
                control={<Switch checked={marketing} onCheckedChange={setMarketing} />}
              />
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
                  <Input id="current-pw" type="password" placeholder="••••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input id="new-pw" type="password" placeholder="••••••••••" />
                </div>
              </div>
              <Button className="mt-4" onClick={() => toast.success("Password updated")}>
                Update password
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
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Notification preferences</h2>
            <div className="mt-4 divide-y divide-hairline">
              <SettingRow
                label="New match alerts"
                description="Get notified when a new AI match is found"
                control={<Switch checked={matchAlerts} onCheckedChange={setMatchAlerts} />}
              />
              <SettingRow
                label="Application updates"
                description="Status changes on roles you applied to"
                control={<Switch checked={appAlerts} onCheckedChange={setAppAlerts} />}
              />
            </div>
          </div>
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
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg">Consent history</h2>
              <p className="mt-1 text-sm text-muted-foreground">Every visibility decision is recorded and auditable.</p>
              <div className="mt-4 space-y-4">
                {consentHistory.map((event) => (
                  <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-4 text-sm last:border-0">
                    <span className="text-muted-foreground">{event.timestamp}</span>
                    <Badge variant={consentToneVariant[event.tone]}>{event.event}</Badge>
                    <span className="text-muted-foreground">{event.employer}</span>
                  </div>
                ))}
              </div>
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
                  onClick={() => toast.error("Account deletion requires email confirmation")}
                >
                  Delete account
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

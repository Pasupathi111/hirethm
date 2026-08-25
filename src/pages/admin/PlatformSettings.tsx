import { useState } from "react"
import { toast } from "sonner"

import { SettingRow } from "@/components/forms/SettingRow"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminPlatformSettings() {
  const [consentExpiry, setConsentExpiry] = useState("90")
  const [notifyChannel, setNotifyChannel] = useState("email-inapp")
  const [minReadiness, setMinReadiness] = useState("65")
  const [matchWindow, setMatchWindow] = useState("02:00")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Platform settings</h1>
        <p className="mt-1 text-muted-foreground">Operational configuration for the HireThm marketplace.</p>
      </div>

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
    </div>
  )
}

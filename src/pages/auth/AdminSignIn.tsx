import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminSignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("ops@hirethm.com")
  const [password, setPassword] = useState("••••••••••")
  const [code, setCode] = useState("418 902")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-16 text-secondary-foreground">
      <div className="flex items-center gap-2">
        <Logo className="text-white" />
        <Badge variant="dark" className="border border-white/20 bg-white/10 text-mint">
          ADMIN
        </Badge>
      </div>

      <div className="mt-8 w-full max-w-sm text-center">
        <h1 className="text-3xl text-white">Platform administration</h1>
        <p className="mt-2 text-sm text-white/50">Restricted access. All actions are recorded in the audit log.</p>

        <form
          className="mt-8 space-y-5 rounded-lg border border-white/10 bg-white/5 p-6 text-left"
          onSubmit={(e) => {
            e.preventDefault()
            navigate("/admin")
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="work-email" className="text-white/70">
              Work email
            </Label>
            <Input
              id="work-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/15 bg-black/30 text-white placeholder:text-white/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-white/70">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/15 bg-black/30 text-white placeholder:text-white/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-code" className="text-white/70">
              Authenticator code
            </Label>
            <Input
              id="auth-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border-white/15 bg-black/30 font-mono text-white placeholder:text-white/30"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Sign in to admin
          </Button>
        </form>

        <Link to="/" className="mt-6 inline-block text-sm text-white/50 hover:text-white">
          ← Back to hirethm.com
        </Link>
      </div>
    </div>
  )
}

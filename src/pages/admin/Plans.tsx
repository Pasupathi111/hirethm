import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { plans } from "@/data/mockData"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function AdminPlans() {
  const reduced = useReducedMotion()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Plans</h1>
        <p className="mt-1 text-muted-foreground">Commercial plans available to employer organizations.</p>
      </div>

      <motion.div
        className="grid gap-5 md:grid-cols-3"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {plans.map((plan) => (
          <motion.div key={plan.id} variants={withReducedMotion(reduced, fadeInUp)} className="rounded-lg border border-border bg-card p-6">
            <p className="font-bold">{plan.name}</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em]">
              {plan.price}
              <span className="text-base font-medium text-muted-foreground">{plan.billingPeriod}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{plan.employers} employers on this plan</p>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="mt-5 w-full"
              onClick={() => toast(`Editing ${plan.name} plan`, { description: "Pricing and feature changes apply platform-wide." })}
            >
              Edit plan
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

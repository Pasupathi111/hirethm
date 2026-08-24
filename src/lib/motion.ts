import { useReducedMotion as useFramerReducedMotion, type Variants } from "framer-motion"

/**
 * Shared motion tokens for HireThm. Import from here instead of hand-rolling
 * transition timings/variants per component so the whole app moves the same way.
 */

export const DURATION = {
  fast: 0.18, // hover / press / toggle
  normal: 0.25, // cards / dropdowns / tabs / modals / drawers
  slow: 0.4, // page transitions / stagger reveals
} as const

export const EASE = {
  out: [0.16, 1, 0.3, 1] as const, // entering elements
  inOut: [0.65, 0, 0.35, 1] as const, // state transitions / exits
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.out } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.normal, ease: EASE.out } },
}

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const modalScale: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.out } },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: DURATION.fast, ease: EASE.inOut } },
}

export function drawerSlide(side: "left" | "right" = "right"): Variants {
  const offscreen = side === "right" ? "100%" : "-100%"
  return {
    hidden: { x: offscreen },
    show: { x: 0, transition: { duration: DURATION.slow, ease: EASE.out } },
    exit: { x: offscreen, transition: { duration: DURATION.normal, ease: EASE.inOut } },
  }
}

/** framer-motion's hook can return null before mount; normalize to a boolean. */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}

/** Zero out transition durations for a variants object when reduced motion is requested. */
export function withReducedMotion(reduced: boolean, variants: Variants): Variants {
  if (!reduced) return variants
  const stripped: Variants = {}
  for (const key of Object.keys(variants)) {
    const value = variants[key]
    stripped[key] = typeof value === "object" ? { ...value, transition: { duration: 0 } } : value
  }
  return stripped
}

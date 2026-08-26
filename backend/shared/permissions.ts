/**
 * ─────────────────────────────────────────────
 * Centralized Access Control — single source of truth
 * ─────────────────────────────────────────────
 *
 * This file defines EVERY permission in the system.  It is imported by
 * both the server (auth.ts) and the client (auth-client.ts) so roles
 * and statements are always in sync.
 *
 * Design principles:
 *   • Deny by default — if a permission isn't listed here, it's denied.
 *   • Three built-in roles only (owner / admin / member) — no custom ones.
 *   • Import from `better-auth/plugins/access` to keep bundle small.
 *   • Merge with `defaultStatements` so Better Auth's own org/member/invitation
 *     permissions are preserved alongside our ATS-specific ones.
 */

import { createAccessControl } from 'better-auth/plugins/access'
import {
  defaultStatements,
  adminAc,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access'

// ─── ATS-specific resource → action map ────────────────────────────
// Every resource the app manages is declared here with its allowed actions.
// `as const` is mandatory for TypeScript inference.

const atsStatements = {
  organization: ['read', 'update', 'delete'],
  job: ['create', 'read', 'update', 'delete'],
  candidate: ['create', 'read', 'update', 'delete'],
  application: ['create', 'read', 'update', 'delete'],
  document: ['create', 'read', 'update', 'delete'],
  comment: ['create', 'read', 'update', 'delete'],
  interview: ['create', 'read', 'update', 'delete'],
  emailTemplate: ['create', 'read', 'update', 'delete'],
  activityLog: ['read'],
  scoring: ['create', 'read', 'update', 'delete'],
  sourceTracking: ['create', 'read', 'update', 'delete'],
} as const

// ─── Merged statement (Better Auth defaults + ATS resources) ───────
export const statements = {
  ...defaultStatements,
  ...atsStatements,
} as const

// ─── Access Controller ─────────────────────────────────────────────
export const ac = createAccessControl(statements)

// ─── Role definitions ──────────────────────────────────────────────
//
// owner   — org creator.  EVERYTHING including delete org / manage billing.
// admin   — hiring managers.  Full CRUD on ATS resources + invite members.
// member  — recruiters.  Read jobs, manage candidates/applications in pipeline.

// ─── Per-role ATS grants ───────────────────────────────────────────
//
// Typed against `atsStatements` so each value is a MUTABLE array of that
// resource's literal actions — which is exactly what `ac.newRole()` expects.
// (`as const` would produce readonly tuples and fail to type-check there.)
// The annotation also means a typo like `job: ['reed']` is a compile error.

type AtsGrants = {
  [K in keyof typeof atsStatements]: (typeof atsStatements)[K][number][]
}

//
// Declared as standalone constants (rather than inline in `newRole`) so the
// admin console's "Roles & permissions" screen can render the real matrix
// straight from this file via `GET /api/platform/permissions`, instead of
// keeping a hand-maintained copy that silently drifts out of date.

export const ownerAtsGrants: AtsGrants = {
  organization: ['read', 'update', 'delete'],
  job: ['create', 'read', 'update', 'delete'],
  candidate: ['create', 'read', 'update', 'delete'],
  application: ['create', 'read', 'update', 'delete'],
  document: ['create', 'read', 'update', 'delete'],
  comment: ['create', 'read', 'update', 'delete'],
  interview: ['create', 'read', 'update', 'delete'],
  emailTemplate: ['create', 'read', 'update', 'delete'],
  activityLog: ['read'],
  scoring: ['create', 'read', 'update', 'delete'],
  sourceTracking: ['create', 'read', 'update', 'delete'],
}

export const adminAtsGrants: AtsGrants = {
  organization: ['read', 'update', 'delete'],
  job: ['create', 'read', 'update', 'delete'],
  candidate: ['create', 'read', 'update', 'delete'],
  application: ['create', 'read', 'update', 'delete'],
  document: ['create', 'read', 'update', 'delete'],
  comment: ['create', 'read', 'update', 'delete'],
  interview: ['create', 'read', 'update', 'delete'],
  emailTemplate: ['create', 'read', 'update', 'delete'],
  activityLog: ['read'],
  scoring: ['create', 'read', 'update', 'delete'],
  sourceTracking: ['create', 'read', 'update', 'delete'],
}

export const memberAtsGrants: AtsGrants = {
  organization: ['read'],
  job: ['read'],
  candidate: ['create', 'read', 'update'],
  application: ['create', 'read', 'update'],
  document: ['create', 'read'],
  comment: ['create', 'read', 'delete'],
  interview: ['create', 'read', 'update'],
  emailTemplate: ['create', 'read', 'update'],
  activityLog: ['read'],
  scoring: ['create', 'read'],
  sourceTracking: ['read'],
}

/** Every ATS role, in ascending order of privilege. */
export const atsRoleGrants = {
  member: memberAtsGrants,
  admin: adminAtsGrants,
  owner: ownerAtsGrants,
} as const

export type AtsRoleName = keyof typeof atsRoleGrants

export const owner = ac.newRole({
  ...ownerAc.statements,
  ...ownerAtsGrants,
})

export const admin = ac.newRole({
  ...adminAc.statements,
  ...adminAtsGrants,
})

export const member = ac.newRole({
  ...memberAc.statements,
  ...memberAtsGrants,
})

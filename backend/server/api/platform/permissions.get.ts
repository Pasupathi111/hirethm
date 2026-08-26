import { atsRoleGrants, statements } from '~~/shared/permissions'

/**
 * GET /api/platform/permissions
 *
 * The real authorization model, served straight from `shared/permissions.ts`
 * — the same constants Better Auth enforces with — so the admin console's
 * "Roles & permissions" screen cannot drift from what the server actually
 * allows. There is nothing org-specific here: the matrix is identical for
 * every tenant (roles are fixed, not customizable), so a session is all that
 * is required and no org is needed.
 *
 * Two independent boundaries are returned, because conflating them is the
 * mistake this screen previously made:
 *
 *  - `orgRoles` — a member's role *within one organization*. Never grants
 *    cross-tenant access, no matter the role.
 *  - `platformAdmin` — the `user.isPlatformAdmin` flag, a separate boundary
 *    gating the cross-tenant HireThm console. Granted only by the
 *    `grant-platform-admin` script, never self-service.
 *
 * See `server/utils/requirePermission.ts` and
 * `server/utils/requirePlatformAdmin.ts`.
 */

/** Display labels for the resource keys in `shared/permissions.ts`. */
const RESOURCE_LABELS: Record<string, string> = {
  organization: 'Organization',
  job: 'Jobs',
  candidate: 'Candidates',
  application: 'Applications',
  document: 'Documents',
  comment: 'Comments',
  interview: 'Interviews',
  emailTemplate: 'Email templates',
  activityLog: 'Activity log',
  scoring: 'AI scoring',
  sourceTracking: 'Source tracking',
}

const ROLE_LABELS: Record<string, { label: string; description: string }> = {
  owner: { label: 'Owner', description: 'Created the organization. Full control, including deleting it.' },
  admin: { label: 'Admin', description: 'Hiring managers. Full CRUD on every ATS resource, plus member invitations.' },
  member: { label: 'Member', description: 'Recruiters. Manage the pipeline; cannot create or delete jobs.' },
}

/** Order actions consistently rather than however the object happens to iterate. */
const ACTION_ORDER = ['create', 'read', 'update', 'delete']

function sortActions(actions: readonly string[]): string[] {
  return [...actions].sort((a, b) => {
    const ia = ACTION_ORDER.indexOf(a)
    const ib = ACTION_ORDER.indexOf(b)
    return (ia === -1 ? ACTION_ORDER.length : ia) - (ib === -1 ? ACTION_ORDER.length : ib)
  })
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const roleNames = Object.keys(atsRoleGrants)

  // Resources are taken from the grants, not from RESOURCE_LABELS, so a new
  // resource added to shared/permissions.ts shows up here automatically
  // (falling back to its key as the label) instead of disappearing.
  const resourceKeys = Array.from(
    new Set(roleNames.flatMap(r => Object.keys(atsRoleGrants[r as keyof typeof atsRoleGrants]))),
  )

  const resources = resourceKeys.map(key => ({
    key,
    label: RESOURCE_LABELS[key] ?? key,
    /** Every action the access controller knows about for this resource. */
    allActions: sortActions((statements as Record<string, readonly string[]>)[key] ?? []),
    grants: Object.fromEntries(
      roleNames.map(role => [
        role,
        sortActions(
          (atsRoleGrants[role as keyof typeof atsRoleGrants] as Record<string, string[]>)[key] ?? [],
        ),
      ]),
    ),
  }))

  return {
    orgRoles: roleNames.map(name => ({
      name,
      label: ROLE_LABELS[name]?.label ?? name,
      description: ROLE_LABELS[name]?.description ?? '',
    })),
    resources,
    platformAdmin: {
      label: 'Platform admin',
      description:
        'HireThm staff. A flag on the user record (`user.isPlatformAdmin`), entirely separate from organization roles — '
        + 'it grants the cross-tenant console (employers, plans, payments, usage, system health) and is set only by the '
        + '`grant-platform-admin` script. It confers no permissions inside any individual organization.',
      grantedBy: 'grant-platform-admin script',
      selfService: false,
    },
    notes: [
      'Deny by default: any action not listed here is refused.',
      'Organization roles are fixed — there are no custom roles.',
      'Role permission is only one half of access. Tenant scope, resource state and consent rules also apply.',
    ],
  }
})

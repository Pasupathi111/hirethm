export interface ApiSourceChannelBreakdown {
  channel: string
  count: number
}

export interface ApiSourceTopLink {
  id: string
  name: string
  channel: string
  code: string
  jobTitle: string | null
  clickCount: number
  applicationCount: number
  isActive: boolean
}

export interface ApiSourceStats {
  channelBreakdown: ApiSourceChannelBreakdown[]
  topLinks: ApiSourceTopLink[]
  funnel: Record<string, Record<string, number>>
  dailyTrend: { date: string; channel: string; count: number }[]
  topReferrerDomains: { domain: string | null; count: number }[]
  summary: { totalTracked: number; totalUntracked: number; attributionRate: number }
}

export interface OrgSearchResult {
  id: string
  name: string
  slug: string
}

// ── Real backend API shapes (Reqcore) ───────────────────────────────────────

export type ApiJobType = "full_time" | "part_time" | "contract" | "internship"
export type ApiJobStatus = "draft" | "open" | "closed" | "archived"
export type ApiRemoteStatus = "remote" | "hybrid" | "onsite"
export type ApiExperienceLevel = "junior" | "mid" | "senior" | "lead"

export interface ApiJobPipeline {
  new: number
  screening: number
  interview: number
  offer: number
  hired: number
  rejected: number
}

/** GET /api/dashboard/stats — org-scoped, all figures computed live. */
export interface ApiDashboardStats {
  counts: {
    openJobs: number
    totalCandidates: number
    totalApplications: number
    newApplications: number
  }
  pipeline: ApiJobPipeline
  jobsByStatus: Record<ApiJobStatus, number>
  recentApplications: {
    id: string
    status: ApiApplicationStatus
    createdAt: string
    candidateId: string
    candidateFirstName: string
    candidateLastName: string
    candidateEmail: string
    jobId: string
    jobTitle: string
  }[]
  topJobs: {
    id: string
    title: string
    slug: string
    status: ApiJobStatus
    createdAt: string
    applicationCount: number
    newCount: number
    screeningCount: number
    interviewCount: number
    offerCount: number
    hiredCount: number
    rejectedCount: number
  }[]
}

export interface ApiJob {
  id: string
  title: string
  slug: string
  description: string | null
  location: string | null
  type: ApiJobType
  status: ApiJobStatus
  experienceLevel: ApiExperienceLevel | null
  remoteStatus: ApiRemoteStatus | null
  salaryMin?: number | null
  salaryMax?: number | null
  validThrough?: string | null
  skills?: string[]
  createdAt: string
  updatedAt: string
  pipeline: ApiJobPipeline
  /** Present on GET /api/jobs/:id (single-job detail), absent on the list endpoint */
  completeness?: CandidateCompleteness
  /** Present on GET /api/jobs (list endpoint) as a cheaper score-only summary */
  completenessScore?: number
}

export type ApiGender = "male" | "female" | "other" | "prefer_not_to_say"

export interface ApiCandidate {
  id: string
  firstName: string
  lastName: string
  displayName: string | null
  email: string
  phone: string | null
  gender: ApiGender | null
  dateOfBirth: string | null
  quickNotes: string | null
  createdAt: string
  updatedAt: string
  applicationCount: number
}

export type ApiApplicationStatus = "new" | "screening" | "interview" | "offer" | "hired" | "rejected"

export interface ApiApplication {
  id: string
  status: ApiApplicationStatus
  score: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  candidateId: string
  candidateFirstName: string
  candidateLastName: string
  candidateEmail: string
  jobId: string
  jobTitle: string
  jobStatus: ApiJobStatus
}

export type ApiInterviewType = "phone" | "video" | "in_person" | "panel" | "technical" | "take_home"
export type ApiInterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show"

export interface ApiInterview {
  id: string
  title: string
  type: ApiInterviewType
  status: ApiInterviewStatus
  scheduledAt: string
  duration: number
  location: string | null
  notes: string | null
  interviewers: string[] | null
  applicationId: string
  candidateFirstName: string
  candidateLastName: string
  candidateEmail: string
  jobId: string
  jobTitle: string
}

export type ApiInterviewTemplateStatus = "active" | "draft" | "archived"

export interface ApiInterviewTemplate {
  id: string
  organizationId: string
  name: string
  type: ApiInterviewType
  duration: number
  questions: string[]
  status: ApiInterviewTemplateStatus
  createdAt: string
  updatedAt: string
}

export interface ApiInterviewDetail {
  id: string
  title: string
  type: ApiInterviewType
  status: ApiInterviewStatus
  scheduledAt: string
  duration: number
  location: string | null
  notes: string | null
  interviewers: string[] | null
  invitationSentAt: string | null
  candidateResponse: ApiCandidateInterviewResponse
  candidateRespondedAt: string | null
  googleCalendarEventId: string | null
  googleCalendarEventLink: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  applicationId: string
  candidateId: string
  candidateFirstName: string
  candidateLastName: string
  candidateEmail: string
  candidatePhone: string | null
  jobId: string
  jobTitle: string
}

// ── Candidate self-service (GET /api/me/candidate) ──────────────────────────

export type ApiCandidateInterviewResponse = "pending" | "accepted" | "declined" | "tentative"

export interface MyCandidateInterview {
  id: string
  title: string
  type: ApiInterviewType
  status: ApiInterviewStatus
  scheduledAt: string
  duration: number
  location: string | null
  candidateResponse: ApiCandidateInterviewResponse
  candidateRespondedAt: string | null
}

export interface MyCandidateApplication {
  id: string
  status: ApiApplicationStatus
  score: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  job: {
    id: string
    title: string
    location: string | null
    type: ApiJobType
    remoteStatus: ApiRemoteStatus | null
    status: ApiJobStatus
  }
  interviews: MyCandidateInterview[]
}

export interface CandidateCompletenessItem {
  key: string
  label: string
  met: boolean
  weight: number
  hint: string
}

export interface CandidateCompleteness {
  score: number
  isComplete: boolean
  items: CandidateCompletenessItem[]
  hints: string[]
}

export interface MyCandidate {
  id: string
  firstName: string
  lastName: string
  displayName: string | null
  email: string
  phone: string | null
  gender: ApiGender | null
  dateOfBirth: string | null
  quickNotes: string | null
  skills?: string[]
  createdAt: string
  updatedAt: string
  applications: MyCandidateApplication[]
  organization: { id: string; name: string } | null
  completeness: CandidateCompleteness
}

// ── Candidate self-service: recommended jobs, matches, notifications, preferences, documents ──

export interface ApiRecommendedJobSummary {
  id: string
  title: string
  location: string | null
  type: ApiJobType
  remoteStatus: ApiRemoteStatus | null
  salaryMin?: number | null
  salaryMax?: number | null
  organizationName?: string | null
}

/** One entry of a Mutual Readiness Score breakdown, as returned by the API. */
export interface ReadinessCriterion {
  label: string
  value: number
}

export interface ApiRecommendedJob {
  job: ApiRecommendedJobSummary
  score: number
  criteria: ReadinessCriterion[]
  reasons: string[]
  gap?: string
}

export type ApiMatchStatus = "new" | "waiting" | "accepted" | "rejected" | "in_progress"

export interface ApiMatch {
  id: string
  jobId: string
  job: ApiRecommendedJobSummary
  score: number
  criteria: ReadinessCriterion[]
  reasons: string[]
  gap?: string
  status: ApiMatchStatus
  matchedAt: string
  updatedAt: string
}

export type ApiMatchStatusAdmin = "new" | "waiting" | "accepted" | "rejected" | "in_progress"

export interface ApiAdminMatch {
  id: string
  score: number
  status: ApiMatchStatusAdmin
  matchedAt: string
  candidateId: string
  candidateFirstName: string
  candidateLastName: string
  jobId: string
  jobTitle: string
}

export interface ApiAdminMatchDetail {
  id: string
  score: number
  criteria: ReadinessCriterion[]
  reasons: string[]
  gap: string | null
  status: ApiMatchStatusAdmin
  matchedAt: string
  updatedAt: string
  candidateId: string
  candidateFirstName: string
  candidateLastName: string
  candidateEmail: string
  jobId: string
  jobTitle: string
  jobLocation: string | null
  jobType: string
  organizationName: string
}

export interface ApiMeInterview {
  id: string
  jobId: string
  jobTitle: string
  company: string
  type: ApiInterviewType
  status: ApiInterviewStatus
  scheduledAt: string
  duration: number
  location: string | null
}

export interface ApiNotification {
  id: string
  category: string
  title: string
  description: string
  actionLabel: string
  actionHref?: string
  isRead: boolean
  createdAt: string
}

export type ApiWorkMode = "remote" | "hybrid" | "onsite" | "any"

export interface ApiPreferences {
  desiredTitles: string[]
  locations: string[]
  workMode: ApiWorkMode
  minSalary: number | null
  maxSalary: number | null
  employmentTypes: string[]
  notifyMatches: boolean
  notifyApplications: boolean
  notifyInterviews: boolean
}

export interface ResumeSection {
  heading: string
  content: string
}

export interface ParsedResumeStructured {
  email: string | null
  phone: string | null
  skills: string[]
}

export interface ParsedResume {
  text: string
  sections: ResumeSection[]
  structured: ParsedResumeStructured
  metadata: {
    pageCount: number | null
    wordCount: number
    characterCount: number
    extractedAt: string
    parserVersion: string
    sourceFormat: "pdf" | "docx" | "doc"
  }
}

export interface ApiDocument {
  id: string
  originalFilename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  parsedContent?: ParsedResume | null
}

export type ApiPlanTier = "free" | "premium" | "enterprise"
export type ApiSubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing"

export interface ApiPlan {
  id: string
  name: string
  tier: ApiPlanTier
  priceMonthlyCents: number | null
  currency: string
  activeJobLimit: number | null
  profileViewQuota: number | null
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  subscriberCount?: number
}

export interface ApiOrganizationSubscription {
  id: string
  organizationId: string
  planId: string
  status: ApiSubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  plan?: ApiPlan
}

export interface ApiOrgUsage {
  plan: ApiPlan | null
  periodStart: string | null
  periodEnd: string | null
  profileViews: number
  profileViewQuota: number | null
  profileViewPercent: number | null
  activeJobs: number
  activeJobLimit: number | null
  activeJobPercent: number | null
}

export type ApiNameDisplayFormat = "first_last" | "last_first"
export type ApiDateFormat = "mdy" | "dmy" | "ymd"

export type ApiMatchNotificationChannel = "in_app" | "email" | "both"

export interface ApiOrgSettings {
  nameDisplayFormat: ApiNameDisplayFormat
  dateFormat: ApiDateFormat
  retentionEnabled: boolean
  retentionMonths: number
  quarantineDays: number
  retentionActivatedAt: string | null
  matchNotificationChannel: ApiMatchNotificationChannel
  minReadinessScore: number
  /** Per-criterion Mutual Readiness weighting. Server substitutes engine defaults when unset. */
  matchWeights: ApiMatchWeights
  consentExpiryEnabled: boolean
  consentExpiryDays: number
  privacyPolicyUrl: string | null
  privacyPolicyText: string | null
  privacyContactEmail: string | null
}

export type ApiPaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface ApiPayment {
  id: string
  organizationId: string
  planId: string | null
  amountCents: number
  currency: string
  status: ApiPaymentStatus
  provider: "paypal"
  providerTransactionId: string | null
  createdAt: string
  settledAt: string | null
  organization: { id: string; name: string; slug: string }
  plan: { id: string; name: string } | null
}

export interface ApiSsoProvider {
  id: string
  providerId: string
  issuer: string
  domain: string
  organizationId: string | null
}

export interface ApiCalendarStatus {
  available: boolean
  connected: boolean
  provider: "google" | null
  accountEmail: string | null
  calendarId: string | null
  webhookActive: boolean
  connectedAt?: string
}

export interface ApiPlatformOrgUsage extends ApiOrgUsage {
  organization: { id: string; name: string; slug: string }
}

export interface ApiPlatformEmployer {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: string
  memberCount: number
  activeJobCount: number
  applicationCount: number
}

export interface ApiPlatformEmployerMember {
  id: string
  userId: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  createdAt: string
}

export interface ApiPlatformEmployerDetail extends ApiPlatformEmployer {
  metadata: string | null
  members: ApiPlatformEmployerMember[]
  jobs: { id: string; title: string; status: ApiJobStatus; createdAt: string }[]
}

export interface ApiPlatformMember {
  id: string
  userId: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  createdAt: string
  organizationId: string
  organizationName: string
  activeJobCount: number
}

export interface ApiPlatformMemberDetail extends ApiPlatformMember {
  jobs: { id: string; title: string; status: ApiJobStatus; createdAt: string }[]
  activity: { id: string; action: ApiActivityAction; resourceType: ApiActivityResourceType; resourceId: string; createdAt: string }[]
}

export type ApiActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "comment_added"
  | "member_invited"
  | "member_removed"
  | "member_role_changed"
  | "scored"
  | "scheduled"

export type ApiActivityResourceType = "job" | "candidate" | "application" | "interview" | "member"

export interface ApiActivityLogItem {
  id: string
  action: ApiActivityAction
  resourceType: ApiActivityResourceType
  resourceId: string
  metadata: Record<string, unknown> | null
  createdAt: string
  actorId: string
  actorName: string | null
  actorEmail: string | null
  actorImage: string | null
  resourceName: string | null
  resourceUrl: string | null
  jobId: string | null
  jobName: string | null
  isUpcoming?: boolean
}

export interface ApiActivityTimelineResponse {
  items: ApiActivityLogItem[]
  upcoming: ApiActivityLogItem[]
  hasMore: boolean
  oldestTimestamp: string | null
  newestTimestamp: string | null
}

// ─────────────────────────────────────────────
// Platform health — GET /api/platform/health
// ─────────────────────────────────────────────

/** `not_configured` is deliberately distinct from `down`: nothing is broken, nothing is set up. */
export type ApiServiceStatus = "healthy" | "degraded" | "down" | "not_configured"

export interface ApiServiceHealth {
  key: string
  name: string
  status: ApiServiceStatus
  detail: string
}

export type ApiHealthStatTone = "neutral" | "warning" | "negative"

export interface ApiHealthStat {
  key: string
  label: string
  value: number
  tone: ApiHealthStatTone
}

export interface ApiPlatformHealth {
  checkedAt: string
  services: ApiServiceHealth[]
  stats: ApiHealthStat[]
  runtime: {
    version: string | null
    nodeVersion: string
    platform: string
    uptimeSeconds: number
    memory: { usedBytes: number; totalBytes: number; percent: number }
  }
}

// ─────────────────────────────────────────────
// Release notes — GET /api/platform/updates
// ─────────────────────────────────────────────

export type ApiChangeKind = "feature" | "improvement" | "fix" | "removal" | "other"

export interface ApiChangelogSection {
  heading: string
  kind: ApiChangeKind
  items: string[]
}

export interface ApiChangelogEntry {
  title: string
  date: string | null
  version: string | null
  link: string | null
  sections: ApiChangelogSection[]
}

export interface ApiPlatformUpdates {
  entries: ApiChangelogEntry[]
  currentVersion: string | null
}

// ─────────────────────────────────────────────
// AI configuration — GET /api/ai-config
// ─────────────────────────────────────────────

export interface ApiAiConfig {
  id: string
  name: string
  provider: string
  model: string
  baseUrl: string | null
  maxTokens: number
  inputPricePer1m: number | null
  outputPricePer1m: number | null
  isDefaultChatbot: boolean
  isDefaultAnalysis: boolean
  hasApiKey: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiAiProvider {
  name: string
  tagline: string
  modelsUrl: string
  apiKeyUrl: string
  signupUrl?: string
  supportsBaseUrl: boolean
  defaultModel: string
  models: { id: string; label: string; description?: string }[]
}

/** Only the slice of GET /api/ai-analysis/stats that the AI management screen reads. */
export interface ApiAiAnalysisStats {
  summary: {
    totalRuns: number
    completedRuns: number
    failedRuns: number
    totalTokens: number
  }
  modelBreakdown: {
    provider: string
    model: string
    runCount: number
    totalTokens: number
  }[]
}

// ─────────────────────────────────────────────
// Matching rules — the 8 BRD §3.3 criteria
// ─────────────────────────────────────────────

export const MATCH_CRITERIA_LABELS = [
  "Skills Match",
  "Experience Match",
  "Career Goals",
  "Location Preference",
  "Salary Fit",
  "Availability",
  "Culture & Role Fit",
  "Potential & Growth",
] as const

export type ApiMatchCriterionLabel = (typeof MATCH_CRITERIA_LABELS)[number]

export type ApiMatchWeights = Partial<Record<ApiMatchCriterionLabel, number>>

// ─────────────────────────────────────────────
// Authorization model — GET /api/platform/permissions
// ─────────────────────────────────────────────

export interface ApiPermissionResource {
  key: string
  label: string
  allActions: string[]
  /** role name → the actions that role is granted on this resource */
  grants: Record<string, string[]>
}

export interface ApiPlatformPermissions {
  orgRoles: { name: string; label: string; description: string }[]
  resources: ApiPermissionResource[]
  platformAdmin: {
    label: string
    description: string
    grantedBy: string
    selfService: boolean
  }
  notes: string[]
}

export type WorkMode = "Remote" | "Hybrid" | "On-site"
export type EmploymentType = "Full Time" | "Contract" | "Part Time"

export interface Job {
  id: string
  reqId: string
  title: string
  company: string
  companyInitials: string
  companyColor: string
  location: string
  workMode: WorkMode
  employmentType: EmploymentType
  experience: string
  salaryMin: number
  salaryMax: number
  skills: string[]
  postedAt: string
  about: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  companyBlurb: string
  status: "Published" | "Draft" | "Closed" | "Processing" | "AI Failed"
  jdComplete: number
  aiStatus: "Analysed" | "Queued" | "Enhancement offered" | "Processing"
  applications: number
  matches: number
}

export interface ReadinessCriterion {
  label: string
  value: number
}

export type ApplicationStage = "Applied" | "Viewed" | "Employer Review" | "Shortlisted" | "Interview"

export interface Application {
  id: string
  jobId: string
  title: string
  company: string
  companyInitials: string
  companyColor: string
  appliedAt: string
  status: "Applied" | "Under Review" | "Shortlisted" | "Interview"
  stage: ApplicationStage
}

export interface NotificationItem {
  id: string
  category: "Matches" | "Applications" | "Interviews" | "Profile" | "System"
  title: string
  description: string
  timeAgo: string
  action: string
  unread: boolean
}

export interface ConsentEvent {
  id: string
  timestamp: string
  event: string
  employer: string
  tone: "positive" | "negative" | "neutral"
}

export interface CandidateProfile {
  name: string
  initials: string
  title: string
  location: string
  email: string
  phone: string
  completeness: number
  summary: string
  experience: { role: string; company: string; period: string }[]
  education: { school: string; period: string }[]
  skills: string[]
  certifications: { name: string; year: string }[]
  languages: { name: string; level: string }[]
}

export interface AdminCandidate {
  id: string
  name: string
  initials: string
  email: string
  location: string
  profilePercent: number
  cvStatus: "Analysed" | "Processing" | "Failed"
  applications: number
  matches: number
  status: "Active" | "Needs attention" | "Suspended"
  created: string
}

export interface AdminEmployer {
  id: string
  company: string
  domain: string
  recruiters: number
  activeJobs: number
  applications: number
  plan: "Enterprise" | "Premium" | "Free"
  usage: number
  status: "Active" | "Trial" | "Past due" | "Quota reached" | "Suspended"
  created: string
}

export interface SystemService {
  name: string
  status: "Healthy" | "Degraded" | "Down"
  detail: string
}

export interface AdminRecruiter {
  id: string
  name: string
  initials: string
  email: string
  employer: string
  activeJobs: number
  status: "Active" | "Invited" | "Suspended"
  created: string
}

export interface AdminHiringManager {
  id: string
  name: string
  initials: string
  email: string
  employer: string
  department: string
  status: "Active" | "Invited" | "Suspended"
  created: string
}

export interface AdminApplication {
  id: string
  candidate: string
  job: string
  employer: string
  status: "Applied" | "Under Review" | "Shortlisted" | "Interview" | "Rejected"
  applied: string
}

export interface Plan {
  id: string
  name: string
  price: string
  billingPeriod: string
  employers: number
  features: string[]
}

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

export interface TimelineEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  resource: string
  category: "Consent" | "Visibility" | "Admin action" | "Auth" | "Billing"
}

export interface UpdateItem {
  id: string
  date: string
  title: string
  description: string
  tag: "Feature" | "Improvement" | "Fix"
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
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

export interface ApiOrgSettings {
  nameDisplayFormat: ApiNameDisplayFormat
  dateFormat: ApiDateFormat
  retentionEnabled: boolean
  retentionMonths: number
  quarantineDays: number
  retentionActivatedAt: string | null
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

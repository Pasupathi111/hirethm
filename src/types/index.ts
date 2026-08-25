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

export interface Match {
  id: string
  jobId: string
  title: string
  company: string
  companyInitials: string
  companyColor: string
  status: "New" | "Waiting for Decision" | "Accepted" | "Rejected" | "In Progress"
  matchedAt: string
  readiness: number
  criteria: ReadinessCriterion[]
  reasons: string[]
  gap?: string
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

export interface Interview {
  id: string
  jobId: string
  title: string
  company: string
  type: string
  date: string
  time: string
  location: string
  status: "Upcoming" | "Completed" | "Cancelled"
  slotConfirmed: boolean
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

export interface AuditLogEntry {
  id: string
  timestamp: string
  actor: string
  role: "Candidate" | "AI Engine" | "Recruiter" | "Admin" | "Employer"
  action: string
  resource: string
  resourceId: string
  previousState: string
  newState: string
  category: "Consent" | "Visibility" | "Admin action" | "Auth" | "Billing"
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

export interface AdminMatch {
  id: string
  candidate: string
  job: string
  employer: string
  readiness: number
  status: "New" | "Waiting for Decision" | "Accepted" | "Rejected"
  created: string
}

export interface AdminInterview {
  id: string
  candidate: string
  job: string
  employer: string
  type: string
  date: string
  status: "Upcoming" | "Completed" | "Cancelled"
}

export interface Plan {
  id: string
  name: string
  price: string
  billingPeriod: string
  employers: number
  features: string[]
}

export interface Payment {
  id: string
  employer: string
  amount: string
  plan: string
  status: "Paid" | "Failed" | "Refunded" | "Pending"
  date: string
}

export interface InterviewTemplate {
  id: string
  name: string
  type: string
  questionCount: number
  duration: string
  status: "Active" | "Draft" | "Archived"
  updated: string
  questions: string[]
}

export interface SourceTrackingEntry {
  id: string
  source: string
  campaign: string
  candidates: number
  applications: number
  hires: number
  conversionRate: number
  updated: string
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
  createdAt: string
  updatedAt: string
  pipeline: ApiJobPipeline
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

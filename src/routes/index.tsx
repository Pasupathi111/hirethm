import { createBrowserRouter } from "react-router-dom"

import { RequireAuth } from "@/components/auth/RequireAuth"
import { RequireCandidateAuth } from "@/components/auth/RequireCandidateAuth"
import { RequirePlatformAdmin } from "@/components/auth/RequirePlatformAdmin"
import { AcceptInvitation } from "@/pages/auth/AcceptInvitation"
import { AdminSignIn } from "@/pages/auth/AdminSignIn"
import { CandidateSignIn } from "@/pages/auth/candidate/SignIn"
import { CandidateSignUp } from "@/pages/auth/candidate/SignUp"
import { CreateProfile } from "@/pages/auth/CreateProfile"
import { EmployerSignIn } from "@/pages/auth/employer/SignIn"
import { EmployerSignUp } from "@/pages/auth/employer/SignUp"
import { ForgotPassword } from "@/pages/auth/ForgotPassword"
import { ResetPassword } from "@/pages/auth/ResetPassword"
import { SignIn } from "@/pages/auth/SignIn"
import { SignUp } from "@/pages/auth/SignUp"
import { InterviewRespond } from "@/pages/interview/Respond"
import { CreateOrg } from "@/pages/onboarding/CreateOrg"
import { JoinOrg } from "@/pages/onboarding/JoinOrg"
import { Applications } from "@/pages/candidate/Applications"
import { CareerPreferences } from "@/pages/candidate/CareerPreferences"
import { Dashboard } from "@/pages/candidate/Dashboard"
import { Interviews } from "@/pages/candidate/Interviews"
import { MyMatches } from "@/pages/candidate/MyMatches"
import { Notifications } from "@/pages/candidate/Notifications"
import { Profile } from "@/pages/candidate/Profile"
import { Recommended } from "@/pages/candidate/Recommended"
import { Resume } from "@/pages/candidate/Resume"
import { Settings } from "@/pages/candidate/Settings"
import { FindJobs } from "@/pages/marketing/FindJobs"
import { Home } from "@/pages/marketing/Home"
import { JobApply } from "@/pages/marketing/JobApply"
import { JobApplyConfirmation } from "@/pages/marketing/JobApplyConfirmation"
import { JobDetail } from "@/pages/marketing/JobDetail"
import { AdminAIChat } from "@/pages/admin/AIChat"
import { AdminAIManagement } from "@/pages/admin/AIManagement"
import { AdminApplications } from "@/pages/admin/Applications"
import { AdminAuditLogs } from "@/pages/admin/AuditLogs"
import { AdminCandidateDetail } from "@/pages/admin/CandidateDetail"
import { AdminCandidateEdit } from "@/pages/admin/CandidateEdit"
import { AdminCandidateNew } from "@/pages/admin/CandidateNew"
import { AdminCandidates } from "@/pages/admin/Candidates"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { AdminEmployerDetail } from "@/pages/admin/EmployerDetail"
import { AdminEmployers } from "@/pages/admin/Employers"
import { AdminHiringManagerDetail } from "@/pages/admin/HiringManagerDetail"
import { AdminHiringManagers } from "@/pages/admin/HiringManagers"
import { AdminInterviewDetail } from "@/pages/admin/InterviewDetail"
import { AdminInterviewTemplateDetail } from "@/pages/admin/InterviewTemplateDetail"
import { AdminInterviewTemplates } from "@/pages/admin/InterviewTemplates"
import { AdminInterviews } from "@/pages/admin/Interviews"
import { AdminJobApplicationForm } from "@/pages/admin/JobApplicationForm"
import { AdminJobDetail } from "@/pages/admin/JobDetail"
import { AdminJobEdit } from "@/pages/admin/JobEdit"
import { AdminJobNew } from "@/pages/admin/JobNew"
import { AdminJobPreview } from "@/pages/admin/JobPreview"
import { AdminJobs } from "@/pages/admin/Jobs"
import { AdminMatchDetail } from "@/pages/admin/MatchDetail"
import { AdminMatches } from "@/pages/admin/Matches"
import { AdminMatchingRules } from "@/pages/admin/MatchingRules"
import { AdminPaymentDetail } from "@/pages/admin/PaymentDetail"
import { AdminPayments } from "@/pages/admin/Payments"
import { AdminPlans } from "@/pages/admin/Plans"
import { AdminPlatformSettings } from "@/pages/admin/PlatformSettings"
import { AdminRecruiterDetail } from "@/pages/admin/RecruiterDetail"
import { AdminRecruiters } from "@/pages/admin/Recruiters"
import { AdminRolesPermissions } from "@/pages/admin/RolesPermissions"
import { AdminSourceTracking } from "@/pages/admin/SourceTracking"
import { AdminSourceTrackingDetail } from "@/pages/admin/SourceTrackingDetail"
import { AdminSystemHealth } from "@/pages/admin/SystemHealth"
import { AdminTimeline } from "@/pages/admin/Timeline"
import { AdminUpdates } from "@/pages/admin/Updates"
import { AdminUsage } from "@/pages/admin/Usage"
import { AdminLayout } from "@/layouts/AdminLayout"
import { CandidateLayout } from "@/layouts/CandidateLayout"
import { MarketingLayout } from "@/layouts/MarketingLayout"

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/jobs", element: <FindJobs /> },
      { path: "/jobs/:id", element: <JobDetail /> },
      { path: "/jobs/:id/apply", element: <JobApply /> },
      { path: "/jobs/:id/confirmation", element: <JobApplyConfirmation /> },
    ],
  },
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/candidate/sign-in", element: <CandidateSignIn /> },
  { path: "/candidate/sign-up", element: <CandidateSignUp /> },
  { path: "/employer/sign-in", element: <EmployerSignIn /> },
  { path: "/employer/sign-up", element: <EmployerSignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/accept-invitation/:id", element: <AcceptInvitation /> },
  { path: "/join/:token", element: <JoinOrg /> },
  { path: "/onboarding/create-org", element: <CreateOrg /> },
  { path: "/interview/respond", element: <InterviewRespond /> },
  { path: "/admin/login", element: <AdminSignIn /> },
  { path: "/create-profile", element: <CreateProfile /> },
  {
    path: "/app",
    element: <RequireCandidateAuth />,
    children: [
      {
        element: <CandidateLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "jobs", element: <FindJobs basePath="/app/jobs" /> },
          { path: "jobs/:id", element: <JobDetail basePath="/app/jobs" candidateMode /> },
          { path: "jobs/:id/apply", element: <JobApply basePath="/app/jobs" /> },
          { path: "jobs/:id/confirmation", element: <JobApplyConfirmation basePath="/app/jobs" /> },
          { path: "recommended", element: <Recommended /> },
          { path: "matches", element: <MyMatches /> },
          { path: "applications", element: <Applications /> },
          { path: "interviews", element: <Interviews /> },
          { path: "profile", element: <Profile /> },
          { path: "resume", element: <Resume /> },
          { path: "preferences", element: <CareerPreferences /> },
          { path: "notifications", element: <Notifications /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
      { path: "candidates", element: <AdminCandidates /> },
      { path: "candidates/new", element: <AdminCandidateNew /> },
      { path: "candidates/:id", element: <AdminCandidateDetail /> },
      { path: "candidates/:id/edit", element: <AdminCandidateEdit /> },
      { path: "jobs", element: <AdminJobs /> },
      { path: "jobs/new", element: <AdminJobNew /> },
      { path: "jobs/:id", element: <AdminJobDetail /> },
      { path: "jobs/:id/edit", element: <AdminJobEdit /> },
      { path: "jobs/:id/preview", element: <AdminJobPreview /> },
      { path: "jobs/:id/application-form", element: <AdminJobApplicationForm /> },
      { path: "applications", element: <AdminApplications /> },
      { path: "matches", element: <AdminMatches /> },
      { path: "matches/:id", element: <AdminMatchDetail /> },
      { path: "interviews", element: <AdminInterviews /> },
      { path: "interviews/:id", element: <AdminInterviewDetail /> },
      { path: "interview-templates", element: <AdminInterviewTemplates /> },
      { path: "interview-templates/:id", element: <AdminInterviewTemplateDetail /> },
      { path: "source-tracking", element: <AdminSourceTracking /> },
      { path: "source-tracking/:id", element: <AdminSourceTrackingDetail /> },
      { path: "ai-chat", element: <AdminAIChat /> },
      { path: "ai-management", element: <AdminAIManagement /> },
      { path: "matching-rules", element: <AdminMatchingRules /> },
      { path: "timeline", element: <AdminTimeline /> },
      { path: "updates", element: <AdminUpdates /> },
      { path: "audit-logs", element: <AdminAuditLogs /> },
      { path: "roles-permissions", element: <AdminRolesPermissions /> },
      { path: "platform-settings", element: <AdminPlatformSettings /> },

          // ── Cross-tenant platform-admin console (issue #43) ──────────────
          // These surface data across ALL organizations, so they require the
          // HireThm-internal isPlatformAdmin flag — not just org membership.
          // The backend already enforces this via requirePlatformAdmin(); this
          // guard makes the client agree instead of showing a recruiter pages
          // that will only ever 403.
          {
            element: <RequirePlatformAdmin />,
            children: [
              { path: "employers", element: <AdminEmployers /> },
              { path: "employers/:id", element: <AdminEmployerDetail /> },
              { path: "recruiters", element: <AdminRecruiters /> },
              { path: "recruiters/:id", element: <AdminRecruiterDetail /> },
              { path: "hiring-managers", element: <AdminHiringManagers /> },
              { path: "hiring-managers/:id", element: <AdminHiringManagerDetail /> },
              { path: "plans", element: <AdminPlans /> },
              { path: "payments", element: <AdminPayments /> },
              { path: "payments/:id", element: <AdminPaymentDetail /> },
              { path: "usage", element: <AdminUsage /> },
              { path: "system-health", element: <AdminSystemHealth /> },
            ],
          },
        ],
      },
    ],
  },
])

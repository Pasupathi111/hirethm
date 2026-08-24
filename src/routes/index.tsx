import { createBrowserRouter } from "react-router-dom"

import { AdminSignIn } from "@/pages/auth/AdminSignIn"
import { CreateProfile } from "@/pages/auth/CreateProfile"
import { SignIn } from "@/pages/auth/SignIn"
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
import { JobDetail } from "@/pages/marketing/JobDetail"
import { AdminAIManagement } from "@/pages/admin/AIManagement"
import { AdminApplications } from "@/pages/admin/Applications"
import { AdminAuditLogs } from "@/pages/admin/AuditLogs"
import { AdminCandidateDetail } from "@/pages/admin/CandidateDetail"
import { AdminCandidates } from "@/pages/admin/Candidates"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { AdminEmployerDetail } from "@/pages/admin/EmployerDetail"
import { AdminEmployers } from "@/pages/admin/Employers"
import { AdminHiringManagerDetail } from "@/pages/admin/HiringManagerDetail"
import { AdminHiringManagers } from "@/pages/admin/HiringManagers"
import { AdminInterviewDetail } from "@/pages/admin/InterviewDetail"
import { AdminInterviews } from "@/pages/admin/Interviews"
import { AdminJobDetail } from "@/pages/admin/JobDetail"
import { AdminJobs } from "@/pages/admin/Jobs"
import { AdminMatchDetail } from "@/pages/admin/MatchDetail"
import { AdminMatches } from "@/pages/admin/Matches"
import { AdminMatchingRules } from "@/pages/admin/MatchingRules"
import { AdminNotifications } from "@/pages/admin/Notifications"
import { AdminPaymentDetail } from "@/pages/admin/PaymentDetail"
import { AdminPayments } from "@/pages/admin/Payments"
import { AdminPlans } from "@/pages/admin/Plans"
import { AdminPlatformSettings } from "@/pages/admin/PlatformSettings"
import { AdminRecruiterDetail } from "@/pages/admin/RecruiterDetail"
import { AdminRecruiters } from "@/pages/admin/Recruiters"
import { AdminReports } from "@/pages/admin/Reports"
import { AdminRolesPermissions } from "@/pages/admin/RolesPermissions"
import { AdminSystemHealth } from "@/pages/admin/SystemHealth"
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
    ],
  },
  { path: "/sign-in", element: <SignIn /> },
  { path: "/admin/login", element: <AdminSignIn /> },
  { path: "/create-profile", element: <CreateProfile /> },
  {
    path: "/app",
    element: <CandidateLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "jobs", element: <FindJobs basePath="/app/jobs" /> },
      { path: "jobs/:id", element: <JobDetail basePath="/app/jobs" candidateMode /> },
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
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "candidates", element: <AdminCandidates /> },
      { path: "candidates/:id", element: <AdminCandidateDetail /> },
      { path: "employers", element: <AdminEmployers /> },
      { path: "employers/:id", element: <AdminEmployerDetail /> },
      { path: "recruiters", element: <AdminRecruiters /> },
      { path: "recruiters/:id", element: <AdminRecruiterDetail /> },
      { path: "hiring-managers", element: <AdminHiringManagers /> },
      { path: "hiring-managers/:id", element: <AdminHiringManagerDetail /> },
      { path: "jobs", element: <AdminJobs /> },
      { path: "jobs/:id", element: <AdminJobDetail /> },
      { path: "applications", element: <AdminApplications /> },
      { path: "matches", element: <AdminMatches /> },
      { path: "matches/:id", element: <AdminMatchDetail /> },
      { path: "interviews", element: <AdminInterviews /> },
      { path: "interviews/:id", element: <AdminInterviewDetail /> },
      { path: "plans", element: <AdminPlans /> },
      { path: "payments", element: <AdminPayments /> },
      { path: "payments/:id", element: <AdminPaymentDetail /> },
      { path: "usage", element: <AdminUsage /> },
      { path: "ai-management", element: <AdminAIManagement /> },
      { path: "matching-rules", element: <AdminMatchingRules /> },
      { path: "notifications", element: <AdminNotifications /> },
      { path: "reports", element: <AdminReports /> },
      { path: "audit-logs", element: <AdminAuditLogs /> },
      { path: "roles-permissions", element: <AdminRolesPermissions /> },
      { path: "platform-settings", element: <AdminPlatformSettings /> },
      { path: "system-health", element: <AdminSystemHealth /> },
    ],
  },
])

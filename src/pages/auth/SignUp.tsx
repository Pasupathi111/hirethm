import { Navigate } from "react-router-dom"

/** Legacy unbranded URL — redirect to the candidate-specific sign-up page. */
export function SignUp() {
  return <Navigate to="/candidate/sign-up" replace />
}

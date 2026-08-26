import { Navigate } from "react-router-dom"

/** Legacy unbranded URL — redirect to the candidate-specific sign-in page. */
export function SignIn() {
  return <Navigate to="/candidate/sign-in" replace />
}

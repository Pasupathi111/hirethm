import { motion } from "framer-motion"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { adminInterviews } from "@/data/mockData"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

const questions = [
  "Walk us through your most relevant recent project.",
  "What draws you to this role specifically?",
  "Describe a challenge you overcame in a previous position.",
]

export function InterviewRespond() {
  const { id } = useParams()
  const interview = adminInterviews.find((i) => i.id === id)
  const reduced = useReducedMotion()
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""))
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <motion.div
        className="w-full max-w-2xl"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        {submitted ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="text-2xl">Response submitted</h1>
            <p className="mt-2 text-muted-foreground">
              Thanks — {interview?.job ?? "the hiring team"} will follow up once your responses have been reviewed.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <Badge variant="info">{interview?.type ?? "Async Interview"}</Badge>
            <h1 className="mt-3 text-3xl">Respond to your interview</h1>
            <p className="mt-1 text-muted-foreground">
              {interview ? `${interview.job} at ${interview.employer}` : "Answer each question below at your own pace."}
            </p>

            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                toast.success("Responses submitted")
                setSubmitted(true)
              }}
            >
              {questions.map((q, i) => (
                <div key={q} className="space-y-2">
                  <label className="text-sm font-semibold">
                    {i + 1}. {q}
                  </label>
                  <Textarea
                    value={answers[i]}
                    onChange={(e) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))}
                    rows={4}
                    placeholder="Type your response..."
                    required
                  />
                </div>
              ))}
              <Button type="submit" size="lg" className="w-full">
                Submit responses
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}

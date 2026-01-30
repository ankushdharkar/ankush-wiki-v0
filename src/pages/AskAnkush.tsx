import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trackEvent } from '../services/analytics'
import { questionsApi } from '../services/api'
import type { Question } from '../services/api'

// Generate a persistent visitor ID
function getVisitorId(): string {
  const key = 'askAnkush_visitorId'
  let id = localStorage.getItem(key)
  if (!id) {
    id = 'visitor-' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem(key, id)
  }
  return id
}

// Get/set persistent username
function getStoredUsername(): string {
  return localStorage.getItem('askAnkush_username') || 'Ankush'
}

function setStoredUsername(name: string): void {
  localStorage.setItem('askAnkush_username', name)
}

const VISITOR_ID = getVisitorId()

export default function AskAnkush() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'upvotes' | 'recent'>('upvotes')
  const [showSuccess, setShowSuccess] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [username, setUsername] = useState(getStoredUsername)

  const handleUsernameChange = (name: string) => {
    setUsername(name)
    setStoredUsername(name)
  }

  useEffect(() => {
    document.title = 'Ask Ankush'
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await questionsApi.getAll()
      setQuestions(data)
    } catch {
      setError('Failed to load questions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newQuestion.trim().length < 10) return

    setIsSubmitting(true)
    setError(null)

    try {
      const question = await questionsApi.create({
        content: newQuestion.trim(),
        isAnonymous,
        authorName: username || 'Visitor',
      })

      setQuestions((prev) => [question, ...prev])
      setNewQuestion('')
      setIsAnonymous(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      trackEvent('question_submitted', {
        isAnonymous,
        questionLength: question.content.length,
      })
    } catch {
      setError('Failed to submit question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async (questionId: number) => {
    const question = questions.find((q) => q.id === questionId)
    const hasUpvoted = question?.upvotedBy.includes(VISITOR_ID)

    trackEvent('question_upvote', {
      questionId,
      action: hasUpvoted ? 'remove' : 'add',
    })

    try {
      const updated = await questionsApi.upvote(questionId, VISITOR_ID)
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? updated : q))
      )
    } catch {
      setError('Failed to upvote')
    }
  }

  const sortedQuestions = [...questions]
    .filter((q) => q.status === 'approved')
    .sort((a, b) => {
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ask Ankush</h1>
              <p className="text-gray-400 text-sm mt-1">
                Got a question? Ask away and upvote what you want answered first.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Your name:</span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gray-500"
                placeholder="Your name"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Question Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50"
        >
          <form onSubmit={handleSubmit}>
            <label htmlFor="question" className="block text-lg font-medium mb-3">
              What would you like to know?
            </label>
            <textarea
              id="question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask about tech, career advice, Real Dev Squad, or anything else..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus-ring-inset resize-none transition-colors"
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-green-500 focus:ring-green-400 focus:ring-offset-gray-900"
                />
                <span className="text-sm text-gray-400">Ask anonymously</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {newQuestion.length}/500
                </span>
                <button
                  type="submit"
                  disabled={newQuestion.trim().length < 10 || isSubmitting}
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors focus-ring"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Question'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Success message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-sm"
              >
                Question submitted successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Questions List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              Questions{' '}
              <span className="text-gray-500 font-normal">
                ({sortedQuestions.length})
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('upvotes')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  sortBy === 'upvotes'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Top
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Recent
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-gray-400"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="mt-4 text-gray-400">Loading questions...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && sortedQuestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-4"
            >
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-medium mb-2">No questions yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Be the first to ask! Whether it's about tech, career, or anything
                else - Ankush is here to help.
              </p>
            </motion.div>
          )}

          {/* Question Cards */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedQuestions.map((question, index) => {
                const hasUpvoted = question.upvotedBy.includes(VISITOR_ID)
                const isExpanded = expandedQuestion === question.id

                return (
                  <motion.article
                    key={question.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Question Header */}
                      <div className="flex items-start gap-4">
                        {/* Upvote Button */}
                        <button
                          onClick={() => handleUpvote(question.id)}
                          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                            hasUpvoted
                              ? 'bg-green-900/30 text-green-400'
                              : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill={hasUpvoted ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            {question.upvotes}
                          </span>
                        </button>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white leading-relaxed">
                            {question.content}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              {question.isAnonymous ? (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  Anonymous
                                </>
                              ) : (
                                question.authorName
                              )}
                            </span>
                            <span>·</span>
                            <span>{formatTime(question.createdAt)}</span>
                            {question.ankushAnswer && (
                              <>
                                <span>·</span>
                                <span className="text-green-400 font-medium">
                                  Answered by Ankush
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expand/Collapse */}
                        <button
                          onClick={() =>
                            setExpandedQuestion(isExpanded ? null : question.id)
                          }
                          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Answers Section (Expanded) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-700/50 bg-gray-900/30"
                        >
                          <div className="p-5 space-y-4">
                            {/* AI Answer */}
                            {question.aiAnswer && (
                              <div className="pl-4 border-l-2 border-blue-500/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">
                                    AI Response
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Based on Ankush's public content
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                  {question.aiAnswer}
                                </p>
                              </div>
                            )}

                            {/* Ankush's Answer */}
                            {question.ankushAnswer ? (
                              <div className="pl-4 border-l-2 border-green-500">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-medium px-2 py-0.5 bg-green-900/30 text-green-400 rounded">
                                    Ankush's Answer
                                  </span>
                                </div>
                                <p className="text-gray-200 leading-relaxed">
                                  {question.ankushAnswer}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Waiting for Ankush's response...
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>
            Questions are reviewed before appearing publicly.
            <br />
            Ankush answers when available.
          </p>
        </footer>
      </main>
    </div>
  )
}

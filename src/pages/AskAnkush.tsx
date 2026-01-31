import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trackEvent } from '../services/analytics'
import { questionsApi } from '../services/api'
import type { Question, Topic } from '../services/api'
import { TopicBadge } from '../components/ui/TopicBadge'
import { ThemeToggle } from '../components/ThemeToggle'

// Feature flag for AI features (disabled by default for security)
const AI_FEATURES_ENABLED = import.meta.env.VITE_PUBLIC_FEATURE_AI_ENABLED === 'true'

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
  const [sortBy, setSortBy] = useState<'upvotes' | 'recent' | 'trending'>('upvotes')
  const [showSuccess, setShowSuccess] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [username, setUsername] = useState(getStoredUsername)
  const [topics, setTopics] = useState<Topic[]>([])
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  const handleUsernameChange = (name: string) => {
    setUsername(name)
    setStoredUsername(name)
  }

  useEffect(() => {
    document.title = 'Ask Ankush'
    loadTopics()
    loadQuestions()
  }, [])

  // Reload questions when filter changes
  useEffect(() => {
    loadQuestions()
  }, [activeTopic, sortBy])

  const loadTopics = async () => {
    try {
      const data = await questionsApi.getTopics()
      setTopics(data)
    } catch {
      // Topics are optional, don't show error
    }
  }

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await questionsApi.getAll({
        topic: activeTopic ?? undefined,
        sort: sortBy,
      })
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

  // Questions are already filtered and sorted by the API
  const sortedQuestions = questions

  const totalQuestions = topics.reduce((sum, t) => sum + t.count, 0)

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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ask Ankush</h1>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1.5">
                Got a question? Ask away and upvote what you want answered first.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/60 rounded-lg px-3.5 py-2 border border-gray-200 dark:border-gray-700/50">
                <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">Posting as</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-28 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="Your name"
                />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Question Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-gray-800/40 rounded-2xl p-8 mb-10 border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
        >
          {/* Accent border */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />

          <form onSubmit={handleSubmit}>
            <label htmlFor="question" className="block text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              What would you like to know?
            </label>
            <textarea
              id="question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask about tech, career advice, Real Dev Squad, or anything else..."
              className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700/70 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 resize-none transition-all"
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="peer w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 checked:bg-green-500 checked:border-green-500 cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-green-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                  />
                  <svg
                    className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Ask anonymously
                </span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 dark:text-gray-600 font-mono tabular-nums">
                  {newQuestion.length}/500
                </span>
                <button
                  type="submit"
                  disabled={newQuestion.trim().length < 10 || isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 disabled:shadow-none"
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
                className="mt-5 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-3"
              >
                <svg
                  className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Question submitted successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Questions List */}
        <section>
          {/* Topic Filters */}
          {topics.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Filter by topic
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <TopicBadge
                  name="All"
                  color={activeTopic === null ? 'blue' : 'gray'}
                  count={totalQuestions}
                  isActive={activeTopic === null}
                  onClick={() => setActiveTopic(null)}
                />
                {topics.map((topic) => (
                  <TopicBadge
                    key={topic.slug}
                    name={topic.name}
                    color={topic.color}
                    count={topic.count}
                    isActive={activeTopic === topic.slug}
                    onClick={() => setActiveTopic(topic.slug)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Questions{' '}
              <span className="text-gray-400 dark:text-gray-600 font-normal text-base">
                ({sortedQuestions.length})
              </span>
            </h2>
            <div className="flex bg-gray-100 dark:bg-gray-800/40 rounded-lg p-1 gap-1 border border-gray-200 dark:border-gray-700/50">
              <button
                onClick={() => setSortBy('upvotes')}
                aria-pressed={sortBy === 'upvotes'}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                  sortBy === 'upvotes'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm dark:shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                Top
              </button>
              <button
                onClick={() => setSortBy('recent')}
                aria-pressed={sortBy === 'recent'}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                  sortBy === 'recent'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm dark:shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy('trending')}
                aria-pressed={sortBy === 'trending'}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                  sortBy === 'trending'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm dark:shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                Trending
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
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading questions...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && sortedQuestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 px-6 bg-gray-100 dark:bg-gray-800/20 rounded-2xl border border-gray-200 dark:border-gray-700/30"
            >
              {activeTopic ? (
                <>
                  <div className="text-7xl mb-6">🏷️</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    No questions in this topic yet
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-8 text-[15px] leading-relaxed">
                    Be the first to ask a question about{' '}
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {topics.find((t) => t.slug === activeTopic)?.name || activeTopic}
                    </span>
                    !
                  </p>
                  <button
                    onClick={() => setActiveTopic(null)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                  >
                    View all questions →
                  </button>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-8">💭</div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">No questions yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-8 text-[15px] leading-relaxed">
                    Be the first to ask! Whether it's about tech, career, or anything
                    else — Ankush is here to help.
                  </p>
                  <button
                    onClick={() => document.getElementById('question')?.focus()}
                    className="px-7 py-3 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 shadow-lg shadow-blue-600/20"
                  >
                    Ask the first question
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Question Cards */}
          <div className="space-y-5">
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
                    className="bg-white dark:bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/40 shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:border-gray-300 dark:hover:border-gray-700/60 transition-all"
                  >
                    <div className="p-6">
                      {/* Question Header */}
                      <div className="flex items-start gap-5">
                        {/* Upvote Button */}
                        <motion.button
                          onClick={() => handleUpvote(question.id)}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`${hasUpvoted ? 'Remove upvote from' : 'Upvote'} question by ${question.isAnonymous ? 'anonymous user' : question.authorName}`}
                          aria-pressed={hasUpvoted}
                          className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                            hasUpvoted
                              ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/10'
                              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-600 dark:hover:text-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400'
                          }`}
                        >
                          <svg
                            className="w-6 h-6"
                            fill={hasUpvoted ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <span className="text-sm font-bold tabular-nums">
                            {question.upvotes}
                          </span>
                        </motion.button>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white leading-relaxed text-[15px]">
                            {question.content}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                            {question.topicName && question.topicColor && (
                              <TopicBadge
                                name={question.topicName}
                                color={question.topicColor}
                                size="sm"
                              />
                            )}
                            <span className="flex items-center gap-1.5 text-gray-500">
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
                                  <span>Anonymous</span>
                                </>
                              ) : (
                                <span className="font-medium">{question.authorName}</span>
                              )}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span className="text-gray-500">{formatTime(question.createdAt)}</span>
                            {question.ankushAnswer && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">·</span>
                                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Answered
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
                          aria-label={isExpanded ? 'Hide answers' : 'Show answers'}
                          aria-expanded={isExpanded}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
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
                          className="border-t border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900/40"
                        >
                          <div className="p-6 space-y-5">
                            {/* AI Answer - only shown when AI features are enabled */}
                            {AI_FEATURES_ENABLED && question.aiAnswer && (
                              <div className="pl-5 border-l-4 border-blue-500/50">
                                <div className="flex items-center gap-2.5 mb-3">
                                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md uppercase tracking-wide">
                                    AI Response
                                  </span>
                                  <span className="text-xs text-gray-400 dark:text-gray-600">
                                    Based on Ankush's public content
                                  </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                  {question.aiAnswer}
                                </p>
                              </div>
                            )}

                            {/* Ankush's Answer */}
                            {question.ankushAnswer ? (
                              <div className="pl-5 border-l-4 border-green-500">
                                <div className="flex items-center gap-2.5 mb-3">
                                  <span className="text-xs font-bold px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md uppercase tracking-wide">
                                    Ankush's Answer
                                  </span>
                                </div>
                                <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                                  {question.ankushAnswer}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-600 italic bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4">
                                <svg
                                  className="w-5 h-5 flex-shrink-0"
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
                                <span>Waiting for Ankush's response...</span>
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
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-600 leading-relaxed">
            Questions are reviewed before appearing publicly.
            <br />
            Ankush answers when available.
          </p>
        </footer>
      </main>
    </div>
  )
}

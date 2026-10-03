import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      {/* A single-page app answers unknown URLs with HTTP 200, so keep this page out of search results. React 19 hoists these tags into the head. */}
      <title>Page not found | Ankush Dharkar</title>
      <meta name="robots" content="noindex" />
      <section className="mx-auto flex max-w-md flex-col items-center px-6 pt-24 pb-16 text-center md:pt-32">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Page not found</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          There is nothing at this address. Check that it is typed correctly.
        </p>
        <Link
          to="/"
          className="focus-ring mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-900 px-5 text-base font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Go to the home page
        </Link>
      </section>
    </div>
  )
}

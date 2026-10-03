import type { ReactNode } from 'react'

// One home for the private round's look. Every surface in this feature composes these,
// so a change to a button, sheet or field lands everywhere at once.

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400'
const buttonBase = `inline-flex min-h-11 items-center justify-center rounded-md py-2 font-medium transition-[color,background-color] duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`
const outline = 'bg-white text-stone-800 ring-1 ring-inset ring-stone-300 enabled:hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-100 dark:ring-stone-700 dark:enabled:hover:bg-stone-800'

// Buttons. One solid action per view at most; everything else is outline or text.
export const primaryButton = `${buttonBase} bg-teal-800 px-5 text-base text-white enabled:hover:bg-teal-900 dark:bg-teal-700 dark:enabled:hover:bg-teal-800`
export const secondaryButton = `${buttonBase} ${outline} px-4 text-base`
export const compactButton = `${buttonBase} ${outline} px-3 text-sm tabular-nums`
export const quietButton = `${buttonBase} px-3 text-base text-stone-700 underline-offset-4 enabled:hover:text-stone-950 enabled:hover:underline dark:text-stone-300 dark:enabled:hover:text-white`
export const dangerButton = `${buttonBase} bg-red-50 px-4 text-base text-red-800 ring-1 ring-inset ring-red-200 enabled:hover:bg-red-100 dark:bg-red-950 dark:text-red-200 dark:ring-red-900 dark:enabled:hover:bg-red-900`
// Action rows stack full width on a phone and sit inline from the sm breakpoint up.
export const actions = 'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3'
export const iconButton = `inline-flex size-11 items-center justify-center rounded-md text-stone-600 transition-[color,background-color] duration-150 motion-reduce:transition-none hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 ${focusRing}`

// Text. Serif is reserved for page titles and for Ankush's own first-person words.
export const pageTitle = 'font-serif text-2xl leading-8 font-medium text-balance text-stone-900 sm:text-3xl sm:leading-10 dark:text-stone-50'
export const sectionTitle = 'text-lg leading-7 font-semibold text-stone-900 dark:text-stone-50'
export const voice = 'font-serif text-base leading-7 text-stone-700 sm:text-lg sm:leading-8 dark:text-stone-300'
export const label = 'text-sm leading-6 font-medium text-stone-600 dark:text-stone-400'
export const secondaryText = 'text-stone-600 dark:text-stone-400'
export const figure = 'font-semibold tracking-tight tabular-nums text-stone-900 dark:text-stone-50'
export const statusText = 'py-16 text-center text-base text-stone-600 dark:text-stone-400'

// Surfaces. A hairline sheet on a warm canvas, no shadows.
export const sheet = 'rounded-lg bg-white p-6 ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800'
export const flushSheet = 'overflow-hidden rounded-lg bg-white ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800'
export const hairline = 'border-stone-200 dark:border-stone-800'
export const statRow = `mt-6 flex flex-wrap gap-x-12 gap-y-4 border-t pt-6 ${hairline}`
export const inset = 'rounded-md bg-stone-50 p-4 ring-1 ring-inset ring-stone-200 dark:bg-stone-950 dark:ring-stone-800'

// Fields. A group holds one input plus its attached selects or unit, read as one control.
const controlFocus = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400'
export const fieldLabel = 'block text-sm leading-6 font-medium text-stone-800 dark:text-stone-200'
export const fieldGroup = 'flex min-w-0 items-stretch overflow-hidden rounded-md border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950'
export const fieldGroupInvalid = 'flex min-w-0 items-stretch overflow-hidden rounded-md border border-red-700 bg-white dark:border-red-400 dark:bg-stone-950'
export const fieldInput = `min-w-0 flex-1 bg-transparent px-4 text-stone-900 placeholder:text-stone-500 disabled:cursor-not-allowed dark:text-stone-50 dark:placeholder:text-stone-400 ${controlFocus}`
export const fieldSelect = `h-full appearance-none bg-white py-2 pr-9 pl-3.5 text-base font-medium text-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-950 dark:text-stone-100 dark:scheme-dark ${controlFocus}`
export const fieldError = 'flex items-start gap-2 text-sm leading-6 text-red-700 dark:text-red-300'
export const searchInput = `min-h-11 w-full rounded-md border border-stone-300 bg-white py-2 pr-3.5 pl-10 text-base text-stone-900 placeholder:text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50 dark:placeholder:text-stone-400 ${controlFocus}`

function Icon({ path, className }: { path: string; className: string }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}><path d={path} /></svg>
}
const paths = {
  check: 'M4.5 10.5l3.5 3.5 7.5-8',
  alert: 'M10 6.5v4m0 3h.01M3 16.5h14L10 3.5 3 16.5z',
  chevron: 'M6 8l4 4 4-4',
  search: 'M14 14l3.5 3.5M9 15.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z',
  sun: 'M10 2.5v1.5m0 12v1.5m7.5-7.5H16M4 10H2.5m12.8-5.3l-1.05 1.05M5.75 14.25L4.7 15.3m10.6 0l-1.05-1.05M5.75 5.75L4.7 4.7M13 10a3 3 0 11-6 0 3 3 0 016 0z',
  moon: 'M16.5 12.2A7 7 0 017.8 3.5a7 7 0 108.7 8.7z',
}
export function SelectChevron() {
  return <Icon path={paths.chevron} className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-stone-500 dark:text-stone-400" />
}
export function SearchIcon() {
  return <Icon path={paths.search} className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-stone-500 dark:text-stone-400" />
}
export function AlertIcon() {
  return <Icon path={paths.alert} className="mt-0.5 size-5 shrink-0" />
}
export function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  return <Icon path={theme === 'dark' ? paths.sun : paths.moon} className="size-5" />
}

// A label and its figure. Used for every round number that is not the headline total.
export function Stat({ label: name, value }: { label: string; value: string }) {
  return <div className="min-w-0">
    <dt className={label}>{name}</dt>
    <dd className={`${figure} mt-1 text-lg leading-7 break-words`}>{value}</dd>
  </div>
}

// Announced feedback. Success is one calm line; a warning is a tinted block that can hold actions.
// The icon carries the tone as well, so color is never the only signal.
export function Notice({ tone, role, className = '', children }: {
  tone: 'success' | 'warning'; role: 'status' | 'alert'; className?: string; children: ReactNode
}) {
  if (tone === 'success') {
    return <div role={role} className={`flex items-start gap-2.5 text-base leading-6 font-medium text-stone-900 dark:text-stone-50 ${className}`}>
      <Icon path={paths.check} className="mt-0.5 size-5 shrink-0 text-teal-700 dark:text-teal-400" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  }
  return <div role={role} className={`flex items-start gap-3 rounded-md border-l-2 border-amber-600 bg-amber-50 py-3 pr-4 pl-3.5 text-base leading-6 text-stone-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-stone-100 ${className}`}>
    <span className="text-amber-700 dark:text-amber-400"><AlertIcon /></span>
    <div className="min-w-0 flex-1 space-y-3">{children}</div>
  </div>
}

// A blocking message with the single way forward.
export function MessageSheet({ message, actionLabel, onAction }: { message: string; actionLabel: string; onAction: () => void }) {
  return <div role="alert" className={`mx-auto max-w-xl ${sheet}`}>
    <p className="text-base leading-7 text-stone-800 dark:text-stone-200">{message}</p>
    <button type="button" onClick={onAction} className={`${primaryButton} mt-6`}>{actionLabel}</button>
  </div>
}

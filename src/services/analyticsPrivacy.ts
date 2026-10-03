export function isPrivateAnalyticsPath(path: string): boolean {
  return /^\/invest(?:\/|$)/.test(path)
}
export function isPrivateAnalyticsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try { return isPrivateAnalyticsPath(new URL(value, 'https://ankush.wiki').pathname) }
  catch { return false }
}
// The private page lives at /invest, but its backend API keeps the /friends-and-family path. Recorded network requests to either stay masked.
export function isPrivateNetworkUrl(value: unknown): boolean {
  if (isPrivateAnalyticsUrl(value)) return true
  if (typeof value !== 'string') return false
  try { return /^\/friends-and-family(?:\/|$)/.test(new URL(value, 'https://ankush.wiki').pathname) }
  catch { return false }
}

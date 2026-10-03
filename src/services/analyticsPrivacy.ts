export function isPrivateAnalyticsPath(path: string): boolean {
  return /^\/invest(?:\/|$)/.test(path)
}
export function isPrivateAnalyticsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try { return isPrivateAnalyticsPath(new URL(value, 'https://ankush.wiki').pathname) }
  catch { return false }
}
// The private page lives at /invest, but its backend API keeps the /friends-and-family path, with admin endpoints under
// /admin/friends-and-family. Recorded network requests to any of these stay masked. Other /admin/ paths are not masked here.
export function isPrivateNetworkUrl(value: unknown): boolean {
  if (isPrivateAnalyticsUrl(value)) return true
  if (typeof value !== 'string') return false
  try { return /^\/(?:admin\/)?friends-and-family(?:\/|$)/.test(new URL(value, 'https://ankush.wiki').pathname) }
  catch { return false }
}

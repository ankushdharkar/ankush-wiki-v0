export function isPrivateAnalyticsPath(path: string): boolean {
  return /^\/friends-and-family(?:\/|$)/.test(path)
}
export function isPrivateAnalyticsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try { return isPrivateAnalyticsPath(new URL(value, 'https://ankush.wiki').pathname) }
  catch { return false }
}

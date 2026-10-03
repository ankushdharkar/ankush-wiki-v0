import { useLocation } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { isPrivateAnalyticsPath } from '../services/analyticsPrivacy'

export default function QueryTools() {
  const { pathname } = useLocation()
  return isPrivateAnalyticsPath(pathname) ? null : <ReactQueryDevtools initialIsOpen={false} />
}

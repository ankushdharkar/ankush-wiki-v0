import { useTheme } from '../../hooks/useTheme'
import { iconButton, ThemeIcon } from './ui'

// The private round's own theme control: same theme state as the rest of the site,
// a plain 44px button, and no motion.
export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme()
  return <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className={iconButton}>
    <ThemeIcon theme={theme} />
  </button>
}

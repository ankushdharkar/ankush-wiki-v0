/// <reference types="vite/client" />

// Type-safe env vars — validated at build time by @julr/vite-plugin-validate-env
interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL: string
  readonly VITE_PUBLIC_POSTHOG_KEY: string
  readonly VITE_PUBLIC_POSTHOG_HOST?: string
  readonly VITE_PUBLIC_FEATURE_AI_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

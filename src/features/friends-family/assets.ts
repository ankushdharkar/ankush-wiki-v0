// Optional files for the private page, resolved at build time from src/assets/friends-family/.
// A missing file resolves to null and its slot renders nothing, so adding a file with the
// agreed name is enough to show it. Built files are public: anyone can fetch them from the
// site's assets without signing in.

export interface WelcomeMedia { kind: 'video' | 'audio'; src: string; type: string }

const photos = import.meta.glob<string>('../../assets/friends-family/ankush-photo.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const media = import.meta.glob<string>('../../assets/friends-family/welcome.{mp4,webm,m4a,mp3}', { eager: true, import: 'default' })

// Preference order when more than one file is present.
const mediaTypes: [extension: string, kind: WelcomeMedia['kind'], type: string][] = [
  ['mp4', 'video', 'video/mp4'], ['webm', 'video', 'video/webm'], ['m4a', 'audio', 'audio/mp4'], ['mp3', 'audio', 'audio/mpeg'],
]
const byExtension = (files: Record<string, string>, extension: string) =>
  Object.entries(files).find(([file]) => file.endsWith(`.${extension}`))?.[1] ?? null

export const ankushPhoto: string | null = ['jpg', 'jpeg', 'png', 'webp'].map(extension => byExtension(photos, extension)).find(Boolean) ?? null

export const welcomeMedia: WelcomeMedia | null = mediaTypes
  .map(([extension, kind, type]) => { const src = byExtension(media, extension); return src ? { kind, src, type } : null })
  .find(Boolean) ?? null

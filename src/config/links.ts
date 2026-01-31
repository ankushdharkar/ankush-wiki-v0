/**
 * Centralized external links configuration
 * All external URLs used across the site are defined here for easy maintenance
 */

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/RealAnkush',
  linkedin: 'https://www.linkedin.com/in/ankushdharkar',
  github: 'https://github.com/ankushdharkar',
} as const;

export const PRODUCT_LINKS = {
  realDsa: 'https://realdsa.com',
  getShortlisted: 'https://myresumeisnotgettingshortlisted.com/',
} as const;

export const COMMUNITY_LINKS = {
  jsTsGuildDiscord: 'https://discord.gg/Vm2dugCsC8',
  realDevSquadFaq: 'https://docs.google.com/document/d/1-Bkfj9T6SKvVU8DfuwasHSt_bI-flCX5K9wieblk-7Q/edit?tab=t.0#heading=h.jg8i8nmyqp56',
  chilloutsJoin: 'https://docs.google.com/document/d/1Pn37IDyVp3yQV9PZduFwWMZa8yHP7FCitvRwo7Zdv5Y/edit?usp=sharing',
} as const;

export const MEDIA_LINKS = {
  youtubePodcast: 'https://www.youtube.com/watch?v=idLp9jI44L0',
  youtubePodcastEmbedId: 'idLp9jI44L0',
} as const;

export const TWITTER_EMBEDS = [
  {
    id: 'resume-tips',
    url: 'https://x.com/ankushdharkar/status/1954534159583420476',
    description: 'Resume tips thread',
  },
  {
    id: 'coding-journey',
    url: 'https://x.com/ankushdharkar/status/1911666308778774958',
    description: 'Coding journey insights',
  },
  {
    id: 'tech-thoughts',
    url: 'https://x.com/ankushdharkar/status/1852708946978783592',
    description: 'Tech thoughts',
  },
] as const;

// Third-party service URLs (typically not changed)
export const THIRD_PARTY = {
  twitterWidgets: 'https://platform.twitter.com/widgets.js',
} as const;

// Convenience export of all links
export const LINKS = {
  social: SOCIAL_LINKS,
  products: PRODUCT_LINKS,
  community: COMMUNITY_LINKS,
  media: MEDIA_LINKS,
  twitterEmbeds: TWITTER_EMBEDS,
  thirdParty: THIRD_PARTY,
} as const;

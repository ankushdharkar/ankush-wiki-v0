# TODO - Ankush Wiki v0 Improvements

This document outlines planned improvements and tasks for the Ankush Wiki v0 project.

## 🚀 High Priority / Bug Fixes

-   **[BUG] Fix Canvas Reveal Animation:** The particle animation in the `CanvasRevealEffect` component is not working due to a bug where the particle data arrays are re-created on every render.
    -   **Action:** Refactor the `DotMatrix` component in `src/components/ui/CanvasRevealEffect.tsx` to memoize the particle arrays (`positions`, `opacityArray`, `colorArray`) using `useMemo`.
    -   **Action:** Replace the `useState` for the `time` variable in the animation loop with `useRef` to prevent unnecessary re-renders.
    -   **Action:** Fix the `dotSize` prop, which is currently hardcoded in the shader, by passing it as a uniform.

## ⚡️ Performance Optimizations

-   **[PERF] Optimize Image Loading:** The images in the section components (`JsTsGuildSection`, `RealDevSquadSection`, etc.) are loaded with `loading="lazy"`, which is good. However, some images are quite large and could be optimized.
    -   **Action:** Compress and resize images in the `public/images` directory to reduce their file size without sacrificing too much quality.
    -   **Action:** Consider using a more modern image format like WebP.
-   **[PERF] Reduce Unnecessary Re-renders:** The `RouteCard` component uses a `requestAnimationFrame` loop inside a `useEffect` hook that updates the component's state on every frame, causing frequent re-renders.
    -   **Action:** Refactor the animation logic to use a more performant approach, perhaps by leveraging the animation library's own mechanisms or CSS animations.

## 🎨 UI/UX Enhancements

-   **[UI/UX] Consistent Navigation:** The `Header` on the homepage and the `Navigation` on other pages are two separate components with different styles. This creates a jarring experience when navigating between the homepage and other pages.
    -   **Action:** Create a single, unified navigation component that is used across all pages. It can have a transparent background on the homepage and a solid background on other pages, but the layout and links should be consistent.
-   **[UI/UX] Improve Mobile Responsiveness:** While the site is generally responsive, some elements could be improved on smaller screens. For example, the main heading in the `Header` has a very large text size that might not look great on all mobile devices.
    -   **Action:** Review and fine-tune the responsive styles for all components, paying special attention to typography, spacing, and layout on mobile devices.
-   **[UI/UX] Add a Footer:** The application currently lacks a footer.
    -   **Action:** Add a simple footer with copyright information and links to social media profiles.
-   **[UI/UX] Enhance `AceShowcase` Page:** The `AceShowcase` page is a great start, but it could be more organized.
    -   **Action:** Add a sidebar or a tabbed interface to categorize the components, making it easier to navigate.

## 🔄 Code Refactoring & Maintainability

-   **[REFACTOR] Consolidate Section Components:** The `RealDevSquadSection`, `JsTsGuildSection`, and `ChilloutsSection` components share a similar structure.
    -   **Action:** Create a generic `Section` component that accepts props for title, content, and layout, and then use it to build the specific sections. This will reduce code duplication.
-   **[REFACTOR] Centralize Data:** The data for the "teachings" in `RealDevSquadSection` and the Pokémon cards in `ExpandableCards` is hardcoded within the components.
    -   **Action:** Move this data to separate files (e.g., `src/data/teachings.ts`, `src/data/pokemon.ts`) to make it easier to manage and update.
-   **[REFACTOR] Type Safety:** The `Icon` component in `HomePageCanvasReveal.tsx` uses `any` for its props.
    -   **Action:** Provide proper TypeScript types for the component's props to improve type safety.
-   **[REFACTOR] Remove Unused Code:** The `Portfolio.tsx` file has a commented-out import for an `AboutSection`.
    -   **Action:** Remove the commented-out code if it's no longer needed.

## 📊 Analytics Implementation

-   **[ANALYTICS] Select Analytics Tools:** Research and evaluate analytics solutions for tracking user behavior and site performance.
    -   **Action:** Compare features, pricing, and implementation complexity of different analytics tools
    -   **Primary Tools to Consider:** Mixpanel, PostHog, Amplitude, Google Analytics 4, Plausible, Fathom
    -   **Real-Time & Heatmap Analytics:** Microsoft Clarity, Smartlook, Mouseflow, Inspectlet, Hotjar, FullStory, Crazy Egg
    -   **Open Source/Self-Hosted:** Ackee, Shynet, Offen, Koko Analytics, GoatCounter, Umami, Matomo
    -   **Developer-Focused:** Pirsch Analytics, Counter.dev, Splitbee/Vercel Analytics, Panelbear
    -   **Enterprise/Advanced:** Quantum Metric, Contentsquare, Glassbox, Dynatrace, DataDog RUM, Adobe Analytics
    -   **Error Tracking + Analytics:** Sentry, Bugsnag, Rollbar, LogRocket
    -   **A/B Testing Focused:** Optimizely, VWO, Google Optimize, AB Tasty
    -   **Customer Journey:** Kissmetrics, Woopra, Heap
    -   **Modern/Emerging:** June, Baremetrics, ChartMogul, Retool, Grafana
    -   **All-in-One Platforms:** HubSpot, Intercom, Customer.io, Segment
    -   **Decision Criteria:** Real-time data, event tracking capabilities, user privacy, cost, ease of integration, cohort analysis, session recording, heatmaps, error tracking

-   **[ANALYTICS] Implement Mixpanel:** Add Mixpanel for detailed user behavior tracking and funnel analysis.
    -   **Action:** Set up Mixpanel account and obtain API keys
    -   **Action:** Install Mixpanel SDK (`npm install mixpanel-browser`)
    -   **Action:** Create analytics wrapper service in `src/services/analytics.ts`
    -   **Action:** Initialize Mixpanel in main App component with proper configuration
    -   **Action:** Set up user identification and properties tracking

-   **[ANALYTICS] Alternative: Implement Amplitude:** Consider Amplitude as alternative to Mixpanel for product analytics.
    -   **Action:** Set up Amplitude account and obtain API keys
    -   **Action:** Install Amplitude SDK (`npm install @amplitude/analytics-browser`)
    -   **Action:** Compare Amplitude vs Mixpanel features (cohort analysis, retention tracking, funnel analysis)
    -   **Action:** Evaluate pricing differences and feature sets
    -   **Action:** Initialize Amplitude if chosen over Mixpanel
    -   **Pros:** Strong cohort analysis, excellent retention tracking, robust free tier
    -   **Cons:** More complex setup, enterprise-focused features

-   **[ANALYTICS] Implement PostHog:** Add PostHog for comprehensive product analytics and feature flags.
    -   **Action:** Set up PostHog account and obtain project API key
    -   **Action:** Install PostHog SDK (`npm install posthog-js`)
    -   **Action:** Initialize PostHog in main App component
    -   **Action:** Configure PostHog for session recording and heatmaps (optional)
    -   **Action:** Set up PostHog feature flags for A/B testing capabilities

-   **[ANALYTICS] Track Key Events:** Define and implement tracking for important user interactions.
    -   **Page Views:**
        - Homepage visits
        - Section page visits (/real-dev-squad, /js-ts-guild, /chillouts, /important-links)
        - Dev page visits (/dev)
    -   **Navigation Events:**
        - Canvas card clicks (Important Links, Real Dev Squad, JS TS Guild, Chillouts)
        - Header navigation clicks
        - Social link clicks (LinkedIn, GitHub, Twitter)
    -   **Content Engagement:**
        - YouTube video play/pause events
        - External link clicks (Real Dev Squad FAQ, YouTube podcast)
        - Hover events on canvas reveal cards
        - Coming Soon card interactions
    -   **Technical Events:**
        - Page load times
        - Error occurrences
        - Mobile vs desktop usage
    -   **Action:** Implement event tracking in components using the analytics service
    -   **Action:** Create custom hooks for consistent event tracking (`useAnalytics`)

-   **[ANALYTICS] Create Analytics Dashboard:** Set up monitoring and reporting for tracked events.
    -   **Action:** Configure Mixpanel dashboards for user behavior analysis
    -   **Action:** Set up PostHog insights for conversion tracking
    -   **Action:** Create alerts for unusual traffic patterns or errors
    -   **Action:** Document tracked events and their purposes for future reference

-   **[ANALYTICS] Privacy & Compliance:** Ensure analytics implementation respects user privacy.
    -   **Action:** Add privacy policy page explaining data collection
    -   **Action:** Implement cookie consent banner if required
    -   **Action:** Configure analytics tools to be GDPR compliant
    -   **Action:** Add opt-out mechanisms for users who don't want to be tracked

-   **[ANALYTICS] Recommended Tool Combinations:** Evaluate different analytics stack combinations based on use case and budget.
    -   **Personal Portfolio Stack (Current Project):**
        - **Option A:** PostHog + Plausible (comprehensive + privacy-first)
        - **Option B:** Amplitude + Microsoft Clarity (advanced analytics + free heatmaps)
        - **Option C:** Mixpanel + Vercel Analytics (if using Vercel hosting)
        - **Option D:** Umami or Plausible only (simple, privacy-focused)
    -   **Budget-Conscious Stack:**
        - Microsoft Clarity (free heatmaps and session recordings)
        - Plausible (affordable privacy-first analytics)
        - Sentry (error tracking with generous free tier)
    -   **Enterprise/Advanced Stack:**
        - PostHog + Hotjar + Sentry (complete user experience monitoring)
        - Amplitude + FullStory + Optimizely (advanced product analytics)
        - Adobe Analytics + Quantum Metric (enterprise-grade)
    -   **Developer-Focused Stack:**
        - Vercel Analytics + Microsoft Clarity + Sentry
        - Pirsch Analytics + Counter.dev
        - Self-hosted: Umami + Grafana + Sentry
    -   **Content/Blog Stack:**
        - Plausible + Microsoft Clarity
        - Fathom + Hotjar
        - GoatCounter + Simple Analytics
    -   **Future B2B SaaS Stack:**
        - PostHog + June + Sentry + Intercom
        - Amplitude + Mixpanel + Customer.io
    -   **E-commerce Stack:**
        - Mixpanel + Hotjar + Google Analytics 4
        - PostHog + Microsoft Clarity + Segment

-   **[ANALYTICS] Tool Evaluation Matrix:** Create comparison matrix for final tool selection.
    -   **Action:** Create spreadsheet comparing top 5-7 tools across criteria:
        - Pricing (free tier, paid plans)
        - Privacy compliance (GDPR, CCPA)
        - Implementation complexity
        - Real-time capabilities
        - Event tracking flexibility
        - Session recording availability
        - Heatmap functionality
        - Cohort analysis features
        - A/B testing capabilities
        - Integration ecosystem
        - Data export options
        - Support quality
    -   **Action:** Score each tool and create final recommendation

## ✨ New Features

-   **[FEATURE] Add an "About Me" Section:** The commented-out `AboutSection` suggests that this was planned.
    -   **Action:** Create a new "About Me" section on the homepage to provide more information about yourself.
-   **[FEATURE] Create a Project Showcase:** The `AceShowcase` page is for UI components, but you could also create a dedicated page to showcase your own projects.
    -   **Action:** Design and build a new page to display your projects, with details, screenshots, and links.
-   **[FEATURE] Add a Blog:** A blog would be a great way to share your knowledge and experiences.
    -   **Action:** Integrate a simple blog using Markdown files or a headless CMS.
-   **[FEATURE] Contact Form:** Add a contact form to allow visitors to get in touch with you.
    -   **Action:** Create a new contact page with a form that sends emails or integrates with a service like Formspree.

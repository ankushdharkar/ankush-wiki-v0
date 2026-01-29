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

**Decision (Jan 2026):** Start with PostHog, add Mixpanel later for advanced funnel analysis.

### Phase 1: PostHog (Current Priority) ✅ CHOSEN

-   [ ] **[ANALYTICS] Set Up PostHog Account**
    -   Create PostHog account at https://posthog.com
    -   Obtain project API key
    -   Note: Free tier includes 1M events/month + 5K session recordings

-   [ ] **[ANALYTICS] Install & Initialize PostHog**
    -   Install SDK: `pnpm add posthog-js`
    -   Create `src/services/analytics.ts` wrapper
    -   Initialize in `main.tsx` with PostHogProvider
    -   Configure for SPA route tracking with React Router

-   [ ] **[ANALYTICS] Configure PostHog Features**
    -   Enable automatic pageview capture
    -   Enable session recording (optional - for UX insights)
    -   Set up autocapture for clicks/inputs
    -   Configure privacy settings (mask sensitive inputs)

-   [ ] **[ANALYTICS] Track Key Events**
    -   **Page Views:** Auto-captured with SPA integration
    -   **Navigation:** Canvas card clicks, header nav, social links
    -   **Engagement:** External link clicks, video interactions
    -   **Technical:** Page load times, errors, device type

-   [ ] **[ANALYTICS] Create PostHog Dashboard**
    -   Set up insights for page popularity
    -   Create funnel for navigation flow
    -   Configure retention analysis
    -   Add alerts for traffic anomalies

### Phase 2: Mixpanel (Future)

-   [ ] **[ANALYTICS] Add Mixpanel for Advanced Analytics**
    -   Install SDK: `pnpm add mixpanel-browser`
    -   Integrate with existing analytics wrapper
    -   Set up detailed funnel analysis
    -   Configure cohort tracking
    -   Use for deeper user journey analysis
    -   **Note:** Requires cookie consent banner (GDPR)

### Privacy & Compliance

-   [ ] **[ANALYTICS] Privacy Implementation**
    -   PostHog: Cookie-less mode available (no consent needed)
    -   Mixpanel: Will need consent banner when added
    -   Add privacy policy page
    -   Implement opt-out mechanism

## ✨ New Features

-   **[FEATURE] Add an "About Me" Section:** The commented-out `AboutSection` suggests that this was planned.
    -   **Action:** Create a new "About Me" section on the homepage to provide more information about yourself.
-   **[FEATURE] Create a Project Showcase:** The `AceShowcase` page is for UI components, but you could also create a dedicated page to showcase your own projects.
    -   **Action:** Design and build a new page to display your projects, with details, screenshots, and links.
-   **[FEATURE] Add a Blog:** A blog would be a great way to share your knowledge and experiences.
    -   **Action:** Integrate a simple blog using Markdown files or a headless CMS.
-   **[FEATURE] Contact Form:** Add a contact form to allow visitors to get in touch with you.
    -   **Action:** Create a new contact page with a form that sends emails or integrates with a service like Formspree.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Mobile-first design is mandatory

Every UI you write must be designed mobile-first. This means:

- Start from 375px viewport width. Style for mobile, then scale up with `min-width` media queries — never `max-width`.
- Minimum tap target size: 44×44px for all interactive elements (buttons, links, inputs).
- Default font size: 16px minimum on body text. Never below 14px anywhere.
- Spacing: use the 8px grid (8, 16, 24, 32, 48px). Generous padding on mobile — at least 16px horizontal page margin.
- Navigation: bottom-anchored on mobile (bottom tab bar or fixed bottom CTA). Top nav is desktop only.
- Inputs and forms: full-width on mobile, keyboard-aware (account for virtual keyboard pushing layout).
- Images and media: always `width: 100%`, `height: auto`. Never fixed pixel widths on images.
- Touch interactions: swipe, tap — no hover-only affordances. Hover effects are progressive enhancement only.
- No horizontal scroll on the page level. All content fits within the viewport width.
- Test every layout at 375px, 390px, 430px (iPhone SE, 14, 14 Plus) before considering desktop.
<!-- END:nextjs-agent-rules -->

# Desktop and large displays: enhance, don't just scale

Design for large screens (1280px+) as a progressive enhancement on top of mobile. Rules:

- At `min-width: 1024px`: introduce sidebar navigation, multi-column layouts, wider cards, and expanded data tables.
- At `min-width: 1280px`: cap content width at `max-w-7xl` (1280px) or similar. Never let text or cards stretch full-width on a 1920px monitor — center the content with auto margins.
- Use the extra space meaningfully: show more data (e.g. expanded transaction rows, visible chart legends, side-by-side panels) rather than just scaling up mobile components.
- Typography scales up modestly: mobile body 16px → desktop 16–18px. Headings can grow. Never just `zoom: 1.5` the mobile layout.
- Sidebar nav on desktop replaces the mobile bottom tab bar — same routes, different chrome.
- Two-column or three-column grid layouts are encouraged on desktop where mobile shows a single column.
- Desktop is a nice-to-have. If time is short, a clean centered single-column layout on desktop is acceptable. A broken mobile layout is never acceptable.

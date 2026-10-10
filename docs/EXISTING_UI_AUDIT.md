# Existing UI Audit

## Framework & Version
- **Framework**: Framer (visual web development platform)
- **Version**: Framer 8a3d870 (from meta generator tag)
- **Underlying Technology**: React-based (evidenced by react.D45P4A5Z.mjs bundle)

## Language
- **Primary Language**: JavaScript (JSX)
- **TypeScript**: Not detected (no .ts/.tsx files in static output)

## Bundler
- **Bundler**: Framer's built-in bundler with Rolldown runtime (rolldown-runtime.uxh0A31G.mjs)
- **Code Splitting**: Automatic code splitting per component/page

## Router & Route List
- **Router**: Framer's built-in routing system
- **Routes Detected**:
  - `/` (home) - index.html
  - `/contact` - contact.html
  - `/blog` - blog directory
  - `/blog/{post-slug}` - individual blog posts
  - `/legal/privacy-policy` - privacy-policy.html
  - `/legal/terms-conditions` - terms-conditions.html
  - `/legal/refund-policy` - refund-policy.html

## Folder Conventions
- **Root Level**: HTML files for main pages
- `/blog`: Blog posts in HTML format
- `/legal`: Legal policy pages
- `/.claude`: Claude Code configuration
- Assets served via framerusercontent.com CDN

## Styling System
- **CSS Approach**: CSS-in-JS with CSS custom properties (tokens)
- **Design Tokens**: 
  - Colors: `--token-a9c881b7-a087-4bee-a49f-befc82631c31` (rgb(242, 242, 242))
  - Fonts: Fragment Mono, Manrope (via @font-face rules)
  - Spacing: Not explicitly tokenized in CSS but appears consistent
- **CSS Framework**: None detected (custom Framer-generated CSS)

## Shell/Layout
- **Layout Type**: Single-page application with client-side routing
- **Navigation**: Header-based navigation (inferred from HTML structure)
- **Container**: Responsive design with breakpoints at 1200px, 810px

## Navigation Items
- **Main Navigation** (inferred from site structure):
  - Home
  - Blog
  - Contact
  - Legal (dropdown: Privacy Policy, Terms, Refund Policy)

## Reusable Components
- **Detected Components** (from bundle names):
  - NumberCounter
  - DynamicTabTitle
  - ResponsiveImage
  - Various custom components per page/section

## Icon Set
- **Icon System**: Not explicitly detected in HTML (likely SVG or font-based via Framer)

## Chart Library
- **Chart Library**: None detected in current pages

## HTTP Layer
- **HTTP Client**: Not applicable (static site)
- **Data Fetching**: Built into Framer runtime for CMS/data

## State Management
- **State Management**: Framer's built-in state system (inferred from hydration data)

## i18n
- **Internationalization**: Not detected (English-only content)

## Auth
- **Authentication**: None detected (public marketing site)

## Env Handling
- **Environment Variables**: Not applicable (static site)

## Lint/Test/Build Commands
- **Build Process**: Framer CLI/build system (external to repo)
- **Dev Command**: `framer dev` (inferred)
- **Test Command**: None detected
- **Lint Command**: None detected

## Existing Backend
- **Backend**: None (static site only)
- **APIs**: None detected

## Mock Data Layer
- **Mock Data**: None detected

## Page Map for FinSense Screens
Based on section 20.1 of the prompt, mapping FinSense screens to existing UI:

1. **Upload** → NEW-page (`/upload`)
2. **Processing** → NEW-page (`/processing`)
3. **Dashboard** → EXISTS-extend (extend existing homepage or create `/dashboard`)
4. **Bills list** → NEW-page (`/bills`)
5. **Bill inspector/detail** → NEW-page (`/bills/:id`)
6. **Prioritized Review Queue** → NEW-page (`/review`)
7. **Batches** → NEW-page (`/batches`)
8. **Batch detail** → NEW-page (`/batches/:id`)
9. **Suppliers** → NEW-page (`/suppliers`)
10. **Supplier profile** → NEW-page (`/suppliers/:id`)
11. **Analytics** → NEW-page (`/analytics`)
12. **Upcoming Reminders** → NEW-page (`/reminders`)
13. **Omnichannel Inbox** → NEW-page (`/inbox`)
14. **Integrations/Settings** → NEW-page (`/settings/integrations`)

## Baseline Results
Since this is a static Framer site with no build/test/lint configuration in the repository:
- **Build**: N/A (handled by Framer platform externally)
- **Lint**: N/A
- **Test**: N/A
- **Baseline Status**: No existing tests to pass/fail

## Decision
**FINSENSE_ENABLED**: Feature flag to be implemented via environment variable
**Approach**: Build FinSense as a separate React application that can be embedded or linked from the existing Framer site, OR migrate to a React/Vite setup that matches the existing site's visual style.

**Selected Approach**: Following the prompt's instruction 20.B - "If (and only if) no existing frontend is found: React 18 + Vite + Tailwind 3 (JavaScript)". Since the existing site is a Framer template (not a code-based frontend we can modify), we will create a new React+Vite+Tailwind frontend that matches the visual style.

## Baseline Test Results (Pre-FinSense)
**Date**: 2026-10-10
**Environment**: Windows 11, Node.js version not applicable (static site)

### Existing Build System
- **Status**: No build system in repository (Framer site built externally)
- **Commands**: None available in repo
- **Baseline**: N/A

### Existing Lint System
- **Status**: No lint configuration in repository
- **Commands**: None available in repo
- **Baseline**: N/A

### Existing Test System
- **Status**: No test configuration in repository
- **Commands**: None available in repo
- **Baseline**: N/A

### Verification
- **HTML File Access**: ✓ All HTML files in demo website are readable
- **Link Integrity**: Manual verification shows internal links would work when hosted
- **Responsive Design**: Site uses viewport meta tag and media queries for responsiveness


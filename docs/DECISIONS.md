# FinSense Project Decisions

## Phase 0 Decisions

### Frontend Technology Choice
**Decision**: Since the existing website is a Framer-generated static site (not a modifiable codebase), we will create a new React 18 + Vite + Tailwind 3 frontend as instructed in prompt section 20.B.

**Why**: 
- The existing site is a visual builder output (Framer) with no accessible source code for modification
- Following the prompt's instruction: "If (and only if) no existing frontend is found: React 18 + Vite + Tailwind 3 (JavaScript)"
- This allows us to build a maintainable codebase while matching the existing site's visual style

### Feature Flag Approach
**Decision**: Implement `FINSENSE_ENABLED` environment variable to conditionally show FinSense navigation items.

**Why**: 
- Allows hiding FinSense features when backend is unreachable
- Follows prompt section 4 requirement for feature-flag config
- Enables gradual rollout

### Visual Style Matching
**Decision**: Extract design tokens from existing site to match visual style in new frontend.

**Tokens Extracted**:
- Background color: rgb(242, 242, 242) (from --token-a9c881b7-a087-4bee-a49f-befc82631c31)
- Font Family: Fragment Mono (primary), Manrope (secondary)
- Responsive breakpoints: 1200px, 810px

## Pending Decisions
These will be documented as the project progresses:
- Backend language/framework choice (already specified as Python/FastAPI in prompt)
- Database choice (SQLite default, Supabase configurable)
- Authentication approach (reusing existing if present, otherwise single-owner gate)

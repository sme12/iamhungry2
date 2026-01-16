# iamhungry — Meal Planning Web App

> **Scope:** MVP — AI-powered meal plan generation
> **Storage:** Vercel KV (Redis)
> **Stack:** Next.js + TypeScript + Tailwind CSS + Zod + AI SDK + Claude + Vercel KV + next-intl
> **Auth:** Clerk
> **Package Manager:** pnpm

---

## Current Project State

### ✅ Already Configured

| Item                | Status                                            |
| ------------------- | ------------------------------------------------- |
| **Package manager** | pnpm 10.28.0 (specified in `packageManager`)      |
| **Git repository**  | Initialized                                       |
| **Prettier**        | Configured (`.prettierrc`, `.prettierignore`)     |
| **README.md**       | Basic README with installation instructions       |
| **.gitignore**      | Configured for Node.js/pnpm project               |

### 📦 Installed Dependencies

- `prettier` — code formatting (devDependency)

### 🔜 Need to Install/Configure

- Next.js + TypeScript
- Tailwind CSS
- Zod
- AI SDK + Anthropic provider
- next-intl
- @use-gesture/react + @react-spring/web
- Vercel KV

---

## MVP Simplifications

| Item               | Decision                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Participants       | Hardcoded: Vitalik + Lena                                                                                                                                                                                             |
| Cuisines           | **UI selection** (multiselect): Eastern European, Asian, Mexican, American, Italian, Mediterranean, Japanese, Thai, Georgian, Scandinavian. **Hardcoded exclusions:** Indian, Nepalese                               |
| Cooking time       | Hardcoded: 30-60 min                                                                                                                                                                                                  |
| Special conditions | Simple textarea (free text)                                                                                                                                                                                           |

**Main UI:** Week calendar + cuisine selection (multiselect) + special conditions field

---

## Authentication

**Solution:** Clerk

Authentication is configured via Clerk — a modern auth-as-a-service provider.

### ✅ Already Configured

- `@clerk/nextjs` installed and configured
- `ClerkProvider` wraps the app in `layout.tsx`
- Middleware configured for route protection
- Environment variables added to `.env.local`

### Main Components

- `<SignIn />` / `<SignUp />` — ready-made auth forms
- `<UserButton />` — profile button with menu
- `auth()` / `currentUser()` — server helpers for getting user
- `useUser()` / `useAuth()` — client hooks

### Benefits

- Protection from unauthorized API access (saves on Claude API costs)
- Data sync across devices (one account = one data set)
- Ready-made UI components for auth
- OAuth support (Google, GitHub, etc.)

---

## Design and Style

**Theme:** Dark Mode

- Use dark color scheme by default
- Tailwind CSS dark classes as primary (bg-gray-900, text-gray-100, etc.)
- Contrasting accent colors for interactive elements
- Soft shadows and borders for section separation

---

## Mobile-First Approach

**Priority:** Mobile devices (phone is the primary use case)

### Principles

- **Viewport-first:** All components designed for 320-428px width first
- **Touch-friendly:** Minimum tappable element size — 44×44px (Apple HIG)
- **Thumb zone:** Main actions at bottom of screen (thumb-reachable zone)
- **Responsiveness:** Immediate visual feedback on all touches
- **Breakpoints:** `sm:` (640px) → `md:` (768px) → `lg:` (1024px) — expand, don't shrink

### Mobile-Focused Components

| Component          | Mobile optimization                                        |
| ------------------ | ---------------------------------------------------------- |
| `MealSlotCell`     | 48×48px minimum, ripple effect on tap                      |
| `CuisineSelector`  | Horizontal chip scroll instead of grid                     |
| `TabSwitcher`      | Sticky at top, large full-width tabs                       |
| `WeekPagination`   | Swipe navigation between weeks                             |
| `StickyPanel`      | Safe area padding for iPhone (env(safe-area-inset-bottom)) |
| `ShoppingListView` | **Separate section below**                                 |

---

## Shopping List — Touch Optimization

**Goal:** Perfect UX for one-handed use in the store

### Element Sizes

- Row height: 56px
- Checkbox: 48×48px

### Interactions

| Gesture          | Action                       |
| ---------------- | ---------------------------- |
| **Tap on row**   | Mark as purchased (toggle)   |
| **Swipe left**   | Show "Delete" button         |

### Swipe to Delete (Web)

Swipe works in browser via Touch Events API. Using `@use-gesture/react` library (lightweight, 3KB gzip).

### Visual Feedback

- Haptic feedback on iOS/Android via `navigator.vibrate(10)`
- Scale animation on tap: `active:scale-[0.98]`
- Color transition when marked

### Category Grouping

- Collapsible categories
- Progress shown: "(2 of 5 purchased)"

### Checkbox State Persistence (Vercel KV)

Checkbox state saved in Vercel KV for cross-device sync (phone in store ↔ laptop at home).

**KV Structure:** `meal-planner:checked:2026-02 → ["item-id-1", "item-id-2", ...]`

**KV vs localStorage Benefits:**

- Cross-device sync (marked on phone → visible on laptop)
- Data persists through browser clearing
- State tied to plan, deleted together with it

### Additional Touch Features

- **Pull-to-refresh:** Refresh list (sync with KV)
- **Sticky categories:** Category header stays visible while scrolling
- **Floating action button:** "Copy unpurchased" — for sending to messenger
- **Filter:** Show only unpurchased / all

---

## Internationalization (next-intl)

**Default language:** Russian (ru)
**Architecture:** Ready for 2+ language expansion

### File Structure

- `messages/ru.json` — Russian translations (primary)
- `messages/en.json` — English (future placeholder)
- `i18n/request.ts` — Server Components configuration
- `i18n/routing.ts` — Routing configuration (optional)

### Language Impact on Claude Prompt and Output

UI language affects:

1. **Prompt** — instructions for Claude should be in user's language
2. **Claude response** — dish names, ingredients in shopping list

**Important:** For Russian UI, prompts are in Russian. Explicitly specify response language in prompt: "Все названия блюд и ингредиентов — на русском языке." (All dish and ingredient names in Russian.)

### Expanding to Second Language (Future)

1. Create `messages/en.json` with translations (including `prompt` section)
2. Update `i18n/request.ts` for locale detection (cookie/header/path)
3. Add language switcher in UI
4. Pass `locale` to `generatePrompt()`

---

## User Flow and Routing

### Route Structure

- `/` → Home: view current plan
- `/new` → Create new plan (controls + generation)

### Flow

1. **Home (`/`)** — view saved plan
   - Shows last saved plan (or selected week)
   - Two tabs: "Plan" and "Shopping List"
   - Pagination between weeks (arrows ◀ ▶)
   - Week number for identification
   - If no plans — empty state with create button

2. **New plan (`/new`)** — plan creation (TWO-STAGE GENERATION)
   - Calendar + cuisine selection + special conditions
   - **Stage 1: Meal Plan Generation**
     - "Generate plan" button
     - Plan preview (without shopping list)
     - Can "Regenerate" unlimited times
     - "Confirm plan" button → proceed to stage 2
   - **Stage 2: Shopping List Generation**
     - Automatically starts after plan confirmation
     - Shows shopping list preview
     - "Save" / "Back to plan" buttons
   - After saving → redirect to `/`

3. **Sticky panel** — "New plan" button at bottom on home page

### Two-Stage Generation Benefits

- **API savings:** don't generate shopping list on every plan regeneration
- **Faster iterations:** fewer tokens in response = faster response
- **Better UX:** user sees clear process separation

---

## Loading States and Skeleton UI

For all async operations, show skeleton placeholders instead of spinners for better UX.

### Components

- `Skeleton` — base component with `animate-pulse`
- `MealPlanSkeleton` — skeleton for plan table
- `ShoppingListSkeleton` — skeleton for shopping list

---

## Error Boundaries

React Error Boundaries for graceful error handling in UI. Next.js App Router provides built-in support via special files.

### Files

- `app/error.tsx` — Global error boundary
- `app/new/error.tsx` — Error boundary for /new page
- `app/not-found.tsx` — 404 page
- `components/ErrorBoundary.tsx` — Reusable component for granular handling

---

## Data Model (Zod)

### Schemas in `schemas/appState.ts`

- `MealSlotStatusSchema` — cell statuses: "full" | "coffee" | "skip"
- `DaySchema` — days of week: "mon" | "tue" | ... | "sun"
- `MealSchema` — meals: "breakfast" | "lunch" | "dinner"
- `DayScheduleSchema` — day schedule
- `PersonWeekScheduleSchema` — person's week schedule
- `CuisineIdSchema` — cuisine identifiers
- `AppStateSchema` — full app state

### Zod Benefits

1. **Single source of truth** — schema = type
2. **Data validation from KV** — `safeParse` returns `null` if data is corrupted
3. **Autocomplete** — TypeScript knows all possible enum values
4. **Refactoring** — change schema → TypeScript shows all places to fix

---

## Prompt Generation

Based on controls, the system automatically generates prompt structure:

1. **Count portions** — for each slot: how many people eat at home
2. **Determine meal type** — regular/large/quick
3. **Exclude slots** — where no one eats at home
4. **Add special conditions** — guests, leftovers, preferences

---

## Project Structure (Next.js App Router)

### Directories

- `messages/` — Translations (ru.json)
- `i18n/` — next-intl configuration
- `lib/` — Rate limiting via Vercel KV
- `app/` — Next.js App Router pages and layouts
- `components/` — React components
- `hooks/` — Custom hooks
- `config/` — Hardcoded configuration
- `schemas/` — Zod schemas
- `utils/` — Utilities

### Key Files

**app/**
- `layout.tsx` — NextIntlClientProvider
- `page.tsx` — Home: view plans + tabs
- `error.tsx` — Global error boundary
- `not-found.tsx` — 404 page
- `new/page.tsx` — Create new plan
- `new/error.tsx` — Error boundary for /new

**app/api/**
- `generate-meal-plan/route.ts` — Stage 1: meal plan generation
- `generate-shopping-list/route.ts` — Stage 2: shopping list generation
- `regenerate-meals/route.ts` — Partial meal regeneration
- `plans/route.ts` — GET: plans list, POST: save plan
- `plans/[weekKey]/route.ts` — GET: specific plan by key
- `plans/[weekKey]/checked/route.ts` — GET/PUT: checkbox state

**components/**
- `WeekCalendar.tsx` — Schedule grid (for /new)
- `PersonScheduleRow.tsx` — Row for one person
- `MealSlotCell.tsx` — Clickable cell
- `CuisineSelector.tsx` — Cuisine multiselect
- `SpecialConditions.tsx` — Special conditions textarea
- `GenerateSection.tsx` — Generate button + preview
- `MealPlanView.tsx` — Plan display (read-only, for /)
- `ShoppingListView.tsx` — Shopping list with checkboxes
- `WeekPagination.tsx` — Pagination between weeks
- `TabSwitcher.tsx` — Plan / List switcher
- `EmptyState.tsx` — Empty state (no plans)
- `StickyPanel.tsx` — Sticky panel with "New plan" button
- `ErrorBoundary.tsx` — Error handling component
- `Skeleton.tsx` — Skeleton placeholders for loading states

**hooks/**
- `useSchedule.ts` — Calendar state (for /new)
- `usePlans.ts` — Plan loading/navigation
- `useMealPlanGeneration.ts` — API call + state

**config/**
- `defaults.ts` — Hardcoded: people, cuisines, constraints

**schemas/**
- `appState.ts` — Zod state schemas (for /new)
- `mealPlanResponse.ts` — Zod schema for Claude response
- `persistedPlan.ts` — Zod schemas for saved plans

**utils/**
- `promptBuilder.ts` — Prompt building
- `weekNumber.ts` — Week number utilities
- `shoppingItemId.ts` — Stable ID generation for items

### Hardcoded Config (defaults.ts)

- `PEOPLE` — ["Виталик", "Лена"] (Russian names kept as-is)
- `AVAILABLE_CUISINES` — 10 cuisines for UI selection
- `DEFAULT_SELECTED_CUISINES` — pre-selected cuisines
- `EXCLUDED_CUISINES` — ["Индийская", "Непальская"] (Indian, Nepalese)
- `COOKING_TIME` — optimal: 30, max: 60
- `BANNED_INGREDIENTS` — list of banned ingredients
- `MEAT_RULES` — meat rules

---

## UI Component: CuisineSelector

Cuisine multiselect. Uses `AVAILABLE_CUISINES` from config and translations from `messages/ru.json`.

---

## UI Component: MealSlotCell

Click on cell cycles through status: 🍽️ Full meal → ☕ Coffee → ❌ Skip → 🍽️ ...

---

## Output Format: JSON (Two-Stage Generation)

Claude returns structured JSON that we parse and render ourselves. This gives full UI control and allows response validation via Zod.

**IMPORTANT:** Generation is split into two stages:
1. **Stage 1:** Meal plan generation (without shopping list)
2. **Stage 2:** Shopping list generation (based on confirmed plan)

### Response Zod Schemas

**schemas/mealPlanResponse.ts:**
- `MealItemSchema` — dish (name, time, portions)
- `DayPlanSchema` — day in plan
- `CategorySchema` — product categories
- `ShoppingItemSchema` — shopping list item
- `ShoppingItemWithIdSchema` — item with ID for client
- `ShoppingTripSchema` — shopping trip
- `MealPlanOnlyResponseSchema` — Stage 1: weekPlan only
- `ShoppingListResponseSchema` — Stage 2: shoppingTrips only
- `MealPlanResponseSchema` — full response for saved plans

### Product Categories

| Category          | Emoji | ID         |
| ----------------- | ----- | ---------- |
| Dairy             | 🥛    | dairy      |
| Meat / Fish       | 🥩    | meat       |
| Vegetables/Fruits | 🥬    | produce    |
| Pantry            | 🍝    | pantry     |
| Frozen            | ❄️    | frozen     |
| Bread / Bakery    | 🥖    | bakery     |
| Sauces/Condiments | 🧂    | condiments |

---

## AI SDK Integration (Direct Claude) — Two-Stage Generation

Instead of manual prompt copying — plan generation directly in app via Vercel's AI SDK with direct Anthropic API connection.

**IMPORTANT:** Generation split into two stages:
1. `/api/generate-meal-plan` — generates meal plan only (without shopping list)
2. `/api/generate-shopping-list` — generates shopping list for confirmed plan

### Installation

- ai
- @ai-sdk/anthropic
- use-debounce
- next-intl

### Environment Variables

- `ANTHROPIC_API_KEY` — Claude API key

### Client Hook — Two-Stage Generation

`useMealPlanGeneration` — hook with state:
- `stage`: "idle" | "generating-plan" | "plan-ready" | "generating-shopping" | "complete"
- Methods: `generatePlan`, `generateShoppingList`, `resetToPlanStage`, `reset`, `getCompleteResult`

### Two-Stage Generation Benefits

1. **API cost savings** — don't generate shopping list on every plan regeneration
2. **Faster iterations** — fewer tokens in response = faster Claude response
3. **Better UX** — user sees clear process separation
4. **Fewer tokens** — single plan request ≈ 1-1.5K tokens instead of 2-3K

### Cost

Claude Sonnet 4: ~$3/$15 per 1M tokens (input/output).
- Meal plan generation ≈ 1-1.5K tokens → **~$0.005-0.01**
- Shopping list generation ≈ 1-1.5K tokens → **~$0.005-0.01**
- **Total per full cycle:** ~$0.01-0.02
- **With 3 plan regenerations:** ~$0.02-0.04

---

## Rate Limiting

Protection from API abuse (even by authenticated users). Using Vercel KV for counter storage.

### checkRateLimit Function

Checks rate limit for user by identifier (IP or user ID).

### Limits for Different Operations

| Operation             | Limit | Window | Reason                                 |
| --------------------- | ----- | ------ | -------------------------------------- |
| Plan generation       | 10    | 1 min  | Expensive Claude API call              |
| Meal regeneration     | 20    | 1 min  | Fewer tokens, but still expensive      |
| Plan saving           | 30    | 1 min  | Cheap, but spam protection             |
| Checkbox toggle       | 100   | 1 min  | Frequently used, high limit            |

---

## Vercel KV Integration

### Installation

- @vercel/kv

### Environment Variables

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Persistence Zod Schemas

**schemas/persistedPlan.ts:**
- `PersistedPlanSchema` — saved plan with metadata (weekNumber, year, weekStart, weekEnd, savedAt)
- `PlansListSchema` — plans list for pagination

### Week Utilities

**utils/weekNumber.ts:**
- `getCurrentWeekInfo()` — current week
- `formatWeekRange(weekStart, weekEnd)` — range formatting
- `getPlanKey(year, weekNumber)` — unique key: "2026-02"

### Stable ID Generation for Items

**utils/shoppingItemId.ts:**
- `generateShoppingItemId(item, tripIndex)` — deterministic ID based on properties
- `addIdsToShoppingItems(trips)` — adds IDs to all items

**Why this matters:**
- On regeneration "Eggs — 6 pcs" gets the same ID
- Checkbox state in KV is preserved
- If user marked item and regenerated plan — mark stays

### KV Data Structure

- `meal-planner:plan-index` — sorted set with plan keys
- `meal-planner:plan:2026-02` — plan data
- `meal-planner:checked:2026-02` — marked items

---

## MVP Implementation Plan

### 1. ✅ Project Initialization

- Create Next.js + TypeScript project
- Configure Tailwind CSS
- Configure next-intl (config + `messages/ru.json`)
- Install date-fns for date/week handling
- Create Vercel KV store in dashboard and connect to project

### 2. ✅ Zod Schemas and Config

- `schemas/appState.ts`
- `schemas/mealPlanResponse.ts`
- `schemas/persistedPlan.ts`
- `config/defaults.ts`
- `utils/weekNumber.ts`

### 3. ✅ Home Page (/) — View Plans

- `MealPlanView`, `ShoppingListView`, `TabSwitcher`, `WeekPagination`
- `EmptyState`, `StickyPanel`
- `usePlans` hook

### 4. ✅ Create Page (/new) — Generation Form

- `WeekCalendar`, `MealSlotCell`, `CuisineSelector`, `SpecialConditions`
- "← Back" button

### 5. Two-Stage Generation (plan → shopping list)

**Stage 1: Meal Plan Generation**
- `promptBuilder.ts`
- Exclusion of repeats from last plan
- API route `/api/generate-meal-plan`

**Stage 2: Shopping List Generation**
- API route `/api/generate-shopping-list`
- Called after plan confirmation

**Hook and Components:**
- `useMealPlanGeneration`
- `GenerateSection`

### 6. Persistence (Vercel KV)

**What we save:**
- Plans by week

**API routes:**
- `GET /api/plans`
- `POST /api/plans`
- `GET /api/plans/[weekKey]`

---

## Testing (Vitest)

### What We Test

| File                          | Coverage                                               |
| ----------------------------- | ------------------------------------------------------ |
| `schemas/mealPlanResponse.ts` | Parsing valid/invalid JSON from Claude                 |
| `schemas/persistedPlan.ts`    | Parsing data from KV                                   |
| `utils/weekNumber.ts`         | `getCurrentWeekInfo`, `formatWeekRange`, `getPlanKey`  |
| `utils/promptBuilder.ts`      | Prompt generation from different calendar states       |
| `utils/shoppingItemId.ts`     | Item ID stability and determinism                      |
| `lib/rateLimit.ts`            | Correct counting and limit resets                      |

---

## Verification

**Home Page (/) Tests:**

1. With existing plans — shows latest plan
2. Without plans — shows empty state
3. "Plan" / "Shopping List" tabs switch correctly
4. Pagination works: ◀ ▶ switch between weeks
5. Week number and dates display correctly
6. Shopping list checkboxes work
7. "New plan" button navigates to `/new`

**Create Page (/new) Tests:**

1. Cell click cycles status (🍽️ → ☕ → ❌ → 🍽️)
2. Cuisine selection works (checkboxes toggle)
3. Special conditions textarea saves text
4. "← Back" button returns to home
5. "Copy prompt" button copies to clipboard

**Two-Stage AI Integration Tests:**

*Stage 1 — Meal Plan Generation:*
1. "Generate plan" button sends request to `/api/generate-meal-plan`
2. Loading shows spinner and "Generating meal plan..." text
3. API error shows error message
4. Successful response parsed via `MealPlanOnlyResponseSchema`
5. Plan matches given schedule (null for skipped slots)
6. Repeat exclusion: dishes from last plan added to prompt as exclusions
7. "Regenerate" and "Confirm plan" buttons appear after generation

*Stage 2 — Shopping List Generation:*
8. "Confirm plan" button sends request to `/api/generate-shopping-list`
9. Request includes confirmed meal plan
10. Shows spinner and "Generating shopping list..." text
11. Successful response parsed via `ShoppingListResponseSchema`
12. "Back to plan" and "Save" buttons appear after list generation

**Selective Meal Regeneration Tests (Stage 1):**

1. Click on dish in preview marks it for regeneration (⟳ icon appears)
2. Second click removes mark
3. "Fix (N)" counter shows number of marked dishes
4. "Fix" button inactive if nothing selected
5. "Fix" calls `/api/regenerate-meals` with correct parameters
6. After partial regeneration only selected dishes update
7. Other dishes in plan remain unchanged

**Persistence Tests (Vercel KV):**

1. After "Save" plan saves with week number and year
2. Full plan saved (weekPlan + shoppingTrips)
3. Redirect to `/` after saving
4. New plan appears in home list
5. Plan for same week overwrites (no duplicates)
6. Pagination correctly loads different plans

**E2E Check (Two-Stage Flow):**

1. Open `/` → see empty state
2. Click "Create plan" → navigate to `/new`
3. Configure schedule, select cuisines, add conditions
4. Click "Generate plan" → wait for result (plan only, no shopping list)
5. (Optional) Click "Regenerate" several times until plan is satisfactory
6. Click "Confirm plan" → shopping list generates
7. (Optional) Click "Back to plan" → can regenerate plan
8. Click "Save" → redirect to `/`
9. See saved plan with correct week number
10. Switch to "Shopping List" tab → see grouped list

---

## Selective Meal Regeneration (Stage 1)

At **Stage 1** (after meal plan generation, but before confirmation) user can mark individual dishes they don't like and regenerate only those.

**IMPORTANT:** Selective regeneration available only at Stage 1, before plan confirmation.

### Interaction (Stage 1)

| Action                  | Result                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| **Click on dish**       | Toggle "regenerate" mark (⟳ icon added)                          |
| **"Fix (N)"**           | Regenerates only marked dishes, others preserved                 |
| **"Regenerate"**        | Generates entire plan from scratch                               |
| **"Confirm plan"**      | Proceed to Stage 2 → shopping list generation                    |

### Partial Regeneration Prompt

Prompt includes full current plan context to:
- Avoid ingredient duplication with existing dishes
- Maintain stylistic consistency for the week
- Correctly recalculate shopping list

### Marked Dish Visual Style

- Background: `bg-amber-900/30`
- Border: `border-amber-500 ring-2 ring-amber-500/50`
- Icon: ⟳ (amber-400)

---

## Future Improvements (Post-MVP)

- Second language (English) + switcher in UI
- Deleting old plans

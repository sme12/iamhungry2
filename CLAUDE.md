# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iamhungry is a family meal planner app built with Next.js 16. It uses AI (Claude via Vercel AI SDK) to generate weekly meal plans with shopping lists based on family schedules and cuisine preferences.

## Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm tsc --noEmit # Type check
pnpm test         # Run Vitest in watch mode
pnpm test:run     # Run tests once (CI)
pnpm prettier --write .  # Format code
```

Run a single test file: `pnpm test utils/weekNumber.test.ts`

## Architecture

### Tech Stack

- **Next.js 16** with App Router and Turbopack
- **Clerk** for authentication
- **next-intl** for i18n (currently Russian only, locale hardcoded in `i18n/request.ts`)
- **@upstash/redis** (Vercel Marketplace) for persistence — uses `Redis.fromEnv()`
- **AI SDK** with Anthropic provider for meal plan generation
- **Zod** for schema validation
- **Tailwind CSS v4**

### Directory Structure

- `app/` - Next.js App Router pages and layouts
- `lib/` - Shared utilities (Redis client in `redis.ts`, auth helpers in `auth.ts`)
- `schemas/` - Zod schemas defining domain types:
  - `appState.ts` - User input state (schedules, cuisines, conditions)
  - `mealPlanResponse.ts` - AI response types (meals, shopping lists)
  - `persistedPlan.ts` - Saved plan format for Redis
- `config/defaults.ts` - App constants (cuisines, meal rules, banned ingredients, schedule defaults)
- `utils/` - Pure utility functions with tests
- `messages/` - i18n translation files (ru.json)

### Development Auth Bypass

Set `BYPASS_AUTH=true` in `.env.local` to skip Clerk auth. Never enable in production.

- `getAuthUserId()` in `lib/auth.ts` - Use this to get current user ID. Returns `DEV_USER_ID` ("dev-user") when bypass enabled, otherwise calls Clerk's `auth()`.

### Key Patterns

- **Path alias**: Use `@/` for root imports (e.g., `@/schemas/appState`)
- **Week keys**: Plans are keyed by ISO week format `YYYY-WW` (e.g., "2026-02")
- **Shopping item IDs**: Deterministic hash-based IDs for preserving checkbox state across regenerations
- **Schema parsing**: All external data is validated with Zod `safeParse()` before use

### Domain Model

- Two family members (hardcoded as "vitalik" and "lena" in `config/defaults.ts`)
- Weekly schedules with three meal slots per day: breakfast, lunch, dinner
- Each slot has status: "full" (cook), "coffee" (light), or "skip"
- Shopping lists split into trips with items categorized (dairy, meat, produce, etc.)

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

# alfred.food

Family meal planner app that uses AI (Claude) to generate weekly meal plans with shopping lists based on family schedules and cuisine preferences.

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **Clerk** for authentication
- **next-intl** for i18n (Russian)
- **Upstash Redis** for persistence
- **AI SDK** with Anthropic provider
- **Zod** for schema validation
- **Tailwind CSS v4**

## Prerequisites

- Node.js
- pnpm 10.28.0+

## Installation

```bash
pnpm install
```

## Environment Variables

Create a `.env.local` file with:

```
ANTHROPIC_API_KEY=your-api-key
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929  # optional
BYPASS_AUTH=true  # dev only, skip Clerk auth
```

## Development

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm tsc --noEmit # Type check
pnpm test         # Run Vitest in watch mode
pnpm test:run     # Run tests once (CI)
pnpm prettier --write .  # Format code
```

## How It Works

1. User fills form with schedule, cuisines, and conditions at `/new`
2. AI generates a meal plan for review
3. User accepts plan → AI generates shopping list → saves to Redis → redirects to home

## License

ISC

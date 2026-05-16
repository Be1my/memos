# memos

A modern, self-hostable memo/note-taking application — a lightweight alternative to services like [usememos/memos](https://github.com/usememos/memos). Write quick notes with a rich text editor, organize with tags, and share publicly if you'd like.

Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) and deployable to Cloudflare.

## Features

- **Rich text editor** — Powered by Lexical with floating toolbar, tag autocomplete, hashtag support
- **Memo management** — Create, edit, archive, and search your memos
- **Visibility control** — Private, public, or protected (password-protected) memos
- **Tags & filtering** — Organize memos with tags, filter by tag, date, or search query
- **Explore** — Browse public memos from other users
- **Inbox** — Receive notifications (comments, references)
- **Attachments** — Upload and manage file attachments (S3/R2/GCS/LOCAL)
- **Authentication** — Email/password auth powered by Better-Auth; role system (USER/ADMIN/HOST)
- **Internationalization** — i18n via Inlang/Paraglide (en, zh-Hans)
- **Themes** — Light, dark, paper, system
- **Dark mode** — Powered by next-themes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19, TanStack Start (SSR), TanStack Router |
| **Editor** | Lexical (rich text) |
| **Styling** | TailwindCSS v4, shadcn/ui |
| **Database** | PostgreSQL + Drizzle ORM |
| **Auth** | Better-Auth |
| **Infrastructure** | Cloudflare (Workers + Alchemy) |
| **Monorepo** | Turborepo + Bun |
| **i18n** | Inlang / Paraglide |
| **Linting** | Biome |

## Project Structure

```
memos/
├── apps/
│   └── web/                    # Fullstack application (React + TanStack Start)
│       ├── src/
│       │   ├── components/     # Shared UI components (sidebar, search panel)
│       │   ├── features/
│       │   │   ├── auth/       # Sign-in/sign-up flows
│       │   │   ├── editor/     # Rich text editor (Lexical)
│       │   │   ├── i18n/       # Internationalization setup
│       │   │   └── memos/      # Memo stats and queries
│       │   ├── functions/      # Server functions (RPCs)
│       │   ├── routes/         # TanStack Router routes
│       │   ├── middleware/     # Request middleware
│       │   └── lib/           # Utility libraries
│       └── messages/          # i18n translation files
├── packages/
│   ├── ui/                    # Shared shadcn/ui components
│   ├── auth/                  # Better-Auth configuration
│   ├── db/                    # Drizzle schema, migrations, queries
│   ├── env/                   # Environment variable schemas
│   ├── config/                # Shared TypeScript config
│   └── infra/                 # Cloudflare/Alchemy deployment config
└── docs/                      # Design specs and implementation plans
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.7
- PostgreSQL database

### Setup

```bash
# Install dependencies
bun install

# Copy environment file and configure your database
cp apps/web/.env.example apps/web/.env

# Push the schema to your database
bun run db:push

# Start the development server
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all applications in dev mode |
| `bun run build` | Build all applications |
| `bun run dev:web` | Start only the web application |
| `bun run check-types` | Check TypeScript types |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Drizzle client/types |
| `bun run db:migrate` | Run database migrations |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run check` | Run Biome formatting and linting |
| `bun run deploy` | Deploy to Cloudflare via Alchemy |
| `bun run destroy` | Destroy Cloudflare deployment |

## Deployment

The app is designed to deploy to Cloudflare Workers via [Alchemy](https://alchemy.run/).

```bash
bun run deploy
```

## UI Customization

Shared shadcn/ui primitives live in `packages/ui`. Add new components:

```bash
npx shadcn@latest add dialog popover sheet -c packages/ui
```

Import shared components:

```tsx
import { Button } from "@memos/ui/components/button";
```

App-specific blocks can be added from `apps/web`:

```bash
npx shadcn@latest add table -c apps/web
```

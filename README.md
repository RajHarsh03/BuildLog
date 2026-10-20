<div align="center">

# 🔨 BuildLog

### Personal Developer Journal

**Build. Learn. Document.** — MDX-rendered articles, GitHub-gated comments, and an OAuth-protected admin CMS in a neo-brutalist design system.

![Next.js 15](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=111111)
![TypeScript 5](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_8-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Auth.js v5](https://img.shields.io/badge/Auth.js_v5-GitHub_OAuth-7E22CE?style=flat-square)
![License](https://img.shields.io/badge/License-Private-999999?style=flat-square)

**[🚀 Quick Start](#-quick-start) · [⚙️ Environment](#-environment-variables) · [🗺️ Routes & API](#-routes) · [🛠️ Admin CMS](#-admin-cms-guide) · [☁️ Deploy](#-deploying-to-vercel)**

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#-environment-variables)
- [🔑 Setting Up GitHub OAuth](#-setting-up-github-oauth)
- [🗄️ Setting Up MongoDB](#-setting-up-mongodb)
- [📜 Available Scripts](#-available-scripts)
- [📁 Project Structure](#-project-structure)
- [🗺️ Routes](#-routes)
- [🛠️ Admin CMS Guide](#-admin-cms-guide)
- [📝 Content & MDX Pipeline](#-content--mdx-pipeline)
- [💬 Comments System](#-comments-system)
- [🎨 Design System](#-design-system)
- [📦 Build & Run in Production](#-build--run-in-production)
- [☁️ Deploying to Vercel](#-deploying-to-vercel)
- [🩺 Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Public site
- **Home** — featured article, latest posts, featured-project spotlight (wording follows the project's status: *Currently building* while `active`, *Recently shipped* once `shipped`), and newsletter callout. The site header carries the same status-aware *Now building / Just shipped* chip on desktop.
- **Articles** — filterable, paginated index (category + search) at `/articles`.
- **Article detail** — server-rendered MDX (GitHub-flavored markdown), optional cover image figure, Shiki syntax highlighting, auto-generated table of contents, reading time, share links, font-size toggle, and view counts.
- **Comments** — custom, GitHub-gated comment threads under every article **and** project case study (see [Comments System](#-comments-system)).
- **Slug-first breadcrumbs** — detail pages show the entry's (editable) URL slug, humanised (`my-short-url` → `My Short Url`), in the breadcrumb chip instead of the long title, so it never wraps or cuts mid-sentence.
- **Projects** — filterable browser at `/projects` (status + tech filters, deep-linkable as `/projects?tech=Next.js`) plus article-like case-study pages: an identical byline bar (author, date, computed reading time + word count, live view count, font-size toggle, share links), cover image, scroll-spy TOC rail with reading-progress meter, author card, comments, and Live Demo / GitHub actions (top-right on desktop, full-width on mobile).
- **About** — author bio, journey timeline, toolbelt, and the featured-build *On The Bench* card (also status-worded), all editable from the CMS.
- **Skeleton loading** — route-level `loading.tsx` fallbacks for the article/project lists and detail pages.
- **Dark mode** — light/dark toggle persisted in `localStorage` (`buildlog-theme`) and applied before first paint; default is light.
- **Command-palette search** — global search over published posts and projects (**Ctrl/Cmd+K**), backed by the public `/api/search` endpoint.
- **Toasts** — brutalist ink-bordered confirmations for every action (publish, archive, feature, delete, comment, reply, like, edit, link copy, history clear, sign in/out). Desktop-only (`sm+`); mobile stays clean. A "Signed in as …" greeting fires once per real sign-in, never on browser reopen.
- **SEO** — per-route metadata, Open Graph tags, canonical URLs, and JSON-LD (`Article` / `ProfilePage` / `ItemList`) on detail and index pages.

### Admin CMS (`/admin`)
- **GitHub OAuth login** (Auth.js v5) — no passwords stored anywhere.
- Optional **single-admin allowlist** via `ADMIN_EMAIL`.
- Dashboard with content stats and quick actions.
- Full **CRUD for posts and projects**: create, edit, publish/unpublish, feature/unfeature, archive, delete.
- **Publish-date control** — every post/project form has a date picker plus a **Today** button; pick an older date to back-date the entry (its `publishedAt` *and* creation date move, so lists and sorting treat it as published that day). Leaving it blank keeps the existing date / stamps "now" on publish.
- **Editable URL slug** — a Slug field under the title on both forms: leave it alone to auto-generate from the title, or type a short one (`/articles/bleve-search`). The field previews the live URL and warns that renaming breaks previously shared links.
- **Never lose a draft** — admin forms autosave to `localStorage` every ~0.7 s. Clicking away with unsaved edits raises an **Unsaved changes** dialog: *Save draft & leave* first persists a real draft in the CMS (posts → `draft`, projects → `archived`/private) and then navigates. Returning to the form restores the local copy with a toast; a successful save/publish clears it.
- **About page editor** — bio, journey milestones, and skills, all managed from `/admin/about`.
- **Comment moderation** (`/admin/comments`) — **Posts / Projects filter tabs**, threads grouped by source entry, reply / one-time like / inline edit / cascade delete, with counts that refresh live after every mutation (see [Comments System](#-comments-system)).
- Markdown editor with **live client-side preview** tab.
- Status workflow: posts `draft → published → archived`; projects `active ↔ shipped`, with `archived` as the private "shelved" state (hidden from the public site, like post drafts).
- Fully **responsive** — mobile-optimised lists, forms, and an icon-only admin nav.
- Protected by Edge middleware — unauthenticated visitors are redirected to `/login`.

---

## 🧰 Tech Stack

| Layer      | Technology |
| ---------- | ---------- |
| Framework  | Next.js 15 (App Router, React Server Components) |
| UI         | React 19, Tailwind CSS v4 (`@theme` design tokens) |
| Language   | TypeScript 5 (strict) |
| Database   | MongoDB via Mongoose 8 (content) + `mongodb` driver (Auth.js adapter) |
| Auth       | Auth.js v5 (`next-auth` beta) with GitHub provider + MongoDB adapter, JWT sessions |
| Content    | MDX (`next-mdx-remote/rsc`) with `remark-gfm`, `rehype-pretty-code` (Shiki) |
| Validation | Zod 3 (API + admin form payloads) |
| Tooling    | ESLint 9 (`eslint-config-next`), `tsx` for seeding |

---

## 📋 Prerequisites

- **Node.js ≥ 20** (LTS recommended) and npm
- **MongoDB** — either a local server (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **GitHub account** — for the OAuth app that powers admin login
- A Git client (optional, for cloning)

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/RajHarsh03/BuildLog.git
cd BuildLog
```

> Starting from an un-versioned folder instead? Initialize and push it first:
>
> ```bash
> git init
> git add .
> git commit -m "BuildLog initial commit"
> git branch -M main
> git remote add origin <your-repo-url>
> git push -u origin main
> ```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
# Linux / macOS
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

Then edit `.env.local` — see [Environment Variables](#-environment-variables) below.
The minimum for browsing the public site is `MONGODB_URI`; the admin CMS additionally needs the four `AUTH_*` values.

### 4. Seed the database (optional but recommended)

```bash
npm run seed
```

Loads **11 sample articles and 6 projects** (rich MDX content with code blocks and tables).
⚠️ **The seed script is destructive**: it empties the `posts` and `projects` collections before inserting, so re-running it resets all content to the sample data.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the public site.
The admin CMS lives at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## ⚙️ Environment Variables

All variables are documented in [`.env.example`](.env.example).

| Variable | Required | Description |
| -------- | :------: | ----------- |
| `MONGODB_URI` | Yes (for content) | MongoDB connection string. Local: `mongodb://127.0.0.1:27017/buildlog` · Atlas: `mongodb+srv://…` |
| `AUTH_SECRET` | Yes (for admin) | Long random string used to sign JWT sessions. Generate: `openssl rand -base64 32`, or on PowerShell: `[Convert]::ToBase64String([System.Security.RandomNumberGenerator]::GetBytes(32))` |
| `AUTH_GITHUB_ID` | Yes (for admin) | Client ID of your GitHub OAuth App |
| `AUTH_GITHUB_SECRET` | Yes (for admin) | Client secret of your GitHub OAuth App |
| `ADMIN_EMAIL` | No | If set, only this email (your GitHub account email) may access `/admin` and the mutating API routes. Leave blank to allow any authenticated GitHub user |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site origin used in metadata/JSON-LD. Default `http://localhost:3000` |
| `NEXT_PUBLIC_AUTHOR_NAME` | No | Author byline used by seed content and article pages |
| `NEXT_PUBLIC_AUTHOR_HANDLE` | No | Author handle (e.g. `@harshxdotin`) |
| `NEXT_PUBLIC_AUTHOR_WEBSITE` | No | Personal site the handle links to across the UI (default `https://harshx.in`) |
| `NEXT_PUBLIC_GITHUB_USERNAME` | No | GitHub account the avatar is auto-synced from (default `RajHarsh03`) |
| `NEXT_PUBLIC_AUTHOR_AVATAR` | No | Override avatar URL. Leave blank to auto-fetch from `NEXT_PUBLIC_GITHUB_USERNAME` (`github.com/<user>.png` always redirects to the current profile photo) |

Notes:
- In development, a fallback secret is used automatically if `AUTH_SECRET` is missing — **always set it in production**.
- Without `MONGODB_URI` the public pages still render (with empty content states), but admin and API routes cannot function.

---

## 🔑 Setting Up GitHub OAuth

1. Go to **GitHub → Settings → Developer settings → [OAuth Apps](https://github.com/settings/developers)** → *New OAuth App*.
2. Fill in:
   - **Application name**: `BuildLog` (anything)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click *Register application*, then *Generate a new client secret*.
4. Copy the **Client ID** → `AUTH_GITHUB_ID` and the **Client secret** → `AUTH_GITHUB_SECRET` in `.env.local`.
5. Restart `npm run dev`, visit `/admin`, and sign in with GitHub.
6. (Recommended) Set `ADMIN_EMAIL` to your GitHub account's email so only you can administer the site.

For production, register a second OAuth App (or edit the existing one) with your production origin, e.g. `https://your-domain.com/api/auth/callback/github`.

---

## 🗄️ Setting Up MongoDB

### Option A — Local server
Install MongoDB Community Server, ensure the service is running, then use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/buildlog
```

### Option B — MongoDB Atlas (recommended, required for Vercel)
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and copy the connection string.
3. Under *Network Access*, allow your IP (or `0.0.0.0/0` for development convenience).
4. Paste the string into `MONGODB_URI`, including the database name, e.g.:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/buildlog
```

Auth.js collections (`users`, `accounts`, `sessions`, `verification_tokens`) are created automatically on first sign-in. Content lives in `posts`, `projects`, `about`, and `comments`, all created on first write.

---

## 📜 Available Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Next.js dev server with **Turbopack** at `http://localhost:3000` |
| `npm run build` | Production build (type-safe routes, static/dynamic analysis) |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` strict type checking |
| `npm run seed` | Wipe + load sample posts/projects into MongoDB (see warning above) |

---

## 📁 Project Structure

```
BuildLog/
├── app/
│   ├── (site)/                 # Public site (shared header/footer layout)
│   │   ├── page.tsx            #   Home
│   │   ├── about/              #   About / bio
│   │   ├── articles/           #   Article index (filters + pagination)
│   │   │   └── [slug]/         #   Article detail (MDX + TOC + JSON-LD)
│   │   ├── projects/           #   Project browser
│   │   │   └── [slug]/         #   Project case study
│   │   └── not-found.tsx       #   Public 404 within site chrome
│   ├── (auth)/
│   │   └── login/              # GitHub OAuth sign-in page
│   ├── admin/                  # CMS (middleware-protected)
│   │   ├── layout.tsx          #   Server-side auth guard + admin nav
│   │   ├── page.tsx            #   Dashboard (stats, recent content)
│   │   ├── posts/              #   List / new / [id]/edit
│   │   ├── projects/           #   List / new / [id]/edit
│   │   ├── about/              #   About-page editor
│   │   └── comments/           #   Comment moderation
│   ├── api/
│   │   ├── auth/[...nextauth]/ #   Auth.js endpoint
│   │   ├── posts/ [id]/view/   #   REST CRUD (Zod-validated, admin-only) + view counter
│   │   ├── projects/ [id]/     #   REST CRUD (Zod-validated, admin-only) + view counter
│   │   ├── about/              #   About document (GET/PUT)
│   │   ├── search/             #   Command-palette search (public)
│   │   └── comments/ [id]/ like/ # Comments REST (public read, gated write, admin mod)
│   ├── layout.tsx              # Root layout (fonts, global metadata)
│   ├── globals.css             # Tailwind v4 @theme tokens + MDX styles
│   └── not-found.tsx           # Root 404
├── components/
│   ├── ui/                     # Button, Badge, StatusBadge (CVA variants)
│   ├── layout/                 # SiteHeader, SiteFooter, NavLinks, SiteSearch
│   ├── blog/                   # ArticleCard, CodeBlock, TableOfContents, Comments, …
│   ├── projects/               # ProjectCard, ProjectsBrowser
│   ├── home/                   # CurrentlyBuilding, TypingStatus
│   ├── shared/                 # Icon, Breadcrumbs, ThemeToggle, BackToTop
│   └── admin/                  # Forms, row actions, nav, markdown preview, SelectDropdown,
│                               #   AdminComments, LoginError, useFormAutosave (draft safety-net)
├── lib/
│   ├── auth/                   # auth.ts, auth.config.ts (edge-safe), guard.ts
│   ├── client/                 # formGuard.ts (unsaved-changes flag + DB draft-saver registry)
│   ├── content/                # Query + CRUD helpers (posts, projects, about, comments, featured)
│   ├── db/                     # mongodb.ts (Mongoose), mongo-client.ts (driver), models/
│   ├── mdx/render.ts           # compileMDX + TOC plugin + Shiki config
│   └── utils.ts                # cn(), slugify(), prettifySlug(), formatDate(), readingTime…
├── public/                     # Static assets (wordmark logo)
├── scripts/seed.ts             # Sample content loader (11 posts, 6 projects)
├── schemas/                    # Zod payloads (post, project, about)
├── types/                      # Post/Project/Comment/About types + next-auth augmentation
├── middleware.ts               # Edge auth guard for /admin/*
├── .vscode/                    # Tailwind v4 lint suppression + extension recommendations
├── DESIGN.md                   # Neo-brutalist design specification
└── .env.example                # Documented environment template
```

---

## 🗺️ Routes

### Public
| Route | Purpose |
| ----- | ------- |
| `/` | Home: featured article, latest posts, featured-project spotlight |
| `/about` | Author bio, timeline, toolbelt |
| `/articles` | Article index with category filter, search, pagination, and a recently-viewed strip |
| `/articles/[slug]` | Article detail: MDX body, TOC, share, view tracking, comments, related posts |
| `/projects` | Project browser with status/tech filters (`?tech=` deep links) |
| `/projects/[slug]` | Project case study: MDX narrative, TOC rail, author card, comments |

### Auth & Admin
| Route | Purpose |
| ----- | ------- |
| `/login` | GitHub OAuth sign-in |
| `/admin` | Dashboard: stats, recent posts, quick actions |
| `/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]/edit` | Post management |
| `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]/edit` | Project management |
| `/admin/about` | About-page editor (bio, milestones, skills) |
| `/admin/comments` | Comment moderation (Posts/Projects tabs; threads grouped per post or project) |

### REST API (admin-only, session-checked)
| Route | Methods |
| ----- | ------- |
| `/api/auth/[...nextauth]` | Auth.js handshake endpoints |
| `/api/posts` | `GET` (all, any status) · `POST` (create) |
| `/api/posts/[id]` | `GET` · `PATCH` (partial update) · `DELETE` |
| `/api/projects` | `GET` · `POST` |
| `/api/projects/[id]` | `GET` · `PATCH` · `DELETE` |
| `/api/about` | `GET` · `PUT` (single-document about page) |
| `/api/comments/[id]` | `DELETE` (cascade to replies) · `PATCH` (edit body) — admin only |
| `/api/comments/like` | `POST` — one-way like, admin only |

### Public API
| Route | Methods |
| ----- | ------- |
| `/api/posts/[id]/view` | `POST` — increments a post's view count (public; the client de-dupes with a 30-minute cooldown) |
| `/api/projects/[id]/view` | `POST` — increments a project case study's view count (same public cooldown pattern as posts) |
| `/api/search?q=` | `GET` — returns up to 5 published posts + 5 projects matching the query (powers the command palette; no auth) |
| `/api/comments?postId=` | `GET` (threaded comments for an article or project; no auth) · `POST` (comment/reply — **requires GitHub session**; site owner is exempt from the cooldown) |

Unauthenticated calls to the admin-only API routes receive `401 Unauthorized`; invalid payloads receive `400` with Zod issues.

---

## 🛠️ Admin CMS Guide

1. Start the app with valid `MONGODB_URI` + `AUTH_*` variables.
2. Visit `/admin` → you are redirected to `/login` → click **Continue with GitHub**.
3. On first sign-in, Auth.js creates your user document in MongoDB and issues a JWT session (stored in an http-only cookie).
4. **Posts**: title, **slug** (editable; auto-derived from the title if left blank), excerpt, category, tags, cover image, status (`draft`/`published`/`archived`), featured flag, **publish date** (back-date + Today button), SEO title/description, and the MDX body. The **Preview** tab renders the markdown client-side as you type.
5. **Projects**: name, **slug**, description, technologies, image, GitHub/live URLs, status (`active`/`shipped`/`archived`), featured flag, **publish date**, MDX case-study body. The row actions include an archive button that hides the project from every public page.
6. **About**: bio text, journey milestones (year/title/description), and the skills grid — edited as a single document.
7. **Comments**: switch between the **Posts** and **Projects** tabs, expand an entry's accordion to see its threads (newest activity first); like once, reply once, edit your replies via the ⋮ menu, or trash a whole thread. Every mutation toasts and updates the counts instantly.
8. Row actions on the list pages let you publish/unpublish, feature, and delete (with two-step confirm) without opening the editor.
9. Sign out from the admin top bar.

Draft-safety is always on while editing: forms autosave locally, and leaving an unsaved form through the admin nav offers to persist a real draft to the CMS before navigating away.

Only `published` posts appear on the public site; drafts and archived posts stay inside the CMS. Likewise, `archived` projects are excluded from the browser, search, featured spotlight, prerender, and their detail URLs 404.

---

## 📝 Content & MDX Pipeline

Article and project bodies are stored as **MDX strings in MongoDB** and compiled at request time by [`lib/mdx/render.ts`](lib/mdx/render.ts):

- `remark-gfm` — tables, task lists, strikethrough.
- `rehype-pretty-code` (Shiki, dual `github-light` / `github-dark` themes, transparent background) — tokenized code blocks styled by the neo-brutalist `.code-block` terminal chrome with a copy button. The correct theme swaps automatically via CSS when dark mode is active, with no re-render.
- A custom rehype plugin assigns **heading ids with the app's own `slugify`** and collects the **table of contents** in the same pass, guaranteeing TOC anchors always match rendered headings. The TOC renders its own `01/02` index and strips any manual leading numbering (`1.`, `2)`) from the displayed heading text — ids keep the full text, so anchors never break.

Supported markdown in the editor: headings, paragraphs, GFM tables, fenced code with language tags, blockquotes, ordered/unordered lists, links, images, bold/italic/inline code.

**Inline images**: drop a `![alt](https://…)` line anywhere in the body (or a plain `<img>` for size/alignment control). Any hosted URL works — e.g. ImageKit — and images automatically get the ink-border + hard-shadow treatment at the prose width.

---

## 💬 Comments System

A MongoDB-backed comment engine — no third-party widgets. Comments live in the `comments` collection (`postId`, `parentId`, `body`, author snapshot, `likedBy`/`likedByNames`) and are exposed through `/api/comments*`.

### For readers (article & project pages)
- **GitHub gate** — signed-out visitors see a sign-in banner; the composer only renders for authenticated GitHub users.
- Threaded replies with a collapsible **Replies** toggle per thread.
- The **3 newest threads** are shown; older discussion stays in the DB and the moderation queue.
- Admin likes surface as a heart badge on the public comment.
- Reader comments are **read-only** on the public site; moderation is admin-side.
- Anti-spam: 60-second posting cooldown per user + Zod length validation (2–2000 chars). The site owner (`ADMIN_EMAIL`) is exempt, so replying right after commenting works instantly.

### For the owner (`/admin/comments`)
- **Posts / Projects tabs** — moderate article and case-study threads separately, each tab showing its live comment count.
- Threads grouped per post, sorted by latest activity; posts with no activity for 7 days collapse under an `Older (N)` toggle.
- **Like** — admin-only, one-time, permanent (no unlike endpoint).
- **Reply** — one reply per comment.
- **Edit / Delete** — replies support inline edit and delete; deleting a root comment cascade-deletes the whole thread.
- Author identity (GitHub login + avatar) is captured at sign-in via the JWT `profile.login` claim, with an avatar-URL fallback for pre-existing sessions.

---

## 🎨 Design System

The visual language is **neo-brutalism**, specified in [`DESIGN.md`](DESIGN.md) and tokenized as Tailwind v4 `@theme` variables in [`app/globals.css`](app/globals.css):

- **Ink borders**: 2px solid `var(--color-ink)` on every surface and control.
- **Hard shadows**: zero-blur offsets (`4px 4px 0px var(--color-ink)`); hover lifts elements `-2px/-2px` with a `6px` shadow; active presses `+4px/+4px` with no shadow.
- **Layout shell**: public pages are full-bleed — a single `px-5 sm:px-8` wrapper (20px mobile / 32px desktop edge gutters) with no forced centered column, matching the prototype. Article/project prose keeps a left-aligned 720px reading measure beside the TOC rail; the home view caps its inner content at `max-w-7xl`. The admin CMS body stays centered (`max-w-7xl`) for table readability.
- **Palette**: warm paper surfaces with a vermilion primary (`#AB2F00`) plus Material-style semantic tokens (`surface`, `on-surface`, `primary`, `secondary-fixed-dim`, …).
- **Dark mode**: a `.dark` block overrides ~50 of those `@theme` tokens (surfaces, ink, badges flip), so every token-driven utility — and the ink shadows/borders above — inverts automatically. Boundaries that are meant to stay dark (the hero terminal) use literal colors instead of tokens.
- **Typography**: *Newsreader* serif for display headings and article prose, *Plus Jakarta Sans* for UI/body, *JetBrains Mono* for code and mono labels, plus Material Symbols Outlined icons — all self-hosted via `next/font` (see [`app/layout.tsx`](app/layout.tsx)).
- **Toasts** — one shared provider (`components/shared/Toast.tsx`) renders a bottom-right stack: ink border, `4px 4px` hard shadow, mono text, slide-up entrance, 2.8s auto-dismiss. Hidden below `sm` (640px) — mobile shows no toasts at all.

All components consume these tokens — never hardcode hex values in components (the always-dark terminal chrome is the one deliberate exception).

---

## 📦 Build & Run in Production

```bash
npm run build   # compiles, type-checks routes, prerenders static pages
npm run start   # serves the production build on PORT (default 3000)
```

Production checklist:
- [ ] `AUTH_SECRET` set to a strong random value (no dev fallback in production).
- [ ] `MONGODB_URI` points at Atlas (or a reachable managed instance).
- [ ] `NEXT_PUBLIC_SITE_URL` set to the public origin (used for canonicals/OG/JSON-LD).
- [ ] GitHub OAuth callback registered for the production origin.
- [ ] `ADMIN_EMAIL` set to lock the CMS to your account.

---

## ☁️ Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel (framework preset: **Next.js**).
2. Add all environment variables from `.env.example` in *Project → Settings → Environment Variables* (set `NEXT_PUBLIC_SITE_URL` to the Vercel domain).
3. In MongoDB Atlas *Network Access*, allow the Vercel egress IPs (or `0.0.0.0/0`).
4. Deploy. Run the seed once against Atlas from your machine (`npm run seed` with the Atlas URI in `.env.local`) or via a temporary API task.
5. Register the Vercel domain as the GitHub OAuth callback URL.

The Edge middleware and Auth.js config already set `trustHost`, so no extra proxy configuration is needed on Vercel.

---

## 🩺 Troubleshooting

| Symptom | Cause & fix |
| ------- | ----------- |
| IDE shows `Cannot find module '@/…'` but `npm run typecheck`/`build` pass | Stale TypeScript language server. Command Palette → **TypeScript: Restart TS Server** (or reload the window). The code is fine — don't change imports. |
| Browser still shows the old layout/classes after an edit | Verify what the server actually sends: look for the class string in `(Invoke-WebRequest http://localhost:3000).Content`. If it's old, make sure the file was saved to disk (editor buffers can differ from disk), run only **one** dev server per project (two servers sharing `.next` cause `2.pack.gz_` ENOENT cache warnings), and if it's still stuck stop the server, delete `.next`, and restart. |
| `Unknown at rule @theme` warning in `globals.css` | VS Code's built-in CSS validator doesn't know Tailwind v4 at-rules. Harmless; already silenced via `.vscode/settings.json`. Install the *Tailwind CSS IntelliSense* extension for full support. |
| Public pages render but show no content | `MONGODB_URI` missing/unreachable, or DB not seeded. Fix the URI and run `npm run seed`. |
| `/admin` redirects to `/login` in a loop after signing in | Missing/invalid `AUTH_SECRET`, or callback URL mismatch in the GitHub OAuth App. Check both, then restart the dev server. |
| Sign-in works but `/admin` still denies access | `ADMIN_EMAIL` is set to a different email than your GitHub account's. Update or clear it. |
| Article page shows "join the discussion" instead of the comment box | Expected — comments require a GitHub session (same OAuth as the CMS). Sign in from the banner; the composer appears after the session resolves. |
| `POST /api/comments` returns `429` | The 60-second per-user posting cooldown is active. Wait a minute and retry. |
| `npm run seed` removed my articles | Expected: the seed wipes `posts`/`projects` first. Re-create content via the CMS, or don't re-run the seed against real data. |
| Build fails on CSS minification with `Parser.attribute` error | A substring attribute selector (e.g. `code[data-theme*=" "]`) crashes Next's cssnano. Avoid `*=` selectors on attributes containing spaces in `globals.css`. |

---

## 📄 License

Private personal project — all rights reserved.

---

<div align="center">

© 2026 Harsh · <a href="#-buildlog">Back to top ↑</a>

</div>

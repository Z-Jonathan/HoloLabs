# Holo

Marketing + waitlist landing page for **Holo** — a real-time sign language
translator — plus **Holo Studio** (`/studio`), a working prototype of the
product itself: you sign into your camera and a 3D avatar signs back.

> The landing page's two-panel visual is a stylized mockup. The real
> two-panel app lives at **`/studio`** — see [Holo Studio](#holo-studio-studio)
> below for what it genuinely does (and honestly doesn't) do.

Built with **Next.js (App Router)**, **TypeScript** (strict), **Tailwind CSS**,
**Framer Motion** (`motion/react`), and **Lenis** smooth scrolling. Design
direction: "Liquid Glass" — deep dark canvas, animated aurora mesh, frosted
translucent surfaces.

## Features

- Animated gradient-mesh background with parallax + grain overlay
- Liquid-glass design tokens and reusable components (`GlassCard`,
  `GradientBackground`, `Reveal`, `CTAButton`)
- Scroll-triggered reveals, sticky blur-ramping nav, parallaxing concept mockup
- Fully working email waitlist backed by **Supabase**, with graceful **demo
  mode** when no backend is configured
- Accessibility first: keyboard navigation, visible focus, semantic landmarks,
  `aria-live` form status, and full `prefers-reduced-motion` support

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The site runs out of the box — with no Supabase
credentials the waitlist uses **demo mode** (submissions are validated and
logged server-side, and the user sees a success state).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
npm run format  # Prettier
```

## Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, **New Project → Import** the repo. Framework preset auto-detects
   **Next.js**; no build configuration changes are needed.
3. Click **Deploy**. The site builds and runs with **zero environment
   variables** (waitlist runs in demo mode).
4. To persist real signups, add the Supabase env vars below
   (**Project → Settings → Environment Variables**) and redeploy.

## Enable real waitlist storage (Supabase)

### 1. Create the table

In the Supabase **SQL Editor**, run:

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
```

### 2. Enable Row Level Security

Writes go through the **service role** key on the server, which bypasses RLS.
Enabling RLS with no public policies keeps the table locked down to anonymous
clients while still allowing server-side inserts:

```sql
alter table public.waitlist enable row level security;

-- Optional: an explicit insert policy. The server uses the service role
-- (which bypasses RLS), so this is only needed if you ever insert with the
-- anon key from a trusted context.
create policy "Allow inserts to waitlist"
  on public.waitlist
  for insert
  with check (true);
```

> Do **not** add a public `select` policy — signups should not be readable by
> anonymous clients.

### 3. Add the keys

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
```

- `NEXT_PUBLIC_SUPABASE_URL` — **Project Settings → API → Project URL**
- `SUPABASE_SERVICE_ROLE_KEY` — **Project Settings → API → `service_role`
  secret**

> ⚠️ The `service_role` key is **server-only**. It is read exclusively inside
> the API route handler (`app/api/waitlist/route.ts`) and is never exposed to
> the browser. Never prefix it with `NEXT_PUBLIC_`.

In Vercel, paste the same two variables under **Settings → Environment
Variables**, then redeploy.

## Holo Studio (`/studio`)

A self-contained prototype of the real product on its own route (the landing
page is untouched and doesn't link to it yet).

### What it does — honestly

Full continuous sign-language translation is an unsolved research problem, and
the major word-level ASL datasets (WLASL, MS-ASL, How2Sign) are licensed for
research only — unusable in a product. Within those constraints, Studio
genuinely does:

- **Sign input:** webcam → MediaPipe Hand Landmarker (in-browser WASM — video
  never leaves the device) → a geometric classifier for the **static ASL
  fingerspelling alphabet** (J and Z need motion; type those). Hold a letter
  briefly to commit it; leave the frame to add a space. Typed text is an
  equal-class input.
- **Conversation:** replies come from **Claude** (`/api/respond`, server-side
  `ANTHROPIC_API_KEY` only). Without a key it falls back to canned demo
  replies, so the site still works with zero env vars.
- **Sign output:** a 3D **VRM avatar** (CC0 model, `@pixiv/three-vrm`) signs
  each reply — a starter library of one-handed sign approximations (HELLO,
  THANK YOU, YES, NO, PLEASE, SORRY, ME, YOU, GOOD, WELCOME) plus
  fingerspelling for everything else, with synchronized captions always shown.
  The sign clips are legible prototype gestures, **not certified ASL**.

### Studio assets

`npm run dev` / `npm run build` automatically run
`scripts/prepare-studio-assets.mjs`, which copies the MediaPipe WASM runtime
out of `node_modules` and downloads the hand-landmark model and the CC0 avatar
into `public/` (all gitignored). This also runs on Vercel — no manual step.

### Studio accessibility

- Every state (camera permission, model loading, hand tracking, avatar) is
  shown as visible text badges with `role="status"` — never sound or color
  alone. The transcript is an `aria-live` region.
- Captions accompany all signed output; typed input is always available as a
  fallback when recognition struggles.
- `prefers-reduced-motion` disables decorative motion (avatar breathing/sway);
  signing itself is content and remains.

### Third-party components & licenses

| Component | License |
| --- | --- |
| `@mediapipe/tasks-vision` + hand landmarker model | Apache-2.0 |
| `three`, `@pixiv/three-vrm`, `@anthropic-ai/sdk` | MIT |
| Avatar model (`masc_vroid.vrm`, [madjin/vrm-samples](https://github.com/madjin/vrm-samples)) | CC0 |

## How the waitlist works

- `POST /api/waitlist` validates the email server-side, applies a honeypot
  spam check, and inserts into the `waitlist` table.
- Duplicate emails (unique-constraint violation, Postgres `23505`) return a
  friendly "you're already on the list" success rather than an error.
- If the Supabase env vars are missing, the route falls back to **demo mode**:
  it logs the email and returns success, so the deployed site always works.

## Project structure

```
app/
  layout.tsx              Metadata, OG tags, fonts, background, smooth scroll
  page.tsx                Composes all sections
  globals.css             Tokens, glass utilities, reduced-motion rules
  api/waitlist/route.ts   Server validation + Supabase insert + demo fallback
  lib/
    supabase.ts           Server-only Supabase client (null when unconfigured)
    useReducedMotion.ts   prefers-reduced-motion hook
  components/             Nav, Hero, ConceptMockup, HowItWorks, Features,
                          Waitlist, Footer, and the reusable glass primitives
public/                   icon.svg, og.svg
```

## Accessibility & motion

- Respects `prefers-reduced-motion`: parallax and large motion are disabled and
  replaced with short fades; Lenis smooth scrolling is turned off entirely.
- Form status is announced via `aria-live`; state is never conveyed by color
  alone (icons + text accompany every state).
- Semantic landmarks, logical heading order, and visible focus rings tuned for
  legibility over translucent glass.

We use the terms **"Deaf community"** and **"sign language"** throughout.

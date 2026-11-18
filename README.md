# MathWorld Frontend

Next.js frontend for the MathWorld platform, including the public learning experience, student dashboard, and administration screens.

## Requirements

- Node.js 20 or newer
- pnpm with Corepack enabled
- A running MathWorld API

## Environment

Copy the example environment file:

```powershell
Copy-Item .env.example .env.local
```

Configure the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://mathwordbackend.onrender.com/api
```

## Install and run

```powershell
corepack enable
pnpm install
pnpm dev
```

The development server is available at `http://localhost:3000`.

## Validation

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

## Math content format

Mixed text and mathematical expressions are rendered with KaTeX.

- Inline expressions: `$x^2 + 1$`
- Block expressions: `$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$`
- Answer options contain raw LaTeX, such as `\frac{1}{2}`.

Question text, generated problem titles, detailed solutions, answer options, dashboard activities, and problem cards all use the shared math rendering components.

## Search

PostgreSQL is the default search engine. MeiliSearch is requested only when explicitly selected and enabled on the backend.

## QA testing against an isolated backend

To try the latest development UI and student/admin flows **without modifying production data**, use a dedicated staging API and database:

```powershell
Copy-Item .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL to the isolated https://STAGING-HOST/api.
corepack enable
pnpm install --frozen-lockfile
pnpm qa:preflight
pnpm qa:dev
```

Open `http://localhost:3000/ar` or `http://localhost:3000/en`. `pnpm qa:dev` rejects missing or known production API endpoints.

The existing public Vercel/Netlify site is **not** a verified preview of this branch; its Vercel commit status currently says the build was ignored. For Android staging-only APK, a bilingual test matrix and safe backend prerequisites, see [START_TESTING_WEB_AND_ANDROID.md](docs/START_TESTING_WEB_AND_ANDROID.md). No payment, ads, content publication or production migration is enabled by this process.

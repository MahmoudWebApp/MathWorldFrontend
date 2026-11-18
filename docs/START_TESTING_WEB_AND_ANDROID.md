# MathWorld — start testing the web app and Android safely

**Development QA playbook — 2026-11-15.** These steps do not merge branches, deploy production or modify live Supabase records.

## What is actually available

| Surface | Current checkpoint | Safe to use against production? |
| --- | --- | --- |
| Web feature branch | `MahmoudWebApp/MathWorldFrontend`, `feature/premium-entitlements-client`, PR #18; Next.js CI green | **No write testing:** published Netlify/Vercel site may still be based on `main`. The branch's Vercel status says **Canceled by Ignored Build Step**, not a deployed preview |
| Flutter feature branch | `MahmoudWebApp/mathworld-mobile`, `feature/premium-entitlements-client`, PR #12 | The existing debug-signed release-mode APK artifact runs with `.env.example` and defaults to **production Render API**, so do not use it for answer submissions/admin tests |
| Backend feature branch | `MahmoudWebApp/MathWordBackEnd`, `feature/premium-entitlement-foundation`, PR #20 | Disposable PostgreSQL integration CI passed. It has **not** been asserted that this branch or its schema changes are deployed to the public API |

The QA APK built by GitHub Actions is downloadable from:
https://github.com/MahmoudWebApp/mathworld-mobile/actions/runs/43730687183

Open the run, scroll to **Artifacts**, download `mathworld-android-qa-release-mode-debug-signed`, unzip it, and install `app-release.apk` on an Android test device. This artifact is for launcher/layout inspection only until the API is isolated. GitHub sign-in may be required to download Actions artifacts. **Not Google Play signed.** The artifact expires according to GitHub retention.

## Required: one dedicated staging API and database

Before practicing, granting Premium, publishing content, testing notifications or changing admin settings, create a **separate staging backend and PostgreSQL database** running the backend feature branch and migrations. Do not reuse any production database credentials or live Render/Supabase data, even if the web/mobile client has a different URL.

The requested staging URL must look like `https://<your-staging-host>/api`. Never place JWT secrets, database connection strings, or OAuth client secrets in web `NEXT_PUBLIC_*` values, Flutter `.env` or GitHub Actions input/variables.

### Run the newest web features locally

```powershell
git clone --branch feature/premium-entitlements-client https://github.com/MahmoudWebApp/MathWorldFrontend.git
cd MathWorldFrontend
Copy-Item .env.example .env.local
```

In `.env.local`, change `NEXT_PUBLIC_API_BASE_URL` to the actual **staging backend** (the default production Render URL is prohibited for QA). Keep social auth OFF until configured:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://YOUR-ISOLATED-STAGING-HOST/api
NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED=false
```

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm qa:preflight
pnpm qa:dev
```

Open `http://localhost:3000/ar` or `http://localhost:3000/en`.

The new `pnpm qa:preflight` and `pnpm qa:dev` commands **stop** if the URL is empty, malformed or one of the known production endpoints. This is a configuration check only: review the actual staging service's database connection before using any write action.

**Hosted preview:** Vercel currently ignores deployments of this feature branch. A true hosted QA website requires a separate Vercel Preview (or equivalent) connected to this branch, configured with the isolated `NEXT_PUBLIC_API_BASE_URL`. Do **not** point a preview build to production. Do not confuse a passed GitHub Actions `next build` with a published Preview URL.

### Build an Android app pointed at staging (recommended)

A new feature-branch workflow exists: `.github/workflows/android-staging-qa-apk.yml` ("Android staging QA APK (explicit API, debug-signed)"). It deliberately refuses the known live API host.

Because GitHub can dispatch a **new** workflow manually only after its YAML exists on the default branch, the **safe no-merge route** is:

1. In **GitHub repository Settings → Secrets and variables → Actions → Variables**, add a *repository variable* `MATHWORLD_STAGING_API_URL` with the full HTTPS staging API URL ending in `/api`. This endpoint URL is not a secret.
2. In the mobile PR's branch, change/push a relevant source file or workflow to trigger its pull-request workflow (a new push also triggers it). **Do not merge PR #12 to main** to activate the workflow.
3. Open the **Actions** workflow and check that "Android staging QA APK (explicit API, debug-signed)" completed with a real successful **staging-android** job, not just a skipped job.
4. Under its successful run's **Artifacts**, download `mathworld-staging-qa-apk-debug-signed`. Install `app-release.apk` on a test Android phone.
5. In the app, confirm the visible **QA** ribbon at the top. Then verify the backend actually points at the isolated staging database, not a live one.

The staging APK uses release-mode compilation **but debug signing**, and defaults to social login OFF. It retains the current Android application ID, so installing it may replace an existing installed MathWorld build; use a test device or back up app data first.

## Bilingual hands-on acceptance matrix

Use newly created **staging-only** student and admin accounts.

| Scenario | Expected result |
| --- | --- |
| First login / change learning stage | Current stage persists; switching stage does not delete solved history or points |
| Free student, each educational stage | Exactly **two** backend-authorized categories unlocked, all their questions repeatable without any daily ten-problem limit |
| Attempt a locked category using a direct link/API | Backend denies unauthorized access; client does not mislead with a playable category |
| Premium student (admin grant in staging) | Can access all categories without a daily limit; can see worked solution before submitting |
| Practice and revisit problems | Correct option and explanation appear only under the account's entitlement; points, progress and error notebook update correctly |
| Journey and leaderboard | Stage-specific solved counts, points and recommended **unlocked** topics; accurate stage-separated rankings |
| Student analytics | Privacy-enforced personal report data; XLSX/PDF outputs display Arabic and English, export to Android correctly |
| Notifications | Mark one/all as read; pagination and last-30-day inbox; real-time push/SignalR are **not** implemented |
| Admin content queue | CSV preview, draft review and approval do not publish automatically. Never publish unreviewed MathWorld drafts |
| UI and launcher | Arabic RTL, English LTR, 320px web width, Android compact/large fonts, landscape as supported, light/dark, external home-screen logo and splash with no black square |

**Content warning:** 320 bilingual questions are development **drafts**, ten per 32 categories. They have passed automated structural checks, **not** independent educator review; 16 categories are uncreated proposals. Do not expect all 320 questions in the live app.

**OAuth warning:** Google/Facebook login is not ready for real-device acceptance until provider IDs, Android SHA certificates and backend validation are configured; keep test login email/password for now.

## Reporting a bug

Record the device/browser, OS version, language, stage and category, exact path/action, what appeared versus expected, and screenshots or short clips **without passwords, tokens or student personal data**. Include the web feature-branch commit SHA or the GitHub APK workflow run ID. A green build does not prove the interaction worked on a physical device.

## Release boundary

No `main` merge, production database migration/import, live payment or ad enablement is covered by this QA guide. After preview testing, a separate owner-approved launch can be planned.

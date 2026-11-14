# MathWorld — delivery tracker (14 November 2026)

> This document tracks the **feature branches**, not deployed production. A green CI build is not proof of a feature being deployed or tested end to end.

## Branches and pull requests

| Surface | PR | Branch |
| --- | --- | --- |
| ASP.NET Backend | [#20](https://github.com/MahmoudWebApp/MathWordBackEnd/pull/20) | `feature/premium-entitlement-foundation` |
| Next.js Web | [#18](https://github.com/MahmoudWebApp/MathWorldFrontend/pull/18) | `feature/premium-entitlements-client` |
| Flutter Mobile | [#12](https://github.com/MahmoudWebApp/mathworld-mobile/pull/12) | `feature/premium-entitlements-client` |

## Confirmed on development branches — not yet merged/deployed

- Web: fixed duplicate category-access API endpoints and RTK hooks; typecheck + production build passed.
- Backend: fixed EF snapshot relationships; PostgreSQL workflow suites including schema drift, stage journey, problem integrity, analytics and admin learner integration passed.
- Entitlements: two free categories per learning stage, **unlimited solving within accessible categories**; Premium unlocks all categories and early solution preview. No daily ten-question allowance.
- Backend notifications: additive `UserNotifications` migration, JWT-scoped 30-day inbox, mark-one/mark-all read, atomic notice when an admin changes a learner subscription, admin-to-one-learner notice endpoint.
- Web notifications: bilingual bell + unread dot + 30-day inbox, typed RTK Query integration, admin notification composer and navigation; polling every 60 seconds, **not SignalR**.
- Flutter notifications: authenticated 30-day inbox, mark read, unread app-bar badge, route and periodic refresh. Flutter analyze and Android build workflows passed.
- UX: obsolete daily-quota cards removed from the Web and Flutter student dashboards.
- Content: admin CSV upload + strict client-side parser, PostgreSQL-backed draft batches, editorial review with note, explicit confirmation before publish, row locks/serialization and live duplicate/category validation. **Publishing is implemented but no user draft was published by this work.**
- Question drafts: `docs/content/mathworld-initial-32-questions.csv` and `docs/content/mathworld-next-32-questions.csv` contain **64 bilingual proposals**: 16 per stage, 4 per each of 16 seeded categories. **Not editorially approved, tested against production data, or published.**
- Achievements: backend badge thresholds at 1/10/25/50/100/250/500/1000 uniquely solved questions, first-solve milestone notifications, web and Flutter badge cards with progress and lock states. Uses server-maintained progress; no fabricated XP.
- Leaderboards: authenticated backend stage-only ranking for all/last-7/last-30-days using first-try points and unique solves; peers are anonymous. Next.js page and Flutter existing leaderboard screen now surfaced. Privacy/authorization covered in disposable PostgreSQL integration tests.
- Premium reports: server-authorized personal attempt analytics and Excel-friendly CSV export with Arabic UTF-8 BOM. Web report includes CSV download + browser print/save-as-PDF (not a generated server PDF); Flutter shows the metrics and provides **clipboard CSV** only (not native XLSX/PDF download).
- Editorial integration test: new PostgreSQL-backed CI checks JWT-owned inbox, subscription notice, milestone, anonymized leaderboard, badge counts, safe draft approve/publish, Premium private report and UTF-8 export. At latest successful snapshot the suite was green.
- Category proposals: `docs/content/mathworld-proposed-16-new-categories.csv` drafts four new bilingual categories per stage (IDs intentionally omitted to preserve existing stage/category history). This is **not** an automatic import or published content.
- Visual identity: Web BrandMark and Flutter BrandMark were visually compared; both use the violet/pink cap/sigma/x² mark. Actual launch icons need a device check.

## Next high-priority acceptance work

1. **Pull-request review and integration:** finish latest CI, review migrations and auth rules, check production parity on a staging environment, and smoke test web and mobile against migrated disposable PostgreSQL. No merges until all checks pass.
2. **Question bank editorial review:** preview both 32-row CSV batches against live IDs; verify every mathematical answer, translation, curriculum suitability and duplicate, then approve and publish only through the protected editorial queue. Expand beyond 64 drafts to initial launch content.
3. **Notifications v2:** milestone achievement and subscription notifications are in place; add content announcements, optional FCM push and transactional email after consent, verification, rate limits and cost controls. SMS OFF for launch.
4. **Web/Flutter parity:** test Arabic/English, RTL, accessible text, responsive screens, offline/error states, launch screen/icon on actual Android and iOS devices.
5. **Student journey:** backend points, badges, stage-specific leaderboards and error notebook are present on branches; complete UI QA, stage isolation, learning recommendations, challenges and optional richer animations. Server-driven entitlements throughout.
6. **Premium UX:** $5/year is a target, not a live checkout. Admin grants, audit and private analytics/CSV are implemented on branches; improve native file export on mobile and true PDF production, coupon planning, and eventual payment provider after legal/business readiness.
7. **Content/editor tooling:** approved publication of the 64 question drafts, editorial approval of 16 proposed new categories, a dedicated safe category-import/review path, categorical SVG icon key migration, video links, mathematics diagrams and validation.
8. **Security/production:** backups, restore test, monitoring, migration rehearsal, protected config/secrets, VPS/domain and final release gates.
9. **Growth:** YouTube, TikTok, Facebook accounts/content pipeline and educational videos after core product readiness.

## Explicitly not completed

- No live production migration, data insertion, publication, or payment activation was performed by this batch.
- 64 question drafts are not verified or approved for students. No content was directly inserted into production.
- Push notifications, SignalR, email and SMS delivery are not implemented.
- Green CI is per feature-branch SHA, and the newest builds may still be queued. Hands-on end-to-end and staging tests still need to follow.
- The existing React Learning Player is a different project and must not be confused with MathWorld.

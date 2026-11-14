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
- Content: admin CSV upload + strict client-side parser + server-side **dry-run validation only**; no content publishing endpoint in this workflow.
- Question draft: `docs/content/mathworld-initial-32-questions.csv` contains 32 bilingual proposals: 8 per stage, 2 per each of 16 existing seeded categories. **Not reviewed against the live curriculum, not published.**
- Visual identity: Web BrandMark and Flutter BrandMark were visually compared; both use the violet/pink cap/sigma/x² mark. Actual launch icons need a device check.

## Next high-priority acceptance work

1. **Pull-request review and integration:** validate interactions against a migrated disposable PostgreSQL database, including authorization, notification ownership, duplicate request behavior, and category access. No merges until all checks pass.
2. **Question bank editorial review:** run the 32-row CSV through the preview endpoint against live stage/category IDs; verify each answer/translation; resolve duplicates; establish staged publish approval and more content.
3. **Notifications v2:** add event-triggered learning achievements and content announcements; optional FCM push and transactional email after consent, verification, rate limits and cost controls. SMS OFF for launch.
4. **Web/Flutter parity:** test Arabic/English, RTL, accessible text, responsive screens, offline/error states, launch screen/icon on actual Android and iOS devices.
5. **Student journey:** finish points, badges, stage-specific leaderboards, error notebook and learning recommendations; server-driven entitlements throughout.
6. **Premium UX:** $5/year is a target, not a live checkout. Continue admin grants, audit, coupon planning, and premium analytics/Excel/PDF export. Payment provider selection remains postponed pending legal/business readiness.
7. **Content/editor tooling:** bulk CSV review and controlled publish, categorical SVG icon key migration, video links, mathematics diagrams and validation.
8. **Security/production:** backups, restore test, monitoring, migration rehearsal, protected config/secrets, VPS/domain and final release gates.
9. **Growth:** YouTube, TikTok, Facebook accounts/content pipeline and educational videos after core product readiness.

## Explicitly not completed

- No live production migration, data insertion, publication, or payment activation was performed by this batch.
- 32 question drafts are not verified or approved for students.
- Push notifications, SignalR, email and SMS delivery are not implemented.
- Backend/Flutter/Web green CI must be followed by hands-on end-to-end tests.
- The existing React Learning Player is a different project and must not be confused with MathWorld.

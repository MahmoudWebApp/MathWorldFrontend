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
- Premium reports: server-authorized personal attempt analytics and Excel-friendly CSV export with Arabic UTF-8 BOM. Web report includes CSV download + browser print/save-as-PDF (not a generated server PDF); Flutter shows metrics, clipboard CSV and **native sharing of a real CSV file** (not true XLSX/PDF output).
- Editorial integration test: new PostgreSQL-backed CI checks JWT-owned inbox, subscription notice, milestone, anonymized leaderboard, badge counts, safe draft approve/publish, Premium private report and UTF-8 export. At latest successful snapshot the suite was green.
- Category proposals: `docs/content/mathworld-proposed-16-new-categories.csv` drafts four new bilingual categories per stage (IDs intentionally omitted to preserve existing stage/category history). This is **not** an automatic import or published content.
- Flutter Premium CSV: iOS/Android native file-sharing flow added with Arabic-compatible UTF-8 BOM; real file sharing, not clipboard-only. Requires device QA for share targets and file privacy; PDF remains web-print only.
- Category safety: backend blocks moving populated/free-selected categories to another stage and deleting a selected Free category. Admin page now offers a safe read-only bilingual category CSV preview; proposed taxonomy is never auto-published.
- Premium launch gifts: backend one-use, 144-bit random gift codes stored as SHA-256 hashes only, administrator issue/list/revoke, student atomic redemption with audited subscription changes and inbox notice; dedicated redemption rate limit. Web admin/student pages and Flutter student redemption route are on feature branches. These are **100% gifted Premium periods**, not payment discounts, and their availability in production is not implied.
- Visual identity: Android/Flutter transparent mark and iOS/PWA icon pixels were inspected in CI; all iOS/PWA black-backed icon assets replaced with pastel brand images from the existing approved mark. No physical Android/iOS launcher tests or signed production APK installation have been completed.

## Visual UI and mobile launcher logo — PRIMARY OPEN WORKSTREAM

Detailed release acceptance: [MATHWORLD_UI_BRAND_ACCEPTANCE.md](MATHWORLD_UI_BRAND_ACCEPTANCE.md).

- The user's requested launcher logo is the icon **outside** the Android/iOS app; this is not equivalent to in-app BrandMark or animated Splash.
- Assets for Android launcher (round/adaptive), iOS AppIcon, Flutter logo/splash and Next.js icon exist in feature branches. AndroidManifest roundIcon is now set explicitly, and Flutter Web's default blue manifest was rebranded.
- **Corrected on branches:** pixel audit found a genuinely transparent Flutter/Android mark but **black-backed iOS and Web icons**. The iOS and Flutter Web icons have been regenerated from approved source with nonblack pastel backgrounds. iOS native launch assets were previously placeholders and are now a branded mark. Next.js browser ICO and PWA image assets were also regenerated; audit must pass on latest SHA.
- **Still open and launch-blocking:** rebuild/install signed APK and check Android launcher icon in app drawer/home/Android 12+ launch; open real iOS icon and launch screen, compare favicon/PWA after cache refresh, confirm safe mask padding and old-logo cache replacement. Remove stale logo variants only after approved comparison.
- **Progress on UI:** removed Flutter wordmark direction/cropping issues, improved narrow phone metrics and semantics, and improved web dark button contrast, keyboard focus/reduced motion and 320px admin cards. **Still high-priority:** screen-by-screen web/mobile UI/UX QA in Arabic RTL and English LTR; shared brand components, real admin dashboard charts, learner stage/category/problem flows, interactive geometric content, responsive/mobile, dark/light and all loading/error states.
- Green CI is not a substitute for visual/device approval. Do not mark UI or launcher icon complete until acceptance screenshots and physical device check.

## November 14 — student UI and Free category policy hardening

- **Free has no ten-per-day limit:** obsolete client-side daily-quota **answer-blocking logic was removed from both the Next.js problem details page and Flutter problem details screen**. Legacy practice cards now read subscription status rather than the daily quota counter. HTTP 429 now describes generic request throttling, not a fictional ten-question allowance.
- **Stage categories:** responsive Flutter grid (320–430 px single column, dynamic text-scale layout with unit tests), Free/Premium status badges and locked-category gift-code action. Next.js category grid now has Free badges, visible arrows, better focus, reduced motion and the current two-free-category unlimited policy clearly shown.
- **Problem discovery:** Flutter no-results screen supports a clear-search action and pull-to-refresh. Reusable interactive Flutter cards now expose proper Material Ink feedback; widget tests verify their behavior.
- **Access correctness:** failed Premium subscription checks on the web no longer silently present the user as Free; icons returned by the API show a safe glyph/image fallback without raw URL text.
- **Android external launcher:** a pixel-level audit found the native `android/.../drawable-nodpi/launch_image.png` was still an opaque **black square**, and the adaptive foreground used 64.8% of the full bitmap. Generator code now regenerates native splash, round/mipmap/adaptive icons from the approved transparent logo with safe margins. **Do not consider this done until the automated regeneration bot commit and latest strict pixel audit have both completed.**
- Website favicon, iOS app icons and Flutter Web PWA generated images are already free of black corners and previously passed audit.

## Learner UI parity and accessible math workflow — current batch

- **Flutter stages and categories:** list refresh/empty recovery, one-column category layout on narrow phones or enlarged fonts, and readable unlimited Free/locked Premium status. The same two-Free-category/unlimited-problems policy is unchanged.
- **Flutter problem details:** answer option feedback is labeled for accessibility, reduced-motion preferences are respected, metadata pills wrap instead of overflowing. Legacy unlimited-practice banner is not repeated above every question.
- **Next.js stages, categories and problem search:** empty state plus in-place retry; retained selected stage/category/search filters on network retry; Arabic search controls have explicit labels.
- **Next.js question detail:** navigate to a different question without carrying over the prior answer, submission result, retry state or time; automatically scrolling to explanations respects reduced-motion.
- **Premium pre-answer solutions:** replace raw backend option IDs with the actual correct math option content on Next.js and Flutter. The backend still grants and authorizes access.
- **Admin analytics:** small-phone KPI cards no longer crush into two columns at 320px; stage comparison charts can scroll horizontally to keep long Arabic labels legible.
- **Accessibility:** problem answer feedback and errors exposed as live status/alerts, attempt-history disclosure exposes its expanded state, and category stage parallax honors reduced-motion preferences.
- **Verification:** Next.js TypeScript/build and Flutter analyze/RTL/brand checks run on PR branches; report success only for a checked SHA. Android APK and physical device visual verification remain pending.

## Next high-priority acceptance work

1. **Pull-request review and integration:** finish latest CI, review migrations and auth rules, check production parity on a staging environment, and smoke test web and mobile against migrated disposable PostgreSQL. No merges until all checks pass.
2. **Question bank editorial review:** preview both 32-row CSV batches against live IDs; verify every mathematical answer, translation, curriculum suitability and duplicate, then approve and publish only through the protected editorial queue. Expand beyond 64 drafts to initial launch content.
3. **Notifications v2:** milestone achievement and subscription notifications are in place; add content announcements, optional FCM push and transactional email after consent, verification, rate limits and cost controls. SMS OFF for launch.
4. **UI + Flutter launcher logo (blocking):** icon image pixels and black backgrounds were corrected with generated source-controlled assets, but physical **external Android/iOS launcher tests** and clean-install screenshots are still required. Complete the visual checklist for every learner/admin screen, interactive geometry, RTL/responsive/dark modes and accessibility.
5. **Student journey:** backend points, badges, stage-specific leaderboards and error notebook are present on branches; complete UI QA, stage isolation, learning recommendations, challenges and optional richer animations. Server-driven entitlements throughout.
6. **Premium UX:** $5/year is a target, not a live checkout. Admin grants, audit, private analytics/CSV and single-use 100%-gift codes are on branches; test device export/redeem, add true PDF and payment-processor percentage coupons only when checkout is integrated.
7. **Content/editor tooling:** approved publication of the 64 question drafts, editorial approval of 16 proposed new categories, a dedicated safe category-import/review path, categorical SVG icon key migration, video links, mathematics diagrams and validation.
8. **Security/production:** backups, restore test, monitoring, migration rehearsal, protected config/secrets, VPS/domain and final release gates.
9. **Growth:** YouTube, TikTok, Facebook accounts/content pipeline and educational videos after core product readiness.

## Explicitly not completed

- No live production migration, data insertion, publication, or payment activation was performed by this batch. Premium gifts require PostgreSQL migration and deployment before use.
- 64 question drafts are not verified or approved for students. No content was directly inserted into production.
- Push notifications, SignalR, email, SMS and percentage-off checkout codes are not implemented.
- Green CI is per feature-branch SHA, and the newest builds may still be queued. Hands-on end-to-end and staging tests still need to follow.
- The existing React Learning Player is a different project and must not be confused with MathWorld.

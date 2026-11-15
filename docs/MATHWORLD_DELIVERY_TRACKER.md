# MathWorld — delivery tracker (15 November 2026)

> This document tracks the **feature branches**, not deployed production. A green CI build is not proof of a feature being deployed or tested end to end.

## Branches and pull requests

| Surface | PR | Branch |
| --- | --- | --- |
| ASP.NET Backend | [#20](https://github.com/MahmoudWebApp/MathWordBackEnd/pull/20) | `feature/premium-entitlement-foundation` |
| Next.js Web | [#18](https://github.com/MahmoudWebApp/MathWorldFrontend/pull/18) | `feature/premium-entitlements-client` |
| Flutter Mobile | [#12](https://github.com/MahmoudWebApp/mathworld-mobile/pull/12) | `feature/premium-entitlements-client` |


## November 15 — closure QA and 10-question draft coverage across all 32 categories

- **Android completed checkpoint:** Flutter's prior commit `1fdbe306` successfully completed all six workflows including **Mobile social auth Android build** and **Flutter Free-access tests and debug-signed Android QA APK**. This is a QA build, not a Play Store release-signed app. Later mobile commit `a645e83` adds a pull-to-refresh/empty-state fix in the error notebook; verify that exact commit's Android runs before claiming its APK passed.
- **Flutter notebook:** An empty notebook can now be pulled down to refresh and has an explicit retry action. The unarchived empty state explains how to view older archived mistakes.
- **Content expansion:** Added `mathworld-proposed-categories-96-expansion-drafts.csv` (96 bilingual drafts) and `mathworld-existing-categories-96-expansion-drafts.csv` (96 more). Together with the original 128, there are **320 distinct draft questions**: 160 mapped to 16 existing numeric categories and 160 mapped to 16 **proposed, uncreated** categories. Each category has **10 drafts**; each stage has 80 drafts.
- **Structural CI gate:** `scripts/validate-content-drafts.mjs` and `.github/workflows/content-draft-integrity.yml` reject missing bilingual text/solutions, invalid options, duplicate keys/prompts, stage-to-category mapping errors, and insufficient category counts. The new GitHub workflow **passed** on commit `10686a71`. See `docs/content/MATHWORLD_320_QUESTION_CONTENT_GATE.md`.
- **Critically NOT done:** educator verification of all math answers, Arabic/English curricula/notation, real staging category IDs, safe admin dry-run/editorial approval, publication of categories/questions, and physical Android/iOS inspection. **Ten drafts/category is not ten teacher-vetted/published questions/category.**
- **Release constraints:** no merge, production migrations, publication, payment or rewarded ads; branch work only.

## November 15 — combined student UX, stage journey and content expansion (development branch)

**Scope:** The owner approved running UI/UX improvements and curriculum/student-journey work together. This batch makes no release, live payment, ads, database updates, or content publication.

- **Web journey** (`src/app/[locale]/journey/page.tsx`, commit `146f80f`): recommendation remains scoped to currently unlocked categories. Added review-notebook entry for accessible attempted-but-unsolved topics; explicit all-completed and no-published-content states; disabled unhelpful practice links on zero-inventory topics.
- **Flutter dashboard** (`lib/screens/home/home_screen.dart`, commits `477be10`, `d1728b4`): unlocked stage topics appear ahead of Premium-locked topics in a compact, actionable list; direct category practice links, no fake locked actions, error-notebook entry and all-categories navigation. Pull-to-refresh reconciles dashboard and journey API queries together.
- **Flutter stage onboarding** (`lib/screens/stages/learning_stage_screen.dart`, commit `1fdbe30`): labels saved current stage, explains past progress is retained, and uses a navigation-only action when the learner continues on their already-selected stage instead of sending an unnecessary server PUT.
- **Admin analytics UI** (`src/app/[locale]/(dashboard)/admin/engagement/page.tsx`, commit `9c09880`): narrow mobile stage cards use one column, RTL back navigation uses the shared direction-aware control, selected cards get keyboard focus indication, and empty stage datasets are explained.
- **New curriculum drafts** (`docs/content/mathworld-proposed-categories-next-32-question-drafts.csv`, commits `d6280ea` and `a3beea3`): 32 additional bilingual questions, four options and worked explanations; two prompts duplicated earlier files and were replaced before the audit.
- **Draft inventory:** 128 questions in four 32-row CSVs; 16 existing category IDs and 16 proposed category keys, each with four drafts, 32 questions per each of four stages. The proposed categories are still **unpublished**, and these counts do not claim live inventory or the required ten reviewed problems per level.
- **Editorial gate:** `docs/content/MATHWORLD_128_QUESTION_CONTENT_GATE.md` records quote-aware structural checks: all rows/columns parse, unique content keys, no repeated exact English prompt, complete bilingual fields, four distinct choices, 1..4 correct-option indices and matching proposal-to-stage mappings. This is **not** independent math curriculum review, runtime QA or authorization to import to production.
- **QA:** Check each repository's **latest** GitHub Actions SHA before marking green. Native debug-signed Android build, Google OAuth device setup, physical launcher inspection, bilingual visual QA, migrated staging/end-to-end QA, and educator review are separate outstanding gates.
- **Release protection:** Branch work only; Netlify builds stay stopped, no production migrations, no merges, no payment integrations, no content publication.

## November 15 — UI/UX closure batch 1: focused admin analytics and reliable student screens

Development PRs only; **no change to production Vercel, Render, Netlify or Supabase**.

- **Admin monitoring, web:** stage engagement now compares the **top eight** topics by distinct active learners, rather than cramming an unlimited category list into a fixed-height bar chart. The chart height is content-aware and labels are abbreviated safely for narrow screens. The detailed leaderboard initially shows six category cards, with an accessible expand/collapse button for more. All-time solvers remain visibly separated from period-filtered activity. Chart accents match the selected stage's cyan/orange/emerald/violet identity and each stage card distinguishes last-five-minute contact from actual problem practice. In-flight stage switches no longer show stale metrics from another stage or reporting window.
- **Student problem search, web:** uses `currentData` from RTK Query instead of stale last-result data; checks stage/category entitlement before displaying problems. A pending Premium request cannot falsely mark a Premium student as locked, and API errors have their own bilingual retry state rather than a misleading lock. Next/previous and numbered page buttons have accessible labels and `aria-current`.
- **Stage category catalog, web:** smaller cards, reduced vertical padding and responsive grids improve phones and medium-width screens. Deleted/invalid stage links and failed stage lookups now have distinct bilingual error states; the loader is announced through `role=status`.
- **Flutter home:** optional learning journey request failures are now visible as a compact bilingual retry card; previously errors were silently discarded. The rest of the dashboard remains available while retrying. The loading state is also visible with an animated progress indicator and geometric ornament.
- **Flutter problems list:** the search bar now submits on Enter, clears immediately, and exposes an accessible clear tooltip. If a later page becomes empty when questions change, the learner gets a **back-to-first-page** action instead of being stranded on a false no-results page.
- **Verification:** existing GitHub Actions typecheck, Flutter analyzer and Android APK smoke checks must all complete on the current development commits. **Physical-phone visual screenshots, RTL large-text QA and real API acceptance remain open**; passing static checks is not a completed manual UI audit.

## November 15 — release-closing batch: native mobile PDF + filtered activity exports

- **Mobile Premium PDF:** `lib/services/premium_analytics_pdf_service.dart` generates actual A4 multi-page PDF files from the server-authorized `PremiumAnalyticsReport`, with Arabic/English headings and `pw.TextDirection.rtl` for Arabic. Noto Naskh Arabic Regular/Bold is embedded by `PdfGoogleFonts`; first-use download may require a connection. `premium_analytics_screen.dart` now offers a native `SharePlus` PDF button. Tests cover PDF signatures, pagination, empty and populated reports with injected test fonts; *font shaping on real Arabic Android/iOS devices is still an acceptance test*, not claimed passed.
- **Mobile dependencies:** pin `pdf` below 3.13 and `printing` below 5.15 for the current Flutter/Dart CI SDK. The `image` transitive codec is pinned to 4.10.2 because image 4.11.0 expects a newer `archive.ZLibDecoder.decodeLazy` than CI resolved. Confirm Android CI before release; test iOS separately (iOS project and OAuth native scheme also need validation).
- **Audit export:** authenticated admins can download at most 10,000 recent audit rows via `GET /api/admin/activity-audit/export.csv`, filtered by time, role, actor and action. Export is UTF-8 with a BOM for Excel, CSV cells are escaped and spreadsheet-formula prefixes neutralized, data has no bodies/passwords/tokens, and a truncation row explicitly identifies partial exports. The bilingual admin timeline offers a real download button; disposable PostgreSQL tests validate student denial and admin-only access.
- **Verification as of this batch:** the matching backend branch had 9/9 green PR checks and the matching web branch had 3/3 green checks. Flutter static analysis and bilingual navigation checks passed after the PDF changes, while full Android assembly may take longer; do not mark the mobile feature release-ready based on static checks alone.
- **Operational guard:** the current user-tested Vercel `main` site and Render production API remain unchanged. Netlify auto-builds remain stopped, Vercel build ignored, no payment integrations or production migrations are triggered.

### Blockers that cannot be finished without external inputs/approval

- Owner-provided Google Cloud OAuth setup: Web audience client, Android debug/release/Play SHA registrations, final iOS bundle ID and URL scheme; signed physical-device tests.
- Content editorial decisions: review/approve 96 draft questions and the 16 proposed categories before publishing into the live question bank.
- Staging database and API credentials/environment (do not apply feature-branch migrations to production by inference), load, end-to-end and data retention checks.
- Native iOS build pipeline, real-device RTL and accessibility screenshots, official Android/iOS store signing/accounts, backups/monitoring and release approval.
- Stripe/mobile-store payments, ads, vouchers and tutor marketplace remain **explicitly deferred**; no live payment activation.

## November 15 — foreground live notifications (web, Flutter, backend)

- **Realtime without an additional paid provider:** the ASP.NET API now exposes `GET /api/notifications/stream`, a JWT-header-authenticated Server-Sent Events stream. A bounded in-memory broker routes *content-free* `event: inbox` invalidation hints by authenticated account; no inbox text, tokens, or other students' identifiers travel in events. Streams revalidate active status, cap lifetime to five minutes or JWT expiry and are rate-limited per user.
- **Committed notification sources:** admin personal notices, first-solve milestone notifications, manual Premium changes, gift-code activation, already-verified future settlement, and mark-read/read-all actions publish refresh hints only after persistence/transaction completion. This is in-app presence, **not** mobile OS push delivery.
- **Next.js:** one authenticated foreground stream per account, reconnection with exponential backoff, no bearer redirects, shared RTK Query cache invalidation for bell and full-page inbox; existing one-minute foreground polling and focus/reconnect refresh remain safety nets. A 404/405 old backend uses polling only.
- **Flutter:** `MainShell` opens/cancels a foreground-only `HttpClient` SSE stream with secure-storage JWT in a request header; it refreshes the Riverpod bell and full list, shuts off in background, avoids redirects and falls back to one-minute polling. No dependency added.
- **Verification:** the disposable PostgreSQL integration checks for authenticated event frames and the policy-smoke tests for cross-user isolation passed in the reviewed Backend 9-check run. The matching earlier Next.js three-check CI run passed; newest security commits still require their own CI result. Flutter analyzers/navigation and icon audits passed on the checked earlier commit; final Android release/device acceptance is separate.
- **Limits:** the broker is per process; multiple replicas require Redis/PostgreSQL pub-sub or another backplane. Background mobile push still requires FCM/APNs, device tokens, platform credentials and consent. No Netlify deployment or main-branch merge occurred.

See [notification realtime rollout and acceptance checklist](NOTIFICATION_REALTIME_ROLLOUT.md).

## November 15 — authenticated live notifications and SSE regression work

- **Already present on development branches:** the ASP.NET API exposes `GET /api/notifications/stream` using authenticated Server-Sent Events. Events are recipient-scoped `inbox` refresh hints, **never** message contents. Admin messages, student achievement milestones, Premium grant/gift and independently verified payment settlement emit notifications after committed database changes. The web uses an authenticated foreground `fetch` stream; Flutter uses an authenticated foreground `HttpClient` stream. All clients retain 60-second inbox polling and refresh on reconnection as fallback.
- **Reliability/security this batch:** the in-memory broker now limits a student or admin to **three concurrent open streams** and returns HTTP 429 before opening a fourth. Existing internal `Subscribe` API remains backward compatible; controllers use nullable `TrySubscribe`. Policy smoke covers isolation across different users, concurrent-stream caps and release on unsubscribe.
- **Backend integration:** extended the disposable PostgreSQL presence suite to open two JWT-authenticated SSE streams concurrently, send separate private admin notices, verify each stream receives only its own refresh hint, reject anonymous listeners and verify events carry no private body. This test runs after the CI-only API restart, preserving the live authentication rate limit. No production DB writes.
- **Web notification security:** compact-bell notification navigation now rejects query strings, fragments, encoded paths, control characters and backslashes, consistent with the full inbox. Browser typecheck/build checks passed on the reviewed notification change.
- **Flutter SSE handling:** added a short event coalescing delay to avoid duplicate inbox requests when multiple hints or reconnects arrive together. Normal 60-second foreground polling remains. Android/Flutter QA workflow outcome needs verifying on the latest mobile commit.
- **Technical boundary:** this is **foreground live in-app notification refresh**, not FCM/APNs lock-screen push. A single-process memory broker needs a distributed backplane if we move to multiple Backend instances; clients will still poll if a stream breaks. The existing Netlify build status stays stopped.

**Still pending:** store push notifications, staging deployment/migration acceptance, physical-device bilingual QA, Google OAuth credentials, native Android/iOS Arabic PDF, approved category content, full admin monitoring QA and launch preparation. Payments remain deferred.

## November 15 — CI repair and admin monitoring reliability (latest batch)

- **CI repaired without weakening authentication:** the disposable PostgreSQL editorial and presence suites previously shared one API process and hit the production-equivalent limit of five login/registration requests per minute per IP. The workflow now restarts *only the disposable test API* between suites; no production rate-limit or security setting changed. After the repair and new audit assertions, all **nine** backend PR checks passed on the reviewed commit.
- **Audit coverage improved:** legacy admin category creation/update/deletion under `/api/categories` now produces success-only admin events alongside `/api/admin/*`. Action classification protects meaningful labels such as `Publish`, `Revoke`, `Disable` and `Notify`. The presence integration test confirms that student sign-out is visible only to authorized admins when filtered by the correct actor, and excludes passwords/email from event metadata.
- **Audit UI:** the bilingual admin timeline now filters by action as well as role, user ID and date window. Fixed inconsistent `actorId`/`userId` deep-links from the student directory.
- **Low-cost refresh:** admin monitoring and active-stage presence refresh every 60 seconds only while the browser tab is focused. Notification bell and full inbox do the same, refresh on focus/reconnection, and tolerate malformed notification timestamps. This is **foreground polling**, not real-time push or a verified immediate online/offline state.
- **Budget protection:** the owner confirmed Netlify's build status is **Stopped**. All code changes remain on unmerged development PRs with no deployments. Do not reactivate automatic Netlify builds without explicit release approval.

**Still outstanding:** full authenticated notification push architecture (SignalR/FCM/APNs), complete operational event coverage and retention policy, mobile native Arabic PDF, final Google OAuth/device acceptance, staging migrations/load tests, bilingual UI review with real devices, content approval and deployment readiness. Paid checkout remains explicitly deferred.

## November 15 — owner-requested admin monitoring redesign and colorful learning stages

- **Navigation:** desktop admin-specific mega-menu was removed; the single existing `System Admin` account dropdown now contains a compact, categorized list. The unused desktop dropdown component was deleted. The mobile drawer remains the only mobile admin navigation.
- **Administrative monitoring:** `/admin` stays focused on new students and real daily practice activity. `/admin/engagement` splits out stage and category activity charts, all-time unique problem-solvers leaderboards, and best student per category. `/admin/engagement/students` lists student registration, last successful login, last saved practice and attempt count with stage/name filters; `/admin/audit` shows privacy-minimal admin/student event history with user/role/date filtering. Read-only monitoring is separate from `/admin/users` and content editing.
- **Audit truth:** the existing append-only `PlatformActivityEvents` entity, migration and success-action middleware record server-observed operations. Existing login/register events are logged. Explicit web/mobile signout now calls `POST /api/users/session/sign-out` before local token deletion (best effort with timeouts). Browser closure/force-quit is **not** a verified logout; older unrecorded actions do not appear retroactively. JWT logout still only removes local credentials; the event does not revoke already issued stateless JWTs.
- **Visual treatment:** web stage cards use original inline SVG geometric motifs with cyan, orange, emerald and violet accents; Flutter stage catalog, stage picker and topic cards use the same colored identities with low-contrast mathematical `CustomPainter` decorations. The logo remains unchanged, and shape/icon labels prevent color-only meaning.
- **Verification:** server/Flutter/Web CI is being checked against latest commits; results from prior passing commits are not evidence that this newest batch passed. Staging migration and real-device screenshots remain outstanding.
- **Owner-approved payment decision unchanged:** no payment platform integration or production activation until remaining non-payment work is complete and the owner explicitly reopens the decision.

See [admin monitoring architecture and metric definitions](MATHWORLD_ADMIN_MONITORING_UX.md).

## November 15 — non-payment batch: native Excel, mobile sync and curriculum drafts

- **Native XLSX, not renamed CSV:** ASP.NET exports an OOXML workbook from authorized, server-aggregated Premium analytics at `GET /api/users/premium-analytics/export.xlsx?lang=ar|en`. Bilingual headers, Arabic RTL option, frozen header, named worksheet, numeric totals and inline literal strings prevent formula execution; no third-party Excel service is used. Existing premium JWT/active-user checks apply to this export. The existing CSV is retained.
- **Web reporting:** student dashboard adds a real Excel workbook download via the authenticated RTK Query pipeline with blob validation, loading and failure feedback. Browser print-to-PDF remains available.
- **Flutter reporting:** authenticated Dio binary request support, ZIP signature verification and XLSX file sharing on Android/iOS. Existing CSV copy/export remains. The existing mocked ApiClient in tests was updated after a CI analyzer error.
- **Regression:** backend policy smoke checks validate the ZIP workbook parts, typed numeric totals, RTL worksheet direction, and that suspicious category names such as `=1+2` remain *text cells*, not executable Excel formulas. Full compatibility must still be checked with installed Excel and LibreOffice.
- **Mobile state refresh:** polling no longer refreshes the inbox while app is backgrounded; returning foreground refreshes notifications, Premium entitlement, dashboard and student badges to reconcile admin changes.
- **Personalized journey:** Next.js and Flutter now suggest a next practice category using the student's own server-computed stage progress. Started/unfinished categories take priority over unattempted ones; all recommendations strictly exclude locked Premium categories and empty/completed inventories. Flutter now parses the server's IsLocked/AttemptedProblems/FirstTryCorrect fields and labels locked categories rather than hiding access status. Tests cover Free category access and no-recommendation cases.
- **Account isolation:** Flutter invalidates cached journey results whenever a different student signs in/out or the chosen learning stage changes, and when returning to the foreground. The backend refuses private journey/stage queries from inactive/revoked students and marks these responses non-cacheable.
- **Content expansion:** added [32 bilingual proposed-category questions](content/mathworld-proposed-categories-32-question-drafts.csv), exactly two for each of the 16 unapproved category proposals. Every row uses `ProposedCategoryKey` instead of a live DB `CategoryId`; the file **cannot be imported as live questions until categories and IDs have been reviewed and approved**. With the two earlier 32-row draft CSVs, there are now 96 proposal rows, of which 32 require new category approval. Maths/translation/pedagogy need further human review; no question was published.
- **Not finished:** native downloadable Arabic PDF on mobile, full PDF screenshot/print QA, approval of proposed categories/draft questions, real-time SignalR/FCM, Google OAuth registration/device login, device icon QA, staging migration/release rehearsals, VPS/domain/backups, and store signing. Payment remains deliberately deferred.

## November 15 — Google mobile readiness and content review (payments deferred)

- **Scope decision:** pause Stripe/checkout discussions and development; focus on remaining nonpayment work. See [Non-payment release backlog](MATHWORLD_REMAINING_NONPAYMENT_WORK.md).
- **Flutter Google:** Google Sign-In 7.x code, account linking and backend JWT exchange existed already, but default APK hides the button. Hardened handling of canceled account-picker flows, clearing SDK session on logout, native platform/OAuth ID validation, and iOS callback URL-scheme guard. Added configuration unit tests and [OAuth setup instructions](https://github.com/MahmoudWebApp/mathworld-mobile/blob/feature/premium-entitlements-client/docs/GOOGLE_SIGN_IN_SETUP.md). Google Cloud Client ID, Android signature fingerprints, iOS URL scheme and physical device login remain unconfigured/unverified.
- **Backend Google:** removed personally identifying social-auth email logging and a misleading default example OAuth client ID. Real `Google__ClientId` environment value is still required; no production configuration was changed.
- **Draft math content:** inspected answer options and English explanations for all 64 proposed questions; repaired an ambiguous Arabic word problem about disjoint student groups. Logged staging editorial acceptance in [64-question audit](content/MATHWORLD_64_QUESTION_MATH_AUDIT.md). No content was published or imported.
- **Verification:** existing backend build/PostgreSQL suites and Next.js build/typecheck suites passed on checked older commits. Flutter CI initially failed due to malformed config in one edit; source reconstruction fixed the syntax, and later runs must be checked against the repaired mobile SHA. Neither app stores nor production deployments have been touched.

## November 15 — Premium discount and checkout foundation (feature branches only)

- **Annual target price:** USD 5.00. Free remains two unlocked categories per stage with unlimited solving; no ten-question quota.
- **Discounts:** backend cryptographic one-time code creation (`MD-...`), scheduled UTC validity, percentage/fixed-USD pricing, total usage cap, **per-student usage cap defaulting to one**, admin disable and validity/limit edits with row locking, student price quote. Both React and Flutter display bilingual price preview. Admin web has management screen, one-time code copy, schedule editor and usage display. Discount codes are distinct from redeemable `MW-...` Premium gifts.
- **Order ledger:** checkout order table/migrations and EF snapshot, server-side amounts/unique references and provider payment IDs, status/audit timestamps. Students can prepare a **Pending** nonpayment order, list their own orders, see status, and cancel a local unpaid draft. Three-Pending-order limit enforced with transaction-level locking. There is no payment action in the UI.
- **Flutter parity:** new Premium & discounts route from student settings includes quote/history/pagination/cancellation and gift-code navigation. API models and providers use the existing authenticated Dio pipeline.
- **Admin audit:** read-only API and Next.js dashboard for order counts, paid/discount aggregates, long-pending orders, status filtering and pagination. Admin cannot mark an order paid.
- **Settlement logic:** a backend service is implemented for **already independently verified provider receipts**, with order/coupon row locks, paid amount checks, coupon/per-student usage validation, duplicate-payment protection and atomic one-year entitlement updates/notification. It is **not called by any payment webhook yet** and cannot accept real payments without a provider adapter.
- **Verification:** Flutter six latest matching CI workflows passed, including analyze and Android QA builds. Older backend/web build suites passed; newest checkout commits must pass CI again. Nothing was deployed or merged by these changes.
- **Still blocked:** choosing a payment provider/merchant account, signed webhook/provider verification, refunds/chargebacks and reconciliation, staging PostgreSQL migration/integration QA, real-device RTL/LTR checks, official Android/iOS release signing and branding acceptance. Zero-cost coupon checkout is deliberately not enabled; use existing gift codes for no-payment grants.

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

## November 14 — admin and geometry UI continuation

- **Admin category management (Next.js):** explicit bilingual load-failure state with retry for both stage/category API requests; category-list empty state and scrollable minimum-width table on small phones. No category was created or published.
- **Admin problem management (Next.js):** API list failures are no longer shown as empty results, filter and page selections are kept when retrying, pagination is disabled during failed/active fetches, and failed save reports a visible message while leaving the draft untouched.
- **Geometry editor (Next.js):** changing problem IDs resets the draft and saved scene so another problem cannot accidentally inherit it; a successful diagram deletion clears its editor text, and JSON input stays LTR inside Arabic layout.
- **Geometry parity (Next.js + Flutter):** all primitive coordinates are bounded to +/-10,000; signed angle sweeps render in the same direction; empty/full-turn arcs are rejected consistently. Flutter geometry tests cover the safety boundary and signed angles.
- **Flutter problem diagrams:** added visible bilingual captions and a responsive bordered figure with color-scheme-aware contrast; removed the redundant surrounding glass card.
- **Verification:** Next.js production build/typecheck and brand audit passed for web commit `6eb9a461`. Flutter analyze/geometry, brand checks and Android builds must be evaluated against the latest mobile commit `51282257`, not the earlier successful APK. Physical launcher-icon verification, staging APIs and Arabic/English device QA remain open.
- **Android shipping gate (new finding):** current `android/app/build.gradle.kts` uses `signingConfigs.getByName("debug")` even under `buildTypes.release`. Thus CI produces an installable **release-mode, debug-signed QA APK**, not an APK signed for Google Play. Production upload signing, final application ID, key handling and device icon validation are tracked in [mobile issue #13](https://github.com/MahmoudWebApp/mathworld-mobile/issues/13).
- All changes are committed to the existing feature branches only. No main merges, app-store uploads or deployed API changes.

## November 14 — admin editorial UX, import validation and notification safety

- **Category admin:** removed a duplicated empty-results table row; category image upload now checks PNG/JPEG/WebP and a 2 MB client limit, and explains that an existing stored icon cannot be deleted with the local preview reset. The create/edit modal scrolls on small phones. The backend remains the authority on image upload constraints.
- **Editorial review queue:** Arabic/English problem text and solutions use the shared rich-math renderer; each answer option has a LaTeX preview and the correct answer is highlighted. Filters clear the previously selected batch; list/detail API errors have retry controls, and mobile metadata reflows.
- **CSV imports:** the API's validation codes now have explanatory Arabic/English messages; category/question stage ID lookups expose retry states; long results and tables scroll on narrow screens, and file pickers have visible focus. The question import explicitly distinguishes a write-free dry run from saving a protected, unpublished editorial draft.
- **Manual notice composer:** strict decimal-only student IDs, a visible recipient/title preview and an explicit confirmation before sending a single in-app notice. No bulk, SMS, email or push sending was added.
- **Static draft audit:** checked the two 32-question CSVs and the proposed 16-category CSV. All 64 question rows have four nonempty distinct answer options, one integer correct-option index from 1 to 4, filled bilingual prompt/solution fields, and no duplicate content keys. The 16 proposals pass basic icon-key shape and unique content-key checks. Exactly 16 questions and four category proposals per stage; 4 questions per existing category ID (1–16). This **does not certify mathematical/pedagogical accuracy, actual staging IDs, translations, editorial approval or publication**.
- No live content was imported, submitted to the API or published. Changes remain on draft PRs only; latest CI, physical-device RTL and staging acceptance are still required.

## November 14 — Free category admin configuration and mobile learner directory

- **Backend route gap fixed:** `PUT /api/admin/categories/{id}` and `DELETE /api/admin/categories/{id}` are what the admin dashboard calls. Previously this route lacked the populated-category stage-move guard and saved-Free-selection deletion guard already present on the separate `/api/categories/{id}` route; the active admin endpoints now enforce both.
- **New admin Free selection:** authenticated active admins can select exactly two distinct categories belonging to each stage using `PUT /api/admin/stages/{stageId}/free-categories`. The selection is saved to the existing `StageFreeCategorySelections` table with editor ID and timestamp; problem reads still use the server-side entitlement service. No daily question quota.
- **Web admin UX:** an explicit stage-scoped editor lists available categories, allows exactly two selections, shows fetching/error/empty/retry states, and requires confirmation before saving. Switching stages clears stale choices. Changes to Free access are not applied to production in this work.
- **Integration checks:** disposable PostgreSQL CI covers anonymous/student rejection, invalid/cross-stage selections, saved catalog response, Free access change, blocked deletion on both category management routes, and blocked stage moves for populated, explicitly Free-selected and default Free categories. It additionally checks that an unpinned default selection cannot be altered by category reordering, while an explicitly pinned selection stays stable under reordering.
- **Default-pair stability:** the public stage category catalog now reports `HasSavedFreeSelection`. Admins can pin the same default pair through the editor; changes to editorial order which would change implicit Free access are rejected until the pair is explicitly saved. This prevents accidental entitlements drift during content management.
- **Admin student directory:** a dedicated responsive card layout for narrow phones with name/email, active state, stage, Free/Premium, solves, points, last activity, and detail navigation. Stale-filter results are hidden and stage-filter API errors offer retry; the desktop table remains.
- **Release status:** Backend CI passed on `0ef27be18` after these changes, including PostgreSQL suites. Frontend CI must be checked for its latest SHA; physical screenshot and migrated staging checks remain open.
- All changes are on feature branches only, not merged or published.

## November 14 — complete 30-day notifications history (web, API and Flutter)

- **Backend:** `GET /api/notifications` now supports `take=1..50` and `skip=0..10000` while filtering by active JWT owner and a rolling 30-day window. Returns `TotalCount`, `HasMore`, `Skip` and `Take` along with the existing items/unread count. Validates page inputs and keeps the existing mark-read endpoints unchanged. See backend `docs/NOTIFICATIONS_INBOX_PAGINATION_V1.md`.
- **Web:** full authenticated `/notifications` page with next/previous pages, total/unread count, bilingual RTL/LTR copy, read item/mark-all, errors and retry. Bell popup now links to the full screen instead of implying its 30-item preview is the entire 30-day history.
- **Mobile:** Flutter full-page inbox uses a separate paginated provider, keeps the bell first-page provider, invalidates the bell after read operations, supports bilingual page controls and pull-to-refresh. Data parsing accepts older API responses without pagination metadata.
- **Tests:** disposable PostgreSQL integration checks cover multi-page ordering, page limits, read state and cross-user isolation. Flutter pagination parsing regression test added to the existing CI test suite.
- **Not implemented:** SignalR/push, email/SMS, device-notification permission, 31+ actual-device interaction screenshot review, production deployment. Offset pagination can shift while new notices arrive mid-session; a refresh from page one reconciles.
- All code remains on feature branches and draft PRs; CI on each current SHA must be verified before merging.

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

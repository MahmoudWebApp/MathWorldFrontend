# MathWorld — Non-payment release readiness backlog

Updated: 2026-11-15. Scope: ASP.NET Core backend, Next.js web, Flutter
Android/iOS. **Stripe and all paid-checkout work are explicitly deferred** by
the project owner. Do not conflate checkout scaffolding with a live payment
system. The Free policy remains two unlocked categories **per stage**, unlimited
solving in those categories, and no daily ten-question quota.

## Implemented on feature branches — release QA still required

- Free/Premium authorization on the backend; pre-answer Premium solution,
  admin grants, time-limited gifts and audit.
- Stage selection, lesson/category access, problems and answer history; points,
  achievement badges, stage leaderboard and error notebook.
- Arabic/English responsive learner/admin interfaces on Next.js and Flutter,
  accessible basic math/geometry diagrams and progress widgets.
- Inbox notifications (30-day pagination, read one/all, periodic client
  refresh), admin student notifications, and app badges. Realtime push is NOT
  implemented.
- Premium personal analytics, CSV file export on Flutter/Next.js; web
  print-to-PDF is available. True XLSX/Arabic PDF generation on mobile is NOT
  finished.
- Editorial draft import/review/publish workflow, 64 bilingual draft questions,
  16 proposed additional categories. No live content publication.
- Google login code on mobile with backend token validation/account linking;
  disabled by default until native OAuth credentials/signing registered.

## Can be completed in source code without external account ownership

1. **UI acceptance sweep:** QA every stage, category, problem, analytics,
   leaderboard, gifts, notifications, login and admin screen at small Android
   widths and desktop, Arabic RTL + English LTR, text scale 100/150/200%,
   light/dark, empty/error/loading and keyboard/semantic navigation.
2. **Content readiness:** complete mathematical and language editorial reviews,
   verify live staging category IDs, render all formulas/diagrams, expand the
   starter corpus beyond 64 draft questions; keep publication behind admin
   explicit approval.
3. **PDF/XLSX:** provide authentic Arabic-capable PDF and XLSX export with
   bundled licensed fonts and a stable format rather than labeling CSV as
   native Excel.
4. **Notifications:** real-time client delivery only after a backend design
   (SignalR or equivalent) with auth, reconnect, offline consistency,
   deduplication and consent. FCM/Apple push requires separate credentials.
5. **Quality/accessibility:** automated regression tests for key Free/Premium
   and role paths; fix CI failures and verify migrations/schema drift against
   disposable PostgreSQL; ensure cross-user cache isolation.
6. **Operational readiness:** documented staged migration, backup/restore,
   telemetry alerts, rate limits, rollout/rollback procedures, dependency
   auditing and secrets inventory.

## Requires owner/external setup or physical-device acceptance

- Google Cloud OAuth configuration, backend `Google__ClientId`, Android
  package `com.mathworld.mathworld_mobile` + debug/release/Play signing
  certificate fingerprints; iOS client ID and native reversed URL scheme.
  A successful CI build does **not** confirm an interactive Google sign-in.
- Android Play signing key/Play Console and final package identification;
  iOS Apple Developer account + App Store Connect + physical iOS testing.
- Real-device screenshot review of the **launcher icon outside the app**,
  iOS launcher/splash, and clean installs; PWA favicon caching on web.
- Hosted staging env + disposable/test PostgreSQL to rehearse migrations and
  end-to-end auth/content before touching production.
- VPS/domain/SSL, deploy secrets and monitoring accounts, real backup restore
  drill, final load testing and production handover approval.
- Social-media channels and educational video production require account
  ownership/content approval and should follow stable learner experience.

## Payment-platform selection decision gate — after all other modifications

**Owner decision (2026-11-15):** Do NOT choose, activate, integrate further, or
deploy any payment platform during the remaining MathWorld development and QA.
Finish the web, Android, iOS, learning content, Google sign-in, accessibility,
analytics, administration, infrastructure and launch-acceptance modifications
first. Keep currently written checkout scaffolding dormant and do not treat it
as a live payment system.

**Reopen this decision only after the owner explicitly approves it.** Compare
Stripe Checkout, Paddle/Lemon Squeezy where legally available, Apple In-App
Purchases, Google Play Billing, and optionally RevenueCat for synchronized
cross-platform entitlements. Evaluate the actual target countries, merchant
country eligibility, bank/payout support, fees on the planned USD 5 annual
manual-renewal plan, taxes/refunds, store review policies, digital educational
content classification and legitimate external-payment exceptions. Do NOT
assume the app qualifies for Apple's reader-app exception or that paid voucher
redemption is allowed in either store.

Start launch testing with **Free (two categories per stage, unlimited questions)**
and explicitly granted Premium for QA only. No real-money collections, sales of
off-app redemption codes, student payment links or production activation until
the deferred architecture is selected and legally/platform compliant.

## Explicitly deferred

- Stripe Checkout and other online payment providers, coupons requiring live
  payment, taxes, refunds, settlement, and paid subscriptions.
- Advertising unlock logic and teacher marketplace/integrations until the
  relevant systems and policies are agreed upon.
- Facebook sign-in remains separately scoped until app IDs, developer settings
  and platform acceptance are supplied.

## Completion criterion

Do **not** claim the project is fully launched when builds are green. A ready
release has (a) signed/installed native builds, (b) approved bilingual content,
(c) staging migrations and security tested, (d) production secrets and
backup/restore validated, (e) real Google login exercised, (f) owner-approved
release and store/web deployment. Until then PRs stay draft/unmerged.

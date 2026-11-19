# MathWorld — five-priority acceptance pack
Updated: 2026-11-19. **Not an all-green release approval.**

Use the existing Render + Vercel + Supabase environment only. No extra services,
payment gateways, ads, tutor marketplace, or automatic content publication.
Never paste OAuth secrets, administrator passwords or live student personal data
into issues, logs, videos or test evidence.

## Exact review candidates

| Layer | Source |
| --- | --- |
| Backend | `MathWordBackEnd` PR #42 (Google-only cleanup and link-status CI) |
| Web | `MathWorldFrontend` PR #52 (stage visual parity and content review ledger) |
| Android | `mathworld-mobile` PR #40 (stage parity and background), GitHub Actions QA APK |
| Database | MathWorldDB PostgreSQL, **19 applied EF migrations**, 16 categories, 66 published problems |
| Curriculum | 320 unpublished CSV draft records, one Pending editorial row per key |

The current Render deployment must be matched to a specific SHA before
claiming the latest backend contract is live. Web and Flutter PR green builds
alone are not authenticated end-to-end acceptance.

## Gate 1 — backend and hosting synchronization

- [ ] Confirm Render is running a reviewed backend commit including Google
  `GET /api/auth/social/link-status`, Premium challenge and badge enforcement.
- [ ] `GET /health/live` and `GET /health/ready` both succeed; pending migration
  count remains zero. Do not turn on automatic DB migrations for this check.
- [ ] Unauthenticated `GET /api/auth/social/link-status` is 401, while both
  disabled Facebook/Meta POST routes are 404.
- [ ] Verify Google login, user-initiated Google linking and linked-state hiding
  from web/Android with proper configured OAuth origins and signing SHA.
- [ ] Confirm public Vercel domain and QA preview open to intended testers,
  without unexpected Vercel SSO prompts or stale API/CORS configuration.
- [ ] Preserve existing email/password logins and historical social records.

## Gate 2 — brand, cards and math background

Test Arabic RTL and English LTR, light/dark, web widths 320/390/768/1440px,
Android 100/150/200% font scale.

- [ ] The four stages use cyan / orange / green / violet identities on both platforms.
- [ ] Every topic in one stage shows its own stage color, not arbitrary
  category-ID cycling; problem list cards and details match that stage.
- [ ] Topic cards are of consistent usable height; title wrapping never
  moves the CTA unpredictably or clips the category count.
- [ ] Light mathematical grid/glyph backgrounds are subtle and do not intercept
  taps, obscure equations or reduce reading contrast.
- [ ] Completion/success remains green; errors remain red; neutral/unattempted
  tracks remain grey. Brand purple/pink gradients remain decorative only.
- [ ] Guest, Free and Premium navigation retain the same affordances and
  no extra repeated Premium labels appear in every card.

## Gate 3 — curriculum and data integrity

- [ ] Review `docs/content/MATHWORLD_LIVE_CONTENT_AUDIT_2026-11-19.md`.
- [ ] Compare 320 draft keys against live questions before any import.
  Correct the live duplicate IDs **3 and 4** only with a history-safe plan:
  both IDs already have recorded student progress and attempts.
- [ ] Qualified reviewer validates every answer, explanation, distractor,
  age level and Arabic/English equivalence in
  `mathworld-320-editorial-review-ledger.csv`.
- [ ] Re-run the existing draft integrity workflow after each correction.
- [ ] Approve 16 proposed category names/stages, map stable real category IDs,
  dry-run into disposable database and publish only after separate owner approval.
- [ ] Verify every published category still has content and the Free two-topic
  selection remains stable after editorial reordering.

## Gate 4 — complete learner/admin journey

Use authorized disposable **test accounts** only for operations that write
progress, subscriptions, notifications or codes. Do not run mutation tests
on real student records.

| Scenario | Expected result | Evidence/status |
| --- | --- | --- |
| Student signup | Stage is required and persists across login | Pending |
| Legacy student | Elementary fallback, existing history retained | Pending |
| Free browse | Exactly two server-authorized categories per stage, unlimited attempts | Pending |
| Free direct URL | Locked detail/answers/reveal blocked by API | Pending |
| Premium grant/revoke | Admin action immediately updates both platforms after revalidation | Pending |
| Gift activation | Single-use 100% code upgrades once; expired/reused codes rejected | Pending |
| Daily challenge | Free 403, active Premium allowed, no legacy 10/day cap | Pending |
| Solution reveal | Only Premium may see detailed correct answer before attempting | Pending |
| Leaderboard | Real eligible solvers, correct stage filter, no fake users | Pending |
| Personal report | Auth-scoped statistics, Excel/CSV/PDF display Arabic correctly | Pending |
| Notifications | Recipient isolation, unread state, pagination and refresh | Pending |
| Admin control | Student activity by stage and last activity, no duplicate admin menu | Pending |
| API offline/500 | Localized error and retry, no dead-end screens | Pending |

## Gate 5 — Android build and release readiness

- [x] A successful GitHub workflow produced a **release-mode QA APK signed by
  the debug key** from Flutter PR #40; not store-signed.
- [ ] Install on a dedicated test phone, test fresh install/launcher icon and
  Arabic fonts in light and dark themes. Capture screenshots.
- [ ] Do not overwrite an existing signed install with a differently signed QA
  artifact. Use independent QA application ID only if persistent QA signing
  credentials are configured; otherwise use a spare test device.
- [ ] Confirm OAuth Android client signing SHA, account stage change, responsive
  topic grids, geometry labels, native PDF/XLSX viewers and offline recovery.
- [ ] Create and restore-test an **offsite** PostgreSQL backup; an internal
  snapshot schema alone is not a disaster-recovery backup.
- [ ] Require explicit approval before production deployment, content
  publication or app-store signing/distribution.

**Exit rule:** Mark a scenario PASS only with tested SHA, date, role and
screenshot/API result. A CI green check is evidence of build integrity, not of
manual real-device or authenticated UAT completion.

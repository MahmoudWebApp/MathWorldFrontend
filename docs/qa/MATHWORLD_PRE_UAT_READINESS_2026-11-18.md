# MathWorld — pre-UAT readiness and cross-platform acceptance
Date: 2026-11-18. Status: **pre-release; development only, not production approval.**

> This is a human-executable acceptance pack, not evidence that every scenario passed. Never write test data to the connected production Supabase database or grant real production entitlements as part of this plan.

## Verified code and database baseline

- API: `MathWordBackEnd` default `main`; complete Premium implementation in **draft PR #20** (`feature/premium-entitlement-foundation`), not merged. The full-stack build, EF upgrade rehearsal from current main and PostgreSQL integration workflows passed on `f4e35c57` (verify the latest SHA again before merging).
- Web: `MathWorldFrontend` main `b0e59413`; production Vercel recorded READY at that revision. Proposed additional stage catalog/entitlement fallback in draft PR #45; do not claim deployed.
- Flutter: `mathworld-mobile` main, version `1.3.0+4`. Proposed non-blocking membership lookup behavior in draft PR #37; Android QA artifacts are debug-signed, not Play Store signed.
- Questions: 4 stages, 16 real categories and 66 real problems in connected Supabase on inspection; no stage/category mismatch or empty published category at that time. The 320 bilingual CSV questions and 16 new category proposals remain **unpublished**, not approved by an educator.
- Content quality gate: draft PR #46 detects equivalent numeric distractors (e.g. 1/2 and 2/4) in addition to exact text duplicates; proposed `stage4_complex` now appropriately reads **Complex Numbers / الأعداد المركبة**, while preserving its stable ContentKey.
- Vercel READY and green GitHub Actions are **not** end-to-end evidence for an authenticated user workflow.

## Product decisions — do not regress

1. At new student registration the stage is required. Legacy students without a saved stage effectively default to elementary/primary; changing stages never deletes previous attempts, favorites, points or reports.
2. Free = exactly **two admin-selected categories in each stage** with unlimited practice **inside those categories**. The previously proposed ten-questions-per-day cap was superseded, and must not be displayed or enforced.
3. Premium = all categories, unlimited practice, optional pre-answer solution, private reports and exports. Premium must remain ad-free. Price and payment checkout are **OFF** in student UI during prelaunch.
4. Admin can grant/expire/revoke Premium with audit, and issue one-time 100% access gift codes that students redeem without a payment provider. Payment/percentage coupons are not student activation paths until an approved gateway is live.
5. Locked topics must explain their state without showing restricted question text, correct answers or previews. Empty topics must show a factual message and not route to dead ends.
6. Arabic RTL and English LTR are first-class, including math formulas, geometry, PDFs/Excel, error messages and native Android launcher branding.
7. No Meilisearch activation, new ads, tutors, purchases, live database mutations or production release without separate approval.

## Gate 0 — prerequisites (block external UAT until verified)

- [ ] Obtain an isolated API and disposable/staging PostgreSQL. Confirm it is **not** the connected live Supabase project and cannot dispatch production messages.
- [ ] Rehearse reviewed EF Premium migrations with a restore-tested backup, and verify additive schema compatibility with old clients.
- [ ] Verify reviewed backend PR #20 SHA and all full-stack/PostgreSQL/security tests green.
- [ ] Verify web PR #45 and Flutter PR #37 builds for the exact intended SHAs; use signed-for-QA device builds only, never infer store readiness from debug signatures.
- [ ] Create **staging-only** identities: Free student, finite Premium student, indefinite Premium student, active Admin, and inactive student.
- [ ] Configure staging category catalog with at least two unlocked and two locked categories per stage, plus zero-question test category.
- [ ] Turn off payment, ads, push and external providers unless separately approved/tested.

## Gate 1 — full student journey (web and Flutter, Arabic and English)

| ID | Scenario | Expected result |
| --- | --- | --- |
| S01 | Register student without stage | Validated error; no half-created account |
| S02 | Register student with stage | Saved selection, returns to same stage next login |
| S03 | Legacy student CurrentStageId null | Effective elementary stage, no reset of history |
| S04 | Change stage, then return | Old solved history and stage report remain intact |
| S05 | Free stage category catalog | Exactly server-selected two categories open; others clearly locked |
| S06 | Global categories request fails but stage catalog works | Stage page still shows valid categories from stage access API |
| S07 | Subscription request pending or fails | Free categories still usable, Premium access stays closed, retry visible |
| S08 | Free opens locked problem via URL, search, history or API | Backend refuses text, options, preview and answer submission |
| S09 | Free solves unlocked question successfully | Accurate points, progress, achievement and leaderboard refresh |
| S10 | Wrong answer then correct retry | History accurate; unique solved count not duplicated |
| S11 | Switch/filter leaderboard with a single eligible learner | Shows real solved learner; no phantom ranks or stale filter data |
| S12 | Open zero-question topic | No false 'try Premium' paywall and no dead-end list |
| S13 | API 401/403/429/500 or offline while browsing | Honest localized error, retry/back navigation preserved |
| S14 | Login/return after entitlement change | Fresh subscription state, no stale Premium/Free cache across accounts |

## Gate 2 — Premium and admin

| ID | Scenario | Expected result |
| --- | --- | --- |
| P01 | Admin grants finite Premium | Student web/mobile unlocks immediately after refresh/revalidation; auditable |
| P02 | Admin grants indefinite Premium | No gift redemption can replace indefinite grant with time limit |
| P03 | Admin revokes or grant expires | Locked content reprotected across all endpoints and platforms |
| P04 | Admin generates one-time 100% gift code | Value shown once to admin, hashed at rest, no payment |
| P05 | Student redeems code | Premium active and consistent on web/Flutter; correct expiry |
| P06 | Repeat/revoked/expired code | Rejected securely without unintended entitlement |
| P07 | Two concurrent redemptions | At most one succeeds; no double grant or race |
| P08 | Premium previews solution pre-answer | Only actual Premium sees correct answer and worked steps |
| P09 | Private report and export | Student only sees own stats; Excel/CSV and PDF render Arabic correctly |
| P10 | Admin activity/learners by stage | Correct last login/attempt, stage filters and time windows |
| P11 | Admin and learner notifications | Correct recipient, read state, pagination and realtime/polling fallback |

## Gate 3 — UI, visual assets and accessibility

- [ ] Web phone widths 320, 360, 390, 430; desktop widths 1024 and 1440; light/dark.
- [ ] Flutter physical Android 11 and 12+ with 100%, 150% and 200% text scaling, Arabic/English.
- [ ] Original MathWorld logo on web header, icons and **external Android launcher**; no black inner square, no clipping under adaptive/round masks; verify clean installation and in-place upgrade.
- [ ] Geometry diagrams: same source semantics and answer correctness in web SVG and Flutter, with legible labels and RTL-safe directions.
- [ ] Clear tap targets, keyboard/screen-reader semantics, correct back arrows, no redundant admin panel or lost student navigation.
- [ ] Loading/error/empty states do not show fabricated zeros, infinite loading or dead-end links.
- [ ] Native Android PDF/Excel can be opened using real apps; screenshots show Arabic text not reversed.

## Gate 4 — content

- [ ] Run `node scripts/validate-content-drafts.mjs` and check same-SHA GitHub workflow success.
- [ ] Have an independent qualified educator review **all 320** questions: answer key, each distractor, algebraic equivalence, worked solution, bilingual equivalence, age level, and copyright provenance.
- [ ] Approve names/placement of the 16 proposed categories. Preserve existing ID mappings and student history.
- [ ] Map all original 16 numeric category IDs to the **staging** DB, create approved proposals there, preview/deduplicate/import as unpublished editorial drafts.
- [ ] Publish only vetted content after owner approval and re-check stage counts, Free/Premium visibility, lock enforcement and formulas.
- [ ] Never treat a structural CSV pass or this checklist as teacher certification.

## Gate 5 — release decision

- [ ] Monitor deployment/API errors, authorization denials, DB timeouts and notification delivery with no secrets in logs.
- [ ] Confirm legal/privacy and Google/Meta OAuth ownership/signing configuration separately; do not enable placeholders.
- [ ] Ensure restore/rollback runbook and production deployment approval have named owner.
- [ ] Keep Free/Premium sales/payment and ads flags OFF until explicitly approved.

**Exit rule:** Mark individual IDs PASS only with device/API evidence, the tested code SHA and a timestamp. A green build alone is insufficient. Production data was not modified by preparing this document.

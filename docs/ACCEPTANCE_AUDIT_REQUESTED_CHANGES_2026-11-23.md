# MathWorld — requested-change acceptance audit (23 Nov 2026)

**Scope:** user-requested corrections on existing MathWorld web, ASP.NET API,
Flutter and curriculum. **This document does not authorize deployment,
Hostinger migration, merging, publishing content or resetting accounts.**
A passing source/typecheck/build test is **not** proof of a production UAT pass.

## Evidence levels
- **Code reviewed:** expected behavior exists on an open development PR.
- **Automated CI pass:** named workflow passed on the current PR commit.
- **UAT pending:** needs an authenticated student/admin browser or Android test.
- **Editorial pending:** student-facing mathematics require correctness review.

| User requirement | Code and verification | Remaining release gate |
|---|---|---|
| Admin dashboard: exactly 3 management entries (students/subscriptions, learning content, student activity log) | Frontend PR #93, `admin/page.tsx`; automated source contract `scripts/check-requested-ux-contract.mjs` | Confirm all three real links with admin role |
| Admin learner list: no solved/view/score/attempt/last-login columns; actual Premium expiry | Frontend PR #93 `admin/users/page.tsx`; Backend PR #96 `AdminLearnersController.cs`, optional `includeActivity=false` | Test Arabic/English, no hidden activity fetch |
| Admin annual Premium for one/many learners, modal with real names and projected dates; renewal extends active expiry; indefinite remains unchanged | Frontend PR #93 and Backend PR #96; PostgreSQL admin learner integration tests | Test actual response periods on individual/bulk selections, renewal and indefinite |
| Student preview cards narrower and star plus view action in top corner on **mobile and desktop** | Frontend PR #93 `ProblemCard.tsx` responsive row + column action; source contract and web build | Test RTL/LTR at 320px, 375px, tablet and desktop; avoid text overflow |
| Category card connected to **View questions** + **Restart practice** at bottom; reset disabled for untouched topic; confirmation dialog | Frontend PR #93 `dashboard/categories/page.tsx`; source contract | Authenticated manual test of Free/Premium, completed and empty categories, stage/category resets |
| Reuse errors without duplicating solved records and show correct New/Solved/Review status | Backend PostgreSQL learning journey, problem integrity, student card sources | Manual cross-screen consistency check after restart and answer |
| Daily challenge: **improve, do not only hide**; Premium-only; guided 5 questions, wrong counts as completed, auto-next after readable solution, pause/next actions | Frontend PR #93 and Backend PR #97; source contract; dedicated disposable PostgreSQL guided-answer regression | End-to-end test with 5 real answers, wrong/right, resume, last question and day boundary |
| Charts dark/light, full dates, correct admin metrics, no invented leaderboard | Frontend PR #93; backend stage analytics integration | Manual chart legibility plus actual activity and time values |
| Real skeletons while loading API data | Frontend PR #93 covers routes mentioned in PR | Full route-by-route audit is **not yet complete**; skeletons cannot mask slow APIs |
| Speed across entire site, not just admin | Backend PR #98 (pooled DB and fewer queries), Frontend PR #94 (less refetch and catalog cache); source logs baseline ~3–10s | No measurable live improvement until coordinated release and real before/after TTFB/route audit |
| Published bank taxonomy, coverage, uniqueness and law-first worked explanations | Backend PR #95: 56 bilingual *editorial draft* problems with rule and steps; read-only audit of 601 published problems | **Editorial pending**: math validation, semantic deduplication, stage/topic coverage, published short explanations; do not automatically publish drafts |
| PDF/Excel branded reports, premium export, SEO/public stage pages | Earlier project work and requirements exist; no full independent acceptance pass in these PRs | **UAT pending**: export samples with logo/charts, mobile responsiveness, public SEO and deep links |
| Flutter RTL, 2-column cards, dark theme, Google, nav, solved/error notebook, final signed APK | Android Actions last build on main successful 22 Nov 2026 | **Device UAT pending**; validate Google OAuth and final signed release APK before user handoff |
| Single official website and future Hostinger VPS | Separate draft Hostinger PRs #99 API, #95 web | VPS **explicitly postponed**; no DNS, provider, DB, auth or production migration |

## Release ordering: no premature merge or deployment

1. Finish new automated test results on frontend PR #93 and backend PR #97.
2. Integrate backend PRs **#96, #97, #98** and frontend PRs **#93, #94** in a
   controlled joint branch, resolve conflicts and rerun all backend + web CI.
   PR #95 (editorial draft data) requires separate mathematical review.
3. Verify one student **Free** and one **Premium** and admin with functional
   browser scenarios, including Google and mobile. Re-test because Next
   frontend build alone does not exercise API response contracts.
4. Audit entire student/admin/public route set for loading/empty/error states,
   source correctness, RTL, dark mode, and real performance.
5. Release only after explicit approval; do not create extra QA websites or
   circumvent a Vercel build-rate-limit. Hostinger migration remains separate.

**Rule:** Mark each requirement accepted only after it passes at least one
relevant functional/integration test **and** any required user-visible UAT.

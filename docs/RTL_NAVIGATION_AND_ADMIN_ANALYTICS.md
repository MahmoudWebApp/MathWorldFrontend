# MathWorld — RTL/LTR navigation and operator analytics release audit

## Navigation contract
All directional navigation uses `src/components/ui/DirectionalNavigation.tsx`.
- Arabic: **previous/back** points RIGHT, **next/forward/continue** points LEFT.
- English: **previous/back** points LEFT, **next/forward/continue** points RIGHT.
- The icon is selected by `next-intl` locale, not inferred from `dir` or accidentally double-flipped by CSS transforms.
- Do not apply `rtl:rotate-180` to `DirectionalArrow` from shared `DirectionalNavigation`. Its SVG already points in the correct physical direction.
- Non-navigational icons (search, loading spinners, share/send) are not altered or mirrored.
- Breadcrumb separators are semantically forward; page number arrows are semantically previous/next.

## Pages audited and changes
- Login, registration: forward submission.
- Learning stage onboarding: forward action.
- Social-account linking: dashboard/back.
- Student dashboard, solved/favorites, problem cards: forward/back links.
- Admin student list and individual student pages: fixed **both inverted previous/next arrows** and standardized back.
- Admin problem editor and public problem search: previous/next pagination and back.
- Public problem detail: back.
- Stage category list and stage cards: forward/back and nested category arrows.
- Top navigation / stages dropdown: forward.
- Breadcrumbs, home hero, about CTA, premium stage card: forward.
- Admin analytics: back to dashboard.
- Admin home: major analytics-center CTA uses semantic forward icon.
- Flutter: preexisting `LayoutUtils` already handled search pagination chevrons with explicit LTR icon rendering. The stage-saving button previously forced `Icons.arrow_forward_rounded` into LTR, causing a wrong Arabic right arrow; now uses locale-aware `LayoutUtils.forwardArrow(context)`. Mobile leaderboard previous/next buttons now include explicit, tested locale-aware chevrons.

## Admin UI redesign
- Replaced inventory comparison graphic (counts of levels/problems/categories/users) with actionable Admin-only trend, stage performance, category mistakes and problem-review panels.
- Daily attempts/correct are grouped by UTC day; stages show correct vs incorrect answer attempts (not question inventory).
- 'Categories with most errors' means highest **number of incorrect attempts in the selected interval**, not a definitive difficulty score.
- No fake chart points: periods with no activity display localized empty states. Total solved remains explicitly **all-time**; other activity KPIs follow 7/30/90-day interval.
- Analytics CTA navigates to `/admin/analytics`, which also shows global and per-stage charts, daily activity and category/learner drilldowns.
- Only Student role attempt records contribute to metrics; admin previews are excluded.

## Release gates
1. Backend #14 migration-free additive analytics API passes .NET build and PostgreSQL tests and is Live on Render.
2. Web PR passes TypeScript typecheck and `next build` before merge to auto-deploy Netlify.
3. Flutter PR passes `flutter analyze`, widget tests and Android build before merge.
4. After deployment, visually verify Arabic and English on 360px mobile browser and desktop: previous/right/back/right and next/left/forward/left in Arabic. In English reversed.
5. With Admin role, verify charts for 7/30/90, no-data chart states, link to full center and student drilldowns. Student endpoints remain 403 to non-admins.
6. Check that new backend fields `DailyActivity`, `MostMissedCategories`, `MostMissedProblems` are present, or empty arrays if no activity.

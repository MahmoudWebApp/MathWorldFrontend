# MathWorld — combined batches 2 + 3: implementation and acceptance matrix

**Date:** 2026-11-15. **Branches only.** This file distinguishes code completion from final learner-facing acceptance.

## Implemented on development branches

| Area | Evidence | Development status |
| --- | --- | --- |
| Web student journey | `src/app/[locale]/journey/page.tsx` (`146f80f`): access-aware next step, mistakes review, zero-content/fully-completed handling | Implemented; Next.js CI built |
| Flutter stage journey | `lib/screens/home/home_screen.dart` (`477be10`, `d1728b4`): unlocked topics first, direct practice links, error-notebook navigation, scoped refresh | Implemented; Flutter analyze passed |
| Flutter stage selection | `lib/screens/stages/learning_stage_screen.dart` (`1fdbe30`): distinguish current stage, no redundant PUT, keep prior progress | Implemented; earlier Android QA build passed |
| Flutter error notebook | `lib/screens/dashboard/error_notebook_screen.dart` (`a645e83`): pull-to-refresh and explicit empty/archived guidance | Implemented; newest Android run to confirm |
| Web admin stage analytics | `src/app/[locale]/(dashboard)/admin/engagement/page.tsx` (`9c09880`): 320px-safe cards, RTL back navigation, empty states, focus styles | Implemented; Next.js CI built |
| New content | Six CSV question files in `docs/content`; 320 **drafts**, 32 categories, ten drafts each, 80 per stage | Authored and structurally checked, **not teacher-approved or published** |
| CI content protection | `scripts/validate-content-drafts.mjs`, `.github/workflows/content-draft-integrity.yml` | First content workflow completed successfully; prevents duplicated/malformed drafts |

## Manual learner/admin acceptance still REQUIRED

| Test | Expected acceptance outcome | Observed status |
| --- | --- | --- |
| Arabic/English 320–430 px screen audit | Stage cards, progress, buttons and mathematical notation fit without clipping at 100% and 200% font scale | Not tested on physical device |
| Dark/light theme and keyboard | Text contrast, focus indicator, dialogs, screen reader labels and reduced motion remain usable | Needs visual/accessibility QA |
| Free stage categories | Exactly two admin-selected accessible categories in **each stage**, unlimited daily questions within them, direct locked requests refused | Backend CI tested; staging end-to-end still needed |
| Premium category expiry | No false Free lock while loading; expired grant hides locked problem content without losing history; no paid checkout | Needs staging end-to-end |
| Student journey after attempt | Points, errors, stage progress, recently solved, and recommended topics refresh without cross-stage leakage | Backend CI plus code review; real integration needed |
| Error notebook active/archived | Learner can retry, archive, unarchive and refresh an empty list with predictable result | Flutter analyze passed; manual screen QA pending |
| Admin insights and category import | Stage metrics filter correctly, content preview has no mutations, editorial approval publishes only after explicit decision | Backend CI passed; staging admin role test pending |
| Math answers and grade suitability | **Every question** has one truly correct option and an accurate Arabic/English solution, age-appropriate stage and no existing DB duplicate | Independent educator signoff pending |
| Native Android launcher | Install the newest build on real Android 12+, check adaptive icon, splash and app drawer; take screenshots | Static pixel audit passed; real-device signoff pending |
| Native iOS/Web PWA | Confirm icons in an installed iOS app and browser/PWA after cache refresh | Device/browser signoff pending |

## Exact physical-device smoke path

1. Perform a fresh install of the **newest commit's debug-signed QA APK** (not store signed) on an Android device and inspect launch icon and splash.
2. Sign in as a test **Free** student, choose a stage, confirm two unlocked categories and any number of consecutive practice attempts. Change to a different stage, then back, checking preserved progress.
3. Open journey, follow an unlocked suggested topic, submit a wrong answer, return home and review the error notebook. Archive an item, switch archive visibility, and pull-to-refresh an empty state.
4. Repeat selected screens in Arabic RTL/English LTR, light/dark, with enlarged font and a 320–430 px layout.
5. Sign in as **test Premium** and confirm all categories and pre-answer solution permissions; then expire the test grant to confirm existing progress survives and locked content is no longer accessible.
6. As admin, verify category edit, stage analytics and editorial review **on staging only**. Do not import or publish the question CSVs in production.

**Release hold:** no deployment, main merge, paid checkout, ads, teacher marketplace, production migrations or content publication until independent content review, staged test and owner approval. Store-release signing is not the QA APK signing configuration.

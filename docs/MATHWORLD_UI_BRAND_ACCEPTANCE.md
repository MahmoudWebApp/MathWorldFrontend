# MathWorld — UI / branding & external mobile icon acceptance

**Status:** Mandatory pre-release checklist (14 Nov 2026). Do **not** treat green CI, installed image files, or a working splash as proof the brand is approved. Android launcher icons remain a **device verification gate**.

## Approved identity / source of truth

- Brand: MathWorld, cap + sigma + x² mark; original geometry must remain unchanged.
- Main purple `#6D28D9`; violet `#A21CAF`; pink `#EC4899`; light `#FAF8FF`; dark `#110C1E`.
- Logo must appear consistently on Next.js, Flutter (inside app), Android launcher **outside app**, iOS home-screen icon, splash/native startup, favicon/PWA and social share cards.
- **Do not add an opaque black square** to a transparent mark. The earlier source PNG had an embedded dark background; the final asset must be checked at full resolution and small/icon sizes, not judged by CSS alone.

## Exact assets / current implementation

| Surface | Path / implementation | Present in feature branch | Must visually test |
| --- | --- | --- | --- |
| Next.js symbol | `public/mathworld-mark-transparent-v3.png`, `src/components/layout/BrandMark.tsx` | Yes | Logo on light/dark/mobile, correct transparency |
| Next.js wordmark | `src/components/layout/BrandLogo.tsx` | Yes | Header/footer, small width, Arabic & English |
| Next.js favicon/PWA | `src/app/layout.tsx`, `public/mathworld-favicon-*-v2.*`, `public/site.webmanifest` | Yes | Browser tab, Android home shortcut, cache busting |
| Flutter in-app symbol | `assets/branding/mathworld-mark.png`, `lib/widgets/brand_logo.dart` | Yes | Make sure no black backing remains in the PNG |
| Flutter animated splash | `lib/screens/splash/splash_screen.dart` | Yes | Device boot, 2+ screen sizes, light/dark |
| Android native launch | `android/app/src/main/res/drawable/launch_background.xml`, `values/colors.xml`, `values-v31/styles.xml` | Yes | Android 11/12+ transition, no black flash |
| Android **external launcher** | `android/app/src/main/AndroidManifest.xml` + `mipmap-*/ic_launcher*.png` + `mipmap-anydpi-v26/*.xml` + `drawable-nodpi/mathworld_adaptive_foreground.png` | Yes; `roundIcon` added on dev branch | Home screen, app drawer, recents, circular/adaptive masks, app info |
| iOS external icon | `ios/Runner/Assets.xcassets/AppIcon.appiconset/` | Image set present | Real iPhone and Xcode asset verification |
| Flutter Web PWA | `web/manifest.json`, `web/favicon.png`, `web/icons/` | Manifest rebranded on dev branch | Image assets still require visual matching |

**Not yet verified:** transparency of actual PNG pixel data, that all scaled icons contain the approved final mark (not older images), launcher caching on an updated install, or real-device rendering. Rebuilding an APK does **not** replace an already installed icon until a new version is installed (some Android launchers cache icons).

## UI/UX release acceptance checklist

### Design system, Web + Flutter

- [ ] One source of color, spacing, radii, typography, icons, shadows, gradients for shared components; no legacy blue/cyan surfaces.
- [ ] Shared navigation patterns, back/forward arrow direction, button sizes, tabs, toasts, dialogs, search, loading/skeleton/empty/error states.
- [ ] Arabic RTL / English LTR for all screens including numeric/math formulas, pagination, breadcrumbs, charts, alerts and notifications.
- [ ] 320–430 px phones, larger devices, tablets and desktop; dynamic font sizes, dark/light modes, keyboard and safe areas.
- [ ] Accessibility: tap targets, semantic labels, contrast, reduced-motion, screen readers, color not sole indicator.

### Learner pages

- [ ] Welcome, register/login (Google/Facebook account readiness), selected stage and first-run onboarding.
- [ ] Stage list and category cards, exactly two Free categories/stage, Premium lock/preview, no 10/day limit or quota wording.
- [ ] Problem list and math viewer, options, LaTeX and interactive geometric figures/diagrams on **both** Web and Flutter.
- [ ] Submission, explanation, next-problem journey, progress bars, error notebook and favorites.
- [ ] Student dashboard, earned badges, XP/points and stage ranking; honest server-based stats.
- [ ] Notifications center (read/unread) in both languages; private Premium reports and CSV/PDF expectations explicit.
- [ ] Premium benefits, gift activation, annual price messaging without pretending checkout is live.
- [ ] User profile/settings, stage switching and account cache cleanup.

### Admin pages

- [ ] Consolidated analytics center with real charts, KPI cards, stage/category learner insights.
- [ ] Clear flow: **Stage → Categories → Problems**, with deep-linked add/edit at selected stage/category.
- [ ] Review queue for bilingual question CSV, proposed-category CSV preview, published question verification; safe duplicate history.
- [ ] Student directory, subscription grants/audit, gift code administration, learner notifications.
- [ ] Role access, destructive action confirmation, appropriate errors, RTL navigation and responsive tables.

## Exact required manual release checks

1. Compare Android **home-screen icon** on a clean install and an upgrade: light/dark launcher themes, round and adaptive masks; take a screenshot and verify no black square, clipping or outdated artwork.
2. Open app from home screen: Android native launch → Flutter animated splash → sign-in/home; inspect colors and transition on Android 11 & Android 12+.
3. Compare iOS home icon, splash, Flutter in-app mark, Next.js site header/footer/favicon in one visual approval pass.
4. Run a bilingual Free student, Premium student, and Admin smoke run on mobile and web; capture each main screen at a small display width.
5. Check native CSV share target and gift activation on a physical phone; check notification and subscription caches when switching accounts.
6. Review final launcher PNG transparency/color visually and compare 48/72/96/144/192, 512 and 1024 px outputs; do not substitute simply recoloring a surrounding container.
7. Update APK/build number and install signed release; only then label "external app icon completed."

## Remaining visual engineering

- Simplify/standardize icon artwork for all sizes with transparent mark and controlled purple background where the platform requires opaque icons.
- Correct and version all mobile/iOS/Flutter-web icons from the **same approved source image**; remove stale logo variants after visual comparison.
- Complete screen-by-screen responsive, Arabic/English, dark/light QA and improve geometric visual exercises.
- Integrate new educational categories and reviewed questions with the same card/illustration standards before final design approval.

**Release gate:** The launcher logo, splash and core student/admin screens must be explicitly visually approved before merging to `main`, store submission or public relaunch. No product release was performed in this checklist.

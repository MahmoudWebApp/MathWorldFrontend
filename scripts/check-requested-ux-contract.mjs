#!/usr/bin/env node
/**
 * Lightweight source contract checks for the requested MathWorld learner UX.
 *
 * These catch accidental layout/route regressions in CI without hitting the
 * production API. They do NOT replace rendering checks or logged-in UAT.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(name, 'utf8');
const card = read('src/components/problems/ProblemCard.tsx');
const categories = read('src/app/[locale]/(dashboard)/dashboard/categories/page.tsx');
const challenge = read('src/app/[locale]/daily-challenge/page.tsx');
const solver = read('src/app/[locale]/problems/[id]/page.tsx');
const admin = read('src/app/[locale]/(dashboard)/admin/page.tsx');
const nav = read('src/components/dashboard/StudentWorkspaceNavigation.tsx');
const auth = read('src/components/providers/AuthProvider.tsx');
const categoryApi = read('src/store/api/categoriesApi.ts');
const stageApi = read('src/store/api/stagesApi.ts');
const problemList = read('src/app/[locale]/problems/ProblemsPageClient.tsx');

assert.match(card, /max-w-5xl/, 'Problem preview cards must stay reasonably narrow');
assert.match(card, /flex w-full min-w-0 items-start/, 'Question title should receive the full card width without action compression');
assert.match(card, /flex w-full flex-wrap items-center justify-between gap-2 border-t/, 'Score and view action should remain in a separate responsive row');
assert.match(card, /<Star\b/, 'Problem points star missing');
assert.match(card, /<DirectionalArrow direction="forward"/, 'Problem open action missing');
assert.match(card, /problem\.IsSolved\s*\?\s*\(/, 'Solved status must use server-owned progress');

const categoryCard = categories.slice(categories.indexOf('const card = ('));
assert.match(categoryCard, /'عرض المسائل'/, 'Category card must show View questions');
assert.match(categoryCard, /'إعادة التدريب'/, 'Category card must show Restart practice');
assert.ok(categoryCard.indexOf("'عرض المسائل'") < categoryCard.indexOf("'إعادة التدريب'"), 'Both actions belong in one category card');
assert.match(categoryCard, /disabled=\{resetting \|\| \(progress\?\.AttemptedProblems \?\? 0\) <= 0\}/, 'Restart must be disabled before practice');
assert.match(categories, /<Dialog open=\{!!target\}/, 'Restart must require confirmation');
assert.match(categories, /scope: 'stage' \| 'category'/,
  'Stage and category resets must use a scope-aware confirmation.');
assert.match(categories, /target\?\.scope === 'category'/,
  'Confirmation must explain category versus full-stage reset.');
assert.match(categories, /'المفضلة والنقاط الدائمة والشهادات بتضل محفوظة، والتصفير ما فيك تتراجع عنه.'/,
  'Learner must know favorites are preserved and reset is irreversible.');
assert.match(categories, /onClick=\{\(\) => setTarget\(null\)\}/,
  'Reset dialog must have a working Cancel action.');
assert.match(categories, /onClick=\{\(\) => void confirmReset\(\)\}/,
  'Reset dialog must have explicit Confirm action.');
const resetHandler = categories.slice(categories.indexOf('async function confirmReset()'), categories.indexOf('  return (', categories.indexOf('async function confirmReset()')));
assert.match(resetHandler, /await resetPractice\(/,
  'Only an explicit confirmation handler may submit reset to API.');
assert.equal((categories.match(/await resetPractice\(/g) ?? []).length, 1,
  'There must be exactly one practice-reset API call and no direct card action.');

const overlay=read('src/components/premium/LockedCategoryOverlay.tsx');
assert.match(categories, /<LockedCategoryOverlay name=\{name\}/, 'Locked categories must stay gated');
assert.match(overlay, /<LockedPremiumDialog topicName=\{name\}>/, 'Upgrade dialog remains available');
assert.match(overlay, /absolute inset-0/, 'Locked cards must display full-card overlay');
assert.match(categories, /<CategorySkillsPopover stageId=\{stageId\}/, 'Learner topics show API-owned category skill descriptions.');
assert.match(categories, /const skillsButton = \([\s\S]*?<CategorySkillsPopover stageId=\{stageId\} category=\{category\} trigger=/, 'Skills have a separate anchored trigger.');
assert.match(categories, /<div inert[\s\S]*?\{skillsButton\}[\s\S]*?<LockedCategoryOverlay/, 'Locked card content is inert below the overlay');
const publicCategories = read('src/app/[locale]/stages/[stageId]/StageCategoriesClient.tsx');
assert.match(publicCategories, /<CategorySkillsPopover stageId=\{stageId\}/,
  'Public topic cards must expose the same per-category skills popup.');
assert.match(publicCategories, /color: stageAccent/, 'Public question counts use their stage color.');

assert.match(challenge, /useGetStudentSubscriptionQuery/, 'Challenge must check Premium membership');
assert.match(challenge, /data\.Problems\.map/, 'Show a progress marker for each challenge question');
assert.match(challenge, /findIndex\(problem => !problem\.IsAnswered\)/, 'Challenge must resume first unanswered question');
assert.match(challenge, /'دفتر الأخطاء'/, 'Challenge must guide students to their error notebook');
assert.match(solver, /pauseChallengeAdvance/, 'Student must be able to pause auto-advance to read the solution');
assert.match(solver, /nextChallengeUrl/, 'Guided solver must support the next question');
assert.doesNotMatch(solver, /currentAttemptCount|problem\.totalAttempts|<History\b/,
  'Student solver must not render historical attempt counts or timelines');
assert.doesNotMatch(solver, /problem\.bestTime|problem\.averageTime/,
  'Student solver must not render legacy attempt-history timing dashboard');
assert.match(nav, /href: '\/dashboard\/daily-challenge'.*premium: true/, 'Challenge must remain Premium gated');

const shortcuts = admin.match(/\{ href: '\/admin\/(users|stages|engagement\/students)'/g) ?? [];
assert.equal(shortcuts.length, 3, 'Admin dashboard must have exactly three requested management shortcuts');

assert.match(auth, /PROFILE_REVALIDATE_MS = 45_000/, 'Global account refresh must be throttled');
assert.match(auth, /inFlightToken\.current === token/, 'Overlapping account refresh calls must be deduplicated');
assert.match(categoryApi, /keepUnusedDataFor: 180/, 'Category cache must be reused across navigation');
assert.match(stageApi, /keepUnusedDataFor: 180/, 'Stage cache must be reused across navigation');
assert.match(problemList, /useGetCategoriesQuery\(locale, \{ refetchOnMountOrArgChange: 120 \}\)/,
  'Problem browsing must not re-request categories on each mount');
assert.match(problemList, /useGetStagesQuery\(locale, \{ refetchOnMountOrArgChange: 120 \}\)/,
  'Problem browsing must not re-request stages on each mount');

// Global loading/auth + report export behavior regression contracts.
const brandedLoader = read('src/components/ui/MathWorldLoading.tsx');
const routeLoader = read('src/app/[locale]/loading.tsx');
const sessionGate = read('src/components/providers/AuthHydrationGate.tsx');
const providers = read('src/components/providers/Providers.tsx');
const authState = read('src/store/slices/authSlice.ts');
const reportPage = read('src/app/[locale]/(dashboard)/dashboard/analytics/page.tsx');
const homePage = read('src/app/[locale]/(dashboard)/dashboard/page.tsx');
const studentShell = read('src/components/dashboard/StudentWorkspaceShell.tsx');
assert.match(brandedLoader, /<BrandMark/, 'Loading animation must use the approved MathWorld mark.');
assert.match(brandedLoader, /motion-reduce:animate-none/, 'Loader must honor reduced motion.');
assert.match(routeLoader, /<MathWorldLoading skeleton/, 'Route loading must reuse the same branded skeleton.');
assert.match(providers, /<AuthHydrationGate>\{children\}<\/AuthHydrationGate>/,
  'Account pages must wait for verified authentication.');
assert.match(sessionGate, /\/dashboard/);
assert.match(sessionGate, /\/admin/);
assert.match(sessionGate, /\/journey/);
assert.match(authState, /sessionUnavailable/, 'Network outage must not be treated as logout.');
assert.match(auth, /sessionConnectionFailed\(\)/,
  'A profile API failure must not trigger fake sign-in.');
assert.match(studentShell, /membershipError \|\| !subscription/,
  'Unknown subscription access cannot be silently treated as Free.');
assert.match(homePage, /progressError \|\| !journey \|\| planError \|\| !subscription/,
  'Home must not display invented zero progress or Free access on failed APIs.');
assert.match(reportPage, /const reportAr = ar/,
  'Choosing an export language must not change the current page language.');
assert.doesNotMatch(reportPage, /setReportLanguage|flushSync/,
  'Export language must not mutate the screen locale.');
assert.match(reportPage, /if \(action === 'print'\) await printPdfBlob\(blob\)/,
  'Printing must use the selected-language PDF without switching screen language.');
assert.match(reportPage, /setPreparingExport\(true\)/,
  'The export dialog must remain open while the file is being prepared.');
assert.doesNotMatch(reportPage, /downloadExcelCsv|CSV بيانات خام/,
  'Only the requested Excel, PDF and Print actions may be visible.');
assert.match(reportPage, /<MathWorldLoading compact message=\{ar/,
  'Export progress should use the unified branded loader.');
const navbar = read('src/components/layout/Navbar.tsx');
assert.match(navbar, /!mounted \|\| isLoading \|\| sessionUnavailable/,
  'Navbar must not display temporary Sign in during session verification or API outage.');
assert.match(navbar, /planError \|\| !subscription/,
  'Mobile navigation must not infer Free permissions when subscription API fails.');
assert.match(navbar, /<MathWorldLoading compact \/>/,
  'Mobile navigation should reuse the approved MathWorld loader.');
console.log('PASS: branded sitewide loaders, authenticated API state, no fake fallbacks, bilingual export dialog.');

console.log('PASS: MathWorld learner/admin UX and sitewide public-catalog request-efficiency contracts');

const scopedGrades=read('src/app/[locale]/(dashboard)/admin/learning-tracks/page.tsx');
assert.doesNotMatch(scopedGrades,/useGetTrackInventoryQuery|useMapTrackMutation|toggle\('SkillIds'|toggle\('ProblemIds'/,'Grade editing must not expose manual skill or question mapping.');
assert.match(scopedGrades,/university-level-1','university-level-2/,'University admin catalog must only show the two levels.');
assert.match(scopedGrades, /<TooltipTrigger asChild><Link[^>]+aria-label=\{ar\?'عرض الفئات':'View categories'\}><Shapes[^>]+\/><\/Link><\/TooltipTrigger>/,'Grade category action is an icon-only accessible link with tooltip.');
assert.match(scopedGrades, /<Pencil className="h-4 w-4" aria-hidden="true"\/>/,'Grade edit action uses a labelled icon.');
assert.match(read('src/app/[locale]/(dashboard)/admin/stages/page.tsx'),/<TooltipTrigger asChild><Link[^>]+aria-label=\{ar\?"عرض الصفوف والمستويات":"View grades and levels"\}><Layers/,'Stage table uses an icon action with tooltip.');
assert.match(read('src/app/[locale]/(dashboard)/admin/categories/page.tsx'),/<TooltipTrigger asChild><Link[^>]+aria-label=\{locale==="ar"\?"عرض المسائل":"View problems"\}><BookOpenText/,'Category table uses an icon action with tooltip.');
assert.match(read('src/style/components.css'),/\.text-gradient-math, \.sr-title-accent, \.dark \.sr-title-accent\s*\{[\s\S]*?animation: mw-title-wave/,'Legacy headings must share the canonical animated gradient.');
const scopedTopics=read('src/app/[locale]/(dashboard)/admin/categories/page.tsx');
const editor=read('src/components/editorial/EditorialWorkspace.tsx');
const componentStyle=read('src/style/components.css');
assert.match(scopedGrades,/href=\{'\/admin\/categories\?stageId='\+stageFilter\+'&trackId='\+x.Track.Id\}/);
assert.match(scopedTopics,/track.currentData\?\.CategoryIds.includes\(cat.Id\)/);
assert.doesNotMatch(scopedTopics,/"اختيار الصف" : "Choose grade"/);
assert.doesNotMatch(componentStyle,/:where\(h1,h2,h3,h4,h5,h6\)/);
assert.match(editor,/<ProblemAuthoringGuide\/>/);
assert.match(editor,/<ProblemTitle text=\{showPair\(content.Title\)\}/);
// The new video step precedes the final preview; publication must still be restricted to preview.
assert.match(editor,/if\(busy\|\|!canSubmit\|\|step!==6/);
assert.match(editor,/step===5&&c\.YoutubeSolutionUrl/);
assert.match(editor,/step===6&&editable&&canSubmit/);
console.log('PASS: scoped admin content, explicit brand headings, original guide, gated editor and math titles.');

const skillsPopover=read('src/components/curriculum/CategorySkillsDialog.tsx');
assert.match(skillsPopover,/Popover\.Root modal=\{false\}/);
assert.match(skillsPopover,/Popover\.Arrow/);

// Cross-slice student progress must be refreshed only after successful writes.
const userApi=read('src/store/api/usersApi.ts');
const selectTrackBlock=stageApi.slice(stageApi.indexOf('selectTrack:builder.mutation'),stageApi.indexOf('getTrackContinue:builder.query'));
assert.match(selectTrackBlock,/await queryFulfilled;[\s\S]*?usersApi\.util\.invalidateTags\(\[[^\]]*'Favorite'[^\]]*'Solved'/);
const favoriteBlock=userApi.slice(userApi.indexOf('toggleFavorite: builder.mutation'),userApi.indexOf('checkFavorite: builder.query'));
assert.match(favoriteBlock,/await queryFulfilled;\s*dispatch\(stagesApi\.util\.invalidateTags\(\['TrackPracticeState'\]\)\)/);
assert.match(favoriteBlock,/invalidatesTags: \(_result, error, \{ ProblemId \}\) => error \? \[\] :/);
console.log('PASS: successful grade and favorite writes refresh dependent student caches.');

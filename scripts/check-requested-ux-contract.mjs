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
assert.match(card, /flex flex-row items-start justify-between/, 'Mobile and desktop should keep the score and action in the top corner');
assert.match(card, /flex shrink-0 flex-col items-end/, 'Star and view action should be vertically aligned in the top corner');
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
assert.match(categories, /'المفضلة بتضل محفوظة، والتصفير ما فيك تتراجع عنه.'/,
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

assert.match(categories, /<LockedPremiumDialog topicName=\{name\}>/, 'Locked categories must stay gated');
assert.match(categories, /<CategorySkillsDialog stageId=\{stageId\}/, 'Learner topics show API-owned category skill descriptions.');
assert.match(categories, /onClick=\{\(\) => setSkillsCategory/, 'Category skills open separately from Premium access.');
const publicCategories = read('src/app/[locale]/stages/[stageId]/StageCategoriesClient.tsx');
assert.match(publicCategories, /<CategorySkillsDialog stageId=\{stageId\}/,
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

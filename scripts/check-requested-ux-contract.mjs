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
assert.match(categories, /<LockedPremiumDialog key=\{category\.Id\}/, 'Locked categories must stay gated');

assert.match(challenge, /useGetStudentSubscriptionQuery/, 'Challenge must check Premium membership');
assert.match(challenge, /data\.Problems\.map/, 'Show a progress marker for each challenge question');
assert.match(challenge, /findIndex\(problem => !problem\.IsAnswered\)/, 'Challenge must resume first unanswered question');
assert.match(challenge, /'دفتر الأخطاء'/, 'Challenge must guide students to their error notebook');
assert.match(solver, /pauseChallengeAdvance/, 'Student must be able to pause auto-advance to read the solution');
assert.match(solver, /nextChallengeUrl/, 'Guided solver must support the next question');
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

console.log('PASS: MathWorld learner/admin UX and sitewide public-catalog request-efficiency contracts');

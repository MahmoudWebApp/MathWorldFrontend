'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { BookOpen, LockKeyhole, RefreshCw, RotateCcw } from 'lucide-react';
import { useGetLearningStageQuery, useGetLearningJourneyQuery, useResetPracticeMutation } from '@/store/api/usersApi';
import { useGetStageCategoryAccessQuery, useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { getStageAccent } from '@/lib/stageVisuals';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

export default function StudentCategoriesPage() {
  const [target, setTarget] = useState<{ categoryId?: number; name: string } | null>(null);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetPractice, { isLoading: resetting }] = useResetPracticeMutation();
  const locale = useLocale();
  const ar = locale === 'ar';
  const { data: selected, isLoading: selecting, isError: selectedError, refetch: reloadSelected } = useGetLearningStageQuery();
  const stageId = selected?.StageId ?? 0;
  const { data: journey } = useGetLearningJourneyQuery(stageId, {
    skip: stageId <= 0,
    refetchOnMountOrArgChange: 45,
  });
  const categoryProgress = new Map((journey?.Categories ?? []).map(item => [item.CategoryId, item]));
  const { data: access, isLoading: loadingAccess, isError: accessError, refetch: reloadAccess } =
    useGetStageCategoryAccessQuery(stageId, { skip: stageId <= 0, refetchOnMountOrArgChange: 45 });
  const { data: subscription, isLoading: loadingPlan, isError: planError, refetch: reloadPlan } =
    useGetStudentSubscriptionQuery(undefined, { refetchOnMountOrArgChange: 45 });
  const accent = getStageAccent({ Id: stageId, NameAr: selected?.NameAr, NameEn: selected?.NameEn });
  const loading = selecting || (stageId > 0 && (loadingAccess || loadingPlan));
  const failed = selectedError || accessError || planError;
  const stageName = ar ? selected?.NameAr : selected?.NameEn;
  const unlocked = new Set(access?.FreeCategoryIds ?? []);
  async function confirmReset() {
    if (!target || resetting || stageId <= 0) return;
    setResetError('');
    try {
      await resetPractice({ StageId: stageId, CategoryId: target.categoryId }).unwrap();
      setResetMessage(ar ? `بدأ تدريب جديد في ${target.name}.` :
        `A new practice cycle has started in ${target.name}.`);
      setTarget(null);
    } catch {
      setResetError(ar ? 'تعذرت إعادة التدريب. لم يتغير تقدمك.' :
        'Practice restart failed. Your progress was not changed.');
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{ar ? 'الفئات' : 'Topics'}</h1>
          {stageName && <p className="mt-2 text-sm text-muted-foreground">{ar ? 'المرحلة التعليمية:' : 'Learning stage:'} {stageName}</p>}
        </div>
        {(journey?.AttemptedProblems ?? 0) > 0 && stageId > 0 && (
          <button type="button" disabled={resetting} onClick={() => { setResetError(''); setTarget({
            name: stageName || (ar ? 'المرحلة الحالية' : 'current stage'),
          }); }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-sm font-semibold">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {ar ? 'إعادة تدريب المرحلة' : 'Restart stage'}
          </button>
        )}
      </header>
      <Dialog open={!!target} onOpenChange={open => { if (!open && !resetting) setTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar ? 'تأكيد إعادة التدريب' : 'Confirm practice restart'}</DialogTitle>
            <DialogDescription>
              {ar ? 'إعادة تدريب ' + (target?.name ?? '') + ' من البداية؟'
                : 'Restart all practice in ' + (target?.name ?? '') + '?'}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-7 text-muted-foreground">{ar
            ? 'رح تصير مسائل هذا النطاق جديدة، وينمسح تقدم دورتك الحالية وأخطاؤها. المفضلة محفوظة، وما في تراجع.'
            : 'Questions in this scope become new. The current progress and error notebook reset, while favorites remain. This cannot be undone.'}</p>
          {resetError && <p role="alert" className="text-sm text-destructive">{resetError}</p>}
          <DialogFooter>
            <button type="button" disabled={resetting} onClick={() => setTarget(null)}
              className="min-h-11 rounded-xl border border-border px-4 py-2.5 font-bold disabled:opacity-50">
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="button" disabled={resetting} onClick={() => void confirmReset()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-bold text-white disabled:opacity-50">
              <RotateCcw className="h-4 w-4" aria-hidden="true"/>
              {resetting ? (ar ? 'جارٍ إعادة التدريب…' : 'Restarting…') : (ar ? 'تأكيد إعادة التدريب' : 'Confirm restart')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {!target && resetMessage && <p role="status" className="font-semibold text-primary">{resetMessage}</p>}
      {loading ? (
        <div role="status" aria-busy="true" aria-label={ar ? 'جارٍ تحميل فئات مرحلتك' : 'Loading your topics'} className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-52 rounded-3xl border border-border/70 bg-card/70 p-5">
            <div className="h-10 w-10 rounded-xl bg-muted/70" />
            <div className="mt-4 h-6 w-2/3 rounded bg-muted/70" />
            <div className="mt-4 h-4 w-full rounded bg-muted/60" />
            <div className="mt-2 h-4 w-3/4 rounded bg-muted/60" />
          </div>)}
        </div>
      ) : failed ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 p-6">
          <p>{ar ? 'تعذّر تحميل الفئات أو صلاحيات الحساب.' : 'Could not load topics or subscription access.'}</p>
          <button type="button" onClick={() => { void reloadSelected(); if(stageId>0) void reloadAccess(); void reloadPlan(); }}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold">
            <RefreshCw size={16} />{ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : stageId <= 0 ? (
        <section className="rounded-3xl border bg-card p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-9 w-9 text-primary" />
          <h2 className="text-lg font-bold">{ar ? 'اختر مرحلتك التعليمية لتبدأ' : 'Select your learning stage to begin'}</h2>
          <Link href="/learning-stage" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">
            {ar ? 'اختيار المرحلة' : 'Choose stage'}
          </Link>
        </section>
      ) : !access || !subscription ? (
        <p className="rounded-2xl border p-6 text-muted-foreground">{ar ? 'تعذّر التحقق من صلاحيات الفئات. أعد المحاولة.' : 'Unable to verify your topic access. Please retry.'}</p>
      ) : access.Categories.length === 0 ? (
        <p className="rounded-2xl border p-8 text-center text-muted-foreground">{ar ? 'لا توجد فئات منشورة لهذه المرحلة حالياً.' : 'No published topics for this stage yet.'}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {subscription.IsPremium
              ? (ar ? 'جميع فئات مرحلتك متاحة.' : 'All topics in your stage are available.')
              : (ar ? 'الفئات المفتوحة جاهزة للتعلّم. اضغط القفل لمعرفة مميزات Premium.' : 'Practice unlocked topics; tap a lock to explore Premium benefits.')}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {[...access.Categories].sort((a,b)=>a.Order-b.Order || a.Id-b.Id).map(category => {
              const name = ar ? category.NameAr : category.NameEn;
              const description = ar ? category.DescriptionAr : category.DescriptionEn;
              const locked = !subscription.IsPremium && !unlocked.has(category.Id);
              const empty = category.ProblemsCount === 0;
              const iconUrl = category.Icon;
              const progress = categoryProgress.get(category.Id);
              const solvedCount = progress?.SolvedProblems ?? 0;
              const totalCount = progress?.TotalProblems ?? category.ProblemsCount ?? 0;
              const completion = totalCount > 0 ? Math.min(100, Math.round(100 * solvedCount / totalCount)) : 0;
              const card = (
                <div className="flex h-full min-h-52 flex-col rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md" style={{ borderColor: `${accent}33` }}>
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm"
                      style={{ backgroundColor: `${accent}18`, borderColor: `${accent}40` }}>
                      {iconUrl && (iconUrl.startsWith('/') || iconUrl.startsWith('https://'))
                        ? <Image src={iconUrl} alt="" width={36} height={36} unoptimized className="h-9 w-9 object-contain" />
                        : <BookOpen className="h-6 w-6" style={{color:accent}} />}
                    </div>
                    {locked && <LockKeyhole className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
                  </div>
                  <h2 className="text-base font-bold" style={{ color: accent }}>{name}</h2>
                  {description && <p className="mt-2 line-clamp-3 text-xs leading-6 text-muted-foreground">{description}</p>}
                  {progress && progress.AttemptedProblems > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs text-muted-foreground">
                        {ar
                          ? `حللت ${solvedCount} من ${totalCount} · أتقنت ${progress.MasteredProblems} مسألة`
                          : `Solved ${solvedCount} of ${totalCount} · mastered ${progress.MasteredProblems}`}
                      </p>
                      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}
                        aria-label={ar ? `تقدمك في ${name}` : `Your progress in ${name}`}
                        className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${completion}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="mt-auto pt-4 text-xs font-semibold text-muted-foreground">
                    {locked ? (ar ? 'Premium · مقفولة' : 'Premium · Locked')
                      : empty ? (ar ? 'لا توجد مسائل حالياً' : 'No problems yet')
                      : `${category.ProblemsCount ?? 0} ${ar ? 'مسألة' : 'problems'}`}
                  </div>
                  {!locked && (
                    <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border/60 pt-4 sm:grid-cols-2">
                      {empty ? (
                        <span aria-disabled="true" className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-muted px-2 py-2 text-center text-xs font-bold text-muted-foreground">
                          <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {ar ? 'عرض المسائل' : 'View questions'}
                        </span>
                      ) : (
                        <Link href={`/dashboard/problems?categoryId=${category.Id}&stageId=${stageId}`}
                          className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-primary px-2 py-2 text-center text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                          <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {ar ? 'عرض المسائل' : 'View questions'}
                        </Link>
                      )}
                      <button type="button" disabled={resetting || (progress?.AttemptedProblems ?? 0) <= 0}
                        title={(progress?.AttemptedProblems ?? 0) <= 0
                          ? (ar ? 'ابدأ بحل مسألة أولاً' : 'Solve a question first') : undefined}
                        onClick={() => { setResetError(''); setTarget({ categoryId: category.Id, name }); }}
                        className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-amber-500/40 px-2 py-2 text-center text-xs font-bold text-foreground transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40">
                        <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {ar ? 'إعادة التدريب' : 'Restart practice'}
                      </button>
                    </div>
                  )}
                </div>
              );
              if (locked) return (
                <LockedPremiumDialog key={category.Id} topicName={name}>
                  <button type="button" className="h-full w-full text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-label={ar ? `${name} مقفولة` : `${name} locked`}>{card}</button>
                </LockedPremiumDialog>
              );
              return <div key={category.Id} className={empty ? 'h-full opacity-75' : 'h-full'}>{card}</div>;
            })}
          </div>
        </>
      )}
    </main>
  );
}

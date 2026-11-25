'use client';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { BarChart3, Download, Printer, LockKeyhole } from 'lucide-react';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { Link } from '@/i18n/routing';
import type { RootState } from '@/store';
import { useGetPremiumProgressReportQuery } from '@/store/api/usersApi';
import { useGetStagesQuery } from '@/store/api/stagesApi';

const formatCell = (value: string | number) => {
  const text = String(value);
  const safe = /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
};

export default function PremiumProgressReportPage() {
  const ar = useLocale() === 'ar';
  const user = useSelector((state: RootState) => state.auth.user);
  const premium = user?.SubscriptionType?.toLowerCase() === 'premium';
  const stageId = user?.CurrentStageId ?? null;
  const [chosenStage, setChosenStage] = useState<number | null>(null);
  const { data: stages } = useGetStagesQuery(ar ? 'ar' : 'en', {
    skip: !premium,
  });
  const activeStage = chosenStage ?? stageId ?? undefined;
  const { data, isLoading, error, refetch } =
    useGetPremiumProgressReportQuery(activeStage, {
      skip: !premium || !activeStage,
      refetchOnMountOrArgChange: true,
    });
  const isForbidden = !!error && typeof error === 'object' &&
    'status' in error && error.status === 403;
  const nf = useMemo(() => new Intl.NumberFormat(ar ? 'ar' : 'en'), [ar]);

  const downloadCsv = () => {
    if (!data) return;
    const lines: (string | number)[][] = [
      ['Category', 'Total problems', 'Attempted', 'Solved',
        'First try correct', 'Mastered', 'Completion %', 'Awarded points'],
      ...data.Categories.map(row => [
        row.Name, row.TotalProblems, row.AttemptedProblems, row.SolvedProblems,
        row.FirstTryCorrect, row.MasteredProblems, row.CompletionPercent,
        row.OfficialPoints,
      ]),
    ];
    const csv = '\uFEFF' + lines.map(row => row.map(formatCell).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mathworld-stage-${data.StageId}-report.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8 print:max-w-none print:px-0 print:py-0 print:text-black">
      
      <header>
        <WorkspacePageHeader title={ar?'تقرير التقدم':'Progress report'} icon={BarChart3}/>
        
      </header>

      {!premium ? (
        <section className="math-card rounded-2xl border border-border p-6">
          <LockKeyhole className="mb-3 h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="font-bold">{ar ? 'هذه الميزة لمشتركي Premium' : 'Premium members only'}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {ar ? 'تقدر تكمل حل المسائل المتاحة لك بدون حد يومي.' :
              'You can continue solving available problems with no daily limit.'}
          </p>
          <LockedPremiumDialog>
            <button type="button" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary">
              {ar ? 'عرض مميزات الحساب' : 'Compare account benefits'}
            </button>
          </LockedPremiumDialog>
        </section>
      ) : !activeStage ? (
        <section className="math-card rounded-2xl border border-border p-6">
          <h2 className="font-bold">
            {ar ? 'اختر مرحلتك التعليمية لعرض التقرير' : 'Choose a learning stage to view your report'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {ar ? 'تقدمك السابق محفوظ، بس لازم تختار المرحلة اللي بدك تشوف تقريرها.'
              : 'Your past work is preserved. Select a stage to see its report.'}
          </p>
          <Link href="/learning-stage"
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            {ar ? 'اختيار المرحلة' : 'Choose stage'}
          </Link>
        </section>
      ) : (
        <>
          {isForbidden && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-card p-5">
              {ar ? 'صلاحية Premium تغيّرت. حدّث ملف حسابك أو راجع الإدارة.'
                : 'Your Premium access has changed. Refresh your account or contact an admin.'}
            </p>
          )}
          {error && !isForbidden && (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-5">
              <p>{ar ? 'تعذر تحميل التقرير حالياً.' : 'The report could not be loaded.'}</p>
              <button type="button" onClick={() => void refetch()} className="mt-2 text-primary underline">
                {ar ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}
          {isLoading && !data && (
            <div role="status" className="math-card rounded-xl border border-border p-6 text-center text-muted-foreground">
              {ar ? 'جارٍ إعداد التقرير...' : 'Loading your report...'}
            </div>
          )}
          {data && !error && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{data.StageName}</h2>
                  {stages && stages.length > 1 && (
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      <span>{ar ? 'المرحلة' : 'Stage'}</span>
                      <select
                        aria-label={ar ? 'مرحلة التقرير' : 'Report stage'}
                        value={activeStage ?? ''}
                        onChange={event => setChosenStage(Number(event.target.value))}
                        className="rounded-xl border border-border bg-card px-3 py-2 print:hidden"
                      >
                        {stages.map(stage => (
                          <option key={stage.Id} value={stage.Id}>
                            {ar ? stage.NameAr : stage.NameEn}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                  <button type="button" onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
                    <Printer className="h-4 w-4" aria-hidden />
                    {ar ? 'طباعة أو حفظ PDF' : 'Print / Save as PDF'}
                  </button>
                  
                  <button type="button" onClick={downloadCsv}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                    <Download className="h-4 w-4" aria-hidden />
                    {ar ? 'تصدير CSV لـExcel' : 'Export CSV for Excel'}
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: ar ? 'نسبة الإنجاز' : 'Completion', value: `${data.CompletionPercent}%` },
                  { label: ar ? 'المسائل المحلولة' : 'Solved', value: `${nf.format(data.SolvedProblems)}/${nf.format(data.TotalProblems)}` },
                  { label: ar ? 'صحيحة من أول مرة' : 'First-try correct', value: nf.format(data.FirstTryCorrect) },
                  { label: ar ? 'نقاط مكتسبة' : 'Awarded points', value: nf.format(data.OfficialPoints) },
                ].map(item => (
                  <div key={item.label} className="math-card rounded-2xl border border-border p-5">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <strong className="mt-2 block text-2xl font-bold">{item.value}</strong>
                  </div>
                ))}
              </div>
              <section className="math-card rounded-2xl border border-border p-5">
                <h2 className="mb-4 text-lg font-bold">
                  {ar ? 'التقدم في كل فئة' : 'Progress by category'}
                </h2>
                {data.Categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {ar ? 'لا توجد فئات في هذه المرحلة بعد.' : 'No categories in this stage yet.'}
                  </p>
                )}
                <div className="space-y-4">
                  {data.Categories.map(category => (
                    <article key={category.CategoryId}>
                      <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                        <h3 className="font-semibold">{category.Name}</h3>
                        <span className="tabular-nums text-muted-foreground">
                          {nf.format(category.SolvedProblems)}/{nf.format(category.TotalProblems)}
                          {' · '}{category.CompletionPercent}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar" aria-valuenow={category.CompletionPercent}
                        aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(0, Math.min(100, category.CompletionPercent))}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ar ? 'متقنة' : 'Mastered'}: {nf.format(category.MasteredProblems)}
                        {' · '}{ar ? 'نقاط' : 'Points'}: {nf.format(category.OfficialPoints)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
              <p className="text-xs text-muted-foreground print:hidden">
                {ar ? 'التصدير الحالي CSV متوافق مع Excel. ملفات XLSX وPDF الأصلية ضمن المرحلة التالية.'
                  : 'Current export is Excel-compatible CSV. Native XLSX and PDF are planned separately.'}
              </p>
            </>
          )}
        </>
      )}
    </main>
  );
}

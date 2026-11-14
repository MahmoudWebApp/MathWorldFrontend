'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { BarChart3, Download, FileText, LockKeyhole, Printer, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/routing';
import {
  useGetStudentEntitlementQuery,
  useGetPremiumAnalyticsQuery,
  type StudentPremiumAnalyticsReport,
} from '@/store/api/usersApi';

function csvCell(value: unknown): string {
  let text = String(value ?? '');
  // Protect spreadsheet software from interpreting names as formulas.
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""').replace(/[\r\n]/g, ' ') + '"';
}

function saveCsv(report: StudentPremiumAnalyticsReport) {
  const rows: unknown[][] = [[
    'StageId', 'CategoryId', 'StageAr', 'StageEn', 'CategoryAr', 'CategoryEn',
    'AttemptedProblems', 'SolvedProblems', 'ErrorNotebookProblems',
    'Attempts', 'CorrectAttempts', 'IncorrectAttempts',
    'FirstTryCorrect', 'Points', 'TimeSpentSeconds',
  ]];
  report.Categories.forEach(category => rows.push([
    category.StageId, category.CategoryId,
    category.StageNameAr, category.StageNameEn,
    category.CategoryNameAr, category.CategoryNameEn,
    category.AttemptedProblems, category.SolvedProblems,
    category.ErrorNotebookProblems, category.Attempts,
    category.CorrectAttempts, category.IncorrectAttempts,
    category.FirstTryCorrect, category.AwardedPoints, category.TimeSpentSeconds,
  ]));
  rows.push([
    'TOTAL', '', '', '', '', '', report.AttemptedProblems, report.SolvedProblems,
    report.Categories.reduce((sum, c) => sum + c.ErrorNotebookProblems, 0),
    report.Attempts, report.CorrectAttempts, report.IncorrectAttempts,
    report.FirstTryCorrect, report.AwardedPoints, report.TimeSpentSeconds,
  ]);
  const contents = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'mathworld-personal-report.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function PremiumAnalyticsPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const isStudent = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
      state.auth.isAuthenticated && state.auth.user?.Role === 'Student',
  );
  const { data: entitlement, isLoading: loadingEntitlement, isError: entitlementError,
    refetch: refetchEntitlement } = useGetStudentEntitlementQuery(undefined, { skip: !isStudent });
  const premium = entitlement?.IsPremium === true;
  const { data: report, isLoading, isError, refetch } = useGetPremiumAnalyticsQuery(undefined, {
    skip: !isStudent || !premium,
    refetchOnMountOrArgChange: true,
  });

  const tiles = report ? [
    { label: ar ? 'المسائل المحلولة' : 'Unique solved', value: report.SolvedProblems },
    { label: ar ? 'عدد المحاولات' : 'Total attempts', value: report.Attempts },
    { label: ar ? 'الإجابات الصحيحة' : 'Correct attempts', value: report.CorrectAttempts },
    { label: ar ? 'النقاط المكتسبة' : 'Earned points', value: report.AwardedPoints },
  ] : [];
  const correctness = report && report.Attempts > 0
    ? Math.round(report.CorrectAttempts / report.Attempts * 100) : 0;

  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-7 px-4 py-8 print:max-w-none print:p-0">
      <style jsx global>{`
        @media print {
          body > div header.sticky, body > div footer { display: none !important; }
          .premium-report-actions { display: none !important; }
          .premium-report-table { overflow: visible !important; }
          .premium-report-card { break-inside: avoid; box-shadow: none !important; }
        }
      `}</style>
      <div className="premium-report-actions">
        <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          {ar ? 'العودة للوحة الطالب' : 'Back to dashboard'}
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-extrabold">
            <BarChart3 className="h-7 w-7 text-primary" />
            {ar ? 'تقرير تقدمي في الرياضيات' : 'My mathematics progress report'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ar ? 'بيانات حقيقية من المحاولات المحفوظة في حسابك.' : 'Verified aggregates from your saved answer attempts.'}
          </p>
        </div>
        {report && (
          <div className="premium-report-actions flex flex-wrap gap-2">
            <button type="button" onClick={() => saveCsv(report)}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold hover:bg-muted">
              <Download className="h-4 w-4" />
              {ar ? 'Excel / CSV' : 'Excel / CSV'}
            </button>
            <button type="button" onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground">
              <Printer className="h-4 w-4" />
              {ar ? 'طباعة / حفظ PDF' : 'Print / save as PDF'}
            </button>
          </div>
        )}
      </div>

      {!isStudent ? (
        <div className="premium-report-actions rounded-2xl border p-6">
          <p className="mb-3">{ar ? 'سجّل الدخول بحساب طالب لعرض التقرير.' : 'Sign in with a student account to view the report.'}</p>
          <Link href="/login" className="font-semibold text-primary underline">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link>
        </div>
      ) : loadingEntitlement ? (
        <p role="status" className="py-10 text-center">{ar ? 'جارٍ التحقق من اشتراكك…' : 'Checking Premium access…'}</p>
      ) : entitlementError ? (
        <div role="alert" className="premium-report-actions space-y-3 rounded-2xl border p-6">
          <p>{ar ? 'تعذّر التحقق من صلاحية اشتراكك.' : 'Subscription verification failed.'}</p>
          <button onClick={() => void refetchEntitlement()} className="font-semibold text-primary">
            <RefreshCw className="me-2 inline h-4 w-4" />{ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : !premium ? (
        <div className="premium-report-actions space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <LockKeyhole className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold">{ar ? 'التقرير المتقدم من مزايا Premium' : 'Advanced reports require Premium'}</h2>
          <p className="text-sm text-muted-foreground">
            {ar ? 'حسابك المجاني يمكنه الاستمرار بحل مسائل غير محدودة ضمن فئتين بكل مرحلة.'
              : 'Free accounts can still solve unlimited problems in two unlocked categories per stage.'}
          </p>
          <Link href="/premium" className="inline-flex rounded-xl border border-primary/30 px-4 py-2 font-semibold text-primary">
            {ar ? 'عرض مزايا Premium' : 'Explore Premium'}
          </Link>
        </div>
      ) : isLoading ? (
        <p role="status" className="py-10 text-center">{ar ? 'جارٍ إعداد التقرير…' : 'Preparing report…'}</p>
      ) : isError || !report ? (
        <div role="alert" className="premium-report-actions space-y-3 rounded-2xl border p-6">
          <p>{ar ? 'تعذّر جلب التقرير.' : 'Could not load the report.'}</p>
          <button className="font-semibold text-primary" onClick={() => void refetch()}>
            {ar ? 'إعادة المحاولة' : 'Try again'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map(tile => (
              <section className="premium-report-card rounded-2xl border bg-card p-4 shadow-sm sm:p-5" key={tile.label}>
                <p className="text-xs text-muted-foreground sm:text-sm">{tile.label}</p>
                <strong className="mt-2 block text-2xl font-extrabold tabular-nums text-primary sm:text-3xl">{tile.value}</strong>
              </section>
            ))}
          </div>
          <div className="premium-report-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5">
            <div>
              <h2 className="font-bold">{ar ? 'دقة جميع المحاولات' : 'Overall attempt accuracy'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {ar ? 'عدد الإجابات الصحيحة مقسوماً على إجمالي المحاولات.'
                  : 'Correct answers divided by all recorded attempts.'}
              </p>
            </div>
            <strong className="text-3xl font-extrabold text-primary">{correctness}%</strong>
          </div>
          <section className="premium-report-card space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-5 w-5 text-primary" />
                {ar ? 'التقدم حسب المرحلة والفئة' : 'Progress by stage and category'}
              </h2>
              <time dateTime={report.GeneratedAtUtc} className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(ar ? 'ar' : 'en', {dateStyle:'medium'}).format(new Date(report.GeneratedAtUtc))}
              </time>
            </div>
            {report.Categories.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {ar ? 'ما عندك محاولات بعد. ابدأ الحل حتى تظهر إحصائياتك.'
                  : 'No attempts recorded yet. Start solving to populate your report.'}
              </p>
            ) : (
              <div className="premium-report-table overflow-x-auto">
                <table className="w-full min-w-[660px] border-collapse text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="p-3 text-start">{ar ? 'المرحلة' : 'Stage'}</th>
                      <th className="p-3 text-start">{ar ? 'الفئة' : 'Category'}</th>
                      <th className="p-3 text-end">{ar ? 'المحلولة' : 'Solved'}</th>
                      <th className="p-3 text-end">{ar ? 'المحاولات' : 'Attempts'}</th>
                      <th className="p-3 text-end">{ar ? 'الصحيحة' : 'Correct'}</th>
                      <th className="p-3 text-end">{ar ? 'دفتر الأخطاء' : 'Error notebook'}</th>
                      <th className="p-3 text-end">{ar ? 'النقاط' : 'Points'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.Categories.map(category => (
                      <tr key={category.CategoryId} className="border-t">
                        <td className="p-3">{ar ? category.StageNameAr : category.StageNameEn}</td>
                        <td className="p-3 font-medium">{ar ? category.CategoryNameAr : category.CategoryNameEn}</td>
                        <td className="p-3 text-end tabular-nums">{category.SolvedProblems}</td>
                        <td className="p-3 text-end tabular-nums">{category.Attempts}</td>
                        <td className="p-3 text-end tabular-nums">{category.CorrectAttempts}</td>
                        <td className="p-3 text-end tabular-nums">{category.ErrorNotebookProblems}</td>
                        <td className="p-3 text-end tabular-nums">{category.AwardedPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground print:text-black">
              {ar ? 'يمكن حفظ التقرير بصيغة PDF من نافذة الطباعة، أو تنزيل CSV لفتحه في Excel.'
                : 'Use the print dialog to save a PDF, or download CSV for Excel.'}
            </p>
          </section>
        </>
      )}
    </main>
  );
}

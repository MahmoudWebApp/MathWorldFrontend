'use client';

import { useLocale } from 'next-intl';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart3, Download, FileText, LockKeyhole, Printer, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import {
  useGetStudentEntitlementQuery,
  useGetPremiumAnalyticsQuery,
  useExportPremiumAnalyticsXlsxMutation,
  useExportPremiumAnalyticsPdfMutation,
  useExportPremiumAnalyticsCsvMutation,
} from '@/store/api/usersApi';

function formatReportDate(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export default function PremiumAnalyticsPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const [reportLanguage, setReportLanguage] = useState<'ar' | 'en'>(ar ? 'ar' : 'en');
  const reportAr = reportLanguage === 'ar';
  const isStudent = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
      state.auth.isAuthenticated && state.auth.user?.Role === 'Student',
  );
  const { data: entitlement, isLoading: loadingEntitlement, isError: entitlementError,
    refetch: refetchEntitlement } = useGetStudentEntitlementQuery(undefined, { skip: !isStudent });
  const premium = entitlement?.IsPremium === true;
  const [exportXlsx, { isLoading: exportingXlsx }] =
    useExportPremiumAnalyticsXlsxMutation();
  const [exportCsv, { isLoading: exportingCsv }] =
    useExportPremiumAnalyticsCsvMutation();
  const [exportPdf, { isLoading: exportingPdf }] =
    useExportPremiumAnalyticsPdfMutation();
  const [downloadError, setDownloadError] = useState(false);

  const saveReportFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      // Firefox may need the object URL after the synthetic click returns.
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    }
  };

  const downloadExcelCsv = async () => {
    setDownloadError(false);
    try {
      const blob = await exportCsv(reportLanguage).unwrap();
      if (!(blob instanceof Blob) || blob.size < 20 || blob.size > 20_000_000 ||
        !blob.type.toLowerCase().includes('text/csv')) {
        throw new Error('Invalid CSV response');
      }
      // UTF-8 BOM is sent by the backend so Excel preserves Arabic text.
      saveReportFile(blob, `mathworld-premium-analytics-${reportLanguage}.csv`);
    } catch {
      setDownloadError(true);
    }
  };

  const downloadExcel = async () => {
    setDownloadError(false);
    try {
      const blob = await exportXlsx(reportLanguage).unwrap();
      if (!(blob instanceof Blob) || blob.size < 100 || blob.size > 20_000_000 ||
        !blob.type.toLowerCase().includes('spreadsheetml.sheet')) {
        throw new Error('Invalid XLSX response');
      }
      // Reject an HTTP error page disguised as .xlsx before saving.
      const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      if (signature[0] !== 0x50 || signature[1] !== 0x4b ||
        signature[2] !== 0x03 || signature[3] !== 0x04) {
        throw new Error('Invalid XLSX ZIP signature');
      }
      saveReportFile(blob, `mathworld-premium-analytics-${reportLanguage}.xlsx`);
    } catch {
      setDownloadError(true);
    }
  };

  const downloadPdf = async () => {
    setDownloadError(false);
    try {
      const blob = await exportPdf(reportLanguage).unwrap();
      if (!(blob instanceof Blob) || blob.size < 100 || blob.size > 20_000_000 ||
        !blob.type.toLowerCase().includes('application/pdf')) {
        throw new Error('Invalid PDF response');
      }
      const signature = new TextDecoder('ascii').decode(
        await blob.slice(0, 5).arrayBuffer());
      if (signature !== '%PDF-') throw new Error('Invalid PDF signature');
      saveReportFile(blob, `mathworld-premium-analytics-${reportLanguage}.pdf`);
    } catch {
      setDownloadError(true);
    }
  };

  const { data: report, isLoading, isError, refetch } = useGetPremiumAnalyticsQuery(undefined, {
    skip: !isStudent || !premium,
    refetchOnMountOrArgChange: true,
  });

  const tiles = report ? [
    { label: reportAr ? 'المسائل المحلولة' : 'Unique solved', value: report.SolvedProblems },
    { label: reportAr ? 'عدد المحاولات' : 'Total attempts', value: report.Attempts },
    { label: reportAr ? 'الإجابات الصحيحة' : 'Correct attempts', value: report.CorrectAttempts },
    { label: reportAr ? 'النقاط المكتسبة' : 'Earned points', value: report.AwardedPoints },
  ] : [];
  const categoriesForChart = report
    ? [...report.Categories].sort((a, b) => b.SolvedProblems - a.SolvedProblems)
        .slice(0, 10)
    : [];
  const maxCategorySolved = Math.max(1, ...categoriesForChart.map(c => c.SolvedProblems));
  const correctness = report && report.Attempts > 0
    ? Math.round(report.CorrectAttempts / report.Attempts * 100) : 0;

  return (
    <main dir={reportAr ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-7 px-4 py-8 print:max-w-none print:p-0">
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          body > div header.sticky, body > div footer { display: none !important; }
          .premium-report-actions { display: none !important; }
          .premium-report-table { overflow: visible !important; }
          .premium-report-card { break-inside: avoid; box-shadow: none !important; }
          .premium-report-chart-bar { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .premium-report-letterhead { break-after: avoid; background: #FAF8FF !important; color: #110C1E !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .premium-report-letterhead .brand-wordmark { color: #6D28D9 !important; -webkit-text-fill-color: #6D28D9 !important; }
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
            {reportAr ? 'تقرير تقدمي في الرياضيات' : 'My mathematics progress report'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {reportAr ? 'بيانات حقيقية من المحاولات المحفوظة في حسابك.' : 'Verified aggregates from your saved answer attempts.'}
          </p>
        </div>
        {report && (
          <div className="premium-report-actions flex flex-wrap items-center gap-2">
            <label htmlFor="report-export-language" className="text-sm font-semibold">
              {ar ? 'لغة التقرير' : 'Report language'}
            </label>
            <select
              id="report-export-language"
              value={reportLanguage}
              onChange={(event) => setReportLanguage(event.target.value as 'ar' | 'en')}
              className="min-h-11 rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
            <button type="button" disabled={exportingXlsx || exportingPdf}
              onClick={() => void downloadExcel()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
              <Download className="h-4 w-4" />
              {exportingXlsx ? (ar ? 'جارٍ تجهيز Excel…' : 'Preparing Excel…') :
                (ar ? 'تحميل Excel المنسّق' : 'Download formatted Excel')}
            </button>
            <button type="button" disabled={exportingPdf || exportingXlsx}
              onClick={() => void downloadPdf()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/40 px-4 py-2.5 font-semibold text-primary disabled:opacity-50">
              <Download className="h-4 w-4" />
              {exportingPdf ? (ar ? 'جارٍ تجهيز PDF…' : 'Preparing PDF…') :
                (ar ? 'تحميل PDF' : 'Download PDF')}
            </button>
            <button type="button" onClick={() => window.print()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2.5 font-semibold hover:bg-muted">
              <Printer className="h-4 w-4" />
              {ar ? 'طباعة التقرير' : 'Print report'}
            </button>
            <button type="button" disabled={exportingCsv || exportingXlsx}
              onClick={() => void downloadExcelCsv()}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 py-2 text-xs text-muted-foreground underline disabled:opacity-50">
              {ar ? 'CSV بيانات خام' : 'Raw CSV data'}
            </button>
          </div>
        )}
      </div>

      {downloadError && (
        <div role="alert" className="premium-report-actions rounded-xl border border-destructive/30 p-3 text-sm text-destructive">
          {ar ? 'تعذّر تنزيل الملف. تحقق من صلاحية Premium واتصال الإنترنت أو جرّب صيغة CSV.'
            : 'Download failed. Check Premium access and your connection, or try CSV.'}
        </div>
      )}
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
          <LockedPremiumDialog>
            <button type="button" className="inline-flex min-h-11 rounded-xl border border-primary/30 px-4 py-2 font-semibold text-primary">
              {ar ? 'عرض مزايا Premium' : 'Explore Premium'}
            </button>
          </LockedPremiumDialog>
        </div>
      ) : isLoading ? (
        <div role="status" aria-busy="true" aria-label={ar ? 'جارٍ إعداد التقرير' : 'Preparing report'} className="animate-pulse space-y-4">
          <div className="h-28 rounded-2xl border border-border/60 bg-card/70" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 rounded-2xl bg-muted/70" />)}
          </div>
          <div className="h-72 rounded-2xl border border-border/60 bg-card/70" />
        </div>
      ) : isError || !report ? (
        <div role="alert" className="premium-report-actions space-y-3 rounded-2xl border p-6">
          <p>{ar ? 'تعذّر جلب التقرير.' : 'Could not load the report.'}</p>
          <button className="font-semibold text-primary" onClick={() => void refetch()}>
            {ar ? 'إعادة المحاولة' : 'Try again'}
          </button>
        </div>
      ) : (
        <>
          <header className="premium-report-letterhead flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-pink-500/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <BrandLogo compact className="shrink-0" />
              <span className="text-xs text-muted-foreground">
                {reportAr ? 'منصة الرياضيات التفاعلية' : 'Interactive mathematics learning'}
              </span>
            </div>
            <div className="text-sm">
              <div className="font-bold">{reportAr ? 'تقرير التقدم الشخصي' : 'Personal progress report'}</div>
              <time className="text-xs text-muted-foreground" dateTime={report.GeneratedAtUtc}>
                {formatReportDate(report.GeneratedAtUtc, reportAr ? 'ar' : 'en')}
              </time>
            </div>
          </header>
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
              <h2 className="font-bold">{reportAr ? 'دقة جميع المحاولات' : 'Overall attempt accuracy'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {reportAr ? 'عدد الإجابات الصحيحة مقسوماً على إجمالي المحاولات.'
                  : 'Correct answers divided by all recorded attempts.'}
              </p>
            </div>
            <strong className="text-3xl font-extrabold text-primary">{correctness}%</strong>
          </div>
          {categoriesForChart.length > 0 && (
            <section className="premium-report-card space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
              <h2 className="text-xl font-bold">{reportAr ? 'مخطط المسائل المحلولة حسب الفئة' : 'Solved questions by topic'}</h2>
              <div className="space-y-3" role="img" aria-label={reportAr ? 'مخطط عدد المسائل المحلولة في الفئات' : 'Bar chart of solved questions by topic'}>
                {categoriesForChart.map(category => (
                  <div key={category.CategoryId} className="grid grid-cols-[minmax(0,1fr)_6rem] items-center gap-3 sm:grid-cols-[minmax(9rem,1fr)_minmax(12rem,3fr)_3rem]">
                    <span className="min-w-0 truncate text-xs font-medium sm:text-sm">
                      {reportAr ? category.CategoryNameAr : category.CategoryNameEn}
                    </span>
                    <div className="premium-report-chart-bar h-3 overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                        style={{ width: `${100 * category.SolvedProblems / maxCategorySolved}%` }} />
                    </div>
                    <span className="col-span-2 text-end text-xs font-bold tabular-nums text-primary sm:col-span-1">
                      {category.SolvedProblems}
                    </span>
                  </div>
                ))}
              </div>
              {report.Categories.length > 10 && <p className="text-xs text-muted-foreground">
                {reportAr ? 'أعلى 10 فئات حسب عدد المسائل المحلولة. التفاصيل الكاملة بالجدول.'
                  : 'Top 10 topics by solved questions. All topics are listed below.'}
              </p>}
            </section>
          )}
          <section className="premium-report-card space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-5 w-5 text-primary" />
                {reportAr ? 'التقدم حسب المرحلة والفئة' : 'Progress by stage and category'}
              </h2>
              {formatReportDate(report.GeneratedAtUtc, reportAr ? 'ar' : 'en') && (
                <time dateTime={report.GeneratedAtUtc} className="text-xs text-muted-foreground">
                  {formatReportDate(report.GeneratedAtUtc, reportAr ? 'ar' : 'en')}
                </time>
              )}
            </div>
            {report.Categories.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {reportAr ? 'ما عندك محاولات بعد. ابدأ الحل حتى تظهر إحصائياتك.'
                  : 'No attempts recorded yet. Start solving to populate your report.'}
              </p>
            ) : (
              <div className="premium-report-table overflow-x-auto">
                <table className="w-full min-w-[660px] border-collapse text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="p-3 text-start">{reportAr ? 'المرحلة' : 'Stage'}</th>
                      <th className="p-3 text-start">{reportAr ? 'الفئة' : 'Category'}</th>
                      <th className="p-3 text-end">{reportAr ? 'المحلولة' : 'Solved'}</th>
                      <th className="p-3 text-end">{reportAr ? 'المحاولات' : 'Attempts'}</th>
                      <th className="p-3 text-end">{reportAr ? 'الصحيحة' : 'Correct'}</th>
                      <th className="p-3 text-end">{reportAr ? 'دفتر الأخطاء' : 'Error notebook'}</th>
                      <th className="p-3 text-end">{reportAr ? 'النقاط' : 'Points'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.Categories.map(category => (
                      <tr key={category.CategoryId} className="border-t">
                        <td className="p-3">{reportAr ? category.StageNameAr : category.StageNameEn}</td>
                        <td className="p-3 font-medium">{reportAr ? category.CategoryNameAr : category.CategoryNameEn}</td>
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
              {reportAr ? 'التقرير المنسق متاح مباشرة بصيغتي PDF وExcel مع إحصائيات ومخططات. ملف CSV بيانات خام فقط.'
                : 'Download the formatted PDF or Excel report with real statistics and charts. CSV is for raw data only.'}
            </p>
          </section>
        </>
      )}
    </main>
  );
}

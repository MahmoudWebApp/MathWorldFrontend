'use client';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';

import { useLocale } from 'next-intl';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart3, FileDown, FileSpreadsheet, FileText, LockKeyhole, Printer, RefreshCw, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import {
  useGetStudentEntitlementQuery,
  useGetLearningJourneyQuery,
  type AnalyticsFilter,
  useGetPremiumAnalyticsQuery,
  useExportPremiumAnalyticsXlsxMutation,
  useExportPremiumAnalyticsPdfMutation,
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
  // Export language must never alter the language or direction of this page.
  const reportAr = ar;
  const [pendingExport, setPendingExport] = useState<'excel' | 'pdf' | 'print' | null>(null);
  const isStudent = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
      state.auth.isAuthenticated && state.auth.user?.Role === 'Student',
  );
  const { data: entitlement, isLoading: loadingEntitlement, isFetching: fetchingEntitlement, isError: entitlementError,
    refetch: refetchEntitlement } = useGetStudentEntitlementQuery(undefined, { skip: !isStudent });
  const premium = entitlement?.IsPremium === true;
  const journey=useGetLearningJourneyQuery(undefined,{skip:!isStudent||!premium,refetchOnMountOrArgChange:true});
  const j=journey.currentData;
  const canFilter=j?.LearningSessionsEnabled===true;
  const [scope,setScope]=useState('all');
  const [days,setDays]=useState(0);
  const filters:AnalyticsFilter=canFilter?{...(days?{days}:{}),...(scope==='stage'&&j?{stageId:j.StageId}:{}),...(scope==='track'&&j?.TrackId?{stageId:j.StageId,trackId:j.TrackId}:{}),...((scope.startsWith('category:')&&j?.Categories.some(c=>String(c.CategoryId)===scope.slice(9)))?{stageId:j.StageId,categoryId:Number(scope.slice(9)),...(j.TrackId?{trackId:j.TrackId}:{})}:{})}:{};
  const [exportXlsx, { isLoading: exportingXlsx }] =
    useExportPremiumAnalyticsXlsxMutation();
  const [exportPdf, { isLoading: exportingPdf }] =
    useExportPremiumAnalyticsPdfMutation();
  const [downloadError, setDownloadError] = useState(false);
  const [preparingExport, setPreparingExport] = useState(false);

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

  const getExcelBlob = async (language: 'ar' | 'en'): Promise<Blob> => {
    const blob = await exportXlsx({lang:language,...filters}).unwrap();
    if (!(blob instanceof Blob) || blob.size < 100 || blob.size > 20_000_000 ||
      !blob.type.toLowerCase().includes('spreadsheetml.sheet')) {
      throw new Error('Invalid XLSX response');
    }
    const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
    if (signature[0] !== 0x50 || signature[1] !== 0x4b ||
      signature[2] !== 0x03 || signature[3] !== 0x04) {
      throw new Error('Invalid XLSX ZIP signature');
    }
    return blob;
  };

  const getPdfBlob = async (language: 'ar' | 'en'): Promise<Blob> => {
    const blob = await exportPdf({lang:language,...filters}).unwrap();
    if (!(blob instanceof Blob) || blob.size < 100 || blob.size > 20_000_000 ||
      !blob.type.toLowerCase().includes('application/pdf')) {
      throw new Error('Invalid PDF response');
    }
    const signature = new TextDecoder('ascii').decode(await blob.slice(0, 5).arrayBuffer());
    if (signature !== '%PDF-') throw new Error('Invalid PDF signature');
    return blob;
  };

  // Print the actual selected-language PDF, not the onscreen page.
  // This keeps the page language and RTL/LTR direction completely untouched.
  const printPdfBlob = (blob: Blob): Promise<void> => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const frame = document.createElement('iframe');
    frame.title = 'MathWorld report print';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-9999px;top:0;border:0';
    let started = false;
    const cleanup = () => {
      frame.remove();
      URL.revokeObjectURL(url);
    };
    const timeout = window.setTimeout(() => {
      if (!started) { cleanup(); reject(new Error('Print preview timed out')); }
    }, 20000);
    frame.addEventListener('load', () => {
      if (started) return;
      started = true;
      window.clearTimeout(timeout);
      try {
        frame.contentWindow?.focus();
        if (!frame.contentWindow) throw new Error('Print frame unavailable');
        frame.contentWindow.print();
        // Keep the PDF alive while the native print dialog is open.
        window.setTimeout(cleanup, 90000);
        resolve();
      } catch (error) {
        cleanup();
        reject(error);
      }
    }, { once: true });
    frame.addEventListener('error', () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error('Could not load print preview'));
    }, { once: true });
    document.body.appendChild(frame);
    frame.src = url;
  });

  const openReportAction = (action: 'excel' | 'pdf' | 'print') => {
    if (preparingExport) return;
    setDownloadError(false);
    setPendingExport(action);
  };

  const confirmReportLanguage = async (language: 'ar' | 'en') => {
    const action = pendingExport;
    if (!action || preparingExport) return;
    setPreparingExport(true);
    setDownloadError(false);
    try {
      if (action === 'excel') {
        const blob = await getExcelBlob(language);
        saveReportFile(blob, `mathworld-premium-analytics-${language}.xlsx`);
      } else {
        const blob = await getPdfBlob(language);
        if (action === 'print') await printPdfBlob(blob);
        else saveReportFile(blob, `mathworld-premium-analytics-${language}.pdf`);
      }
      // Close only after the file has been produced and download/print started.
      setPendingExport(null);
    } catch {
      // Preserve the modal so the user can retry another language.
      setDownloadError(true);
    } finally {
      setPreparingExport(false);
    }
  };

  const { currentData: report, isLoading, isError, refetch } = useGetPremiumAnalyticsQuery(canFilter?filters:undefined, {
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
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <WorkspacePageHeader title={reportAr?'التقارير والإحصائيات':'Reports and analytics'} icon={BarChart3}/>
          
        </div>
        {report && (
          <div className="premium-report-actions flex flex-wrap items-center gap-2">
            <button type="button" disabled={exportingXlsx || exportingPdf}
              onClick={() => openReportAction('excel')}
              className="inline-flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
              <FileSpreadsheet className="h-[18px] w-[18px]" aria-hidden="true" />
              {exportingXlsx ? (ar ? 'جارٍ التحميل…' : 'Downloading…') : (ar ? 'تحميل Excel' : 'Download Excel')}
            </button>
            <button type="button" disabled={exportingXlsx || exportingPdf}
              onClick={() => openReportAction('pdf')}
              className="inline-flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
              <FileDown className="h-[18px] w-[18px]" aria-hidden="true" />
              {exportingPdf ? (ar ? 'جارٍ التحميل…' : 'Downloading…') : (ar ? 'تحميل PDF' : 'Download PDF')}
            </button>
            <button type="button" disabled={exportingXlsx || exportingPdf}
              onClick={() => openReportAction('print')}
              className="inline-flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
              <Printer className="h-[18px] w-[18px]" aria-hidden="true" />
              {ar ? 'طباعة' : 'Print'}
            </button>
          </div>
        )}
      </div>

      {canFilter&&premium&&j&&<section className="premium-report-actions flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
        <label className="flex items-center gap-2 text-sm font-semibold">{ar?'النطاق':'Scope'}<select disabled={!!pendingExport||preparingExport} className="rounded-lg border bg-background p-2" value={scope} onChange={e=>setScope(e.target.value)}>
          <option value="all">{ar?'جميع المراحل':'All stages'}</option><option value="stage">{ar?'المرحلة الحالية':'Current stage'}</option>
          {j.TrackId&&<option value="track">{ar?'الصف أو المساق الحالي':'Current grade or course'}</option>}
          {j.Categories.map(c=><option key={c.CategoryId} value={'category:'+c.CategoryId}>{ar?c.NameAr:c.NameEn}</option>)}
        </select></label>
        <label className="flex items-center gap-2 text-sm font-semibold">{ar?'الفترة':'Period'}<select disabled={!!pendingExport||preparingExport} className="rounded-lg border bg-background p-2" value={days} onChange={e=>setDays(Number(e.target.value))}>
          <option value={0}>{ar?'كل الوقت':'All time'}</option>{[7,30,90,365].map(d=><option key={d} value={d}>{d} {ar?'يوم':'days'}</option>)}
        </select></label>
        <p className="basis-full text-xs text-muted-foreground">{ar?'النقاط حسب تاريخ اكتسابها؛ دفتر الأخطاء يعرض الحالة الحالية. زمن الجلسات الموجهة غير مقاس.':'Points follow their original earn date; review errors show current state. Guided-session time is not measured.'}</p>
      </section>}
      {downloadError && !pendingExport && (
        <div role="alert" className="premium-report-actions rounded-xl border border-destructive/30 p-3 text-sm text-destructive">
          {ar ? 'تعذّر تنزيل التقرير. تحقق من اشتراك Premium واتصال الإنترنت.'
            : 'Download failed. Check Premium access and your connection.'}
        </div>
      )}
      {!isStudent ? (
        <div className="premium-report-actions rounded-2xl border p-6">
          <p className="mb-3">{ar ? 'سجّل الدخول بحساب طالب لعرض التقرير.' : 'Sign in with a student account to view the report.'}</p>
          <Link href="/login" className="font-semibold text-primary underline">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link>
        </div>
      ) : loadingEntitlement || (fetchingEntitlement && !entitlement) ? (
        <MathWorldLoading compact />
      ) : entitlementError || !entitlement ? (
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
          <MathWorldLoading compact />
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
              {reportAr ? 'حمّل التقرير بصيغة Excel أو PDF، أو اطبعه مباشرة.'
                : 'Download the Excel or PDF report, or print it directly.'}
            </p>
          </section>
        </>
      )}
      {pendingExport && (
        <div className="premium-report-actions fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
          onMouseDown={(event) => { if (!preparingExport && event.target === event.currentTarget) setPendingExport(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-language-title"
            className="w-full max-w-sm rounded-2xl border border-primary/20 bg-card p-6 shadow-2xl"
            onKeyDown={(event) => { if (!preparingExport && event.key === 'Escape') setPendingExport(null); }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id="report-language-title" className="text-lg font-bold">
                {ar ? 'اختر لغة التقرير' : 'Choose report language'}
              </h2>
              <button type="button" aria-label={ar ? 'إغلاق' : 'Close'}
                onClick={() => setPendingExport(null)} disabled={preparingExport}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            {preparingExport ? (
              <MathWorldLoading compact message={ar
                ? (pendingExport === 'print' ? 'جاري تجهيز الطباعة…' : 'جاري تجهيز الملف…')
                : (pendingExport === 'print' ? 'Preparing print preview…' : 'Preparing your file…')} />
            ) : (
              <>
                {downloadError && (
                  <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {ar ? 'تعذّر تجهيز الملف. حاول مرة ثانية.' : 'Could not prepare the file. Please retry.'}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => void confirmReportLanguage('ar')}
                    className="min-h-12 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                    العربية
                  </button>
                  <button type="button" onClick={() => void confirmReportLanguage('en')}
                    className="min-h-12 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                    English
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

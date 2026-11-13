'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Activity, BarChart3, CircleCheck, Gauge, ShieldCheck, UsersRound,
  BookOpenText, FolderTree, GraduationCap,
} from 'lucide-react';
import { DirectionalChevron } from '@/components/ui/DirectionalNavigation';
import { ADMIN_NAV_ITEMS } from '@/components/admin/AdminNavigation';
import { useGetAdminAnalyticsOverviewQuery } from '@/store/api/statsApi';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';

type Timeframe = 7 | 30 | 90;

export default function AdminDashboardPage() {
  const ar = useLocale() === 'ar';
  const [days, setDays] = useState<Timeframe>(30);
  const { data: overview, isLoading, isError, refetch } =
    useGetAdminAnalyticsOverviewQuery(days, { refetchOnMountOrArgChange: true });
  const { data: stages } = useGetAdminStagesQuery();

  const label = ar ? {
    eyebrow: 'مركز الإدارة',
    title: 'لوحة إدارة MathWorld',
    subtitle: 'لمحة سريعة عن المنصة ووصول مباشر للإدارات. التقارير التفصيلية لها صفحتها الخاصة.',
    administrator: 'حساب إدارة فقط، لا يشارك بحلول الطلاب أو نقاطهم',
    quick: 'نظرة سريعة',
    days: 'يوم',
    students: 'إجمالي الطلاب',
    active: 'الطلاب النشطون',
    attempts: 'محاولات الحل',
    accuracy: 'نسبة الإجابات الصحيحة',
    studentsInfo: 'حسابات الطلاب فقط',
    activeInfo: 'ضمن الفترة المحددة',
    attemptsInfo: 'محاولات الطلاب بالفترة',
    accuracyInfo: 'نسبة الإجابات الصحيحة بالفترة',
    analytics: 'مركز الإحصائيات الكامل',
    analyticsDesc: 'مخططات النشاط، المقارنة بين المراحل، تحليل الأخطاء، وأداء الطلاب — جميعها ضمن صفحة متخصصة.',
    analyticsAction: 'عرض جميع الإحصائيات',
    sections: 'إدارات المنصة',
    sectionsDesc: 'ادخل للقسم المطلوب مباشرة، بدون زحمة مخططات على الرئيسية.',
    open: 'فتح الإدارة',
    contentTitle: 'تنظيم المحتوى التعليمي',
    contentDesc: 'ابدأ من المستوى التعليمي، ثم اختر الفئة، ومنها استعرض المسائل أو أضف مسألة جديدة.',
    chooseLevel: 'اختر المستوى لعرض فئاته',
    manageLevels: 'جميع المستويات',
    manageCategories: 'جميع الفئات',
    manageProblems: 'جميع المسائل',
    loading: 'جاري تحميل المؤشرات...',
    error: 'تعذّر تحميل المؤشرات حاليًا. روابط الإدارة ما زالت متاحة.',
    retry: 'إعادة المحاولة',
  } : {
    eyebrow: 'Administration workspace',
    title: 'MathWorld Admin Dashboard',
    subtitle: 'A quick platform overview and management shortcuts. Detailed reporting has its own page.',
    administrator: 'Admin-only account; excluded from learner scores and attempts',
    quick: 'At a glance',
    days: 'days',
    students: 'Total students',
    active: 'Active students',
    attempts: 'Answer attempts',
    accuracy: 'Correct-answer rate',
    studentsInfo: 'Student accounts only',
    activeInfo: 'In the selected period',
    attemptsInfo: 'Student attempts in the period',
    accuracyInfo: 'Correct attempts in the period',
    analytics: 'Complete analytics center',
    analyticsDesc: 'Activity charts, stage comparisons, error analysis and learner performance live on a dedicated page.',
    analyticsAction: 'View all analytics',
    sections: 'Platform management',
    sectionsDesc: 'Jump straight to the relevant section without overcrowding this page.',
    open: 'Open section',
    contentTitle: 'Organize educational content',
    contentDesc: 'Start with a learning stage, choose one of its categories, then browse or add questions.',
    chooseLevel: 'Choose a stage to view its categories',
    manageLevels: 'All stages',
    manageCategories: 'All categories',
    manageProblems: 'All problems',
    loading: 'Loading key metrics...',
    error: 'Metrics could not be loaded. Management links are still available.',
    retry: 'Retry',
  };

  const format = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const quickCards = overview ? [
    { title: label.students, hint: label.studentsInfo, value: format(overview.TotalStudents), icon: UsersRound },
    { title: label.active, hint: label.activeInfo, value: format(overview.ActiveStudentsInWindow), icon: Activity },
    { title: label.attempts, hint: label.attemptsInfo, value: format(overview.AttemptsInWindow), icon: CircleCheck },
    { title: label.accuracy, hint: label.accuracyInfo, value: `${overview.CorrectRatePercent}%`, icon: Gauge },
  ] : [];

  const sections = ADMIN_NAV_ITEMS.filter(item => item.group !== 'overview');
  return (
    <main className="container mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-primary">{label.eyebrow}</p>
          <h1 className="brand-display-title text-gradient-math text-3xl font-bold">{label.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{label.subtitle}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden />{label.administrator}
          </p>
        </div>
        <div role="group" className="flex flex-wrap gap-2" aria-label={label.quick}>
          {([7, 30, 90] as const).map(value => (
            <button
              type="button" key={value} aria-pressed={days === value}
              onClick={() => setDays(value)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                days === value ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >{value} {label.days}</button>
          ))}
        </div>
      </header>

      <section aria-label={label.quick}>
        <h2 className="mb-4 text-lg font-bold">{label.quick}</h2>
        {isError ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-5">
            <p className="text-sm text-destructive">{label.error}</p>
            <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-primary underline">{label.retry}</button>
          </div>
        ) : isLoading || !overview ? (
          <p role="status" className="rounded-xl border border-border bg-card p-7 text-center text-muted-foreground">{label.loading}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {quickCards.map(({title,hint,value,icon:Icon}) => (
              <div key={title} className="math-card rounded-2xl border border-border p-4 md:p-5">
                <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <h3 className="mt-1 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link href="/admin/analytics"
        className="group flex flex-wrap items-center gap-4 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-brand-secondary/10 p-5 transition-all hover:border-primary/60 hover:shadow-lg md:p-7">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <BarChart3 className="h-7 w-7" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block text-xl font-bold">{label.analytics}</strong>
          <span className="mt-1 block max-w-2xl text-sm text-muted-foreground">{label.analyticsDesc}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          {label.analyticsAction}<DirectionalChevron direction="forward" className="h-4 w-4" />
        </span>
      </Link>

      <section aria-label={label.contentTitle} className="math-card rounded-3xl border border-border p-5 md:p-7">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <GraduationCap className="h-5 w-5 text-primary" aria-hidden />
            {label.contentTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{label.contentDesc}</p>
        </div>
        <p className="mb-3 text-xs font-semibold text-muted-foreground">{label.chooseLevel}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(stages ?? []).map(stage => (
            <Link key={stage.Id} href={`/admin/categories?stageId=${stage.Id}`}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{ar ? stage.NameAr : stage.NameEn}</span>
                <span className="block text-xs text-muted-foreground">{label.manageCategories}</span>
              </span>
              <DirectionalChevron direction="forward" className="h-4 w-4 shrink-0 text-primary" />
            </Link>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {[
            {href:'/admin/stages',name:label.manageLevels,icon:GraduationCap},
            {href:'/admin/categories',name:label.manageCategories,icon:FolderTree},
            {href:'/admin/problems',name:label.manageProblems,icon:BookOpenText},
          ].map(item => (
            <Link href={item.href} key={item.href} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-muted">
              <item.icon className="h-4 w-4 text-primary" aria-hidden />
              {item.name}
              <DirectionalChevron direction="forward" className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>

      <section aria-label={label.sections}>
        <h2 className="text-xl font-bold">{label.sections}</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">{label.sectionsDesc}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sections.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-bold">{ar ? item.labelAr : item.labelEn}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {ar ? item.descriptionAr : item.descriptionEn}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {label.open}<DirectionalChevron direction="forward" className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

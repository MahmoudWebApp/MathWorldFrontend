'use client';

import { useMemo } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type {
  AdminActivityDay, AdminStageAnalytics, AdminWeakCategory,
} from '@/store/api/statsApi';

const primary = 'var(--color-brand-primary-strong)';
const secondary = 'var(--color-brand-secondary)';
const subdued = 'var(--muted-foreground)';
const grid = 'var(--border)';

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-xl bg-muted/20 px-4 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function formatDay(value: string, arabic: boolean): string {
  return new Date(value).toLocaleDateString(arabic ? 'ar' : 'en', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

/** Time series always follows chronological time from left to right. */
export function AdminActivityChart({
  data = [], arabic, height = 260,
}: {
  data?: AdminActivityDay[];
  arabic: boolean;
  height?: number;
}) {
  const labels = arabic
    ? { attempts: 'المحاولات', correct: 'الإجابات الصحيحة', empty: 'لا توجد محاولات في الفترة المختارة.' }
    : { attempts: 'Attempts', correct: 'Correct answers', empty: 'No attempts in this period.' };
  const points = useMemo(() => data.map(day => ({
    day: formatDay(day.DayUtc, arabic),
    attempts: day.Attempts,
    correct: day.CorrectAttempts,
  })), [data, arabic]);
  if (points.every(point => point.attempts === 0)) return <EmptyChart text={labels.empty} />;

  return (
    <div className="w-full min-w-0" dir="ltr" role="img" aria-label={arabic ? 'مخطط المحاولات اليومية والإجابات الصحيحة' : 'Daily attempt and correct answer chart'}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={points} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={grid} strokeOpacity={0.35} strokeDasharray="3 5" />
          <XAxis dataKey="day" tickLine={false} axisLine={false}
            tick={{ fontSize: 11, fill: subdued }} minTickGap={24} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false}
            tick={{ fontSize: 11, fill: subdued }} />
          <Tooltip contentStyle={{ borderRadius: 12, background: 'var(--card)', borderColor: grid }}
            labelStyle={{ color: 'var(--foreground)' }} />
          <Legend verticalAlign="bottom" iconType="circle" />
          <Area type="monotone" name={labels.attempts} dataKey="attempts" stroke={primary}
            strokeWidth={2.5} fill={primary} fillOpacity={0.13} dot={false} />
          <Area type="monotone" name={labels.correct} dataKey="correct" stroke={secondary}
            strokeWidth={2.5} fill={secondary} fillOpacity={0.10} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Side-by-side stage successes and mistakes, never content inventory counts. */
export function AdminStagePerformanceChart({
  stages = [], arabic, height = 260,
}: {
  stages?: AdminStageAnalytics[];
  arabic: boolean;
  height?: number;
}) {
  const labels = arabic
    ? { correct: 'صحيحة', wrong: 'خاطئة', empty: 'لا توجد محاولات للطلاب بهذه الفترة.' }
    : { correct: 'Correct', wrong: 'Incorrect', empty: 'No student attempts in this period.' };
  const rows = useMemo(() => stages.map(stage => ({
    name: arabic ? stage.NameAr : stage.NameEn,
    correct: stage.CorrectAttemptsInWindow,
    wrong: Math.max(0, stage.AttemptsInWindow - stage.CorrectAttemptsInWindow),
  })), [stages, arabic]);
  if (rows.every(row => row.correct + row.wrong === 0)) return <EmptyChart text={labels.empty} />;

  return (
    <div className="w-full min-w-0" dir="ltr" role="img" aria-label={arabic ? 'مقارنة إجابات المراحل التعليمية' : 'Student answers by stage'}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} margin={{ top: 10, right: 4, left: -26, bottom: 0 }}
          barCategoryGap="24%">
          <CartesianGrid vertical={false} stroke={grid} strokeOpacity={0.35} strokeDasharray="3 5" />
          <XAxis dataKey="name" interval={0} tickLine={false} axisLine={false}
            tick={{ fontSize: 10, fill: subdued }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false}
            tick={{ fontSize: 11, fill: subdued }} />
          <Tooltip contentStyle={{ borderRadius: 12, background: 'var(--card)', borderColor: grid }} />
          <Legend iconType="circle" />
          <Bar name={labels.correct} dataKey="correct" stackId="answers" fill={primary} radius={[0, 0, 0, 0]} maxBarSize={44} />
          <Bar name={labels.wrong} dataKey="wrong" stackId="answers" fill={secondary} radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** A volume chart: a category with one wrong answer is NOT called intrinsically difficult. */
export function AdminCategoryMistakesChart({
  categories = [], arabic, height = 260,
}: {
  categories?: AdminWeakCategory[];
  arabic: boolean;
  height?: number;
}) {
  const labels = arabic
    ? { wrong: 'إجابات خاطئة', empty: 'ما في أخطاء مسجّلة ضمن الفترة.' }
    : { wrong: 'Incorrect answers', empty: 'No incorrect answers recorded for this period.' };
  const rows = useMemo(() => categories.map(cat => {
    const name = arabic ? cat.NameAr : cat.NameEn;
    return {
      name: name.length > 16 ? name.slice(0, 15) + '…' : name,
      wrong: cat.IncorrectAttemptsInWindow,
      fullName: name,
    };
  }), [categories, arabic]);
  if (!rows.length) return <EmptyChart text={labels.empty} />;

  return (
    <div className="w-full min-w-0" dir="ltr" role="img" aria-label={arabic ? 'أكثر التصنيفات تسجيلًا للأخطاء' : 'Categories with the most incorrect answers'}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart layout="vertical" data={rows}
          margin={{ top: 8, right: 20, left: 2, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke={grid} strokeOpacity={0.35} strokeDasharray="3 5" />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false}
            tick={{ fontSize: 11, fill: subdued }} />
          <YAxis type="category" dataKey="name" width={112} tickLine={false} axisLine={false}
            tick={{ fontSize: 11, fill: subdued }} />
          <Tooltip contentStyle={{ borderRadius: 12, background: 'var(--card)', borderColor: grid }}
            labelFormatter={(_, payload) => (payload?.[0]?.payload?.fullName as string) ?? ''} />
          <Bar name={labels.wrong} dataKey="wrong" fill={secondary} radius={[0, 6, 6, 0]} maxBarSize={27} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

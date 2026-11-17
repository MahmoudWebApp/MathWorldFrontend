// File: store/api/statsApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface DashboardStats {
  TotalProblems: number;
  TotalUsers: number;
  TotalSolved: number;
  TotalViews: number;
}


export interface AdminStageAnalytics {
  StageId: number;
  NameAr: string;
  NameEn: string;
  Categories: number;
  Problems: number;
  SelectedStudents: number;
  ActiveStudentsInWindow: number;
  UniqueSolved: number;
  AttemptsInWindow: number;
  CorrectAttemptsInWindow: number;
  CorrectRatePercent: number;
}

export interface AdminAnalyticsOverview {
  GeneratedAtUtc: string;
  WindowDays: number;
  TotalStudents: number;
  ActiveStudentsInWindow: number;
  TotalProblems: number;
  TotalUniqueSolved: number;
  AttemptsInWindow: number;
  CorrectAttemptsInWindow: number;
  CorrectRatePercent: number;
  Stages: AdminStageAnalytics[];
  DailyActivity: AdminActivityDay[];
  MostMissedCategories: AdminWeakCategory[];
  MostMissedProblems: AdminMissedProblem[];
}

export interface AdminCategoryAnalytics {
  CategoryId: number;
  NameAr: string;
  NameEn: string;
  Problems: number;
  UniqueSolved: number;
  AttemptsInWindow: number;
  CorrectAttemptsInWindow: number;
}

/** Rank by wrong attempts within the selected period, not a formal difficulty score. */
export interface AdminWeakCategory {
  CategoryId: number;
  StageId: number;
  NameAr: string;
  NameEn: string;
  StageNameAr: string;
  StageNameEn: string;
  AttemptsInWindow: number;
  IncorrectAttemptsInWindow: number;
  CorrectAttemptsInWindow: number;
  IncorrectRatePercent: number;
  AverageAttemptSeconds: number;
}

export interface AdminMissedProblem {
  ProblemId: number;
  StageId: number;
  CategoryId: number;
  TitleAr: string;
  TitleEn: string;
  AttemptsInWindow: number;
  IncorrectAttemptsInWindow: number;
  CorrectAttemptsInWindow: number;
}

export interface AdminTopLearner {
  Rank: number;
  UserId: number;
  FullName: string;
  UniqueSolved: number;
  FirstTryCorrect: number;
  AwardedPoints: number;
}

export interface AdminActivityDay {
  DayUtc: string;
  Attempts: number;
  CorrectAttempts: number;
  UniqueStudents: number;
}

export interface AdminStageDetail {
  Summary: AdminStageAnalytics;
  WindowDays: number;
  Categories: AdminCategoryAnalytics[];
  TopLearners: AdminTopLearner[];
  DailyActivity: AdminActivityDay[];
}

export interface AdminContentAuditSummary {
  TotalStages: number;
  TotalCategories: number;
  TotalProblems: number;
  EmptyCategories: number;
  ProblemsWithInvalidOptions: number;
  ProblemsMissingArabicSolution: number;
  ProblemsMissingEnglishSolution: number;
  LearnersWithoutStage: number;
}

export interface AdminContentAuditCategory {
  Id: number;
  StageId: number;
  NameAr: string;
  NameEn: string;
  Order: number;
  ProblemsCount: number;
  MissingArabicSolutionCount: number;
  MissingEnglishSolutionCount: number;
  InvalidOptionsCount: number;
}

export interface AdminContentAuditStage {
  StageId: number;
  NameAr: string;
  NameEn: string;
  CategoriesCount: number;
  ProblemsCount: number;
}

export interface AdminContentAudit {
  Summary: AdminContentAuditSummary;
  Stages: AdminContentAuditStage[];
  Categories: AdminContentAuditCategory[];
}

export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery,
  tagTypes: ['Stats'],
  endpoints: (builder) => ({
    
    // ✅ PUBLIC: Get platform stats (no auth required)
    // Calls: GET /api/stats
    getStats: builder.query<DashboardStats, void>({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),

    // Only administrators can retrieve detailed learner activity.
    getAdminAnalyticsOverview: builder.query<AdminAnalyticsOverview, number>({
      query: (days) => ({
        url: '/admin/analytics/overview',
        params: { days },
      }),
      providesTags: ['Stats'],
    }),
    getAdminAnalyticsStage: builder.query<
      AdminStageDetail,
      { stageId: number; days: number }
    >({
      query: ({ stageId, days }) => ({
        url: `/admin/analytics/stages/${stageId}`,
        params: { days },
      }),
      providesTags: ['Stats'],
    }),

    // Admin-only, read-only education inventory and quality checks.
    getAdminContentAudit: builder.query<AdminContentAudit, void>({
      query: () => '/admin/content-audit',
      providesTags: ['Stats'],
    }),

    // ✅ ADMIN: Get admin dashboard stats (requires auth)
    // Calls: GET /api/admin/stats
    getAdminStats: builder.query<DashboardStats, void>({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetAdminStatsQuery,
  useGetAdminAnalyticsOverviewQuery,
  useGetAdminAnalyticsStageQuery,
  useGetAdminContentAuditQuery, 
} = statsApi;
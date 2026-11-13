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
} = statsApi;
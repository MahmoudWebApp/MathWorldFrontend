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

export interface AdminEngagementDay {
  DayUtc: string;
  ActiveSolvers: number;
  Signups: number;
}

export interface AdminEngagementStage {
  StageId: number;
  NameAr: string;
  NameEn: string;
  ActiveSolvers: number;
  OnlineLearners: number;
  SuccessfulSolves: number;
  /** Newly registered students whose current stage is this stage. */
  Signups: number;
}

export interface AdminEngagementOverview {
  GeneratedAtUtc: string;
  WindowDays: number;
  TotalStudents: number;
  NewStudents: number;
  ActiveSolvers: number;
  OnlineLearners: number;
  PresenceWindowMinutes: number;
  SuccessfulSolves: number;
  DailyActivity: AdminEngagementDay[];
  Stages: AdminEngagementStage[];
}

export interface TopEngagementStudent {
  Rank: number;
  UserId: number;
  FullName: string;
  Solved: number;
}

export interface AdminEngagementCategory {
  CategoryId: number;
  NameAr: string;
  NameEn: string;
  ActiveSolvers: number;
  AttemptsInWindow: number;
  TotalSolved: number;
  TopStudents: TopEngagementStudent[];
}

export interface AdminEngagementStageDetail {
  StageId: number;
  NameAr: string;
  NameEn: string;
  WindowDays: number;
  TopStudents: TopEngagementStudent[];
  Categories: AdminEngagementCategory[];
}

export interface AdminEngagementStudent {
  Id: number;
  FullName: string;
  CreatedAt: string;
  LastLoginAt: string | null;
  CurrentStageId: number | null;
  IsActive: boolean;
  LastPracticeAt: string | null;
  LastHeartbeatAtUtc: string | null;
  IsOnline: boolean;
  Attempts: number;
}
export interface AdminEngagementStudentPage {
  Total: number;
  Page: number;
  PageSize: number;
  Students: AdminEngagementStudent[];
  Note: string;
}

export interface AdminPlatformAuditEntry {
  Id: number;
  ActorUserId: number;
  ActorName: string;
  ActorRole: 'Admin' | 'Student';
  Action: string;
  Resource: string;
  ResourceId: string | null;
  Origin: string;
  CreatedAtUtc: string;
}
export interface AdminPlatformAuditPage {
  Page: number;
  PageSize: number;
  Total: number;
  Entries: AdminPlatformAuditEntry[];
  HasMore: boolean;
  Notice: string;
}
export interface AdminPlatformAuditFilters {
  page: number;
  days: 7 | 30 | 90 | 180;
  role?: 'Admin' | 'Student';
  userId?: number;
}

export interface AdminAuditEvent {
  Id: number;
  ActorUserId: number;
  ActorRole: 'Admin' | 'Student';
  ActorName: string | null;
  Action: string;
  Resource: string;
  ResourceId: string | null;
  Origin: string;
  CreatedAtUtc: string;
}
export interface AdminAuditPage {
  Entries: AdminAuditEvent[];
  Total: number;
  Page: number;
  PageSize: number;
  HasMore: boolean;
  WindowDays: number;
  Note: string;
}
export interface AdminAuditSummary {
  WindowDays: number;
  RecordedEvents: number;
  UniqueStudents: number;
  UniqueAdmins: number;
  ByAction: Array<{ ActorRole: string; Action: string; Count: number }>;
}
export interface AdminAuditFilter {
  page: number;
  days: number;
  role?: 'Admin' | 'Student';
  actorId?: number;
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

    getAdminPlatformAudit: builder.query<AdminPlatformAuditPage, AdminPlatformAuditFilters>({
      query: ({page, days, role, userId}) => ({
        url: '/admin/activity-audit',
        params: { page, days, ...(role ? {role} : {}), ...(userId ? {userId} : {}) },
      }),
    }),

    getAdminAuditEvents: builder.query<AdminAuditPage, AdminAuditFilter>({
      query: ({ page, days, role, actorId }) => ({
        url: '/admin/activity-audit',
        params: { page, pageSize: 30, days,
          ...(role ? { role } : {}),
          ...(actorId ? { actorId } : {}),
        },
      }),
    }),
    getAdminAuditSummary: builder.query<AdminAuditSummary, number>({
      query: days => ({ url: '/admin/activity-audit/summary', params: { days } }),
    }),

    getAdminEngagementOverview: builder.query<AdminEngagementOverview, number>({
      query: days => ({ url: '/admin/engagement/overview', params: { days } }),
      providesTags: ['Stats'],
    }),
    getAdminEngagementStage: builder.query<AdminEngagementStageDetail, { stageId: number; days: number }>({
      query: ({stageId, days}) => ({url: `/admin/engagement/stages/${stageId}`, params: { days }}),
      providesTags: ['Stats'],
    }),
    getAdminEngagementStudents: builder.query<AdminEngagementStudentPage, {
      page: number; stageId?: number; search?: string;
    }>({
      query: ({page, stageId, search}) => ({
        url: '/admin/engagement/students',
        params: { page, ...(stageId ? {stageId} : {}), ...(search ? {search} : {}) },
      }),
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
  useGetAdminEngagementOverviewQuery,
  useGetAdminAuditEventsQuery,
  useGetAdminAuditSummaryQuery,
  useGetAdminEngagementStageQuery,
  useGetAdminEngagementStudentsQuery,
  useGetAdminPlatformAuditQuery,
  useGetAdminAnalyticsOverviewQuery,
  useGetAdminAnalyticsStageQuery, 
} = statsApi;
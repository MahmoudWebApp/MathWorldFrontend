import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { DashboardData, ProblemPreview } from './types';
import type { MasteryStatus } from './problemsApi';

export interface UserProfile {
  Id: number;
  FullName: string;
  Email: string;
  Role: 'Admin' | 'Student';
  SubscriptionType: string;
  SolvedProblemsCount: number;
  TotalPoints: number;
  MemberSince: string;
  ProfilePicture?: string | null;
  CurrentStageId?: number | null;
}

export interface UserListItem {
  Id: number;
  FullName: string;
  Email: string;
  Role: 'Admin' | 'Student';
  SubscriptionType: string;
  IsActive: boolean;
  CreatedAt: string;
  SolvedProblemsCount: number;
}

export interface PagedUserList {
  Users: UserListItem[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}

export interface FavoriteToggleRequest {
  ProblemId: number;
  IsFavorite: boolean;
}

export interface FavoriteCheck {
  IsFavorite: boolean;
}

export interface ErrorNotebookProblem {
  Id: number;
  Title: string;
  StageId: number;
  StageName: string;
  CategoryId: number;
  CategoryName: string;
  AttemptCount: number;
  IncorrectAttempts: number;
  CorrectAttempts: number;
  MasteryStatus: MasteryStatus;
  IsArchived: boolean;
  NextReviewAt?: string | null;
  LastAttemptAt: string;
}

export interface SetErrorNotebookArchiveRequest {
  ProblemId: number;
  IsArchived: boolean;
}

export interface ErrorNotebookArchiveResult {
  ProblemId: number;
  IsArchived: boolean;
}

export interface LearningStage {
  StageId?: number | null;
  NameAr?: string | null;
  NameEn?: string | null;
  HasSelectedStage: boolean;
}

export interface JourneyCategory {
  CategoryId: number;
  NameAr: string;
  NameEn: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  MasteredProblems: number;
  CompletionPercent: number;
}

export interface LearningJourney {
  StageId: number;
  NameAr: string;
  NameEn: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  MasteredProblems: number;
  TotalPoints: number;
  CompletionPercent: number;
  Categories: JourneyCategory[];
}

export interface AdminLearnerSummary {
  Id: number;
  FullName: string;
  Email: string;
  CurrentStageId?: number | null;
  StageNameAr?: string | null;
  StageNameEn?: string | null;
  SubscriptionType: string;
  IsActive: boolean;
  CreatedAt: string;
  LastLoginAt?: string | null;
  LastAttemptAt?: string | null;
  SolvedProblems: number;
  AttemptedProblems: number;
  TotalAwardedPoints: number;
}

export interface AdminLearnerDirectory {
  Learners: AdminLearnerSummary[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}

export interface AdminLearnerFilters {
  Search?: string;
  StageId?: number;
  IsActive?: boolean;
  Subscription?: 'Free' | 'Premium';
  Page?: number;
  PageSize?: number;
}

export interface AdminLearnerStage {
  StageId: number;
  NameAr: string;
  NameEn: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  AwardedPoints: number;
  CompletionPercent: number;
}

export interface AdminLearnerCategory {
  CategoryId: number;
  StageId: number;
  NameAr: string;
  NameEn: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  InErrorNotebook: number;
}

export interface AdminLearnerDetail {
  Learner: AdminLearnerSummary;
  TotalAttempts: number;
  CorrectAttempts: number;
  WrongAttempts: number;
  FirstTryCorrect: number;
  FavoriteProblems: number;
  OpenErrorNotebookProblems: number;
  TotalTimeSpentSeconds: number;
  CorrectRatePercent: number;
  Stages: AdminLearnerStage[];
  Categories: AdminLearnerCategory[];
}

export interface AdminLearnerAttempt {
  Id: number;
  ProblemId: number;
  TitleAr: string;
  TitleEn: string;
  StageId: number;
  CategoryId: number;
  IsCorrect: boolean;
  IsOfficial: boolean;
  AttemptNumber: number;
  TimeSpentSeconds: number;
  UsedHint: boolean;
  PointsEarned: number;
  SubmittedAt: string;
}

export interface AdminLearnerAttemptPage {
  LearnerId: number;
  StageId?: number | null;
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
  Attempts: AdminLearnerAttempt[];
}

export interface AdminLearnerDrilldownQuery {
  LearnerId: number;
  StageId?: number;
}

export interface AdminLearnerAttemptQuery extends AdminLearnerDrilldownQuery {
  Page: number;
}

/** Server-owned daily allowance; one Free allowance per educational stage. */
export interface StageDailyQuota {
  StageId: number;
  NameAr: string;
  NameEn: string;
  Limit: number;
  Used: number;
  Remaining: number | null;
  Unlimited: boolean;
  SubscriptionType: string;
  DayUtc: string;
  ResetsAtUtc: string;
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: [
    'User',
    'Favorite',
    'Solved',
    'Dashboard',
    'Problem',
    'ErrorNotebook',
    'LearningStage',
    'LearningJourney',
    'AdminLearners',
    'DailyQuota',
  ],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    getLearningStage: builder.query<LearningStage, void>({
      query: () => '/users/learning-stage',
      providesTags: ['LearningStage'],
    }),

    setLearningStage: builder.mutation<LearningStage, { StageId: number }>({
      query: (body) => ({
        url: '/users/learning-stage',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LearningStage', 'LearningJourney', 'Dashboard', 'User'],
    }),

    getDailyQuota: builder.query<StageDailyQuota, number>({
      query: stageId => ({
        url: '/users/daily-quota',
        params: { stageId },
      }),
      providesTags: (_data, _error, stageId) => [
        { type: 'DailyQuota', id: stageId },
      ],
    }),

    getLearningJourney: builder.query<LearningJourney, number>({
      query: (stageId) => ({
        url: '/users/journey',
        params: { stageId },
      }),
      providesTags: ['LearningJourney'],
    }),

    getDashboard: builder.query<DashboardData, string>({
      query: () => '/users/dashboard',
      providesTags: ['Dashboard'],
    }),

    getFavorites: builder.query<ProblemPreview[], string>({
      query: () => '/users/favorites',
      providesTags: ['Favorite'],
    }),

    getSolvedProblems: builder.query<ProblemPreview[], string>({
      query: () => '/users/solved',
      providesTags: ['Solved'],
    }),

    getErrorNotebook: builder.query<
      ErrorNotebookProblem[],
      { IncludeArchived?: boolean; Locale: string }
    >({
      query: (params) => ({
        url: '/users/error-notebook',
        params: {
          includeArchived: params?.IncludeArchived ?? false,
        },
      }),
      providesTags: ['ErrorNotebook'],
    }),

    setErrorNotebookArchive: builder.mutation<
      ErrorNotebookArchiveResult,
      SetErrorNotebookArchiveRequest
    >({
      query: ({ ProblemId, IsArchived }) => ({
        url: `/users/error-notebook/${ProblemId}/archive`,
        method: 'PUT',
        body: { IsArchived },
      }),
      invalidatesTags: (_result, _error, { ProblemId }) => [
        'ErrorNotebook',
        'Dashboard',
        { type: 'Problem', id: ProblemId },
      ],
    }),

    toggleFavorite: builder.mutation<FavoriteCheck, FavoriteToggleRequest>({
      query: (body) => ({
        url: '/users/favorite/toggle',
        method: 'POST',
        body,
      }),
      async onQueryStarted(
        { ProblemId, IsFavorite },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          usersApi.util.updateQueryData(
            'checkFavorite',
            ProblemId,
            (draft) => {
              draft.IsFavorite = IsFavorite;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { ProblemId }) => [
        'Favorite',
        'Dashboard',
        { type: 'Problem', id: ProblemId },
      ],
    }),

    checkFavorite: builder.query<FavoriteCheck, number>({
      query: (ProblemId) => `/users/favorite/check/${ProblemId}`,
      providesTags: (_result, _error, ProblemId) => [
        { type: 'Problem', id: ProblemId },
      ],
    }),

    getAdminLearners: builder.query<AdminLearnerDirectory, AdminLearnerFilters>({
      query: ({ Search, StageId, IsActive, Subscription, Page = 1, PageSize = 10 }) => ({
        url: '/admin/learners',
        params: {
          ...(Search ? { search: Search } : {}),
          ...(StageId ? { stageId: StageId } : {}),
          ...(IsActive === undefined ? {} : { isActive: IsActive }),
          ...(Subscription ? { subscription: Subscription } : {}),
          page: Page,
          pageSize: PageSize,
        },
      }),
      providesTags: ['AdminLearners'],
    }),

    getAdminLearnerDetail: builder.query<AdminLearnerDetail, AdminLearnerDrilldownQuery>({
      query: ({ LearnerId, StageId }) => ({
        url: `/admin/learners/${LearnerId}`,
        params: StageId ? { stageId: StageId } : {},
      }),
      providesTags: ['AdminLearners'],
    }),

    getAdminLearnerAttempts: builder.query<AdminLearnerAttemptPage, AdminLearnerAttemptQuery>({
      query: ({ LearnerId, StageId, Page }) => ({
        url: `/admin/learners/${LearnerId}/attempts`,
        params: {
          ...(StageId ? { stageId: StageId } : {}),
          page: Page,
          pageSize: 15,
        },
      }),
      providesTags: ['AdminLearners'],
    }),

    getAdminUsers: builder.query<
      PagedUserList,
      { Page?: number; PageSize?: number }
    >({
      query: ({ Page = 1, PageSize = 20 } = {}) => ({
        url: '/admin/users',
        params: { page: Page, pageSize: PageSize },
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetLearningStageQuery,
  useSetLearningStageMutation,
  useGetLearningJourneyQuery,
  useGetDailyQuotaQuery,
  useGetProfileQuery,
  useGetFavoritesQuery,
  useGetSolvedProblemsQuery,
  useGetErrorNotebookQuery,
  useSetErrorNotebookArchiveMutation,
  useToggleFavoriteMutation,
  useCheckFavoriteQuery,
  useGetAdminUsersQuery,
  useGetAdminLearnersQuery,
  useGetAdminLearnerDetailQuery,
  useGetAdminLearnerAttemptsQuery,
  useGetDashboardQuery,
} = usersApi;

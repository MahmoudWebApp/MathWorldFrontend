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

export interface LeaderboardEntry {
  Rank: number;
  DisplayName: string;
  UserId?: number | null;
  SolvedProblems: number;
  Points: number;
  FirstTryCorrect: number;
  IsCurrentUser: boolean;
}

export interface LeaderboardData {
  StageId: number;
  NameAr: string;
  NameEn: string;
  Period: 'all' | 'weekly' | 'monthly';
  Page: number;
  PageSize: number;
  TotalLearners: number;
  MyRank?: number | null;
  Entries: LeaderboardEntry[];
}

export interface LeaderboardQuery {
  StageId: number;
  Period: 'all' | 'weekly' | 'monthly';
  Page: number;
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
    'Leaderboard',
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

    getLearningJourney: builder.query<LearningJourney, number>({
      query: (stageId) => ({
        url: '/users/journey',
        params: { stageId },
      }),
      providesTags: ['LearningJourney'],
    }),

    getStudentLeaderboard: builder.query<LeaderboardData, LeaderboardQuery>({
      query: ({ StageId, Period, Page }) => ({
        url: '/users/leaderboard',
        params: { stageId: StageId, period: Period, page: Page, pageSize: 20 },
      }),
      providesTags: ['Leaderboard'],
    }),

    getStageAdminLeaderboard: builder.query<LeaderboardData, LeaderboardQuery>({
      query: ({ StageId, Period, Page }) => ({
        url: `/admin/stages/${StageId}/leaderboard`,
        params: { period: Period, page: Page, pageSize: 20 },
      }),
      providesTags: ['Leaderboard'],
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
  useGetProfileQuery,
  useGetFavoritesQuery,
  useGetSolvedProblemsQuery,
  useGetErrorNotebookQuery,
  useSetErrorNotebookArchiveMutation,
  useToggleFavoriteMutation,
  useCheckFavoriteQuery,
  useGetAdminUsersQuery,
  useGetDashboardQuery,
  useGetStudentLeaderboardQuery,
  useGetStageAdminLeaderboardQuery,
} = usersApi;

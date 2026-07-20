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
  ],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
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
  useGetProfileQuery,
  useGetFavoritesQuery,
  useGetSolvedProblemsQuery,
  useGetErrorNotebookQuery,
  useSetErrorNotebookArchiveMutation,
  useToggleFavoriteMutation,
  useCheckFavoriteQuery,
  useGetAdminUsersQuery,
  useGetDashboardQuery,
} = usersApi;

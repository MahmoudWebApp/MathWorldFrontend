import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse, baseQuery } from './baseQuery';
import { DashboardData, ProblemPreview } from './types';

export interface UserProfile {
  Id: number;
  FullName: string;
  Email: string;
  Role: 'Admin' | 'Student';
  SubscriptionType: string;
  SolvedProblemsCount: number;
  TotalPoints: number;
  MemberSince: string;
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

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['User', 'Favorite', 'Solved', 'Dashboard', 'Problem'],
  endpoints: (builder) => ({

    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    getDashboard: builder.query<DashboardData, void>({
      query: () => '/users/dashboard',
      providesTags: ['Dashboard'],
    }),

    getFavorites: builder.query<ProblemPreview[], void>({
      query: () => '/users/favorites',
      providesTags: ['Favorite'],
    }),

    getSolvedProblems: builder.query<ProblemPreview[], void>({
      query: () => '/users/solved',
      providesTags: ['Solved'],
    }),

    toggleFavorite: builder.mutation<FavoriteCheck, FavoriteToggleRequest>({
      query: (body) => ({
        url: '/users/favorite/toggle',
        method: 'POST',
        body,
      }),
      async onQueryStarted({ ProblemId, IsFavorite }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          usersApi.util.updateQueryData('checkFavorite', ProblemId, (draft) => {
            draft.IsFavorite = IsFavorite;
          })
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
      providesTags: (_result, _error, ProblemId) => [{ type: 'Problem', id: ProblemId }],
    }),

    getAdminUsers: builder.query<ApiResponse<PagedUserList>, { Page?: number; PageSize?: number }>({
      query: ({ Page = 1, PageSize = 20 } = {}) => ({
        url: '/admin/users',
        params: { page: Page, pageSize: PageSize },
      }),
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<UserProfile, { Id: number; Data: Partial<UserProfile> }>({
      query: ({ Id, Data }) => ({
        url: `/admin/users/${Id}`,
        method: 'PUT',
        body: Data,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/users/${Id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    activateUser: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/users/${Id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    deactivateUser: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/users/${Id}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetFavoritesQuery,
  useGetSolvedProblemsQuery,
  useToggleFavoriteMutation,
  useCheckFavoriteQuery,
  useGetAdminUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetDashboardQuery,
} = usersApi;
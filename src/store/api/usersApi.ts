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
    // Get current user profile
    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    getDashboard: builder.query<DashboardData, void>({
      query: () => '/users/dashboard',
      providesTags: ['Dashboard'],
    }),

    // Get user's favorite problems - translated based on Accept-Language
    getFavorites: builder.query<ProblemPreview[], void>({
      query: () => '/users/favorites',
      providesTags: ['Favorite'],
    }),

    // Get user's solved problems - translated based on Accept-Language
    getSolvedProblems: builder.query<ProblemPreview[], void>({
      query: () => '/users/solved',
      providesTags: ['Solved'],
    }),

    // Toggle favorite status for a problem
    toggleFavorite: builder.mutation<FavoriteCheck, FavoriteToggleRequest>({
      query: (body) => ({
        url: '/users/favorite/toggle',
        method: 'POST',
        body,
      }),

      // Optimistic update: update the cache immediately before the server responds
      async onQueryStarted({ ProblemId, IsFavorite }, { dispatch, queryFulfilled }) {
        // Update checkFavorite cache immediately for instant UI feedback
        const patchResult = dispatch(
          usersApi.util.updateQueryData('checkFavorite', ProblemId, (draft) => {
            draft.IsFavorite = IsFavorite;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // If the server request fails, undo the optimistic update
          patchResult.undo();
        }
      },

      invalidatesTags: (_result, _error, { ProblemId }) => [
        'Favorite',
        'Dashboard',
        { type: 'Problem', id: ProblemId },
      ],
    }),

    // Check if a problem is favorite
    checkFavorite: builder.query<FavoriteCheck, number>({
      query: (ProblemId) => `/users/favorite/check/${ProblemId}`,
      providesTags: (_result, _error, ProblemId) => [{ type: 'Problem', id: ProblemId }],
    }),

    // Admin: Get all users with pagination
    getAdminUsers: builder.query<ApiResponse<PagedUserList>, { Page?: number; PageSize?: number }>({
      query: ({ Page = 1, PageSize = 20 } = {}) => ({
        url: '/admin/users',
        params: { Page, PageSize },
      }),
      providesTags: ['User'],
    }),

    // Admin: Update user
    updateUser: builder.mutation<UserProfile, { Id: number; Data: Partial<UserProfile> }>({
      query: ({ Id, Data }) => ({
        url: `/admin/users/${Id}`,
        method: 'PUT',
        body: Data,
      }),
      invalidatesTags: ['User'],
    }),

    // Admin: Delete user
    deleteUser: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/users/${Id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Admin: Activate user
    activateUser: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/users/${Id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Admin: Deactivate user
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
  useGetDashboardQuery
} = usersApi;

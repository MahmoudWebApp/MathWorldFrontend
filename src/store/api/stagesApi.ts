// store/api/stagesApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse, baseQuery } from './baseQuery';

export interface Stage {
  Id: number;
  NameAr: string;
  NameEn: string;
  Order: number;
}

export interface CreateStageRequest {
  NameAr: string;
  NameEn: string;
  Order: number;
}

export const stagesApi = createApi({
  reducerPath: 'stagesApi',
  baseQuery,
  tagTypes: ['Stage'],
  endpoints: (builder) => ({
    // 🔹 Public Endpoint: For displaying stages in the frontend (StagesSection, etc.)
    getStages: builder.query<Stage[], void>({
      query: () => '/stages', // Calls: GET /api/stages (Public Controller)
      providesTags: ['Stage'],
    }),

    // 🔹 Admin Endpoint: For admin panel management (CRUD operations)
    getAdminStages: builder.query<Stage[], void>({
      query: () => '/admin/stages', // Calls: GET /api/admin/stages (Requires Auth)
      providesTags: ['Stage'],
    }),

    createStage: builder.mutation<Stage, CreateStageRequest>({
      query: (body) => ({
        url: '/admin/stages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Stage'],
    }),
    updateStage: builder.mutation<void, { Id: number; Data: CreateStageRequest }>({
      query: ({ Id, Data }) => ({
        url: `/admin/stages/${Id}`,
        method: 'PUT',
        body: Data,
      }),
      invalidatesTags: ['Stage'],
    }),
    deleteStage: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/stages/${Id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stage'],
    }),
  }),
});

// ✅ Export the new public hook + keep admin hooks for admin pages
export const {
  useGetStagesQuery,        // 👈 New: For public/frontend usage
  useGetAdminStagesQuery,   // 👈 Keep: For admin panel usage
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
} = stagesApi;
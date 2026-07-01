// File: store/api/statsApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface DashboardStats {
  TotalProblems: number;
  TotalUsers: number;
  TotalSolved: number;
  TotalViews: number;
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
} = statsApi;
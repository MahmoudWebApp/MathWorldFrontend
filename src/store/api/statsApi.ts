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
  endpoints: (builder) => ({
    getStats: builder.query<DashboardStats, void>({
      query: () => '/admin/stats',
    }),
  }),
});

export const {
  useGetStatsQuery,
} = statsApi;
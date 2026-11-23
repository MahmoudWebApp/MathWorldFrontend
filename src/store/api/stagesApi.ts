// File: store/api/stagesApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface Stage {
  Id: number;
  NameAr: string;
  NameEn: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  Order: number;
}

export interface JourneyCategoryProgress {
  CategoryId: number;
  NameAr: string;
  NameEn: string;
  IsLocked: boolean;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
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
  MasteredProblems: number;
  TotalPoints: number;
  CompletionPercent: number;
  Categories: JourneyCategoryProgress[];
}

export interface DailyChallenge {
  DateUtc: string;
  StageId: number;
  Total: number;
  Completed: number;
  Correct: number;
  Problems: Array<{
    Id: number;
    CategoryId: number;
    TitleAr: string;
    TitleEn: string;
    Points: number;
    IsSolved: boolean;
    IsAnswered: boolean;
  }>;
}

export interface CreateStageRequest {
  NameAr: string;
  NameEn: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  Order: number;
}

export const stagesApi = createApi({
  reducerPath: 'stagesApi',
  baseQuery,
  tagTypes: ['Stage', 'LearningJourney', 'DailyChallenge'],
  endpoints: (builder) => ({
    
    // ✅ PUBLIC: Get all stages (no auth required)
    // Calls: GET /api/stages
    getStages: builder.query<Stage[], string>({
      keepUnusedDataFor: 180,
      query: () => '/stages',
      providesTags: ['Stage'],
    }),

    getDailyChallenge: builder.query<DailyChallenge, number | void>({
      // Stage-specific cache key prevents showing another stage's suggestions
      // immediately after switching stages or returning from practice.
      query: (stageId) => stageId
        ? `/users/daily-challenge?stageId=${stageId}`
        : '/users/daily-challenge',
      providesTags: ['DailyChallenge'],
    }),
    getLearningJourney: builder.query<LearningJourney, number | void>({
      query: (stageId) => stageId
        ? `/users/journey?stageId=${stageId}`
        : '/users/journey',
      providesTags: ['LearningJourney'],
    }),

    // Admin: Get all stages (requires auth)
    getAdminStages: builder.query<Stage[], void>({
      query: () => '/admin/stages',
      providesTags: ['Stage'],
    }),

    // Admin: Create stage
    createStage: builder.mutation<{ Id: number }, CreateStageRequest>({
      query: (body) => ({
        url: '/admin/stages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Stage'],
    }),

    // Admin: Update stage
    updateStage: builder.mutation<void, { Id: number; Data: CreateStageRequest }>({
      query: ({ Id, Data }) => ({
        url: `/admin/stages/${Id}`,
        method: 'PUT',
        body: Data,
      }),
      invalidatesTags: ['Stage'],
    }),

    // Admin: Delete stage
    deleteStage: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/stages/${Id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stage'],
    }),
  }),
});

export const {
  useGetStagesQuery,
  useGetLearningJourneyQuery,
  useGetDailyChallengeQuery,
  useGetAdminStagesQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
} = stagesApi;
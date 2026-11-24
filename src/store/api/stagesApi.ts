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

export interface LearningTrack {
  Id:number; StageId:number; Code:string; Kind:'grade'|'course'; NameAr:string; NameEn:string;
  DescriptionAr:string; DescriptionEn:string; SortOrder:number; Revision:number; IsPublished:boolean;
}
export interface TrackMapping { CategoryIds:number[]; SkillIds:number[]; ProblemIds:number[] }
export interface TrackDetail extends TrackMapping {
  Track:LearningTrack; Coverage:{Categories:number;Skills:number;Problems:number;FreeProblems:number};
}
export interface TrackInventory {
  Categories:{Id:number;NameAr:string;NameEn:string}[];
  Skills:{Id:number;CategoryId:number;NameAr:string;NameEn:string;IsPublished:boolean}[];
  Problems:{Id:number;CategoryId:number;TitleAr:string;TitleEn:string;PrimarySkillId?:number|null;AssignedTrackCount:number}[];
  Total:number;
}
export interface TrackListRow {Track:LearningTrack;CategoryCount:number;SkillCount:number;ProblemCount:number}
export type CreateTrackInput=Omit<LearningTrack,'Id'|'Revision'|'IsPublished'>;
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
  tagTypes: ['Stage', 'LearningJourney', 'DailyChallenge','LearningTrack'],
  endpoints: (builder) => ({
    getAdminTracks:builder.query<{Enabled:boolean;Items:TrackListRow[]},void>({
      query:()=>'/admin/learning-tracks',providesTags:['LearningTrack'],
    }),
    getAdminTrack:builder.query<TrackDetail,number>({
      query:id=>'/admin/learning-tracks/'+id,providesTags:['LearningTrack'],
    }),
    getTrackInventory:builder.query<TrackInventory,{stageId:number;page:number;categoryId?:number}>({
      query:({stageId,...params})=>({url:'/admin/learning-tracks/inventory/'+stageId,params}),providesTags:['LearningTrack'],
    }),
    createTrack:builder.mutation<LearningTrack,CreateTrackInput>({
      query:body=>({url:'/admin/learning-tracks',method:'POST',body}),invalidatesTags:(_r,e)=>e?[]:['LearningTrack'],
    }),
    mapTrack:builder.mutation<{Revision:number},TrackMapping&{id:number;Revision:number}>({
      query:({id,...body})=>({url:'/admin/learning-tracks/'+id+'/mapping',method:'PUT',body}),invalidatesTags:(_r,e)=>e?[]:['LearningTrack'],
    }),
    publishTrack:builder.mutation<{Revision:number;IsPublished:boolean},{id:number;Revision:number;Publish:boolean}>({
      query:({id,...body})=>({url:'/admin/learning-tracks/'+id+'/publication',method:'PUT',body}),invalidatesTags:(_r,e)=>e?[]:['LearningTrack'],
    }),
    
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
  useGetAdminTracksQuery,useGetAdminTrackQuery,useGetTrackInventoryQuery,useCreateTrackMutation,useMapTrackMutation,usePublishTrackMutation,
  useGetStagesQuery,
  useGetLearningJourneyQuery,
  useGetDailyChallengeQuery,
  useGetAdminStagesQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
} = stagesApi;
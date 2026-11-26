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
  FreeCategoryIds?:number[];
  Track:LearningTrack; Coverage:{Categories:number;Skills:number;Problems:number;FreeProblems:number};
}
export interface TrackInventory {
  Categories:{Id:number;NameAr:string;NameEn:string}[];
  Skills:{Id:number;CategoryId:number;NameAr:string;NameEn:string;IsPublished:boolean}[];
  Problems:{Id:number;CategoryId:number;TitleAr:string;TitleEn:string;PrimarySkillId?:number|null;AssignedTrackCount:number}[];
  Total:number;
}
export interface ReviewedTrackDraftBatch {
  Confirmed:boolean;AppliedTracks:number;ExcludedCount:number;
  Items:{Id:number;Revision:number;Code:string;StageId:number;Problems:number;FreeProblems:number;Status:'Ready'|'AlreadyMapped'}[];
}
export interface TrackListRow {Track:LearningTrack;CategoryCount:number;SkillCount:number;ProblemCount:number}
export type CreateTrackInput=Omit<LearningTrack,'Id'|'Revision'|'IsPublished'>;
export type PublishedTrack = Pick<LearningTrack,'Id'|'StageId'|'Code'|'Kind'|'NameAr'|'NameEn'|'DescriptionAr'|'DescriptionEn'>;
export interface TrackCatalog {Enabled:boolean;Items:(PublishedTrack&{ProblemsCount:number;CategoriesCount:number;SkillsCount:number;FreeProblemsCount:number})[]}
export interface PublishedTrackDetail {
  Track:PublishedTrack;
  Categories:{Id:number;NameAr:string;NameEn:string;DescriptionAr:string;DescriptionEn:string;Icon:string;IsFree:boolean;ProblemsCount:number}[];
  Skills:{Id:number;CategoryId:number;NameAr:string;NameEn:string;DescriptionAr:string;DescriptionEn:string}[];
  Examples:{Id:number;CategoryId:number;TitleAr:string;TitleEn:string}[];
}
export interface TrackSelection {Enabled:boolean;StageId:number|null;TrackId:number|null;Track?:PublishedTrack|null}
export interface TrackProgress {TrackId:number;StageId:number;TrackPracticeIsolationEnabled?:boolean;ProblemsCount:number;Solved:number;CompletionPercent:number;Categories:{CategoryId:number;ProblemsCount:number;IsLocked:boolean;Solved:number;Attempted:number;Mastered:number}[]}
export interface TrackPractice {TrackId:number;CategoryId:number;Total:number;Page:number;PageSize:number;Items:{Id:number;CategoryId:number;TitleAr:string;TitleEn:string;Points:number;IsSolved:boolean}[]}
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
  TrackId?: number | null;
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
  TrackId?: number | null;
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
    getPublishedTracks:builder.query<TrackCatalog,number>({
      query:id=>'/stages/'+id+'/tracks',providesTags:['LearningTrack'],
    }),
    getPublishedTrack:builder.query<PublishedTrackDetail,number>({
      query:id=>'/learning-tracks/'+id,providesTags:['LearningTrack'],
    }),
    getTrackSelection:builder.query<TrackSelection,void>({
      query:()=>'/users/learning-track',providesTags:['LearningTrack'],
    }),
    selectTrack:builder.mutation<TrackSelection,{TrackId:number}>({
      query:body=>({url:'/users/learning-track',method:'PUT',body}),invalidatesTags:(_r,e)=>e?[]:['LearningTrack','LearningJourney','DailyChallenge'],
    }),
    getTrackContinue:builder.query<{TrackId:number;Problem:{Id:number;CategoryId:number;TitleAr:string;TitleEn:string}|null},void>({
      query:()=>'/users/learning-tracks/continue',providesTags:['LearningTrack'],
    }),
    getTrackProgress:builder.query<TrackProgress,number>({
      query:id=>'/users/learning-tracks/'+id+'/progress',providesTags:['LearningTrack'],
    }),
    getNextTrackProblem:builder.query<{TrackId:number;CategoryId:number;HasNext:boolean;Problem?:{Id:number;CategoryId:number;TitleAr:string;TitleEn:string;RequiresRetry:boolean}|null},{id:number;categoryId:number;afterProblemId:number}>({
      query:({id,categoryId,afterProblemId})=>({url:'/users/learning-tracks/'+id+'/categories/'+categoryId+'/next',params:{afterProblemId}}),
      providesTags:['LearningTrack'],
    }),
    getTrackPractice:builder.query<TrackPractice,{id:number;categoryId:number;page:number}>({
      query:({id,categoryId,page})=>({url:'/users/learning-tracks/'+id+'/categories/'+categoryId+'/problems',params:{page}}),providesTags:['LearningTrack'],
    }),
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
    updateTrackMetadata:builder.mutation<{Revision:number},{id:number;Revision:number;NameAr:string;NameEn:string;DescriptionAr:string;DescriptionEn:string;SortOrder:number}>({
      query:({id,...body})=>({url:'/admin/learning-tracks/'+id+'/metadata',method:'PUT',body}),invalidatesTags:(_r,e)=>e?[]:['LearningTrack'],
    }),
    reviewedTrackDraftBatch:builder.mutation<ReviewedTrackDraftBatch,{Confirm:boolean;Revisions?:{Id:number;Revision:number}[]}>({
      query:body=>({url:'/admin/learning-tracks/reviewed-draft-batch',method:'POST',body}),
      invalidatesTags:(r,e)=>!e&&r?.Confirmed?['LearningTrack']:[],
    }),
    mapTrack:builder.mutation<{Revision:number},TrackMapping&{id:number;Revision:number}>({
      query:({id,...body})=>({url:'/admin/learning-tracks/'+id+'/mapping',method:'PUT',body}),invalidatesTags:(_r,e)=>e?[]:['LearningTrack'],
    }),
    publishTrack:builder.mutation<{Revision:number;IsPublished:boolean},{id:number;Revision:number;Publish:boolean;ConfirmPremiumOnlyCourse?:boolean}>({
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
  useGetPublishedTracksQuery,useGetPublishedTrackQuery,useGetTrackSelectionQuery,useSelectTrackMutation,useGetTrackProgressQuery,useGetTrackPracticeQuery,useGetNextTrackProblemQuery,useGetTrackContinueQuery,
  useGetAdminTracksQuery,useGetAdminTrackQuery,useGetTrackInventoryQuery,useCreateTrackMutation,useReviewedTrackDraftBatchMutation,useMapTrackMutation,usePublishTrackMutation,useUpdateTrackMetadataMutation,
  useGetStagesQuery,
  useGetLearningJourneyQuery,
  useGetDailyChallengeQuery,
  useGetAdminStagesQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
} = stagesApi;
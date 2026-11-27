import { createApi } from '@reduxjs/toolkit/query/react';
import type { PremiumSolution } from '@/lib/premium-api';
import type { GeometryScene } from '@/components/math/GeometryDiagram';
import { baseQuery } from './baseQuery';
import { usersApi } from './usersApi';
import { stagesApi } from './stagesApi';
import type { PagedProblemsResponse, ProblemPreview } from './types';

export interface ProblemHints {ProblemId:number;Available:boolean;HintCount?:number;RevealedCount:number;Hints:{Level:number;Text:string}[]}

export interface OptionForStudent {
  Id: number;
  LatexCode: string;
  Order: number;
}

export interface AdminProblemOption {
  Id?: number;
  LatexCode: string;
  Order: number;
  IsCorrect: boolean;
}

export interface QuestionOptionDto {
  LatexCode: string;
  IsCorrect: boolean;
  Order: number;
}

export type MasteryStatus = 'New' | 'NeedsReview' | 'Practicing' | 'Mastered';

export interface SolutionStructure {Idea:string;FormulaLatex:string;Steps:string[];Substitution:string;Result:string;Unit:string;Verification:string;CommonError:string}
export interface ProblemForStudent {
  HasDiagram?: boolean;
  PracticeScopeId?: number|null;
  SolutionStructure?:SolutionStructure|null;
  Id: number;
  Title: string;
  QuestionText: string;
  StageId: number;
  StageName: string;
  CategoryId: number;
  CategoryName: string;
  CategoryIcon?: string | null;
  Points: number;
  ViewsCount: number;
  IsSolved: boolean;
  HasAttempted: boolean;
  WasCorrect?: boolean | null;
  SelectedOptionId?: number | null;
  CorrectOptionId?: number | null;
  IsFavorite: boolean;
  AttemptCount: number;
  FirstAttemptCorrect?: boolean | null;
  CanRetry: boolean;
  MasteryStatus: MasteryStatus;
  BestTimeSeconds?: number | null;
  AverageTimeSeconds?: number | null;
  IsInErrorNotebook: boolean;
  IsErrorNotebookArchived: boolean;
  NextReviewAt?: string | null;
  DetailedSolution?: string | null;
  YoutubeSolutionUrl?: string | null;
  Options: OptionForStudent[];
}

export interface ProblemForPublic {
  Id: number;
  Title: string;
  QuestionText: string;
  StageId: number;
  StageName: string;
  CategoryId: number;
  CategoryName: string;
  CategoryIcon?: string | null;
  Message: string;
}

export interface ProblemAdminDetail {
  Id: number;
  TitleAr: string;
  TitleEn: string;
  QuestionTextAr: string;
  QuestionTextEn: string;
  DetailedSolutionAr: string;
  DetailedSolutionEn: string;
  YoutubeSolutionUrl?: string | null;
  StageId: number;
  StageName?: string;
  Points: number;
  CategoryId: number;
  CategoryName?: string;
  CategoryIcon?: string | null;
  Options: AdminProblemOption[];
}

export interface CreateProblemRequest {
  QuestionTextAr: string;
  QuestionTextEn: string;
  DetailedSolutionAr: string;
  DetailedSolutionEn: string;
  YoutubeSolutionUrl?: string;
  StageId: number;
  Points: number;
  CategoryId: number;
  Options: QuestionOptionDto[];
}

export interface AdminProblemsPagedResponse {
  Results: ProblemAdminDetail[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}

export type ProblemDetail =
  | ProblemForStudent
  | ProblemForPublic
  | ProblemAdminDetail;

export interface SearchResponse {
  Query: string;
  Page: number;
  PageSize: number;
  Total: number;
  TotalPages: number;
  Results: ProblemPreview[];
}

export interface SearchProblemsParams {
  Q?: string;
  CategoryId?: number;
  StageId?: number;
  HideSolved?: boolean;
  Engine?: 'meilisearch' | 'postgresql';
  Page?: number;
  PageSize?: number;
  locale?: string;
}

export interface SubmitAnswerRequest {
  PracticeScopeId?: number|null;
  ProblemId: number;
  SelectedOptionId: number;
  TimeSpentSeconds: number;
}

export interface ProblemSolutionPreview {
  ProblemId: number;
  CorrectOptionId?: number | null;
  DetailedSolution?: string | null;
  YoutubeSolutionUrl?: string | null;
}

export interface AnswerResult {
  SolutionStructure?:SolutionStructure|null;
  UsedHint?:boolean;
  IsCorrect: boolean;
  IsSolved: boolean;
  SelectedOptionId: number;
  CorrectOptionId?: number | null;
  PointsEarned: number;
  DetailedSolution?: string | null;
  CorrectOptionText?: string | null;
  YoutubeSolutionUrl?: string | null;
  AttemptId: number;
  AttemptNumber: number;
  IsOfficialAttempt: boolean;
  FirstAttemptCorrect: boolean;
  AttemptTimeSeconds: number;
  BestTimeSeconds?: number | null;
  TotalAttempts: number;
  CanRetry: boolean;
  MasteryStatus: MasteryStatus;
  IsInErrorNotebook: boolean;
  NextReviewAt?: string | null;
}

export interface ProblemAttempt {
  Id: number;
  AttemptNumber: number;
  IsOfficial: boolean;
  SelectedOptionId: number;
  SelectedOptionText: string;
  CorrectOptionId?: number | null;
  CorrectOptionText?: string | null;
  IsCorrect: boolean;
  TimeSpentSeconds: number;
  PointsEarned: number;
  UsedHint: boolean;
  StartedAt: string;
  SubmittedAt: string;
}

export interface ProblemAttemptHistory {
  ProblemId: number;
  TotalAttempts: number;
  FirstAttemptCorrect?: boolean | null;
  IsSolved: boolean;
  BestTimeSeconds?: number | null;
  AverageTimeSeconds?: number | null;
  MasteryStatus: MasteryStatus;
  IsInErrorNotebook: boolean;
  IsErrorNotebookArchived: boolean;
  NextReviewAt?: string | null;
  Attempts: ProblemAttempt[];
}

export const problemsApi = createApi({
  reducerPath: 'problemsApi',
  baseQuery,
  tagTypes: ['Problem', 'Category', 'AttemptHistory'],
  endpoints: (builder) => ({
    searchProblems: builder.query<SearchResponse, SearchProblemsParams>({
      query: (params) => ({
        url: '/problems/search',
        params: {
          q: params.Q?.trim() || '',
          categoryId: params.CategoryId,
          stageId: params.StageId,
          hideSolved: params.HideSolved === true ? true : undefined,
          engine: params.Engine || 'postgresql',
          page: params.Page || 1,
          pageSize: params.PageSize || 10,
        },
      }),
      providesTags: ['Problem'],
    }),

    getSolutionPreview: builder.query<ProblemSolutionPreview, number>({
      query: (problemId) => `/problems/${problemId}/solution-preview`,
    }),

    getProblem: builder.query<
      ProblemDetail,
      { Id: number; locale?: string; viewerKey?: string }
    >({
      keepUnusedDataFor: 25,
      query: ({ Id, locale }) => ({
        url: `/problems/${Id}`,
        headers: locale ? {'Accept-Language':locale} : undefined,
      }),
      providesTags: (_result, _error, params) => [
        { type: 'Problem', id: params.Id },
      ],
    }),

    getProblemAttempts: builder.query<
      ProblemAttemptHistory,
      { ProblemId: number; Locale: string }
    >({
      query: ({ ProblemId }) => `/problems/${ProblemId}/attempts`,
      providesTags: (_result, _error, { ProblemId }) => [
        { type: 'AttemptHistory', id: ProblemId },
      ],
    }),

    submitAnswer: builder.mutation<AnswerResult, SubmitAnswerRequest>({
      query: (body) => ({
        url: '/problems/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { ProblemId }) => [
        { type: 'Problem', id: ProblemId },
        { type: 'AttemptHistory', id: ProblemId },
      ],
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          // These are separate RTK Query APIs; invalidating Problem tags does
          // not refresh usersApi. Run only after the server commits an attempt.
          await queryFulfilled;
          dispatch(usersApi.util.invalidateTags([
            'Leaderboard', 'Achievements', 'LearningJourney',
            'Dashboard', 'Solved', 'ErrorNotebook', 'User',
            'PremiumAnalytics',
          ]));
          // The journey/daily-practice pages also use a separate stagesApi.
          // Refresh their confirmed solved counts on the same successful write.
          dispatch(stagesApi.util.invalidateTags(['LearningJourney', 'DailyChallenge', 'LearningTrack']));
        } catch {
          // Do not show earned points or a changed rank for failed submissions.
        }
      },
    }),

    getCategoryProblems: builder.query<
      PagedProblemsResponse,
      { Id: number; Page?: number; PageSize?: number }
    >({
      query: ({ Id, Page = 1, PageSize = 20 }) => ({
        url: `/categories/${Id}/problems`,
        params: { page: Page, pageSize: PageSize },
      }),
      providesTags: ['Problem', 'Category'],
    }),

    getAdminProblems: builder.query<
      AdminProblemsPagedResponse,
      {
        q?: string;
        categoryId?: number;
        stageId?: number;
        page?: number;
        pageSize?: number;
      }
    >({
      query: (params) => ({
        url: '/admin/problems',
        params: {
          q: params.q,
          categoryId: params.categoryId,
          stageId: params.stageId,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        },
      }),
      providesTags: ['Problem'],
    }),

    getProblemDiagram: builder.query<GeometryScene | null, number>({
      query: (problemId) => `/problems/${problemId}/diagram`,
      providesTags: (_result, _error, problemId) => [{ type: 'Problem', id: problemId }],
    }),

    upsertAdminProblemDiagram: builder.mutation<void, { problemId: number; scene: GeometryScene }>({
      query: ({ problemId, scene }) => ({
        url: `/admin/problems/${problemId}/diagram`,
        method: 'PUT',
        body: { scene },
      }),
      invalidatesTags: (_result, _error, { problemId }) => [{ type: 'Problem', id: problemId }],
    }),

    deleteAdminProblemDiagram: builder.mutation<void, number>({
      query: (problemId) => ({
        url: `/admin/problems/${problemId}/diagram`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, problemId) => [{ type: 'Problem', id: problemId }],
    }),

    getProblemHints: builder.query<ProblemHints,{problemId:number;locale:string;scope?:number|null}>({
      query:({problemId,locale,scope})=>({url:`/problems/${problemId}/hints`,params:scope==null?{}:{practiceScopeId:scope},headers:{'Accept-Language':locale}}),
      providesTags:(_r,_e,{problemId})=>[{type:'Problem',id:problemId}],
    }),
    revealProblemHint: builder.mutation<ProblemHints,{problemId:number;Level:number;locale:string;scope?:number|null}>({
      query:({problemId,Level,locale,scope})=>({url:`/problems/${problemId}/hints`,method:'POST',body:{Level,...(scope==null?{}:{PracticeScopeId:scope})},headers:{'Accept-Language':locale}}),
      invalidatesTags:(_r,e,{problemId})=>e?[]:[{type:'Problem',id:problemId}],
    }),
    getPremiumSolution: builder.query<PremiumSolution, number>({
      query: (problemId) => `/problems/${problemId}/premium-solution`,
    }),

    createProblem: builder.mutation<{ Id: number }, CreateProblemRequest>({
      query: (body) => ({
        url: '/admin/problems',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Problem'],
    }),

    updateProblem: builder.mutation<
      void,
      { Id: number; Data: CreateProblemRequest }
    >({
      query: ({ Id, Data }) => ({
        url: `/admin/problems/${Id}`,
        method: 'PUT',
        body: Data,
      }),
      invalidatesTags: (_result, _error, { Id }) => [
        { type: 'Problem', id: Id },
      ],
    }),

    deleteProblem: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/problems/${Id}`,
        params: { confirmReviewedDeletion: true },
        method: 'DELETE',
      }),
      invalidatesTags: ['Problem'],
    }),
  }),
});

export const {
  useSearchProblemsQuery,
  useGetProblemDiagramQuery,
  useUpsertAdminProblemDiagramMutation,
  useDeleteAdminProblemDiagramMutation,
  useGetProblemQuery,
  useGetProblemHintsQuery,
  useRevealProblemHintMutation,
  useLazyGetPremiumSolutionQuery,
  useLazyGetSolutionPreviewQuery,
  useGetProblemAttemptsQuery,
  useSubmitAnswerMutation,
  useGetCategoryProblemsQuery,
  useGetAdminProblemsQuery,
  useLazyGetAdminProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
} = problemsApi;
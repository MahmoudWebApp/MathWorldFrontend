import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { PagedProblemsResponse, ProblemPreview } from './types';

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

export interface ProblemForStudent {
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
  Engine?: 'meilisearch' | 'postgresql';
  Page?: number;
  PageSize?: number;
  locale?: string;
}

export interface SubmitAnswerRequest {
  ProblemId: number;
  SelectedOptionId: number;
  TimeSpentSeconds: number;
}

export interface AnswerResult {
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
          engine: params.Engine || 'postgresql',
          page: params.Page || 1,
          pageSize: params.PageSize || 10,
        },
      }),
      providesTags: ['Problem'],
    }),

    getProblem: builder.query<
      ProblemDetail,
      { Id: number; locale?: string }
    >({
      query: ({ Id }) => ({
        url: `/problems/${Id}`,
      }),
      providesTags: (_result, _error, params) => [
        { type: 'Problem', id: params.Id },
      ],
    }),

    getProblemAttempts: builder.query<ProblemAttemptHistory, number>({
      query: (problemId) => `/problems/${problemId}/attempts`,
      providesTags: (_result, _error, problemId) => [
        { type: 'AttemptHistory', id: problemId },
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
        method: 'DELETE',
      }),
      invalidatesTags: ['Problem'],
    }),
  }),
});

export const {
  useSearchProblemsQuery,
  useGetProblemQuery,
  useGetProblemAttemptsQuery,
  useSubmitAnswerMutation,
  useGetCategoryProblemsQuery,
  useGetAdminProblemsQuery,
  useLazyGetAdminProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
} = problemsApi;
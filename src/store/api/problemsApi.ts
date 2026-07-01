import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse, baseQuery } from './baseQuery';
import { ProblemPreview, PagedProblemsResponse, PagedResponse } from './types';

// ============================================
// DTOs - Frontend interfaces matching backend
// ============================================

export interface OptionForStudent {
  Id: number;
  LatexCode: string;
  Order: number;
  IsCorrect?: boolean;
}

export interface QuestionOptionDto {
  LatexCode: string;
  IsCorrect: boolean;
  Order: number;
}

export interface ProblemForStudent {
  Id: number;
  Title: string;
  QuestionText: string;
  StageId: number;
  StageName: string;
  Points: number;
  CategoryName: string;
  CategoryIcon: string;
  DetailedSolution?: string;
  YoutubeSolutionUrl?: string;
  Options: OptionForStudent[];
  IsSolved: boolean;
  IsFavorite: boolean;
}

export interface ProblemForPublic {
  Id: number;
  Title: string;
  QuestionText: string;
  StageId: number;
  StageName: string;
  CategoryName: string;
  CategoryIcon: string;
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
  YoutubeSolutionUrl?: string;
  StageId: number;
  StageName?: string;
  Points: number;
  CategoryId: number;
  CategoryName?: string;
  Options: OptionForStudent[];
}

// ============================================
// Create/Update Problem DTO (matches CreateProblemDto in backend)
// ============================================
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

export type ProblemDetail = ProblemForStudent | ProblemForPublic | ProblemAdminDetail;

export interface SearchResponse {
  Query: string;
  Page: number;
  PageSize: number;
  Total: number;
  TotalPages: number;
  Results: ProblemPreview[];
}

export interface SubmitAnswerRequest {
  ProblemId: number;
  SelectedOptionId: number;
  TimeSpentSeconds: number;
}

export interface AnswerResult {
  IsCorrect: boolean;
  PointsEarned: number;
  DetailedSolution: string;
  CorrectOptionText: string;
  IsSolved: boolean;
  YoutubeSolutionUrl?: string;
}

// ============================================
// API Definition
// ============================================

export const problemsApi = createApi({
  reducerPath: 'problemsApi',
  baseQuery,
  tagTypes: ['Problem', 'Category'],
  endpoints: (builder) => ({

    // Search problems with filters - returns translated data based on Accept-Language header
    searchProblems: builder.query<ApiResponse<SearchResponse>, {
      Q?: string;
      CategoryId?: number;
      StageId?: number;
      Engine?: 'meilisearch' | 'postgresql';
      Page?: number;
      PageSize?: number;
      locale?: string; 
    }>({
      query: (params) => ({
        url: '/Problems/search',
        params: {
          q: params.Q || '', // Ensure empty string instead of undefined
          categoryId: params.CategoryId || undefined,
          stageId: params.StageId || undefined,
          engine: params.Engine || 'meilisearch',
          page: params.Page || 1,
          pageSize: params.PageSize || 10,
        },
      }),
      providesTags: ['Problem'],
    }), // 👈 THIS CLOSING BRACKET WAS MISSING

    // Get single problem by ID - returns different data based on auth & role
    getProblem: builder.query<ProblemDetail,{ Id: number, locale?: string }>({
      query: (data) => `/Problems/${data.Id}`,
     providesTags: (_result, _error, params) => [{ type: 'Problem', id: params.Id }],
    }),

    // Submit answer for a problem
    submitAnswer: builder.mutation<AnswerResult, SubmitAnswerRequest>({
      query: (body) => ({
        url: '/problems/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { ProblemId }) =>
        [{ type: 'Problem', id: ProblemId }],
    }),

    // Get problems by category - returns translated content
    getCategoryProblems: builder.query<
      PagedResponse<PagedProblemsResponse>,
      { Id: number; Page?: number; PageSize?: number }
    >({
      query: ({ Id, Page = 1, PageSize = 20 }) => ({
        url: `/Categories/${Id}/problems`,
        params: { Page, PageSize },
      }),
      providesTags: ['Problem', 'Category'],
    }),

    // ============================================
    // Admin Endpoints
    // ============================================

    // Admin: Get all problems (bilingual - returns both Ar/En fields)
    getAdminProblems: builder.query<AdminProblemsPagedResponse, {
      q?: string;
      categoryId?: number;
      stageId?: number;
      page?: number;
      pageSize?: number;
    }>({
      query: (params) => ({
        url: '/admin/problems',
        params: {
          q: params?.q,
          categoryId: params?.categoryId,
          stageId: params?.stageId,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10,
        },
      }),
      providesTags: ['Problem'],
    }),

    // Admin: Create new problem (title is auto-extracted from question text)
    createProblem: builder.mutation<{ Id: number }, CreateProblemRequest>({
      query: (body) => ({
        url: '/admin/problems',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Problem'],
    }),

    // Admin: Update existing problem
    updateProblem: builder.mutation<void, { Id: number; Data: CreateProblemRequest }>({
      query: ({ Id, Data }) => ({
        url: `/admin/problems/${Id}`,
        method: 'PUT',
        body: Data,
      }),
      invalidatesTags: (_result, _error, { Id }) => [{ type: 'Problem', id: Id }],
    }),

    // Admin: Delete problem
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
  useSubmitAnswerMutation,
  useGetCategoryProblemsQuery,
  useGetAdminProblemsQuery,
  useLazyGetAdminProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
} = problemsApi;
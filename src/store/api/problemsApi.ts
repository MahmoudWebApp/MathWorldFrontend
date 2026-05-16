import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse, baseQuery } from './baseQuery';
import { ProblemPreview, PagedProblemsResponse, PagedResponse } from './types';

export interface OptionForStudent {
  Id: number;
  Text: string;
  LatexCode?: string;
  Order: number;
}

export interface ProblemForStudent {
  Id: number;
  Title: string;
  QuestionText: string;
  LatexCode?: string;
  StageId: number;
  StageName: string;
  Points: number;
  CategoryName: string;
  CategoryIcon: string;
  DetailedSolutionAr?: string;
  DetailedSolutionEn?: string;
  DetailedSolution?: string;
  YoutubeSolutionUrl?: string;
  Options: OptionForStudent[];
  IsSolved: boolean;
  IsFavorite: boolean;
  Tags: string[];
}

export interface ProblemForPublic {
  Id: number;
  Title: string;
  QuestionText: string;
  LatexCode?: string;
  StageId: number;
  StageName: string;
  CategoryName: string;
  CategoryIcon: string;
  Message: string;
  Tags: string[];
}

export interface ProblemAdminDetail {
  Id: number;
  TitleAr: string;
  TitleEn: string;
  QuestionTextAr: string;
  QuestionTextEn: string;
  LatexCode?: string;
  DetailedSolution?: string;
  DetailedSolutionAr?: string;
  DetailedSolutionEn?: string;
  YoutubeSolutionUrl?: string;
  StageId: number;
  Points: number;
  CategoryId: number;
  Options: Array<{
    Id: number;
    TextAr: string;
    TextEn: string;
    LatexCode?: string;
    IsCorrect: boolean;
    Order: number;
  }>;
  Tags: Array<{ Id: number; TextAr: string; TextEn: string }>;
}

export interface AdminProblemResponse {
  Id?: number;
  TitleAr: string;
  TitleEn: string;
  QuestionTextAr: string;
  QuestionTextEn: string;
  LatexCode?: string;
  DetailedSolutionAr?: string;
  DetailedSolutionEn?: string;
  YoutubeSolutionUrl?: string;
  StageId: number;
  Points: number;
  CategoryId: number;
  Options: Array<{
    TextAr: string;
    TextEn: string;
    LatexCode?: string;
    IsCorrect: boolean;
    Order: number;
  }>;
  TagIds?: number[];
}

export interface CreateProblemRequest {
  TitleAr: string;
  TitleEn: string;
  QuestionTextAr: string;
  QuestionTextEn: string;
  LatexCode?: string;
  DetailedSolutionAr?: string;
  DetailedSolutionEn?: string;
  YoutubeSolutionUrl?: string;
  StageId: number;
  Points: number;
  CategoryId: number;
  Options: Array<{
    TextAr: string;
    TextEn: string;
    LatexCode?: string;
    IsCorrect: boolean;
    Order: number;
  }>;
  TagIds?: number[];
}

export interface AdminProblemsPagedResponse {
  Results: AdminProblemResponse[];
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

export const problemsApi = createApi({
  reducerPath: 'problemsApi',
  baseQuery,
  tagTypes: ['Problem', 'Category', 'Tag'],
  endpoints: (builder) => ({
    // Search problems with filters - returns translated data based on Accept-Language header
    searchProblems: builder.query<ApiResponse<SearchResponse>, {
      Q?: string;
      CategoryId?: number;
      StageId?: number;
      Engine?: 'meilisearch' | 'postgresql';
      TagId?: number;
      Page?: number;
      PageSize?: number;
    }>({
      query: (params) => ({
        url: '/Problems/search',
        params: {
          q: params.Q,
          categoryId: params.CategoryId,
          stageId: params.StageId,
          engine: params.Engine || 'meilisearch',
          tagId: params.TagId,
          page: params.Page || 1,
          pageSize: params.PageSize || 10,
        },
      }),
      providesTags: ['Problem'], // Cache tagged for invalidation on locale change
    }),

    // Get single problem by ID
    getProblem: builder.query<ProblemDetail, number>({
      query: (Id) => `/Problems/${Id}`,
      providesTags: (result, error, Id) => [{ type: 'Problem', Id }],
    }),

    // Submit answer for a problem
    submitAnswer: builder.mutation<AnswerResult, SubmitAnswerRequest>({
      query: (body) => ({
        url: '/problems/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { ProblemId }) =>
        [{ type: 'Problem', Id: ProblemId }],
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

    // Get problems by tag - returns translated content
    getTagProblems: builder.query<
      PagedResponse<PagedProblemsResponse>,
      { Id: number; Page?: number; PageSize?: number }
    >({
      query: ({ Id, Page = 1, PageSize = 20 }) => ({
        url: `/tags/${Id}/problems`,
        params: { Page, PageSize },
      }),
      providesTags: ['Problem', 'Tag'],
    }),

    // Admin: Get all problems (bilingual - returns both Ar/En fields)
    getAdminProblems: builder.query<AdminProblemsPagedResponse, {
      q?: string;
      categoryId?: number;
      stageId?: number;
      tagId?: number;
      Page?: number;
      PageSize?: number;
    }>({
      query: (params) => ({
        url: '/admin/problems',
        params: {
          q: params?.q,
          categoryId: params?.categoryId,
          stageId: params?.stageId,
          tagId: params?.tagId,
          page: params?.Page || 1,
          pageSize: params?.PageSize || 10,
        },
      }),
      providesTags: ['Problem'],
    }),

    // Admin: Create new problem
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
      invalidatesTags: (result, error, { Id }) => [{ type: 'Problem', Id }],
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
  useGetTagProblemsQuery,
  useGetAdminProblemsQuery,
  useLazyGetAdminProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
} = problemsApi;

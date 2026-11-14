import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface CurriculumCategoryCoverage {
  CategoryId: number;
  NameAr: string;
  NameEn: string;
  Icon: string;
  Order: number;
  ProblemCount: number;
}

export interface CurriculumStageCoverage {
  StageId: number;
  NameAr: string;
  NameEn: string;
  Order: number;
  ProblemCount: number;
  RequiredMinimum: number;
  MissingToMinimum: number;
  MeetsMinimum: boolean;
  InvalidProblemCount: number;
  InvalidProblemIds: number[];
  Categories: CurriculumCategoryCoverage[];
}

export interface CurriculumReadiness {
  MinimumProblemsPerStage: number;
  StageCount: number;
  TotalProblems: number;
  OrphanProblemIds: number[];
  OrphanProblemCount: number;
  TotalMissingToMinimum: number;
  StagesBelowMinimum: number;
  StagesWithInvalidProblems: number;
  Stages: CurriculumStageCoverage[];
}

export interface ProposedCurriculumProblem {
  ContentKey: string;
  StageId: number;
  CategoryId: number;
  QuestionTextAr: string;
  QuestionTextEn: string;
  DetailedSolutionAr: string;
  DetailedSolutionEn: string;
  Points: number;
  Options: { LatexCode: string; IsCorrect: boolean; Order: number }[];
}

export interface CurriculumImportPreview {
  DryRun: boolean;
  Published: boolean;
  Total: number;
  ValidCount: number;
  InvalidCount: number;
  CanProceedToEditorialReview: boolean;
  Results: { ContentKey: string; Valid: boolean; Errors: string[] }[];
}

export type CurriculumDraftStatus = 'Pending' | 'Approved' | 'Rejected' | 'Published';

export interface CurriculumDraft {
  Id: number;
  Status: CurriculumDraftStatus;
  ProblemCount: number;
  SubmittedByAdminId: number;
  SubmittedAtUtc: string;
  ReviewedByAdminId: number | null;
  ReviewedAtUtc: string | null;
  ReviewNote: string | null;
  PublishedCount: number;
  PublishedAtUtc: string | null;
}

export interface CurriculumDraftDetail extends CurriculumDraft {
  Problems: ProposedCurriculumProblem[];
}

export interface CurriculumDraftPage {
  Total: number;
  Page: number;
  PageSize: number;
  Batches: CurriculumDraft[];
}

export const curriculumApi = createApi({
  reducerPath: 'curriculumApi',
  baseQuery,
  tagTypes: ['CurriculumDraft', 'CurriculumReadiness'],
  endpoints: builder => ({
    previewCurriculumImport: builder.mutation<CurriculumImportPreview, { Problems: ProposedCurriculumProblem[] }>({
      query: body => ({ url: '/admin/curriculum/import/preview', method: 'POST', body }),
    }),
    getCurriculumReadiness: builder.query<CurriculumReadiness, void>({
      query: () => '/admin/curriculum/readiness',
      providesTags: ['CurriculumReadiness'],
    }),
    getCurriculumDrafts: builder.query<CurriculumDraftPage, { page?: number; status?: CurriculumDraftStatus }>({
      query: ({ page = 1, status } = {}) => ({
        url: '/admin/curriculum/drafts',
        params: { page, pageSize: 20, ...(status ? { status } : {}) },
      }),
      providesTags: ['CurriculumDraft'],
    }),
    getCurriculumDraft: builder.query<CurriculumDraftDetail, number>({
      query: (id) => `/admin/curriculum/drafts/${id}`,
      providesTags: ['CurriculumDraft'],
    }),
    submitCurriculumDraft: builder.mutation<
      { Id: number; Status: CurriculumDraftStatus; ProblemCount: number; SubmittedAtUtc: string },
      { Problems: ProposedCurriculumProblem[] }
    >({
      query: (body) => ({ url: '/admin/curriculum/drafts', method: 'POST', body }),
      invalidatesTags: ['CurriculumDraft'],
    }),
    reviewCurriculumDraft: builder.mutation<
      { Id: number; Status: CurriculumDraftStatus },
      { id: number; approve: boolean; note: string }
    >({
      query: ({ id, approve, note }) => ({
        url: `/admin/curriculum/drafts/${id}/review`,
        method: 'PUT',
        body: { Approve: approve, Note: note },
      }),
      invalidatesTags: ['CurriculumDraft'],
    }),
    publishCurriculumDraft: builder.mutation<
      { Id: number; Status: CurriculumDraftStatus; PublishedCount: number },
      number
    >({
      query: (id) => ({
        url: `/admin/curriculum/drafts/${id}/publish`,
        method: 'POST',
        body: { Confirm: true },
      }),
      invalidatesTags: ['CurriculumDraft', 'CurriculumReadiness'],
    }),
  }),
});

export const {
  useGetCurriculumReadinessQuery,
  usePreviewCurriculumImportMutation,
  useGetCurriculumDraftsQuery,
  useGetCurriculumDraftQuery,
  useSubmitCurriculumDraftMutation,
  useReviewCurriculumDraftMutation,
  usePublishCurriculumDraftMutation,
} = curriculumApi;

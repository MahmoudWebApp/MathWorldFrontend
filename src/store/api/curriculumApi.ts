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

export const curriculumApi = createApi({
  reducerPath: 'curriculumApi',
  baseQuery,
  endpoints: builder => ({
    previewCurriculumImport: builder.mutation<CurriculumImportPreview, { Problems: ProposedCurriculumProblem[] }>({
      query: body => ({ url: '/admin/curriculum/import/preview', method: 'POST', body }),
    }),
    getCurriculumReadiness: builder.query<CurriculumReadiness, void>({
      query: () => '/admin/curriculum/readiness',
    }),
  }),
});

export const { useGetCurriculumReadinessQuery, usePreviewCurriculumImportMutation } = curriculumApi;

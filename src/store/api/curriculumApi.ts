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
  TotalMissingToMinimum: number;
  StagesBelowMinimum: number;
  StagesWithInvalidProblems: number;
  Stages: CurriculumStageCoverage[];
}

export const curriculumApi = createApi({
  reducerPath: 'curriculumApi',
  baseQuery,
  endpoints: builder => ({
    getCurriculumReadiness: builder.query<CurriculumReadiness, void>({
      query: () => '/admin/curriculum/readiness',
    }),
  }),
});

export const { useGetCurriculumReadinessQuery } = curriculumApi;

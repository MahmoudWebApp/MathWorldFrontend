import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface CurriculumCategoryCoverage {
  CategoryId: number;
  NameAr: string;
  NameEn: string;
  Icon: string;
  Order: number;
  ProblemCount: number;
  DistinctTemplateFamilies: number;
  RepeatedTemplateFamilies: number;
  TemplateVariantProblems: number;
  ExactDuplicateProblemIds: number[];
  NeedsEditorialReview: boolean;
}

export interface CurriculumStageCoverage {
  StageId: number;
  NameAr: string;
  NameEn: string;
  Order: number;
  CategoryCount: number;
  ProblemCount: number;
  EmptyCategoryCount: number;
  CategoriesWithRepeatedTemplates: number;
  InvalidProblemCount: number;
  InvalidProblemIds: number[];
  Categories: CurriculumCategoryCoverage[];
}

export interface CurriculumReadiness {
  CurriculumModel: string;
  FixedCategoryOrProblemQuota: boolean;
  SkillCoverageMeasured: boolean;
  SkillCoverageExplanation: string;
  StageCount: number;
  TotalCategories: number;
  TotalProblems: number;
  OrphanProblemIds: number[];
  OrphanProblemCount: number;
  EmptyCategories: number;
  CategoriesWithRepeatedTemplates: number;
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

export interface ProposedStageCategory {
  ContentKey: string;
  StageId: number;
  Order: number;
  NameAr: string;
  NameEn: string;
  SuggestedIconKey: string;
  ReviewStatus: 'Proposed';
  NotesAr: string;
  NotesEn: string;
}

export interface CategoryImportPreview {
  DryRun: boolean;
  Published: boolean;
  ExistingCategoriesUnchanged: boolean;
  Total: number;
  ValidCount: number;
  InvalidCount: number;
  RequiresEditorialApproval: boolean;
  SupportsAutomaticCategoryPublishing: boolean;
  Results: {
    Row: number;
    ContentKey: string;
    Valid: boolean;
    Errors: string[];
  }[];
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

export interface CurriculumDraftTopicQuestion {
  ContentKey: string;
  PrimarySkillKey: string;
  TemplateFamilyKey: string;
  DifficultyLevel: number;
  PisaProcess: string;
  LearningObjectiveAr: string;
  LearningObjectiveEn: string;
  QuestionTextAr: string;
  QuestionTextEn: string;
  DetailedSolutionAr: string;
  DetailedSolutionEn: string;
  Options: { Order: number; LatexCode: string; IsCorrect: boolean }[];
  EditorialStatus: string;
}

export interface CurriculumDraftTopicQuestionReport {
  TopicKey: string;
  TopicNameAr: string;
  TopicNameEn: string;
  TopicStatus: string;
  Total: number;
  ApprovedForPublication: boolean;
  Questions: CurriculumDraftTopicQuestion[];
}

export interface CurriculumTopicProposal {
  StableKey: string;
  StageId: number;
  DomainKey: string;
  NameAr: string;
  NameEn: string;
  DescriptionAr: string;
  DescriptionEn: string;
  IconKey: string;
  SortOrder: number;
  EditorialStatus: 'Draft' | 'Reviewed' | 'Rejected' | 'Published';
  ProposedQuestionCount: number;
  PublishedQuestionCount: number;
  DraftQuestionCount: number;
}

export interface CurriculumTopicProposalReport {
  Published: boolean;
  Total: number;
  TotalDraftProblems: number;
  RequiresIndependentReview: boolean;
  Topics: CurriculumTopicProposal[];
}

export interface PublishedCurriculumSkill {
  StableKey: string;
  CategoryId: number;
  DomainKey: string;
  NameAr: string;
  NameEn: string;
  DescriptionAr: string;
  DescriptionEn: string;
}

export interface CurriculumSkillSummary {
  StableKey: string;
  DomainKey: string;
  NameAr: string;
  NameEn: string;
  IsPublished: boolean;
  ProblemCount: number;
  StandardMappingCount: number;
}

export interface CurriculumCategorySkillCoverage {
  CategoryId: number;
  StageId: number;
  NameAr: string;
  NameEn: string;
  ProblemCount: number;
  MappedProblemCount: number;
  SkillCount: number;
  DraftSkillCount: number;
  Skills: CurriculumSkillSummary[];
}

export interface CurriculumSkillCoverage {
  TotalProblems: number;
  MappedProblems: number;
  UnmappedProblems: number;
  TotalSkills: number;
  DraftSkills: number;
  PublishedSkills: number;
  StandardsMappedSkills: number;
  InvalidPrimaryLinks: number;
  SkillTaggingApproved: boolean;
  MasteryEvidenceReady: boolean;
  Categories: CurriculumCategorySkillCoverage[];
}

export const curriculumApi = createApi({
  reducerPath: 'curriculumApi',
  baseQuery,
  tagTypes: ['CurriculumDraft', 'CurriculumReadiness'],
  endpoints: builder => ({
    previewCategoriesImport: builder.mutation<
      CategoryImportPreview,
      { Categories: ProposedStageCategory[] }
    >({
      query: (body) => ({
        url: '/admin/curriculum/categories/preview',
        method: 'POST',
        body,
      }),
    }),
    previewCurriculumImport: builder.mutation<CurriculumImportPreview, { Problems: ProposedCurriculumProblem[] }>({
      query: body => ({ url: '/admin/curriculum/import/preview', method: 'POST', body }),
    }),
    getPublishedStageSkills: builder.query<PublishedCurriculumSkill[], number>({
      query: (stageId) => `/curriculum/stages/${stageId}/skills`,
    }),
    getCurriculumDraftTopicQuestions: builder.query<CurriculumDraftTopicQuestionReport, string>({
      query: (stableKey) => `/admin/curriculum/topics/proposals/${encodeURIComponent(stableKey)}/questions`,
      providesTags: ['CurriculumReadiness'],
    }),
    getCurriculumTopicProposals: builder.query<CurriculumTopicProposalReport, void>({
      query: () => '/admin/curriculum/topics/proposals',
      providesTags: ['CurriculumReadiness'],
    }),
    getCurriculumSkillCoverage: builder.query<CurriculumSkillCoverage, void>({
      query: () => '/admin/curriculum/skills/coverage',
      providesTags: ['CurriculumReadiness'],
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
  useGetPublishedStageSkillsQuery,
  useGetCurriculumDraftTopicQuestionsQuery,
  useGetCurriculumTopicProposalsQuery,
  useGetCurriculumSkillCoverageQuery,
  useGetCurriculumReadinessQuery,
  usePreviewCurriculumImportMutation,
  usePreviewCategoriesImportMutation,
  useGetCurriculumDraftsQuery,
  useGetCurriculumDraftQuery,
  useSubmitCurriculumDraftMutation,
  useReviewCurriculumDraftMutation,
  usePublishCurriculumDraftMutation,
} = curriculumApi;

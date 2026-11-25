import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface PlatformSocialLink {
  Platform: string; LabelAr: string; LabelEn: string; Url: string; IsEnabled: boolean; DisplayOrder: number;
}
export interface BrandProfile {
  NameAr: string; NameEn: string; LogoUrl?: string | null; SupportEmail?: string | null; Phone?: string | null;
  ContactAddressAr?: string | null; ContactAddressEn?: string | null; DescriptionAr?: string | null; DescriptionEn?: string | null;
  HelpUrl?: string | null; PrivacyUrl?: string | null; TermsUrl?: string | null; SocialLinks: PlatformSocialLink[];
}
export interface BrandView { Revision: number; WebsiteUrl: string; Profile: BrandProfile }
export const emailTemplateLabels:Record<string,[string,string]>={
  test:['اختبار الإرسال','Test email'],
  'supervisor-invite':['دعوة مشرف','Supervisor invitation'],
  'password-reset':['استعادة كلمة المرور','Password reset'],
  'password-changed':['تغيير كلمة المرور','Password changed'],
  welcome:['الترحيب','Welcome'],
  'premium-granted':['تفعيل Premium','Premium activated'],
  'premium-renewed':['تجديد Premium','Premium renewed'],
  'premium-expired':['انتهاء Premium','Premium expired'],
  announcement:['إشعار إداري','Announcement'],
  'certificate-issued':['إصدار شهادة','Certificate issued'],
};
export interface EmailPreview { Subject: string; PlainText: string; Html: string }
export interface EmailOutboxEntry {
  Id: string; TemplateKey: string; Locale: string; State: string; Attempts: number;
  CreatedAtUtc: string; NextRetryAtUtc: string; LastErrorCode?: string | null;
}
export interface EmailOutboxStatus {
  Provider?: string;
  IsConfigured: boolean; IsTestMode: boolean; IsWorkerEnabled: boolean; RecoveryEnabled: boolean;
  Readiness?: {Missing:string[];CanQueueAdminTest:boolean;AdminRecoveryConfigured:boolean;ProviderConnectionVerified:boolean;InboxDeliveryVerified:boolean};
  TestTemplates?:string[];
  AttemptLimit: number; ReservedAttempts: number;
  Counts: { State: string; Count: number }[]; Items: EmailOutboxEntry[];
}
function safeHttps(value: string | null | undefined): boolean {
  if (!value) return false;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.port && u.hostname.includes('.'); }
  catch { return false; }
}
export function isSafeBrandLogo(value: string, origin: string): boolean {
  if (!safeHttps(value) || !safeHttps(origin)) return false;
  try { return new URL(value).origin === new URL(origin).origin; } catch { return false; }
}
export function publishedSocialLinks(profile?: BrandProfile): PlatformSocialLink[] {
  return (profile?.SocialLinks ?? []).filter(link => link.IsEnabled && safeHttps(link.Url)).sort((a,b) => a.DisplayOrder-b.DisplayOrder);
}
export interface SupervisorActivity {
  Id:number; ActorRole:string; Action:string; Resource:string; CreatedAtUtc:string;
}
export interface SupervisorAccount {
  Id: number; FullName: string; Email: string; IsActive: boolean; StaffSetupPending: boolean;
  Permissions: number; Revision: number; CreatedAt: string; LastLoginAt?: string | null;
}
export interface Bilingual {Ar:string;En:string}
export interface EditorialOption {LatexCode:string;IsCorrect:boolean;ErrorType:string;Reason:Bilingual}
export interface EditorialSolution {Idea:Bilingual;FormulaLatex:string;Steps:Bilingual[];Substitution:Bilingual;Result:Bilingual;Unit:Bilingual;Verification:Bilingual;CommonError:Bilingual}
export interface EditorialContent {StageId:number;CategoryId:number;PrimarySkillId:number;SecondarySkillIds:number[];TrackIds:number[];DifficultyLevel:number;Points:number;Title:Bilingual;Question:Bilingual;Options:EditorialOption[];Hints:Bilingual[];Solution:EditorialSolution}
export interface EditorialRow {Id:number;OwnerUserId:number;Revision:number;Status:string;QuestionTextAr?:string;QuestionTextEn?:string;ReviewNote?:string;PublishedProblemId?:number;SourceProblemId?:number|null}
export interface EditorialDraft extends EditorialRow {Content:Partial<EditorialContent>;LegacySolutionAr?:string|null;LegacySolutionEn?:string|null}
export interface EditorialImportRow {ContentKey:string;PrimarySkillKey:string;ProposedTrackCodes:string[];Content:EditorialContent}
export interface EditorialImportResult {Created:number;Ready?:number;Items:{ContentKey:string;Status:string;DraftId?:number|null;Errors:string[]}[];DraftIds?:number[]}
export interface AmendmentImportRow {ProblemId:number;ExpectedOptionIds:number[];ExpectedLegacySolution:Bilingual;PrimarySkillKey:string;Content:Partial<EditorialContent>;Status:'StructuredAmendmentCandidateNotImported'}
export interface AmendmentImportResult {Created:number;Ready?:number;Items:{ProblemId:number;Status:string;DraftId?:number|null;Errors:string[]}[];DraftIds?:number[]}
export type ReviewedBankKind='amendments'|'hints'|'new-existing'|'new-missing';
export interface ReviewedHintRow {ProblemId:number;PrimarySkillKey:string;Question:Bilingual;Hints:Bilingual[];TaxonomyReviewPending:false}
export interface HeldWordingCandidate {ProblemId:number;ExpectedOptionIds:number[];ExpectedLegacySolution:Bilingual;PrimarySkillKey:string;ProposedTrackCode:string;Content:Partial<EditorialContent>;ProposedQuestion:Bilingual}
export interface HeldWordingPackage {Items:HeldWordingCandidate[];Drafts:Pick<ReviewedDraftState,'Id'|'ContentKey'|'Revision'|'Status'>[];PublicationEnabled:boolean}
export interface ReviewedBankInfo {HeldCount:number;PublicationEnabled:boolean;Batches:{Kind:ReviewedBankKind;Number:number;Count:number}[]}
export interface ReviewedDraftState {Id:number;ContentKey:string;Revision:number;Status:string;PublishedProblemId?:number;MatchesCandidate:boolean}
export interface ReviewedBankBatch {Kind:ReviewedBankKind;Number:number;Items:(AmendmentImportRow|EditorialImportRow|ReviewedHintRow)[];Drafts:ReviewedDraftState[];MissingMappings:number}
export interface HintImportResult {Applied:number;Ready:number;PreviewToken?:string;Items:{ProblemId:number;Status:string;Errors:string[]}[]}
export interface EditorialBankRow {Id:number;StageId:number;CategoryId:number;TitleAr:string;TitleEn:string;HasStructuredSolution:boolean;HasOpenReview:boolean}
export interface ClassificationRow {Id:number;NameAr:string;NameEn:string}
export interface EditorialClassification {Stages:ClassificationRow[];Tracks:ClassificationRow[];Categories:ClassificationRow[];Skills:(ClassificationRow&{CategoryId:number})[]}
export const platformBrandApi = createApi({
  reducerPath: 'platformBrandApi', baseQuery, tagTypes: ['Brand', 'EmailOutbox', 'Supervisors', 'SupervisorPermissions','EditorialDraft'],
  endpoints: builder => ({
    getHeldWording:builder.query<HeldWordingPackage,void>({
      query:()=>'/editorial/problems/held-wording',keepUnusedDataFor:0,
    }),
    importHeldWording:builder.mutation<AmendmentImportResult,{ProblemIds:number[];Confirm:boolean}>({
      query:body=>({url:'/editorial/problems/held-wording/import',method:'POST',body}),
      invalidatesTags:(_r,e,arg)=>!e&&arg.Confirm?['EditorialDraft']:[],
    }),
    getReviewedBankInfo:builder.query<ReviewedBankInfo,void>({
      query:()=>'/editorial/problems/reviewed-bank',keepUnusedDataFor:0,
    }),
    getReviewedBankBatch:builder.query<ReviewedBankBatch,{kind:ReviewedBankKind;number:number}>({
      query:({kind,number})=>'/editorial/problems/reviewed-bank/'+kind+'/'+number,keepUnusedDataFor:0,
    }),
    importReviewedHints:builder.mutation<HintImportResult,{Items:ReviewedHintRow[];Confirm:boolean;PreviewToken?:string;ReviewNote?:string}>({
      query:body=>({url:'/editorial/problems/hints/import',method:'POST',body}),
      invalidatesTags:(_r,e,arg)=>!e&&arg.Confirm?['EditorialDraft']:[],
    }),
    importEditorialBatch:builder.mutation<EditorialImportResult,{Items:EditorialImportRow[];Confirm:boolean}>({
      query:body=>({url:'/editorial/problems/import',method:'POST',body}),
      invalidatesTags:(_r,e,arg)=>!e&&arg.Confirm?['EditorialDraft']:[],
    }),
    importEditorialAmendments:builder.mutation<AmendmentImportResult,{Items:AmendmentImportRow[];Confirm:boolean}>({
      query:body=>({url:'/editorial/problems/amend/import',method:'POST',body}),
      invalidatesTags:(_r,e,arg)=>!e&&arg.Confirm?['EditorialDraft']:[],
    }),
    getEditorialBank:builder.query<{Total:number;Items:EditorialBankRow[]},{page:number;stageId?:number;categoryId?:number}>({
      query:params=>({url:'/editorial/problems/bank',params}),providesTags:['EditorialDraft'],
    }),
    amendEditorialProblem:builder.mutation<EditorialDraft,number>({
      query:id=>({url:'/editorial/problems/amend/'+id,method:'POST'}),invalidatesTags:(_r,e)=>e?[]:['EditorialDraft'],
    }),
    getEditorialDrafts:builder.query<{Total:number;Items:EditorialRow[]},number>({
      query:page=>({url:'/editorial/problems',params:{page}}),providesTags:['EditorialDraft'],
    }),
    getEditorialDraft:builder.query<EditorialDraft,number>({
      query:id=>'/editorial/problems/'+id,providesTags:(_r,_e,id)=>[{type:'EditorialDraft',id}],
    }),
    getEditorialClassification:builder.query<EditorialClassification,number>({
      query:id=>'/editorial/problems/classification/'+id,
    }),
    saveEditorialDraft:builder.mutation<EditorialDraft,{id?:number;Revision:number;Content:EditorialContent}>({
      query:({id,...body})=>({url:'/editorial/problems'+(id?'/'+id:''),method:id?'PUT':'POST',body}),
      invalidatesTags:(_r,e)=>e?[]:['EditorialDraft'],
    }),
    editorialAction:builder.mutation<EditorialDraft,{id:number;action:'submit'|'review'|'publish'|'withdraw';Revision:number;Note?:string;Confirm?:boolean}>({
      query:({id,action,...body})=>({url:'/editorial/problems/'+id+'/'+action,method:'POST',body}),
      invalidatesTags:(_r,e)=>e?[]:['EditorialDraft','SupervisorPermissions'],
    }),
    getSupervisors: builder.query<{Total:number;Items:SupervisorAccount[]}, number>({
      query: page => ({url:'/admin/supervisors',params:{page}}), providesTags:['Supervisors'],
    }),
    createSupervisor: builder.mutation<{Id:number;StaffSetupPending:boolean;InvitationQueued:boolean},{FullName:string;Email:string;Language:string}>({
      query: body=>({url:'/admin/supervisors',method:'POST',body}), invalidatesTags:(_r,e)=>e?[]:['Supervisors'],
    }),
    updateSupervisor: builder.mutation<{Updated:boolean},{id:number;IsActive:boolean;Permissions:number;Revision:number}>({
      query: ({id,...body})=>({url:'/admin/supervisors/'+id,method:'PUT',body}), invalidatesTags:(_r,e)=>e?[]:['Supervisors'],
    }),
    inviteSupervisor: builder.mutation<{Queued:boolean;WorkerEnabled:boolean},{id:number;Language:string}>({
      query: ({id,...body})=>({url:'/admin/supervisors/'+id+'/invite',method:'POST',body}), invalidatesTags:(_r,e)=>e?[]:['Supervisors','EmailOutbox'],
    }),
    getSupervisorActivity: builder.query<{Total:number;Items:SupervisorActivity[]},{id:number;page:number}>({
      query:({id,page})=>({url:'/admin/supervisors/'+id+'/activity',params:{page}}),providesTags:['Supervisors'],
    }),
    getSupervisorPermissions: builder.query<{Id:number;FullName:string;Permissions:number},void>({
      query:()=>'/supervisor/permissions',providesTags:['SupervisorPermissions'],
    }),
    getPublicBrand: builder.query<BrandView, void>({ query: () => '/platform/brand', providesTags: ['Brand'] }),
    getAdminBrand: builder.query<BrandView, void>({ query: () => '/admin/platform/brand', providesTags: ['Brand'] }),
    updateBrand: builder.mutation<BrandView, { Revision: number; Profile: BrandProfile }>({
      query: body => ({ url: '/admin/platform/brand', method: 'PUT', body }),
      invalidatesTags: (_result,error) => error ? [] : ['Brand'],
    }),
    getEmailOutbox: builder.query<EmailOutboxStatus, void>({
      query: () => '/admin/platform/email-outbox',
      providesTags: ['EmailOutbox'],
    }),
    queueTestEmail: builder.mutation<{ Queued: boolean }, { Language: string;Template?:string }>({
      query: body => ({ url: '/admin/platform/email-outbox/test', method: 'POST', body }),
      invalidatesTags: (_result, error) => error ? [] : ['EmailOutbox'],
    }),
    getEmailPreview: builder.query<EmailPreview, { language: string; template: string }>({
      query: params => ({ url: '/admin/platform/email-preview', params }),
    }),
  }),
});
export const { useGetPublicBrandQuery, useGetAdminBrandQuery, useUpdateBrandMutation, useLazyGetEmailPreviewQuery, useGetEmailOutboxQuery, useQueueTestEmailMutation, useGetSupervisorsQuery, useCreateSupervisorMutation, useUpdateSupervisorMutation, useInviteSupervisorMutation, useGetSupervisorPermissionsQuery, useGetSupervisorActivityQuery,useGetEditorialDraftsQuery,useGetEditorialDraftQuery,useGetEditorialClassificationQuery,useSaveEditorialDraftMutation,useEditorialActionMutation,useGetEditorialBankQuery,useAmendEditorialProblemMutation,useImportEditorialBatchMutation,useImportEditorialAmendmentsMutation,useLazyGetReviewedBankInfoQuery,useLazyGetReviewedBankBatchQuery,useImportReviewedHintsMutation,useLazyGetHeldWordingQuery,useImportHeldWordingMutation } = platformBrandApi;

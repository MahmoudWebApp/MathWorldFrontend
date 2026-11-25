import { createApi } from '@reduxjs/toolkit/query/react';
import type { StudentEntitlement } from '@/lib/premium-api';
import { baseQuery } from './baseQuery';
import { stagesApi } from './stagesApi';
import type { DashboardData, ProblemPreview } from './types';
import type { MasteryStatus } from './problemsApi';

export interface StudentOnboardingState { EmailRequired:boolean; StageRequired:boolean; TrackRequired:boolean; NextStep:'VerifyEmail'|'SelectStage'|'SelectTrack'|'Complete' }

export interface EmailPreferenceInput {
  EmailLearningUpdates: boolean;
  EmailSubscriptionUpdates: boolean;
  EmailImportantAnnouncements: boolean;
  Locale: 'ar' | 'en';
}
export interface EmailPreferences extends EmailPreferenceInput {
  EmailVerified: boolean;
  VerificationAvailable?: boolean;
  OptionalDeliveryEnabled: boolean;
}

export type SessionKind = 'practice' | 'daily';
export interface SessionScope { Kind: SessionKind; StageId: number; TrackId?: number | null; CategoryId?: number }
export interface SessionQuestion { Id:number; CategoryId:number; TitleAr:string; TitleEn:string; QuestionTextAr:string; QuestionTextEn:string; Options:{Id:number; LatexCode:string; Order:number}[] }
export interface LearningSessionState { Id:string; Kind:SessionKind; StageId:number; TrackId?:number|null; CategoryId?:number|null; Total:number; Completed:number; IsComplete:boolean; CurrentQuestion?:SessionQuestion|null; CanUseHints:boolean; HintsRevealed:number }
export interface SessionSolution { Idea:string; FormulaLatex:string; Steps:string[]; Substitution:string; Result:string; Unit:string; Verification:string; CommonError:string }
export interface SessionAnswerBody { RequestId:string; Position:number; ProblemId:number; SelectedOptionId:number }
export interface SessionAnswerResult { SessionId:string; Position:number; ProblemId:number; RequestId:string; IsCorrect:boolean; AttemptNumber:number; PointsEarned:number; Completed:number; Total:number; IsComplete:boolean; UsedHint:boolean; IndependentFirstCorrect:boolean; CorrectOptionId?:number; DetailedSolutionAr?:string; DetailedSolutionEn?:string; SolutionStructure?:SessionSolution|null }
export interface SessionRestartPreview { StageId:number; TrackId?:number|null; CategoryId?:number|null; SessionIds:string[] }
export interface SessionHints { Available:boolean; RevealedCount:number; Hints:{Level:number;Text:string}[] }
export interface SessionAchievements { PermanentSolvedProblems:number; PermanentPoints:number; CompletedPracticeSessions:number; CompletedDailyChallenges:number; CorrectSessionAnswers:number; UniqueSolvedProblems:number; IndependentFirstCorrect:number; AssistedCorrect:number; Badges:{Key:string;TitleAr:string;TitleEn:string;EarnedAtUtc:string}[] }

export interface CertificateScope { StageId:number; TrackId?:number|null; CategoryId?:number|null }
export interface CertificateRecord extends CertificateScope {Id:string;Kind:'category'|'grade'|'course';StudentName:string;TitleAr:string;TitleEn:string;VerificationCode:string;PolicyVersion:number;TotalProblems:number;RequiredSkills:number;IssuedAtUtc:string}
export interface CertificateEligibility {Kind:string;TitleAr:string;TitleEn:string;TotalProblems:number;SolvedProblems:number;RequiredSkills:number;IndependentSkills:number;CatalogReady:boolean;Eligible:boolean}
export interface CertificateList {IssuanceEnabled:boolean;Items:CertificateRecord[]}
export interface UserProfile {
  Id: number;
  FullName: string;
  Email: string;
  Role: 'Admin' | 'Student';
  SubscriptionType: string;
  SolvedProblemsCount: number;
  TotalPoints: number;
  MemberSince: string;
  ProfilePicture?: string | null;
  CurrentStageId?: number | null;
}

export interface UserListItem {
  Id: number;
  FullName: string;
  Email: string;
  Role: 'Admin' | 'Student';
  SubscriptionType: string;
  IsActive: boolean;
  CreatedAt: string;
  SolvedProblemsCount: number;
}

export interface PagedUserList {
  Users: UserListItem[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}

export interface FavoriteToggleRequest {
  ProblemId: number;
  IsFavorite: boolean;
}

export interface FavoriteCheck {
  IsFavorite: boolean;
}

export interface PracticeResetRequest {
  StageId: number;
  TrackId?: number;
  CategoryId?: number;
}
export interface PracticeResetResult {
  StageId: number;
  TrackId?: number|null;
  CategoryId?: number | null;
  ResetProblems: number;
  ResetSolved: number;
  PreservedFavorites: number;
  PracticeCycleReset: boolean;
}

export interface ErrorNotebookProblem {
  Id: number;
  Title: string;
  StageId: number;
  StageName: string;
  CategoryId: number;
  CategoryName: string;
  AttemptCount: number;
  IncorrectAttempts: number;
  CorrectAttempts: number;
  MasteryStatus: MasteryStatus;
  IsArchived: boolean;
  NextReviewAt?: string | null;
  LastAttemptAt: string;
}

export interface SetErrorNotebookArchiveRequest {
  ProblemId: number;
  IsArchived: boolean;
}

export interface ErrorNotebookArchiveResult {
  ProblemId: number;
  IsArchived: boolean;
}

export interface LearningStage {
  StageId?: number | null;
  NameAr?: string | null;
  NameEn?: string | null;
  HasSelectedStage: boolean;
}

export interface JourneyCategory {
  CategoryId: number;
  PermanentSolvedProblems?: number;
  PermanentPoints?: number;
  NameAr: string;
  NameEn: string;
  // Only the updated server returns this; undefined means not verified.
  IsLocked?: boolean;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  MasteredProblems: number;
  CompletionPercent: number;
}

export interface PremiumReportCategory {
  CategoryId: number;
  Name: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  MasteredProblems: number;
  OfficialPoints: number;
  CompletionPercent: number;
}

export interface PremiumProgressReport {
  StageId: number;
  StageName: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  MasteredProblems: number;
  OfficialPoints: number;
  CompletionPercent: number;
  Categories: PremiumReportCategory[];
}

export interface LearningJourney {
  StageId: number;
  LearningSessionsEnabled?: boolean;
  CertificatesEnabled?: boolean;
  TrackPracticeIsolationEnabled?: boolean;
  PermanentSolvedProblems?: number;
  PermanentPoints?: number;
  TrackId?: number | null;
  NameAr: string;
  NameEn: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  MasteredProblems: number;
  TotalPoints: number;
  CompletionPercent: number;
  Categories: JourneyCategory[];
}

export interface AdminLearnerSummary {
  Id: number;
  FullName: string;
  Email: string;
  CurrentStageId?: number | null;
  StageNameAr?: string | null;
  StageNameEn?: string | null;
  SubscriptionType: string;
  PremiumExpiresAtUtc?: string | null;
  IsActive: boolean;
  CreatedAt: string;
  LastLoginAt?: string | null;
  LastAttemptAt?: string | null;
  SolvedProblems: number;
  AttemptedProblems: number;
  TotalAwardedPoints: number;
}

export interface AdminLearnerSubscriptionChange {
  LearnerId: number;
  SubscriptionType: 'Free' | 'Premium';
}

export interface AdminLearnerSubscriptionResult {
  Id: number;
  SubscriptionType: 'Free' | 'Premium';
}

export interface AdminLearnerDirectory {
  Learners: AdminLearnerSummary[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}

export interface AdminLearnerFilters {
  /** The compact directory skips expensive attempt/progress aggregation. */
  IncludeActivity?: boolean;
  Search?: string;
  StageId?: number;
  IsActive?: boolean;
  Subscription?: 'Free' | 'Premium';
  Page?: number;
  PageSize?: number;
}

export interface AdminLearnerStage {
  StageId: number;
  NameAr: string;
  NameEn: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  AwardedPoints: number;
  CompletionPercent: number;
}

export interface AdminLearnerCategory {
  CategoryId: number;
  StageId: number;
  NameAr: string;
  NameEn: string;
  TotalProblems: number;
  AttemptedProblems: number;
  SolvedProblems: number;
  FirstTryCorrect: number;
  InErrorNotebook: number;
}

export interface AdminLearnerDetail {
  Learner: AdminLearnerSummary;
  TotalAttempts: number;
  CorrectAttempts: number;
  WrongAttempts: number;
  FirstTryCorrect: number;
  FavoriteProblems: number;
  OpenErrorNotebookProblems: number;
  TotalTimeSpentSeconds: number;
  CorrectRatePercent: number;
  Stages: AdminLearnerStage[];
  Categories: AdminLearnerCategory[];
}

export interface AdminLearnerAttempt {
  Id: number;
  ProblemId: number;
  TitleAr: string;
  TitleEn: string;
  StageId: number;
  CategoryId: number;
  IsCorrect: boolean;
  IsOfficial: boolean;
  AttemptNumber: number;
  TimeSpentSeconds: number;
  UsedHint: boolean;
  PointsEarned: number;
  SubmittedAt: string;
}

export interface AdminLearnerAttemptPage {
  LearnerId: number;
  StageId?: number | null;
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
  Attempts: AdminLearnerAttempt[];
}

export interface AdminLearnerDrilldownQuery {
  LearnerId: number;
  StageId?: number;
}

export interface AdminLearnerAttemptQuery extends AdminLearnerDrilldownQuery {
  Page: number;
}

/** Legacy response shape for stage-scoped usage statistics; no daily cap is enforced. */
export interface StageDailyQuota {
  StageId: number;
  NameAr: string;
  NameEn: string;
  Limit: number;
  Used: number;
  Remaining: number | null;
  Unlimited: boolean;
  SubscriptionType: string;
  DayUtc: string;
  ResetsAtUtc: string;
}

export interface AdminSubscriptionChange {
  SubscriptionType: 'Free' | 'Premium';
  PremiumExpiresAtUtc?: string | null;
  Reason: string;
}

export interface AnnualPremiumGrantResult {
  Updated: number;
  UpdatedIds: number[];
  SkippedIndefiniteIds: number[];
  DurationMonths: number;
  Periods: Array<{ LearnerId: number; StartAtUtc: string; EndAtUtc: string }>;
}

export interface AdminSubscriptionStatus {
  LearnerId: number;
  SubscriptionType: 'Free' | 'Premium';
  PremiumExpiresAtUtc?: string | null;
  Unlimited: boolean;
}

export interface AdminSubscriptionAuditRecord {
  Id: number;
  AdminId: number;
  PreviousType: string;
  NewType: string;
  PreviousExpiresAtUtc?: string | null;
  NewExpiresAtUtc?: string | null;
  Reason: string;
  ChangedAtUtc: string;
}

export interface AdminSubscriptionHistory {
  Total: number;
  Page: number;
  PageSize: number;
  Records: AdminSubscriptionAuditRecord[];
}

export interface PremiumCategoryStatistics {
  StageId: number;
  CategoryId: number;
  StageNameAr: string;
  StageNameEn: string;
  CategoryNameAr: string;
  CategoryNameEn: string;
  AttemptedProblems: number;
  SolvedProblems: number;
  ErrorNotebookProblems: number;
  Attempts: number;
  CorrectAttempts: number;
  IncorrectAttempts: number;
  FirstTryCorrect: number;
  AwardedPoints: number;
  TimeSpentSeconds: number;
}

export interface AnalyticsFilter {stageId?:number;categoryId?:number;trackId?:number;days?:number}
export type AnalyticsExportRequest = 'ar'|'en'|({lang:'ar'|'en'} & AnalyticsFilter);
export interface StudentPremiumAnalyticsReport {
  ScoreBasis?:'ActiveProgress'|'PermanentAchievements';
  GuidedAttempts?:number;
  GuidedTimeMeasured?:boolean;
  FilterStageId?:number|null;
  FilterCategoryId?:number|null;
  FilterTrackId?:number|null;
  WindowDays?:number|null;
  GeneratedAtUtc: string;
  AttemptedProblems: number;
  SolvedProblems: number;
  Attempts: number;
  CorrectAttempts: number;
  IncorrectAttempts: number;
  FirstTryCorrect: number;
  AwardedPoints: number;
  TimeSpentSeconds: number;
  Categories: PremiumCategoryStatistics[];
}

export interface StageLeaderboardEntry {
  Rank: number;
  DisplayName: string;
  SolvedProblems: number;
  Points: number;
  FirstTryCorrect: number;
  IsCurrentUser: boolean;
}

export interface StageLeaderboardReport {
  StageId: number;
  NameAr: string;
  NameEn: string;
  Period: 'all' | 'weekly' | 'monthly';
  Page: number;
  PageSize: number;
  TotalLearners: number;
  /** Active student accounts currently assigned to this stage, including non-solvers. */
  StageParticipants?: number;
  MyRank: number | null;
  Entries: StageLeaderboardEntry[];
}

export interface StageLeaderboardFilter {
  stageId: number;
  period: 'all' | 'weekly' | 'monthly';
  page: number;
}

export type LeaderboardPeriod = 'all' | 'weekly' | 'monthly';
export type StageLeaderboard = StageLeaderboardReport;
export interface StageLeaderboardQuery {
  StageId: number;
  Period: LeaderboardPeriod;
  Page: number;
}

export interface MathBadge {
  Key: string;
  TitleAr: string;
  TitleEn: string;
  RequiredSolved: number;
  Earned: boolean;
  IsAvailable: boolean;
  CurrentProgress: number;
}

export interface AdminPremiumGift {
  Id: number;
  Label: string;
  PremiumDays: number;
  CreatedByAdminId: number;
  CreatedAtUtc: string;
  ExpiresAtUtc: string;
  RedeemedByUserId: number | null;
  RedeemedAtUtc: string | null;
  RevokedAtUtc: string | null;
  Status: 'Available' | 'Redeemed' | 'Revoked' | 'Expired';
}

export interface PremiumGiftPage {
  Total: number;
  Page: number;
  PageSize: number;
  Codes: AdminPremiumGift[];
}

export interface NewlyCreatedPremiumGift {
  Id: number;
  Code: string; // One-time reveal only; never returned in list responses
  Label: string;
  PremiumDays: number;
  CreatedAtUtc: string;
  ExpiresAtUtc: string;
  SingleUse: boolean;
  PaymentRequired: boolean;
}

export interface PremiumGiftRedemption {
  SubscriptionType: 'Premium';
  PremiumExpiresAtUtc: string;
  GrantedDays: number;
}

export interface PremiumDiscountQuote {
  SubtotalUsd: number;
  DiscountUsd: number;
  TotalUsd: number;
  Currency: 'USD';
  EndsAtUtc: string;
  Notice: 'PreviewOnlyRevalidateAtCheckout';
}

export interface AdminPremiumDiscount {
  Id: number;
  Label: string;
  DiscountKind: 'Percentage' | 'FixedUsd';
  Amount: number;
  StartsAtUtc: string;
  EndsAtUtc: string;
  Enabled: boolean;
  MaxRedemptions: number | null;
  MaxRedemptionsPerStudent: number | null;
  RedemptionCount: number;
  CreatedAtUtc: string;
  Status: 'Scheduled' | 'Active' | 'Expired' | 'Disabled' | 'Exhausted';
}

export interface AdminPremiumDiscountPage {
  Total: number;
  Page: number;
  PageSize: number;
  Codes: AdminPremiumDiscount[];
}

export interface CreatePremiumDiscountRequest {
  Label: string;
  DiscountKind: 'Percentage' | 'FixedUsd';
  Amount: number;
  StartsAtUtc: string;
  EndsAtUtc: string;
  MaxRedemptions: number | null;
  MaxRedemptionsPerStudent: number | null;
}

export type UpdatePremiumDiscountSettings = Pick<
  CreatePremiumDiscountRequest,
  'StartsAtUtc' | 'EndsAtUtc' | 'MaxRedemptions' | 'MaxRedemptionsPerStudent'
>;

export interface CreatedPremiumDiscount extends CreatePremiumDiscountRequest {
  Id: number;
  Code: string;
  Enabled: boolean;
}

export interface AdminPremiumCheckoutSummary {
  TotalOrders: number;
  Pending: number;
  Paid: number;
  Failed: number;
  Cancelled: number;
  Refunded: number;
  PendingOlderThan24Hours: number;
  PaidAmountUsd: number;
  RedeemedDiscountUsd: number;
  Currency: 'USD';
  PaymentAvailable: boolean;
}

export interface AdminPremiumCheckoutOrder extends PremiumCheckoutOrder {
  StudentId: number;
  DiscountCodeId: number | null;
  DiscountRedeemedAtUtc: string | null;
}

export interface AdminPremiumCheckoutOrderPage {
  Total: number;
  Page: number;
  PageSize: number;
  Orders: AdminPremiumCheckoutOrder[];
}

export interface PremiumCheckoutOrder {
  Id: number;
  OrderReference: string;
  Status: 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';
  SubtotalUsd: number;
  DiscountUsd: number;
  TotalUsd: number;
  Currency: 'USD';
  CreatedAtUtc: string;
  VerifiedPaidAtUtc: string | null;
}

export interface PremiumCheckoutOrderPage {
  Total: number;
  Page: number;
  PageSize: number;
  Orders: PremiumCheckoutOrder[];
}

export interface PreparedPremiumCheckoutOrder extends Omit<PremiumCheckoutOrder, 'VerifiedPaidAtUtc'> {
  PaymentAvailable: false;
  Notice: string;
}

export interface StudentAchievements {
  UniqueSolved: number;
  EarnedCount: number;
  TotalBadges: number;
  NextMilestone: number | null;
  Badges: MathBadge[];
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: [
    'User',
    'Favorite',
    'Solved',
    'Dashboard',
    'Problem',
    'ErrorNotebook',
    'LearningStage',
    'LearningJourney',
    'SessionAchievements',
    'Certificates',
    'Leaderboard',
    'Achievements',
    'PremiumAnalytics',
    'AdminLearners',
    'DailyQuota',
    'Subscription',
    'PremiumCodes',
    'PremiumDiscounts',
    'PremiumCheckoutOrders',
  ],
  endpoints: (builder) => ({
    getStudentOnboarding: builder.query<StudentOnboardingState,void>({
      query:()=>'/users/onboarding',keepUnusedDataFor:0,
    }),
    requestEmailVerification: builder.mutation<{Queued?:boolean;AlreadyVerified?:boolean},'ar'|'en'>({
      query: (Language) => ({url:'/auth/email-verification/request',method:'POST',body:{Language}}),
    }),
    getEmailPreferences: builder.query<EmailPreferences, number>({
      query: () => '/users/email-preferences',
      keepUnusedDataFor: 0,
    }),
    saveEmailPreferences: builder.mutation<EmailPreferences, {userId:number; preferences:EmailPreferenceInput}>({
      query: ({preferences}) => ({url:'/users/email-preferences',method:'PUT',body:preferences}),
    }),
    getCertificates: builder.query<CertificateList,void>({
      query:()=>'/users/certificates',providesTags:['Certificates'],keepUnusedDataFor:0,
    }),
    getCertificateEligibility: builder.query<CertificateEligibility,CertificateScope>({
      query:({StageId,TrackId,CategoryId})=>({url:'/users/certificates/eligibility',params:{stageId:StageId,...(TrackId?{trackId:TrackId}:{}),...(CategoryId?{categoryId:CategoryId}:{})}}),
      keepUnusedDataFor:0,
    }),
    issueCertificate: builder.mutation<CertificateRecord,CertificateScope>({
      query:body=>({url:'/users/certificates/issue',method:'POST',body}),invalidatesTags:result=>result?['Certificates']:[],
    }),
    downloadCertificate: builder.mutation<Blob,{Id:string;Lang:'ar'|'en'}>({
      query:({Id,Lang})=>({url:'/users/certificates/'+encodeURIComponent(Id)+'/pdf',params:{lang:Lang},responseHandler:(r:Response)=>r.blob()}),
    }),
    getCurrentLearningSession: builder.query<LearningSessionState,SessionScope>({
      query: ({Kind,CategoryId})=>({url:'/users/learning-sessions/current',params:{kind:Kind,...(CategoryId?{categoryId:CategoryId}:{})}}),
      keepUnusedDataFor:0,
    }),
    previewSessionRestart: builder.query<SessionRestartPreview,SessionScope>({
      query: ({CategoryId})=>({url:'/users/learning-sessions/restart-scope',params:CategoryId?{categoryId:CategoryId}:{}}),
      keepUnusedDataFor:0,
    }),
    confirmSessionRestart: builder.mutation<{AbandonedSessionIds:string[]},SessionRestartPreview>({
      query: body=>({url:'/users/learning-sessions/restart-scope',method:'POST',body}),
    }),
    getLearningSessionById: builder.query<LearningSessionState,string>({
      query: id=>'/users/learning-sessions/'+id,
      keepUnusedDataFor:0,
    }),
    startLearningSession: builder.mutation<LearningSessionState,{RequestId:string;Kind:SessionKind;Count:number;CategoryId?:number}>({
      query: body=>({url:'/users/learning-sessions/start',method:'POST',body}),
    }),
    answerLearningSession: builder.mutation<SessionAnswerResult,{Id:string;Body:SessionAnswerBody}>({
      query: ({Id,Body})=>({url:'/users/learning-sessions/'+Id+'/answer',method:'POST',body:Body}),
      invalidatesTags: result=>result?['SessionAchievements','LearningJourney','Leaderboard']:[],
    }),
    revealLearningSessionHint: builder.mutation<SessionHints,{Id:string;Position:number;ProblemId:number;Level:number}>({
      query: ({Id,...body})=>({url:'/users/learning-sessions/'+Id+'/hints',method:'POST',body}),
    }),
    getSessionAchievements: builder.query<SessionAchievements,void>({
      query:()=>'/users/learning-sessions/achievements',
      providesTags:['SessionAchievements'],
    }),
    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    getLearningStage: builder.query<LearningStage, void>({
      query: () => '/users/learning-stage',
      providesTags: ['LearningStage'],
    }),

    setLearningStage: builder.mutation<LearningStage, { StageId: number }>({
      query: (body) => ({
        url: '/users/learning-stage',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LearningStage', 'LearningJourney', 'Dashboard', 'User', 'Leaderboard'],
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Stage-specific journey and daily suggestions live in stagesApi,
          // not this slice. Clearing their caches prevents prior-stage data
          // from flashing after a successful stage change.
          dispatch(stagesApi.util.invalidateTags(['LearningJourney', 'DailyChallenge']));
        } catch {
          // A rejected stage update must leave existing progress untouched.
        }
      },
    }),

    getDailyQuota: builder.query<StageDailyQuota, number>({
      query: stageId => ({
        url: '/users/daily-quota',
        params: { stageId },
      }),
      providesTags: (_data, _error, stageId) => [
        { type: 'DailyQuota', id: stageId },
      ],
    }),

    getAdminPremiumCodes: builder.query<PremiumGiftPage, number>({
      query: (page = 1) => ({
        url: '/admin/premium-codes',
        params: { page, pageSize: 20 },
      }),
      providesTags: ['PremiumCodes'],
    }),

    createAdminPremiumCode: builder.mutation<
      NewlyCreatedPremiumGift,
      { Label: string; PremiumDays: number; ExpiresInDays: number }
    >({
      query: (body) => ({
        url: '/admin/premium-codes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PremiumCodes'],
    }),

    revokeAdminPremiumCode: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/premium-codes/${id}/revoke`,
        method: 'PUT',
      }),
      invalidatesTags: ['PremiumCodes'],
    }),

    redeemPremiumCode: builder.mutation<PremiumGiftRedemption, string>({
      query: (code) => ({
        url: '/users/premium-codes/redeem',
        method: 'POST',
        body: { Code: code.trim() },
      }),
      invalidatesTags: ['Subscription', 'User', 'Dashboard', 'DailyQuota'],
    }),

    quotePremiumDiscount: builder.mutation<PremiumDiscountQuote, string>({
      query: (code) => ({
        url: '/users/premium-discounts/quote',
        method: 'POST',
        body: { Code: code.trim() },
      }),
    }),

    getAdminPremiumDiscounts: builder.query<AdminPremiumDiscountPage, number>({
      query: (page = 1) => ({
        url: '/admin/premium-discounts',
        params: { page, pageSize: 20 },
      }),
      providesTags: ['PremiumDiscounts'],
    }),

    createAdminPremiumDiscount: builder.mutation<CreatedPremiumDiscount, CreatePremiumDiscountRequest>({
      query: (body) => ({
        url: '/admin/premium-discounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PremiumDiscounts'],
    }),

    updateAdminPremiumDiscountSettings: builder.mutation<
      Partial<AdminPremiumDiscount>,
      { Id: number; Settings: UpdatePremiumDiscountSettings }
    >({
      query: ({ Id, Settings }) => ({
        url: `/admin/premium-discounts/${Id}/settings`,
        method: 'PUT',
        body: Settings,
      }),
      invalidatesTags: ['PremiumDiscounts'],
    }),

    disableAdminPremiumDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/premium-discounts/${id}/disable`,
        method: 'PUT',
      }),
      invalidatesTags: ['PremiumDiscounts'],
    }),

    cancelPremiumCheckoutOrder: builder.mutation<{ Id: number; Status: 'Cancelled' }, number>({
      query: (id) => ({
        url: `/users/premium-checkout/orders/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['PremiumCheckoutOrders'],
    }),

    getAdminPremiumCheckoutSummary: builder.query<AdminPremiumCheckoutSummary, void>({
      query: () => '/admin/premium-checkout/summary',
      providesTags: ['PremiumCheckoutOrders'],
    }),

    getAdminPremiumCheckoutOrders: builder.query<
      AdminPremiumCheckoutOrderPage, { Page: number; Status?: string }
    >({
      query: ({ Page, Status }) => ({
        url: '/admin/premium-checkout/orders',
        params: { page: Page, pageSize: 20, ...(Status ? { status: Status } : {}) },
      }),
      providesTags: ['PremiumCheckoutOrders'],
    }),

    getPremiumCheckoutOrders: builder.query<PremiumCheckoutOrderPage, number>({
      query: (page = 1) => ({
        url: '/users/premium-checkout/orders',
        params: { page, pageSize: 10 },
      }),
      providesTags: ['PremiumCheckoutOrders'],
    }),

    getPremiumCheckoutOrder: builder.query<PremiumCheckoutOrder, number>({
      query: (id) => `/users/premium-checkout/orders/${id}`,
      providesTags: ['PremiumCheckoutOrders'],
    }),

    preparePremiumCheckoutOrder: builder.mutation<
      PreparedPremiumCheckoutOrder, { DiscountCode?: string }
    >({
      query: (body) => ({
        url: '/users/premium-checkout/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PremiumCheckoutOrders'],
    }),

    getAchievements: builder.query<StudentAchievements, void>({
      query: () => '/users/achievements',
      providesTags: ['Achievements'],
    }),

    getStageLeaderboard: builder.query<StageLeaderboardReport, StageLeaderboardFilter>({
      query: ({ stageId, period, page }) => ({
        url: '/users/leaderboard',
        params: { stageId, period, page, pageSize: 20 },
      }),
      providesTags: ['Leaderboard'],
    }),

    // Compatibility for the stage leaderboard page merged from main.
    getLeaderboard: builder.query<StageLeaderboard, StageLeaderboardQuery>({
      query: ({ StageId, Period, Page }) => ({
        url: '/users/leaderboard',
        params: { stageId: StageId, period: Period, page: Page, pageSize: 20 },
      }),
      providesTags: ['Leaderboard'],
    }),

    // Historic stage reports remain separate from Premium analytics XLSX.
    getPremiumProgressReport: builder.query<PremiumProgressReport, number | void>({
      query: (stageId) => ({
        url: '/users/premium-report',
        params: stageId ? { stageId } : {},
      }),
      providesTags: ['User'],
    }),

    getLearningJourney: builder.query<LearningJourney, number | void>({
      query: (stageId) => ({
        url: '/users/journey',
        params: { stageId },
      }),
      providesTags: ['LearningJourney'],
    }),

    getStudentEntitlement: builder.query<StudentEntitlement, void>({
      query: () => '/users/subscription',
      providesTags: ['Subscription'],
    }),
    exportPremiumAnalyticsXlsx: builder.mutation<Blob, AnalyticsExportRequest>({
      query: (request) => ({
        url: '/users/premium-analytics/export.xlsx',
        method: 'GET',
        params: typeof request==='string'?{lang:request}:request,
        // Keep the authenticated baseQuery pipeline for private exports.
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
    exportPremiumAnalyticsPdf: builder.mutation<Blob, AnalyticsExportRequest>({
      query: (request) => ({
        url: '/users/premium-analytics/export.pdf',
        method: 'GET',
        params: typeof request==='string'?{lang:request}:request,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
    exportPremiumAnalyticsCsv: builder.mutation<Blob, AnalyticsExportRequest>({
      query: (request) => ({
        url: '/users/premium-analytics/export.csv',
        method: 'GET',
        params: typeof request==='string'?{lang:request}:request,
        // UTF-8 with BOM is the compatibility alternative to native XLSX.
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    getPremiumAnalytics: builder.query<StudentPremiumAnalyticsReport, AnalyticsFilter | void>({
      query: (filter) => ({url:'/users/premium-analytics',params:filter||{}}),
      providesTags: ['PremiumAnalytics'],
    }),

    grantAnnualPremium: builder.mutation<AnnualPremiumGrantResult, number[]>({
      query: (learnerIds) => ({
        url: '/admin/learners/premium-annual',
        method: 'POST',
        body: { LearnerIds: learnerIds },
      }),
      invalidatesTags: ['AdminLearners', 'Subscription', 'User', 'Dashboard'],
    }),

    updateAdminLearnerSubscription: builder.mutation<
      AdminSubscriptionStatus,
      { LearnerId: number; Change: AdminSubscriptionChange }
    >({
      query: ({ LearnerId, Change }) => ({
        url: `/admin/learners/${LearnerId}/subscription`,
        method: 'PUT',
        body: Change,
      }),
      invalidatesTags: ['AdminLearners', 'Subscription', 'User'],
    }),

    getAdminLearnerSubscriptionHistory: builder.query<
      AdminSubscriptionHistory,
      { LearnerId: number; Page?: number; PageSize?: number }
    >({
      query: ({ LearnerId, Page = 1, PageSize = 20 }) => ({
        url: `/admin/learners/${LearnerId}/subscription-history`,
        params: { page: Page, pageSize: PageSize },
      }),
      providesTags: ['Subscription'],
    }),

    getDashboard: builder.query<DashboardData, string>({
      query: () => '/users/dashboard',
      providesTags: ['Dashboard'],
    }),

    getFavorites: builder.query<ProblemPreview[], string>({
      query: () => '/users/favorites',
      providesTags: ['Favorite'],
    }),

    resetPractice: builder.mutation<PracticeResetResult, PracticeResetRequest>({
      query: (body) => ({
        url: '/users/practice/reset',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'Solved', 'Dashboard', 'User', 'LearningJourney',
        'Leaderboard', 'Achievements', 'ErrorNotebook', 'Favorite','PremiumAnalytics',
      ],
      async onQueryStarted(_request, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // These APIs own independent caches. Never show stale New/Solved
          // badges or today's challenge progress after a reset.
          const [{ problemsApi }, { stagesApi }] = await Promise.all([
            import('./problemsApi'), import('./stagesApi'),
          ]);
          dispatch(problemsApi.util.invalidateTags(['Problem', 'Category', 'AttemptHistory']));
          dispatch(stagesApi.util.invalidateTags(['LearningJourney', 'DailyChallenge','LearningTrack']));
        } catch { /* Failed resets must not update any cache. */ }
      },
    }),

    getSolvedProblems: builder.query<ProblemPreview[], string>({
      query: () => '/users/solved',
      providesTags: ['Solved'],
    }),

    getErrorNotebook: builder.query<
      ErrorNotebookProblem[],
      { IncludeArchived?: boolean; Locale: string }
    >({
      query: (params) => ({
        url: '/users/error-notebook',
        params: {
          includeArchived: params?.IncludeArchived ?? false,
        },
      }),
      providesTags: ['ErrorNotebook'],
    }),

    setErrorNotebookArchive: builder.mutation<
      ErrorNotebookArchiveResult,
      SetErrorNotebookArchiveRequest
    >({
      query: ({ ProblemId, IsArchived }) => ({
        url: `/users/error-notebook/${ProblemId}/archive`,
        method: 'PUT',
        body: { IsArchived },
      }),
      invalidatesTags: (_result, _error, { ProblemId }) => [
        'ErrorNotebook',
        'Dashboard',
        { type: 'Problem', id: ProblemId },
      ],
    }),

    toggleFavorite: builder.mutation<FavoriteCheck, FavoriteToggleRequest>({
      query: (body) => ({
        url: '/users/favorite/toggle',
        method: 'POST',
        body,
      }),
      async onQueryStarted(
        { ProblemId, IsFavorite },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          usersApi.util.updateQueryData(
            'checkFavorite',
            ProblemId,
            (draft) => {
              draft.IsFavorite = IsFavorite;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { ProblemId }) => [
        'Favorite',
        'Dashboard',
        { type: 'Problem', id: ProblemId },
      ],
    }),

    checkFavorite: builder.query<FavoriteCheck, number>({
      query: (ProblemId) => `/users/favorite/check/${ProblemId}`,
      providesTags: (_result, _error, ProblemId) => [
        { type: 'Problem', id: ProblemId },
      ],
    }),

    getAdminLearners: builder.query<AdminLearnerDirectory, AdminLearnerFilters>({
      query: ({ Search, StageId, IsActive, Subscription, IncludeActivity = true, Page = 1, PageSize = 10 }) => ({
        url: '/admin/learners',
        params: {
          ...(!IncludeActivity ? { includeActivity: false } : {}),
          ...(Search ? { search: Search } : {}),
          ...(StageId ? { stageId: StageId } : {}),
          ...(IsActive === undefined ? {} : { isActive: IsActive }),
          ...(Subscription ? { subscription: Subscription } : {}),
          page: Page,
          pageSize: PageSize,
        },
      }),
      providesTags: ['AdminLearners'],
    }),

    setAdminLearnerSubscription: builder.mutation<
      AdminLearnerSubscriptionResult,
      AdminLearnerSubscriptionChange
    >({
      query: ({ LearnerId, SubscriptionType }) => ({
        url: `/admin/learners/${LearnerId}/subscription`,
        method: 'PUT',
        body: { SubscriptionType },
      }),
      invalidatesTags: ['AdminLearners', 'User', 'Dashboard'],
    }),

    getAdminLearnerDetail: builder.query<AdminLearnerDetail, AdminLearnerDrilldownQuery>({
      query: ({ LearnerId, StageId }) => ({
        url: `/admin/learners/${LearnerId}`,
        params: StageId ? { stageId: StageId } : {},
      }),
      providesTags: ['AdminLearners'],
    }),

    getAdminLearnerAttempts: builder.query<AdminLearnerAttemptPage, AdminLearnerAttemptQuery>({
      query: ({ LearnerId, StageId, Page }) => ({
        url: `/admin/learners/${LearnerId}/attempts`,
        params: {
          ...(StageId ? { stageId: StageId } : {}),
          page: Page,
          pageSize: 15,
        },
      }),
      providesTags: ['AdminLearners'],
    }),

    getAdminUsers: builder.query<
      PagedUserList,
      { Page?: number; PageSize?: number }
    >({
      query: ({ Page = 1, PageSize = 20 } = {}) => ({
        url: '/admin/users',
        params: { page: Page, pageSize: PageSize },
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetStudentOnboardingQuery,
  useGetEmailPreferencesQuery,
  useRequestEmailVerificationMutation,
  useSaveEmailPreferencesMutation,
  useGetCertificatesQuery,
  useGetCertificateEligibilityQuery,
  useIssueCertificateMutation,
  useDownloadCertificateMutation,
  useGetCurrentLearningSessionQuery,
  useLazyGetLearningSessionByIdQuery,
  useLazyPreviewSessionRestartQuery,
  useConfirmSessionRestartMutation,
  useStartLearningSessionMutation,
  useAnswerLearningSessionMutation,
  useRevealLearningSessionHintMutation,
  useGetSessionAchievementsQuery,
  useGetLearningStageQuery,
  useSetLearningStageMutation,
  useGetLearningJourneyQuery,
  useGetStageLeaderboardQuery,
  useGetLeaderboardQuery,
  useGetPremiumProgressReportQuery,
  useGetAchievementsQuery,
  useGetDailyQuotaQuery,
  useGetStudentEntitlementQuery,
  useGetPremiumAnalyticsQuery,
  useExportPremiumAnalyticsXlsxMutation,
  useExportPremiumAnalyticsPdfMutation,
  useExportPremiumAnalyticsCsvMutation,
  useGetAdminPremiumCodesQuery,
  useQuotePremiumDiscountMutation,
  useGetPremiumCheckoutOrdersQuery,
  useGetAdminPremiumCheckoutSummaryQuery,
  useGetAdminPremiumCheckoutOrdersQuery,
  useGetPremiumCheckoutOrderQuery,
  usePreparePremiumCheckoutOrderMutation,
  useCancelPremiumCheckoutOrderMutation,
  useGetAdminPremiumDiscountsQuery,
  useCreateAdminPremiumDiscountMutation,
  useDisableAdminPremiumDiscountMutation,
  useUpdateAdminPremiumDiscountSettingsMutation,
  useCreateAdminPremiumCodeMutation,
  useRevokeAdminPremiumCodeMutation,
  useRedeemPremiumCodeMutation,
  useUpdateAdminLearnerSubscriptionMutation,
  useGrantAnnualPremiumMutation,
  useGetAdminLearnerSubscriptionHistoryQuery,
  useGetProfileQuery,
  useGetFavoritesQuery,
  useGetSolvedProblemsQuery,
  useResetPracticeMutation,
  useGetErrorNotebookQuery,
  useSetErrorNotebookArchiveMutation,
  useToggleFavoriteMutation,
  useCheckFavoriteQuery,
  useGetAdminUsersQuery,
  useGetAdminLearnersQuery,
  useGetAdminLearnerDetailQuery,
  useSetAdminLearnerSubscriptionMutation,
  useGetAdminLearnerAttemptsQuery,
  useGetDashboardQuery,
} = usersApi;

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
export interface EmailPreview { Subject: string; PlainText: string; Html: string }
export interface EmailOutboxEntry {
  Id: string; TemplateKey: string; Locale: string; State: string; Attempts: number;
  CreatedAtUtc: string; NextRetryAtUtc: string; LastErrorCode?: string | null;
}
export interface EmailOutboxStatus {
  IsConfigured: boolean; IsTestMode: boolean; IsWorkerEnabled: boolean; RecoveryEnabled: boolean;
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
export const platformBrandApi = createApi({
  reducerPath: 'platformBrandApi', baseQuery, tagTypes: ['Brand', 'EmailOutbox'],
  endpoints: builder => ({
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
    queueTestEmail: builder.mutation<{ Queued: boolean }, { Language: string }>({
      query: body => ({ url: '/admin/platform/email-outbox/test', method: 'POST', body }),
      invalidatesTags: (_result, error) => error ? [] : ['EmailOutbox'],
    }),
    getEmailPreview: builder.query<EmailPreview, { language: string; template: string }>({
      query: params => ({ url: '/admin/platform/email-preview', params }),
    }),
  }),
});
export const { useGetPublicBrandQuery, useGetAdminBrandQuery, useUpdateBrandMutation, useLazyGetEmailPreviewQuery, useGetEmailOutboxQuery, useQueueTestEmailMutation } = platformBrandApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface InboxNotification {
  Id: number;
  Type: string;
  TitleAr: string;
  TitleEn: string;
  BodyAr: string;
  BodyEn: string;
  TargetPath: string | null;
  CreatedAtUtc: string;
  ReadAtUtc: string | null;
}

export interface InboxSnapshot {
  Items: InboxNotification[];
  UnreadCount: number;
  TotalCount: number;
  HasMore: boolean;
  Skip: number;
  Take: number;
}

export interface StudentNotification {
  Id: number;
  Type: string;
  Title: string;
  Body: string;
  ActionPath?: string | null;
  CreatedAt: string;
  IsRead: boolean;
}

export interface StudentNotificationsPage {
  Notifications: StudentNotification[];
  Page: number;
  PageSize: number;
  Total: number;
  UnreadCount: number;
  HasMore: boolean;
}

// Backend filters by JWT identity and the last 30 days. No mock notifications.
export interface SendAdminNotificationRequest {
  learnerId: number;
  TitleAr: string;
  TitleEn: string;
  BodyAr: string;
  BodyEn: string;
  TargetPath?: string | null;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery,
  tagTypes: ['Inbox'],
  endpoints: (builder) => ({
    getInbox: builder.query<InboxSnapshot, void>({
      query: () => ({ url: '/notifications/v2', params: { take: 30 } }),
      providesTags: ['Inbox'],
    }),
    getInboxPage: builder.query<InboxSnapshot, { skip: number; take?: number }>({
      query: ({ skip, take = 30 }) => ({
        url: '/notifications/v2',
        params: { take, skip },
      }),
      providesTags: ['Inbox'],
    }),
    // Adapt the newer unified inbox response to the paginated student UI.
    listNotifications: builder.query<StudentNotificationsPage, {
      page?: number;
      pageSize?: number;
      locale?: string;
    }>({
      query: ({ page = 1, pageSize = 20 }) => ({
        url: '/notifications',
        params: { take: pageSize, skip: (page - 1) * pageSize },
      }),
      transformResponse: (data: InboxSnapshot, _meta, args) => {
        const { page = 1, pageSize = 20, locale = 'ar' } = args;
        return {
          Notifications: data.Items.map(item => ({
            Id: item.Id,
            Type: item.Type,
            Title: locale === 'en' ? item.TitleEn : item.TitleAr,
            Body: locale === 'en' ? item.BodyEn : item.BodyAr,
            ActionPath: item.TargetPath,
            CreatedAt: item.CreatedAtUtc,
            IsRead: item.ReadAtUtc != null,
          })),
          Page: page,
          PageSize: pageSize,
          Total: data.TotalCount,
          UnreadCount: data.UnreadCount,
          HasMore: data.HasMore,
        };
      },
      providesTags: ['Inbox'],
    }),
    notificationUnreadCount: builder.query<{ UnreadCount: number }, void>({
      query: () => ({ url: '/notifications', params: { take: 1 } }),
      transformResponse: (data: InboxSnapshot) => ({
        UnreadCount: data.UnreadCount,
      }),
      providesTags: ['Inbox'],
    }),
    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({ url: `/notifications/v2/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Inbox'],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/v2/read-all', method: 'PUT' }),
      invalidatesTags: ['Inbox'],
    }),
    sendContact:builder.mutation<{Received:boolean},{Name:string;Email:string;Category:string;Subject:string;Message:string}>({query:body=>({url:'/contact',method:'POST',body})}),
    sendAdminBroadcast:builder.mutation<{Sent:number},Omit<SendAdminNotificationRequest,'learnerId'>>({
      query:({TargetPath,...body})=>({url:'/admin/notifications/announce',method:'POST',body:{...body,ActionPath:TargetPath}}),
    }),
    getAdminEmailStatus: builder.query<{ IsConfigured: boolean }, void>({
      query: () => ({ url: '/admin/notifications/email-status' }),
    }),
    sendAdminEmail: builder.mutation<
      { Queued?: boolean; EmailSent?: boolean; UserId: number; NoticeId?: number },
      SendAdminNotificationRequest
    >({
      query: ({ learnerId, ...body }) => ({
        url: `/admin/notifications/email/learners/${learnerId}`,
        method: 'POST',
        body,
      }),
    }),
    sendAdminNotification: builder.mutation<
      { Id: number; UserId: number; CreatedAtUtc: string },
      SendAdminNotificationRequest
    >({
      query: ({ learnerId, ...body }) => ({
        url: `/admin/notifications/learners/${learnerId}`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetInboxQuery,
  useGetInboxPageQuery,
  useListNotificationsQuery,
  useNotificationUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useSendAdminNotificationMutation,
  useSendAdminBroadcastMutation,
  useSendContactMutation,
  useGetAdminEmailStatusQuery,
  useSendAdminEmailMutation,
} = notificationsApi;

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
      query: () => ({ url: '/notifications', params: { take: 30 } }),
      providesTags: ['Inbox'],
    }),
    getInboxPage: builder.query<InboxSnapshot, { skip: number; take?: number }>({
      query: ({ skip, take = 30 }) => ({
        url: '/notifications',
        params: { take, skip },
      }),
      providesTags: ['Inbox'],
    }),
    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Inbox'],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PUT' }),
      invalidatesTags: ['Inbox'],
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
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useSendAdminNotificationMutation,
} = notificationsApi;

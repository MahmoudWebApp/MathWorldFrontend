import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

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

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery,
  tagTypes: ['StudentNotifications'],
  endpoints: (builder) => ({
    listNotifications: builder.query<StudentNotificationsPage, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 20 }) => ({
        url: '/notifications',
        params: { page, pageSize },
      }),
      providesTags: ['StudentNotifications'],
    }),
    notificationUnreadCount: builder.query<{ UnreadCount: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['StudentNotifications'],
    }),
    markNotificationRead: builder.mutation<{ IsRead: boolean }, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['StudentNotifications'],
    }),
    markAllNotificationsRead: builder.mutation<{ Updated: number }, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PUT' }),
      invalidatesTags: ['StudentNotifications'],
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useNotificationUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;

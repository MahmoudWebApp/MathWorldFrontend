import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { Tag, PagedProblemsResponse, PagedResponse } from './types';

export interface CreateTagRequest {
  TextAr: string;
  TextEn: string;
}

export interface UpdateTagRequest {
  TextAr?: string;
  TextEn?: string;
}

export const tagsApi = createApi({
  reducerPath: 'tagsApi',
  baseQuery,
  tagTypes: ['Tag'],
  endpoints: (builder) => ({
    getTags: builder.query<Tag[], void>({
      query: () => '/tags',
      providesTags: ['Tag'],
    }),

    getTagProblems: builder.query<
      PagedResponse<PagedProblemsResponse>,
      { Id: number; Page?: number; PageSize?: number }
    >({
      query: ({ Id, Page = 1, PageSize = 20 }) => ({
        url: `/tags/${Id}/problems`,
        params: { Page, PageSize },
      }),
      providesTags: ['Tag'],
    }),

    // Admin: Get all tags (bilingual)
    getAdminTags: builder.query<Tag[], void>({
      query: () => '/admin/tags',
      providesTags: ['Tag'],
    }),

    // Admin: Create tag
    createTag: builder.mutation<{ Id: number }, CreateTagRequest>({
      query: (body) => ({
        url: '/Tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tag'],
    }),

    // Admin: Update tag
    updateTag: builder.mutation<void, { Id: number; Data: UpdateTagRequest }>({
      query: ({ Id, Data }) => ({
        url: `/Tags/${Id}`,
        method: 'PUT',
        body: Data,
      }),
      invalidatesTags: ['Tag'],
    }),

    // Admin: Delete tag
    deleteTag: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/Tags/${Id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tag'],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetTagProblemsQuery,
  useGetAdminTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagsApi;

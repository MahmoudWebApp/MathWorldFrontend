import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse, baseQuery, createFormDataQuery } from './baseQuery';
import { Category, PagedProblemsResponse, PagedResponse } from './types';

export interface CreateCategoryRequest {
  NameAr: string;
  NameEn: string;
  Order?: number;
  Icon?: File;
}

export interface UpdateCategoryRequest {
  NameAr?: string;
  NameEn?: string;
  Order?: number;
  Icon?: File;
}

export interface ApiResponseCategory {
  Success: boolean;
  Message: string;
  StatusCode: number;
  Data?: Category[];
  Errors?: Record<string, string[]>;
  Timestamp: string;
}

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // Get all categories (public) - returns translated names based on Accept-Language
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    // Get paginated problems by category - returns translated content
    getCategoryProblems: builder.query<
      PagedResponse<PagedProblemsResponse>,
      { Id: number; Page?: number; PageSize?: number }
    >({
      query: ({ Id, Page = 1, PageSize = 20 }) => ({
        url: `/categories/${Id}/problems`,
        params: { Page, PageSize },
      }),
      providesTags: ['Category'],
    }),

    // Admin: Get all categories (bilingual)
    getAdminCategories: builder.query<Category[], void>({
      query: () => '/admin/categories',
      providesTags: ['Category'],
    }),

    // Admin: Create category with optional icon upload
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      queryFn: async (data, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        formData.append('NameAr', data.NameAr);
        formData.append('NameEn', data.NameEn);
        if (data.Order !== undefined) {
          formData.append('Order', data.Order.toString());
        }
        if (data.Icon) {
          formData.append('Icon', data.Icon);
        }

        const result = await fetchWithBQ(
          createFormDataQuery('/admin/categories', 'POST', formData)
        );

        if (result.error) return { error: result.error };
        return { data: result.data as Category };
      },
      invalidatesTags: ['Category'],
    }),

    // Admin: Update category with optional icon upload
    updateCategory: builder.mutation<Category, { Id: number; Data: UpdateCategoryRequest }>({
      queryFn: async ({ Id, Data }, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        if (Data.NameAr) formData.append('NameAr', Data.NameAr);
        if (Data.NameEn) formData.append('NameEn', Data.NameEn);
        if (Data.Order !== undefined) formData.append('Order', Data.Order.toString());
        if (Data.Icon) {
          formData.append('Icon', Data.Icon);
        }

        const result = await fetchWithBQ(
          createFormDataQuery(`/admin/categories/${Id}`, 'PUT', formData)
        );

        if (result.error) return { error: result.error };
        return { data: result.data as Category };
      },
      invalidatesTags: (result, error, { Id }) => [{ type: 'Category', Id }],
    }),

    // Admin: Delete category
    deleteCategory: builder.mutation<void, number>({
      query: (Id) => ({
        url: `/admin/categories/${Id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryProblemsQuery,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;

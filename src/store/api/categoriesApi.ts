import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery, createFormDataQuery } from './baseQuery';


// ============================================
// DTOs
// ============================================

export interface CreateCategoryRequest {
  NameAr: string;
  NameEn: string;
  Order?: number;
  StageId: number;
  Icon?: File;
}

export interface UpdateCategoryRequest {
  NameAr?: string;
  NameEn?: string;
  Order?: number;
  StageId?: number;
  Icon?: File;
}

export interface CategoryDto {
  Id: number;
  NameAr: string;
  NameEn: string;
  Name?: string;
  Icon: string;
  StageId: number;
  Order: number;
}

export interface StageCategoryAccessDto {
  StageId: number;
  FreeCategoryIds: number[];
  FreeCategoryCount: number;
  Categories: Array<{
    Id: number;
    NameAr: string;
    NameEn: string;
    Icon: string;
    Order: number;
    IsFree: boolean;
  }>;
}

export interface StudentSubscriptionDto {
  SubscriptionType: 'Free' | 'Premium';
  IsPremium: boolean;
  FreeCategoriesPerStage: number;
  DailyNewProblemsLimit?: number | null;
}

// ============================================
// API Definition
// ============================================

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery,
  tagTypes: ['Category', 'StageAccess'],
  endpoints: (builder) => ({

    // Public: Get all categories - returns translated names based on Accept-Language
    getCategories: builder.query<CategoryDto[], string>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    getStageCategoryAccess: builder.query<StageCategoryAccessDto, number>({
      query: (stageId) => `/stages/${stageId}/free-categories`,
      providesTags: ['Category'],
      providesTags: (_result, _error, stageId) => [{ type: 'StageAccess', id: stageId }],
      providesTags: (_result, _error, stageId) => [{ type: 'StageAccess', id: stageId }],
    }),
    updateStageFreeCategories: builder.mutation<{ StageId: number; FreeCategoryIds: number[] }, { stageId: number; categoryIds: number[] }>({
      query: ({ stageId, categoryIds }) => ({
        url: `/admin/stages/${stageId}/free-categories`,
        method: 'PUT',
        body: { CategoryIds: categoryIds },
      }),
      async onQueryStarted({ stageId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(categoriesApi.util.invalidateTags([{ type: 'Category' }]));
          dispatch(categoriesApi.util.invalidateTags(['Category']));
        } catch { /* mutation error is handled by the UI */ }
      },
    }),
    getStudentSubscription: builder.query<StudentSubscriptionDto, void>({
      query: () => '/users/subscription',
    }),

    updateStageFreeCategories: builder.mutation<void, { stageId: number; categoryIds: number[] }>({
      query: ({ stageId, categoryIds }) => ({
        url: `/admin/stages/${stageId}/free-categories`,
        method: 'PUT',
        body: { CategoryIds: categoryIds },
      }),
      invalidatesTags: (_result, _error, { stageId }) => [{ type: 'StageAccess', id: stageId }],
    }),

    updateStageFreeCategories: builder.mutation<{ StageId: number; FreeCategoryIds: number[] }, { stageId: number; categoryIds: number[] }>({
      query: ({ stageId, categoryIds }) => ({
        url: `/admin/stages/${stageId}/free-categories`,
        method: 'PUT',
        body: { CategoryIds: categoryIds },
      }),
      invalidatesTags: (_result, _error, { stageId }) => [{ type: 'StageAccess', id: stageId }],
    }),

    // Admin: Get all categories (bilingual)
    getAdminCategories: builder.query<CategoryDto[], void>({
      query: () => '/admin/categories',
      providesTags: ['Category'],
    }),

    // Admin: Create category with optional icon upload
    createCategory: builder.mutation<CategoryDto, CreateCategoryRequest>({
      queryFn: async (data, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        formData.append('NameAr', data.NameAr);
        formData.append('NameEn', data.NameEn);
        if (data.Order !== undefined) {
          formData.append('Order', data.Order.toString());
        }
        formData.append('StageId', data.StageId.toString());
        if (data.Icon) {
          formData.append('Icon', data.Icon);
        }

        const result = await fetchWithBQ(
          createFormDataQuery('/admin/categories', 'POST', formData)
        );

        if (result.error) return { error: result.error };
        return { data: result.data as CategoryDto };
      },
      invalidatesTags: ['Category'],
    }),

    // Admin: Update category with optional icon upload
    updateCategory: builder.mutation<CategoryDto, { Id: number; Data: UpdateCategoryRequest }>({
      queryFn: async ({ Id, Data }, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        if (Data.NameAr) formData.append('NameAr', Data.NameAr);
        if (Data.NameEn) formData.append('NameEn', Data.NameEn);
        if (Data.Order !== undefined) formData.append('Order', Data.Order.toString());
        if (Data.StageId !== undefined) formData.append('StageId', Data.StageId.toString());
        if (Data.Icon) {
          formData.append('Icon', Data.Icon);
        }

        const result = await fetchWithBQ(
          createFormDataQuery(`/admin/categories/${Id}`, 'PUT', formData)
        );

        if (result.error) return { error: result.error };
        return { data: result.data as CategoryDto };
      },
      invalidatesTags: (_result, _error, { Id }) => [{ type: 'Category', id: Id }],
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
  useGetStageCategoryAccessQuery,
  useUpdateStageFreeCategoriesMutation,
  useUpdateStageFreeCategoriesMutation,
  useGetStudentSubscriptionQuery,
  useUpdateStageFreeCategoriesMutation,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

// API base URL - production backend
const API_BASE_URL = 'https://mathwordbackend.onrender.com/api';

// Safe cookie reader (works in SSR and CSR)
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

// Backend response wrapper interface
export interface ApiResponse<T> {
  Success: boolean;
  Message: string;
  StatusCode: number;
  Data?: T;
  Meta?: {
    Total?: number;
    Page?: number;
    PageSize?: number;
    TotalPages?: number;
  };
  Errors?: Record<string, string[]>;
  Timestamp: string;
}

// Base query with interceptor - sends locale header to backend
const baseQueryWithInterceptor = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const reduxState = getState() as any;
    const token = reduxState?.auth?.token || getCookie('token');

    // Get locale from Redux store (set by localeSlice) - fallback to cookie then default 'ar'
    const locale = reduxState?.locale?.current || getCookie('NEXT_LOCALE') || 'ar';

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Send current language to backend so it returns translated data
    headers.set('Accept-Language', locale);
    headers.set('Accept', 'application/json');

    return headers;
  },
});

// Custom baseQuery: unwraps ApiResponse<T> with full edge-case handling
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithInterceptor(args, api, extraOptions);

  // 1. Network/fetch errors
  if (result.error) {
    return result;
  }

  // 2. Empty response body (e.g., 204 No Content)
  if (result.data === undefined || result.data === null) {
    return { data: null };
  }

  const response = result.data as ApiResponse<unknown>;

  // 3. Successful response (Success: true)
  if (response?.Success) {
    // Case A: Response has Meta (pagination)
    if (response.Meta) {
      return { 
        data: { 
          Data: response.Data ?? null, 
          Meta: response.Meta 
        } 
      };
    }
    // Case B: Response has Data (even if null/undefined)
    return { data: response.Data ?? null };
  }

  // 4. Business logic error (Success: false)
  return {
    error: {
      status: response?.StatusCode || 400,
      data: {
        message: response?.Message || 'An unexpected error occurred',
        errors: response?.Errors,
      },
    } as FetchBaseQueryError,
  };
};

// Helper for FormData uploads (browser sets Content-Type with boundary)
export const createFormDataQuery = (
  url: string,
  method: 'POST' | 'PUT' | 'PATCH',
  formData: FormData
): FetchArgs => ({
  url,
  method,
  body: formData,
});

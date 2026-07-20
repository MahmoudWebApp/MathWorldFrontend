import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { clearAuthSession } from '@/lib/authSession';
import { logout } from '@/store/slices/authSlice';

const DEFAULT_API_BASE_URL = 'https://mathwordbackend.onrender.com/api';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

interface ApiState {
  auth?: {
    token?: string | null;
  };
  locale?: {
    current?: string | null;
  };
}

export interface ApiMeta {
  Total?: number;
  Page?: number;
  PageSize?: number;
  TotalPages?: number;
  SearchType?: string;
  Query?: string;
}

export interface ApiResponse<T> {
  Success: boolean;
  Message?: string;
  StatusCode?: number;
  Data?: T;
  Meta?: ApiMeta;
  Errors?: Record<string, string[]>;
  Timestamp?: string;
}

export interface ApiErrorData {
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiBaseQueryError =
  | {
      status: number;
      data: ApiErrorData;
    }
  | {
      status: 'FETCH_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR';
      error: string;
      data: ApiErrorData;
    }
  | {
      status: 'PARSING_ERROR';
      originalStatus: number;
      error: string;
      data: ApiErrorData;
    };

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) {
    return undefined;
  }

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return cookie.slice(prefix.length);
  }
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'Success' in value &&
    typeof (value as { Success?: unknown }).Success === 'boolean'
  );
}

function normalizeErrorData(
  value: unknown,
  fallbackMessage: string,
): ApiErrorData {
  if (isApiResponse(value)) {
    return {
      message: value.Message?.trim() || fallbackMessage,
      errors: value.Errors,
    };
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    const message = record.message ?? record.Message ?? record.title;

    return {
      message:
        typeof message === 'string' && message.trim()
          ? message
          : fallbackMessage,
      errors:
        typeof record.errors === 'object' && record.errors !== null
          ? (record.errors as Record<string, string[]>)
          : undefined,
    };
  }

  if (typeof value === 'string' && value.trim()) {
    return { message: value };
  }

  return { message: fallbackMessage };
}

function normalizeBaseQueryError(
  error: FetchBaseQueryError,
): ApiBaseQueryError {
  if (typeof error.status === 'number') {
    return {
      status: error.status,
      data: normalizeErrorData(
        error.data,
        'An unexpected error occurred',
      ),
    };
  }

  if (error.status === 'PARSING_ERROR') {
    return {
      status: 'PARSING_ERROR',
      originalStatus: error.originalStatus,
      error: error.error,
      data: normalizeErrorData(
        error.data,
        error.error || 'Unable to parse the server response',
      ),
    };
  }

  return {
    status: error.status,
    error: error.error,
    data: normalizeErrorData(
      'data' in error ? error.data : undefined,
      error.error || 'Unable to reach the server',
    ),
  };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as ApiState;
    const token = state.auth?.token || getCookie('token');
    
    // FIX: Read locale from URL directly (e.g., from /en/problems/13)
    // This prevents the race condition when the page reloads and Redux hasn't initialized yet.
    let urlLocale: string | undefined = undefined;
    if (typeof window !== 'undefined') {
      const pathSegment = window.location.pathname.split('/')[1];
      if (pathSegment === 'ar' || pathSegment === 'en') {
        urlLocale = pathSegment;
      }
    }

    // FIX: Priority -> 1. Redux State | 2. Current URL | 3. Cookie | 4. Default 'ar'
    const locale = state.locale?.current || urlLocale || getCookie('NEXT_LOCALE') || 'ar';

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Accept-Language', locale);
    headers.set('Accept', 'application/json');

    return headers;
  },
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      clearAuthSession();
      api.dispatch(logout());
    }

    return {
      error: normalizeBaseQueryError(result.error),
    };
  }

  if (result.data === undefined || result.data === null) {
    return { data: null };
  }

  if (!isApiResponse(result.data)) {
    return { data: result.data };
  }

  if (result.data.Success) {
    return { data: result.data.Data ?? null };
  }

  const status = result.data.StatusCode || 400;

  if (status === 401) {
    clearAuthSession();
    api.dispatch(logout());
  }

  return {
    error: {
      status,
      data: normalizeErrorData(
        result.data,
        'An unexpected error occurred',
      ),
    },
  };
};

export function createFormDataQuery(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH',
  formData: FormData,
): FetchArgs {
  return {
    url,
    method,
    body: formData,
  };
}
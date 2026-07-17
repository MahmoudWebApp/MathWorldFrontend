import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from './baseQuery';
import type { User } from './types';

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface RegisterRequest {
  FullName: string;
  Email: string;
  Password: string;
}

export interface SocialLoginRequest {
  Provider?: string;
  AccessToken: string;
}

export type AuthProfile = Omit<User, 'Token'>;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<User, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<User, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    googleLogin: builder.mutation<User, SocialLoginRequest>({
      query: (data) => ({
        url: '/auth/social/google',
        method: 'POST',
        body: { Provider: 'Google', ...data },
      }),
    }),

    facebookLogin: builder.mutation<User, SocialLoginRequest>({
      query: (data) => ({
        url: '/auth/social/facebook',
        method: 'POST',
        body: { Provider: 'Facebook', ...data },
      }),
    }),

    getMe: builder.query<AuthProfile, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,
  useFacebookLoginMutation,
  useGetMeQuery,
} = authApi;

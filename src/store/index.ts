import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { problemsApi } from './api/problemsApi';
import { categoriesApi } from './api/categoriesApi';
import { usersApi } from './api/usersApi';
import { statsApi } from './api/statsApi';
import localeReducer from './slices/localeSlice';
import { stagesApi } from './api/stagesApi';
import { curriculumApi } from './api/curriculumApi';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    locale: localeReducer,
    [authApi.reducerPath]: authApi.reducer,
    [problemsApi.reducerPath]: problemsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [statsApi.reducerPath]: statsApi.reducer,
    [stagesApi.reducerPath]: stagesApi.reducer,
    [curriculumApi.reducerPath]: curriculumApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      problemsApi.middleware,
      categoriesApi.middleware,
      usersApi.middleware,
      statsApi.middleware,
      stagesApi.middleware,
      curriculumApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
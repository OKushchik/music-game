import { configureStore } from '@reduxjs/toolkit';
import songsReducer from '@/src/store/slices/songsSlice';
import authReducer from '@/src/store/slices/authSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      songs: songsReducer,
      auth: authReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

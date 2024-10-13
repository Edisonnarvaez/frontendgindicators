import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import indicatorReducer from './slices/indicatorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    indicators: indicatorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
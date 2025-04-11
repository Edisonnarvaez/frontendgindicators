import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import indicatorReducer from './slices/indicatorSlice';

import userReducer from './slices/userSlice'; // 👈 importar el nuevo slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    indicators: indicatorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



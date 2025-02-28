import { configureStore } from '@reduxjs/toolkit';
import backgroundServiceReducer from './slices/backgroundServiceSlice';

export const store = configureStore({
  reducer: {
    backgroundService: backgroundServiceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
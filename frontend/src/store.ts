import { configureStore } from '@reduxjs/toolkit';
import { initialState, reducer } from './reducer.ts';
export const store = configureStore({ reducer, preloadedState: initialState, });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
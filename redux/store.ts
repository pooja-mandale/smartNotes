/**
 * Redux Toolkit Store Configuration
 * Centralized state management for Smart Notes app
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import flashcardsReducer from './slices/flashcardsSlice';
import notebooksReducer from './slices/notebooksSlice';
import notesReducer from './slices/notesSlice';
import settingsReducer from './slices/settingsSlice';

const appReducer = combineReducers({
    notebooks: notebooksReducer,
    notes: notesReducer,
    flashcards: flashcardsReducer,
    settings: settingsReducer,
});

const rootReducer = (state: any, action: any) => {
    if (action.type === 'GLOBAL_RESET') {
        // Reset all slices except settings (if you want to keep them)
        // Or reset everything
        const { settings } = state;
        state = { settings }; // Keep settings, reset others
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for date serialization
                ignoredActions: ['flashcards/startSession/fulfilled'],
                // Ignore these field paths in state
                ignoredActionPaths: ['payload.sessionStartTime'],
                ignoredPaths: ['flashcards.sessionStats.sessionStartTime'],
            },
        }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

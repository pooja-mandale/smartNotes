/**
 * Redux Toolkit - Flashcards Slice
 * State management for flashcards and review sessions
 */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as flashcardsDb from '../../database/queries/flashcards';
import type { FlashcardWithNote, ReviewSessionStats } from '../../types';

interface FlashcardsState {
    flashcards: FlashcardWithNote[];
    dueFlashcards: FlashcardWithNote[];
    currentFlashcard: FlashcardWithNote | null;
    currentCardIndex: number;
    sessionStats: ReviewSessionStats | null; // This is per-session stats
    stats: {
        total: number;
        due: number;
        learned: number;
        avgEasiness: number;
        totalReviews: number;
    } | null; // This is global stats
    loading: boolean;
    error: string | null;
}

const initialState: FlashcardsState = {
    flashcards: [],
    dueFlashcards: [],
    currentFlashcard: null,
    currentCardIndex: 0,
    sessionStats: null,
    stats: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchAllFlashcards = createAsyncThunk('flashcards/fetchAll', async () => {
    return await flashcardsDb.getAllFlashcards();
});

export const fetchDueFlashcards = createAsyncThunk('flashcards/fetchDue', async () => {
    return await flashcardsDb.getDueFlashcards();
});

export const reviewFlashcardAction = createAsyncThunk(
    'flashcards/review',
    async ({ id, quality }: { id: string; quality: 0 | 1 | 2 | 3 }) => {
        await flashcardsDb.reviewFlashcard(id, quality);
        return quality;
    }
);

export const startReviewSession = createAsyncThunk(
    'flashcards/startSession',
    async () => {
        const dueFlashcards = await flashcardsDb.getDueFlashcards();
        return dueFlashcards;
    }
);

export const fetchFlashcardStats = createAsyncThunk('flashcards/fetchStats', async () => {
    return await flashcardsDb.getFlashcardStats();
});

// Slice
const flashcardsSlice = createSlice({
    name: 'flashcards',
    initialState,
    reducers: {
        nextCard: (state) => {
            const nextIndex = state.currentCardIndex + 1;
            if (nextIndex < state.dueFlashcards.length) {
                state.currentCardIndex = nextIndex;
                state.currentFlashcard = state.dueFlashcards[nextIndex];
            } else {
                state.currentFlashcard = null;
            }
        },

        endSession: (state) => {
            state.currentFlashcard = null;
            state.currentCardIndex = 0;
            state.sessionStats = null;
            state.dueFlashcards = [];
        },

        updateSessionStats: (state, action: PayloadAction<Partial<ReviewSessionStats>>) => {
            if (state.sessionStats) {
                state.sessionStats = { ...state.sessionStats, ...action.payload };
            }
        },
    },

    extraReducers: (builder) => {
        builder
            // Fetch All Flashcards
            .addCase(fetchAllFlashcards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllFlashcards.fulfilled, (state, action) => {
                state.loading = false;
                state.flashcards = action.payload;
            })
            .addCase(fetchAllFlashcards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch flashcards';
            })

            // Fetch Due Flashcards
            .addCase(fetchDueFlashcards.fulfilled, (state, action) => {
                state.dueFlashcards = action.payload;
            })

            // Start Review Session
            .addCase(startReviewSession.fulfilled, (state, action) => {
                state.dueFlashcards = action.payload;
                state.currentFlashcard = action.payload[0] || null;
                state.currentCardIndex = 0;
                state.sessionStats = {
                    totalCards: action.payload.length,
                    reviewedCards: 0,
                    remainingCards: action.payload.length,
                    againCount: 0,
                    hardCount: 0,
                    goodCount: 0,
                    easyCount: 0,
                    sessionStartTime: new Date(),
                    sessionDuration: 0,
                };
            })

            // Review Flashcard
            .addCase(reviewFlashcardAction.fulfilled, (state, action) => {
                const quality = action.payload;

                if (state.sessionStats) {
                    state.sessionStats.reviewedCards++;
                    state.sessionStats.remainingCards--;

                    switch (quality) {
                        case 0: state.sessionStats.againCount++; break;
                        case 1: state.sessionStats.hardCount++; break;
                        case 2: state.sessionStats.goodCount++; break;
                        case 3: state.sessionStats.easyCount++; break;
                    }

                    const now = new Date();
                    state.sessionStats.sessionDuration = Math.floor(
                        (now.getTime() - state.sessionStats.sessionStartTime.getTime()) / 1000
                    );
                }
            })

            // Fetch Flashcard Stats
            .addCase(fetchFlashcardStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    },
});

export const { nextCard, endSession, updateSessionStats } = flashcardsSlice.actions;
export default flashcardsSlice.reducer;

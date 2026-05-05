/**
 * Redux Toolkit - Notes Slice
 * State management for notes with async thunks
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { parseFlashcardsFromNote } from '../../algorithms/parser';
import * as flashcardsDb from '../../database/queries/flashcards';
import * as notesDb from '../../database/queries/notes';
import type { Note, NoteInsert, NoteWithNotebook } from '../../types';

interface NotesState {
    notes: NoteWithNotebook[];
    currentNote: Note | null;
    loading: boolean;
    error: string | null;
}

const initialState: NotesState = {
    notes: [],
    currentNote: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchAllNotes = createAsyncThunk('notes/fetchAll', async () => {
    return await notesDb.getAllNotes();
});

export const fetchNotesByNotebook = createAsyncThunk(
    'notes/fetchByNotebook',
    async (notebookId: string) => {
        return await notesDb.getNotesByNotebook(notebookId);
    }
);

export const fetchNoteById = createAsyncThunk('notes/fetchById', async (id: string) => {
    return await notesDb.getNoteById(id);
});

export const searchNotesAction = createAsyncThunk('notes/search', async (query: string) => {
    return await notesDb.searchNotes(query);
});

export const createNoteAction = createAsyncThunk(
    'notes/create',
    async (data: NoteInsert, { dispatch }) => {
        const id = await notesDb.createNote(data);

        // Auto-generate flashcards
        if (data.content) {
            const flashcards = parseFlashcardsFromNote(data.content);
            for (const card of flashcards) {
                await flashcardsDb.createFlashcard({
                    noteId: id,
                    question: card.question,
                    answer: card.answer,
                });
            }
        }

        dispatch(fetchAllNotes());
        return id;
    }
);

export const updateNoteAction = createAsyncThunk(
    'notes/update',
    async ({ id, data }: { id: string; data: Partial<NoteInsert> }, { dispatch }) => {
        await notesDb.updateNote(id, data);

        // Re-sync flashcards if content changed (Smart Sync)
        if (data.content !== undefined) {
            const existingCards = await flashcardsDb.getFlashcardsByNote(id);
            const parsedCards = parseFlashcardsFromNote(data.content);
            const parsedQuestions = new Set(parsedCards.map(c => c.question));

            // 1. Update existing or Create new
            for (const parsed of parsedCards) {
                const match = existingCards.find(c => c.question === parsed.question);
                if (match) {
                    // Start of Update logic
                    if (match.answer !== parsed.answer) {
                        await flashcardsDb.updateFlashcardAnswer(match.id, parsed.answer);
                    }
                } else {
                    // Create new
                    await flashcardsDb.createFlashcard({
                        noteId: id,
                        question: parsed.question,
                        answer: parsed.answer,
                    });
                }
            }

            // 2. Delete removed cards
            for (const existing of existingCards) {
                if (!parsedQuestions.has(existing.question)) {
                    await flashcardsDb.deleteFlashcard(existing.id);
                }
            }
        }

        dispatch(fetchAllNotes());
    }
);

export const deleteNoteAction = createAsyncThunk(
    'notes/delete',
    async (id: string, { dispatch }) => {
        await notesDb.deleteNote(id);
        dispatch(fetchAllNotes());
    }
);

export const togglePinAction = createAsyncThunk(
    'notes/togglePin',
    async (id: string, { dispatch }) => {
        await notesDb.toggleNotePin(id);
        dispatch(fetchAllNotes());
    }
);

// Slice
const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        clearCurrentNote: (state) => {
            state.currentNote = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Notes
            .addCase(fetchAllNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.notes = action.payload;
            })
            .addCase(fetchAllNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch notes';
            })

            // Fetch By Notebook
            .addCase(fetchNotesByNotebook.fulfilled, (state, action) => {
                state.notes = action.payload;
            })

            // Fetch By ID
            .addCase(fetchNoteById.fulfilled, (state, action) => {
                state.currentNote = action.payload;
            })

            // Search
            .addCase(searchNotesAction.fulfilled, (state, action) => {
                state.notes = action.payload;
            });
    },
});

export const { clearCurrentNote, clearError } = notesSlice.actions;
export default notesSlice.reducer;

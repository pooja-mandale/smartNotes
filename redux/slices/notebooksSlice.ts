/**
 * Redux Toolkit - Notebooks Slice
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as notebooksDb from '../../database/queries/notebooks';
import type { NotebookInsert, NotebookWithStats } from '../../types';

interface NotebooksState {
    notebooks: NotebookWithStats[];
    loading: boolean;
    error: string | null;
}

const initialState: NotebooksState = {
    notebooks: [],
    loading: false,
    error: null,
};

export const fetchAllNotebooks = createAsyncThunk('notebooks/fetchAll', async () => {
    return await notebooksDb.getAllNotebooks();
});

export const createNotebookAction = createAsyncThunk(
    'notebooks/create',
    async (data: NotebookInsert, { dispatch }) => {
        const id = await notebooksDb.createNotebook(data);
        dispatch(fetchAllNotebooks());
        return id;
    }
);

export const updateNotebookAction = createAsyncThunk(
    'notebooks/update',
    async ({ id, data }: { id: string; data: Partial<NotebookInsert> }, { dispatch }) => {
        await notebooksDb.updateNotebook(id, data);
        dispatch(fetchAllNotebooks());
    }
);

export const deleteNotebookAction = createAsyncThunk(
    'notebooks/delete',
    async (id: string, { dispatch }) => {
        await notebooksDb.deleteNotebook(id);
        dispatch(fetchAllNotebooks());
    }
);

const notebooksSlice = createSlice({
    name: 'notebooks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllNotebooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllNotebooks.fulfilled, (state, action) => {
                state.loading = false;
                state.notebooks = action.payload;
            })
            .addCase(fetchAllNotebooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch notebooks';
            });
    },
});

export default notebooksSlice.reducer;

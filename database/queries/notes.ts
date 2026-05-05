/**
 * Notes Database Queries
 */

import type { Note, NoteInsert, NoteWithNotebook } from '../../types';
import { getDatabase } from '../init';

export async function getAllNotes(): Promise<NoteWithNotebook[]> {
    const db = getDatabase();
    return await db.getAllAsync<NoteWithNotebook>(`
    SELECT 
      n.id, n.notebook_id as notebookId, n.title, n.content, n.tags, 
      n.is_pinned as isPinned, n.created_at as createdAt, n.updated_at as updatedAt,
      nb.name as notebookName, nb.color as notebookColor
    FROM notes n
    INNER JOIN notebooks nb ON nb.id = n.notebook_id
    ORDER BY n.is_pinned DESC, n.updated_at DESC
  `);
}

export async function getNotesByNotebook(notebookId: string): Promise<NoteWithNotebook[]> {
    const db = getDatabase();
    return await db.getAllAsync<NoteWithNotebook>(`
    SELECT 
      n.id, n.notebook_id as notebookId, n.title, n.content, n.tags, 
      n.is_pinned as isPinned, n.created_at as createdAt, n.updated_at as updatedAt,
      nb.name as notebookName, nb.color as notebookColor
    FROM notes n
    INNER JOIN notebooks nb ON nb.id = n.notebook_id
    WHERE n.notebook_id = ?
    ORDER BY n.is_pinned DESC, n.updated_at DESC
  `, [notebookId]);
}

export async function getNoteById(id: string): Promise<Note | null> {
    const db = getDatabase();
    const note = await db.getFirstAsync<any>('SELECT id, notebook_id as notebookId, title, content, tags, is_pinned as isPinned, created_at as createdAt, updated_at as updatedAt FROM notes WHERE id = ?', [id]);
    if (!note) return null;
    return {
        ...note,
        isPinned: !!note.isPinned
    } as Note;
}

export async function searchNotes(query: string): Promise<NoteWithNotebook[]> {
    const db = getDatabase();
    const searchTerm = `%${query}%`;
    return await db.getAllAsync<NoteWithNotebook>(`
    SELECT 
      n.id, n.notebook_id as notebookId, n.title, n.content, n.tags, 
      n.is_pinned as isPinned, n.created_at as createdAt, n.updated_at as updatedAt,
      nb.name as notebookName, nb.color as notebookColor
    FROM notes n
    INNER JOIN notebooks nb ON nb.id = n.notebook_id
    WHERE n.title LIKE ? OR n.content LIKE ? OR n.tags LIKE ?
    ORDER BY n.is_pinned DESC, n.updated_at DESC
  `, [searchTerm, searchTerm, searchTerm]);
}

export async function createNote(data: NoteInsert): Promise<string> {
    const db = getDatabase();
    const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.runAsync(
        `INSERT INTO notes (id, notebook_id, title, content, tags, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, data.notebookId ?? null, data.title ?? '', data.content ?? '', data.tags ?? '', data.isPinned ? 1 : 0]
    );
    return id;
}

export async function updateNote(id: string, data: Partial<NoteInsert>): Promise<void> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.notebookId !== undefined) { fields.push('notebook_id = ?'); values.push(data.notebookId ?? null); }
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title ?? ''); }
    if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content ?? ''); }
    if (data.tags !== undefined) { fields.push('tags = ?'); values.push(data.tags ?? ''); }
    if (data.isPinned !== undefined) { fields.push('is_pinned = ?'); values.push(data.isPinned ? 1 : 0); }

    if (fields.length === 0) return;
    values.push(id);
    await db.runAsync(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteNote(id: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}

export async function toggleNotePin(id: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('UPDATE notes SET is_pinned = NOT is_pinned WHERE id = ?', [id]);
}

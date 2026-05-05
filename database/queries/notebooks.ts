/**
 * Notebook Database Queries
 */

import type { Notebook, NotebookInsert, NotebookWithStats } from '../../types';
import { getDatabase } from '../init';

export async function getAllNotebooks(): Promise<NotebookWithStats[]> {
    const db = getDatabase();
    return await db.getAllAsync<NotebookWithStats>(`
    SELECT 
      n.id, n.name, n.description, n.color, n.icon, 
      n.created_at as createdAt, n.updated_at as updatedAt,
      COUNT(DISTINCT no.id) as noteCount,
      COUNT(DISTINCT f.id) as flashcardCount,
      COUNT(DISTINCT CASE WHEN datetime(f.next_review_date) <= datetime('now') THEN f.id END) as dueFlashcardCount
    FROM notebooks n
    LEFT JOIN notes no ON no.notebook_id = n.id
    LEFT JOIN flashcards f ON f.note_id = no.id
    GROUP BY n.id
    ORDER BY n.updated_at DESC
  `);
}

export async function getNotebookById(id: string): Promise<Notebook | null> {
    const db = getDatabase();
    const notebook = await db.getFirstAsync<Notebook>(
        'SELECT id, name, description, color, icon, created_at as createdAt, updated_at as updatedAt FROM notebooks WHERE id = ?',
        [id]
    );
    return notebook || null;
}

export async function createNotebook(data: NotebookInsert): Promise<string> {
    const db = getDatabase();
    const id = `notebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.runAsync(
        `INSERT INTO notebooks (id, name, description, color, icon) VALUES (?, ?, ?, ?, ?)`,
        [id, data.name ?? 'Untitled', data.description ?? null, data.color ?? '#3B82F6', data.icon ?? null]
    );
    return id;
}

export async function updateNotebook(id: string, data: Partial<NotebookInsert>): Promise<void> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name ?? 'Untitled'); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description ?? null); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color ?? '#3B82F6'); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon ?? null); }

    if (fields.length === 0) return;
    values.push(id);
    await db.runAsync(`UPDATE notebooks SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteNotebook(id: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM notebooks WHERE id = ?', [id]);
}

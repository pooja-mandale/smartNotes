/**
 * Flashcards Database Queries
 */

import { calculateSM2, initializeSM2 } from '../../algorithms/sm2';
import type { Flashcard, FlashcardInsert, FlashcardWithNote } from '../../types';
import { getDatabase } from '../init';

export async function getAllFlashcards(): Promise<FlashcardWithNote[]> {
    const db = getDatabase();
    return await db.getAllAsync<FlashcardWithNote>(`
    SELECT 
      f.id, f.note_id as noteId, f.question, f.answer, 
      f.easiness_factor as easinessFactor, f.interval, f.repetitions, 
      f.next_review_date as nextReviewDate, f.last_reviewed_at as lastReviewedAt, 
      f.total_reviews as totalReviews, f.created_at as createdAt, f.updated_at as updatedAt,
      n.title as noteTitle, nb.name as notebookName
    FROM flashcards f
    INNER JOIN notes n ON n.id = f.note_id
    INNER JOIN notebooks nb ON nb.id = n.notebook_id
    ORDER BY f.next_review_date ASC
  `);
}

export async function getFlashcardsByNote(noteId: string): Promise<Flashcard[]> {
    const db = getDatabase();
    return await db.getAllAsync<Flashcard>(
        `SELECT id, note_id as noteId, question, answer, 
         easiness_factor as easinessFactor, interval, repetitions, 
         next_review_date as nextReviewDate, last_reviewed_at as lastReviewedAt, 
         total_reviews as totalReviews, created_at as createdAt, updated_at as updatedAt 
         FROM flashcards WHERE note_id = ? ORDER BY created_at ASC`,
        [noteId]
    );
}

export async function getDueFlashcards(): Promise<FlashcardWithNote[]> {
    const db = getDatabase();
    return await db.getAllAsync<FlashcardWithNote>(`
    SELECT 
      f.id, f.note_id as noteId, f.question, f.answer, 
      f.easiness_factor as easinessFactor, f.interval, f.repetitions, 
      f.next_review_date as nextReviewDate, f.last_reviewed_at as lastReviewedAt, 
      f.total_reviews as totalReviews, f.created_at as createdAt, f.updated_at as updatedAt,
      n.title as noteTitle, nb.name as notebookName
    FROM flashcards f
    INNER JOIN notes n ON n.id = f.note_id
    INNER JOIN notebooks nb ON nb.id = n.notebook_id
    WHERE datetime(f.next_review_date) <= datetime('now')
    ORDER BY f.next_review_date ASC
  `);
}

export async function getFlashcardById(id: string): Promise<Flashcard | null> {
    const db = getDatabase();
    const flashcard = await db.getFirstAsync<Flashcard>(
        `SELECT id, note_id as noteId, question, answer, 
         easiness_factor as easinessFactor, interval, repetitions, 
         next_review_date as nextReviewDate, last_reviewed_at as lastReviewedAt, 
         total_reviews as totalReviews, created_at as createdAt, updated_at as updatedAt 
         FROM flashcards WHERE id = ?`,
        [id]
    );
    return flashcard || null;
}

export async function createFlashcard(data: Omit<FlashcardInsert, 'easinessFactor' | 'interval' | 'repetitions' | 'nextReviewDate' | 'lastReviewedAt' | 'totalReviews'>): Promise<string> {
    const db = getDatabase();
    const id = `flashcard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const srsDefaults = initializeSM2();

    await db.runAsync(
        `INSERT INTO flashcards (id, note_id, question, answer, easiness_factor, interval, repetitions, next_review_date, last_reviewed_at, total_reviews)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.noteId ?? null, data.question ?? '', data.answer ?? '', srsDefaults.easinessFactor, srsDefaults.interval, srsDefaults.repetitions, srsDefaults.nextReviewDate, null, 0]
    );
    return id;
}

export async function reviewFlashcard(id: string, quality: 0 | 1 | 2 | 3): Promise<void> {
    const db = getDatabase();
    const flashcard = await getFlashcardById(id);
    if (!flashcard) throw new Error('Flashcard not found');

    const sm2Result = calculateSM2({
        quality,
        repetitions: flashcard.repetitions,
        easinessFactor: flashcard.easinessFactor,
        interval: flashcard.interval,
    });

    await db.runAsync(
        `UPDATE flashcards SET easiness_factor = ?, interval = ?, repetitions = ?, next_review_date = ?, last_reviewed_at = datetime('now'), total_reviews = total_reviews + 1 WHERE id = ?`,
        [sm2Result.easinessFactor, sm2Result.interval, sm2Result.repetitions, sm2Result.nextReviewDate.toISOString(), id]
    );
}

export async function deleteFlashcard(id: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM flashcards WHERE id = ?', [id]);
}

export async function deleteFlashcardsByNote(noteId: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM flashcards WHERE note_id = ?', [noteId]);
}

export async function updateFlashcardAnswer(id: string, newAnswer: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('UPDATE flashcards SET answer = ?, updated_at = datetime(\'now\') WHERE id = ?', [newAnswer ?? '', id]);
}

export async function getFlashcardStats() {
    const db = getDatabase();
    const stats = await db.getFirstAsync<{
        total: number;
        due: number;
        learned: number;
        avgEasiness: number;
        totalReviews: number;
    }>(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN datetime(next_review_date) <= datetime('now') THEN 1 END) as due,
      COUNT(CASE WHEN repetitions > 0 THEN 1 END) as learned,
      COALESCE(AVG(easiness_factor), 2.5) as avgEasiness,
      COALESCE(SUM(total_reviews), 0) as totalReviews
    FROM flashcards
  `);
    return stats || { total: 0, due: 0, learned: 0, avgEasiness: 2.5, totalReviews: 0 };
}

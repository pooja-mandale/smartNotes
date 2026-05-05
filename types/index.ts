/**
 * TypeScript Type Definitions
 * Database entities and app types
 */

// Database Entity Types
export interface Notebook {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Note {
    id: string;
    notebookId: string;
    title: string;
    content: string;
    tags: string;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Flashcard {
    id: string;
    noteId: string;
    question: string;
    answer: string;
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
    lastReviewedAt: string | null;
    totalReviews: number;
    createdAt: string;
    updatedAt: string;
}

// Insert Types (without auto-generated fields)
export type NotebookInsert = Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>;
export type NoteInsert = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
export type FlashcardInsert = Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>;

// Query Result Types
export interface NoteWithNotebook extends Note {
    notebookName: string;
    notebookColor: string;
}

export interface FlashcardWithNote extends Flashcard {
    noteTitle: string;
    notebookName: string;
}

export interface NotebookWithStats extends Notebook {
    noteCount: number;
    flashcardCount: number;
    dueFlashcardCount: number;
}

// Review Session Types
export type ReviewQuality = 0 | 1 | 2 | 3;

export interface ReviewSessionStats {
    totalCards: number;
    reviewedCards: number;
    remainingCards: number;
    againCount: number;
    hardCount: number;
    goodCount: number;
    easyCount: number;
    sessionStartTime: Date;
    sessionDuration: number;
}

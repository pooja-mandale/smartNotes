/**
 * Database Schema Configuration
 * SQLite schema for Smart Notes + Memory Booster
 */

export const DATABASE_NAME = 'smart_notes.db';
export const DATABASE_VERSION = 1;

/**
 * SQL Table Definitions
 */
export const SCHEMA = {
    notebooks: `
    CREATE TABLE IF NOT EXISTS notebooks (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      icon TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

    notes: `
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      notebook_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
    );
  `,

    flashcards: `
    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY NOT NULL,
      note_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      easiness_factor REAL NOT NULL DEFAULT 2.5,
      interval INTEGER NOT NULL DEFAULT 0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review_date TEXT NOT NULL DEFAULT (datetime('now')),
      last_reviewed_at TEXT,
      total_reviews INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    );
  `,

    reviewHistory: `
    CREATE TABLE IF NOT EXISTS review_history (
      id TEXT PRIMARY KEY NOT NULL,
      flashcard_id TEXT NOT NULL,
      quality INTEGER NOT NULL CHECK (quality IN (0, 1, 2, 3)),
      previous_easiness_factor REAL NOT NULL,
      previous_interval INTEGER NOT NULL,
      new_easiness_factor REAL NOT NULL,
      new_interval INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
    );
  `,
};

export const INDEXES = {
    notesNotebookId: `CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id);`,
    notesPinned: `CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned DESC, updated_at DESC);`,
    flashcardsNoteId: `CREATE INDEX IF NOT EXISTS idx_flashcards_note_id ON flashcards(note_id);`,
    flashcardsNextReview: `CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_date);`,
    reviewHistoryFlashcardId: `CREATE INDEX IF NOT EXISTS idx_review_history_flashcard_id ON review_history(flashcard_id, reviewed_at DESC);`,
};

export const TRIGGERS = {
    notebooksUpdated: `
    CREATE TRIGGER IF NOT EXISTS notebooks_updated_at 
    AFTER UPDATE ON notebooks
    FOR EACH ROW
    BEGIN
      UPDATE notebooks SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `,
    notesUpdated: `
    CREATE TRIGGER IF NOT EXISTS notes_updated_at 
    AFTER UPDATE ON notes
    FOR EACH ROW
    BEGIN
      UPDATE notes SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `,
    flashcardsUpdated: `
    CREATE TRIGGER IF NOT EXISTS flashcards_updated_at 
    AFTER UPDATE ON flashcards
    FOR EACH ROW
    BEGIN
      UPDATE flashcards SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `,
};

export const SEED_DATA = {
    defaultNotebook: {
        id: 'default-notebook-001',
        name: 'General',
        description: 'Default notebook for general notes',
        color: '#3B82F6',
        icon: 'book',
    },
    welcomeNote: {
        id: 'welcome-note-001',
        notebookId: 'default-notebook-001',
        title: 'Welcome to Smart Notes! 📚',
        content: `# Welcome to Smart Notes + Memory Booster! 🎉

This is your first note. Smart Notes helps you learn faster using **Spaced Repetition**.

## How to Create Flashcards

Simply write your notes using this syntax:

Q: What is the capital of France?
A: Paris

Q: What is 2 + 2?
A: 4

The app will automatically convert these into flashcards for review!

## Features

- 📝 **Markdown support** for beautiful notes
- 🧠 **SM-2 Algorithm** for optimal learning
- 📊 **Progress tracking** to see your growth
- 🔔 **Daily reminders** to keep you on track
- 📂 **Organize** notes into notebooks
- 💾 **100% Offline** - all data on your device

Try editing this note and adding your own Q&A pairs!`,
        tags: '["tutorial", "welcome"]',
        isPinned: true,
    },
};

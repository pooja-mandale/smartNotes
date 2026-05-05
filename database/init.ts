/**
 * Database Initialization
 * 100% Offline SQLite Database for React Native
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, INDEXES, SCHEMA, SEED_DATA, TRIGGERS } from '../utils/schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
    try {
        console.log('[Init] Opening db asynchronously...');
        db = await SQLite.openDatabaseAsync(DATABASE_NAME);
        console.log('📦 Database connection established');

        console.log('[Init] PRAGMA foreign_keys = ON...');
        await db.execAsync('PRAGMA foreign_keys = ON;');
        
        console.log('[Init] createTables...');
        await createTables();
        
        console.log('[Init] createIndexes...');
        await createIndexes();
        
        console.log('[Init] createTriggers...');
        await createTriggers();
        
        console.log('[Init] seedDefaultData...');
        await seedDefaultData();

        console.log('✅ Database initialized successfully');
        return db;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

async function createTables(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execAsync(`
    ${SCHEMA.notebooks}
    ${SCHEMA.notes}
    ${SCHEMA.flashcards}
    ${SCHEMA.reviewHistory}
  `);
    console.log('📋 Tables created successfully');
}

async function createIndexes(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execAsync(`
    ${INDEXES.notesNotebookId}
    ${INDEXES.notesPinned}
    ${INDEXES.flashcardsNoteId}
    ${INDEXES.flashcardsNextReview}
    ${INDEXES.reviewHistoryFlashcardId}
  `);
    console.log('🔍 Indexes created successfully');
}

async function createTriggers(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execAsync(`
    ${TRIGGERS.notebooksUpdated}
    ${TRIGGERS.notesUpdated}
    ${TRIGGERS.flashcardsUpdated}
  `);
    console.log('⚡ Triggers created successfully');
}

async function seedDefaultData(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    try {
        const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM notebooks');
        if (result && result.count > 0) {
            console.log('📚 Database already seeded, skipping...');
            return;
        }

        await db.runAsync(
            `INSERT INTO notebooks (id, name, description, color, icon) VALUES (?, ?, ?, ?, ?)`,
            [
                SEED_DATA.defaultNotebook.id,
                SEED_DATA.defaultNotebook.name,
                SEED_DATA.defaultNotebook.description,
                SEED_DATA.defaultNotebook.color,
                SEED_DATA.defaultNotebook.icon,
            ]
        );

        await db.runAsync(
            `INSERT INTO notes (id, notebook_id, title, content, tags, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                SEED_DATA.welcomeNote.id,
                SEED_DATA.welcomeNote.notebookId,
                SEED_DATA.welcomeNote.title,
                SEED_DATA.welcomeNote.content,
                SEED_DATA.welcomeNote.tags,
                SEED_DATA.welcomeNote.isPinned ? 1 : 0,
            ]
        );

        console.log('🌱 Default data seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
    return db;
}

export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.closeAsync();
        db = null;
        console.log('🔒 Database connection closed');
    }
}

export async function resetDatabase(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    try {
        console.log('🗑️ Resetting database...');
        await db.execAsync(`
            DROP TABLE IF EXISTS review_history;
            DROP TABLE IF EXISTS flashcards;
            DROP TABLE IF EXISTS notes;
            DROP TABLE IF EXISTS notebooks;
        `);
        await createTables();
        await createIndexes();
        await createTriggers();
        await seedDefaultData();
        console.log('✨ Database reset complete');
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        throw error;
    }
}

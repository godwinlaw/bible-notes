/**
 * Database queries for backlinks functionality
 */

import db from './db';
import { ChapterReference } from './note-parser';

export interface Backlink {
    id: number;
    title: string;
    filename: string;
    createdAt: string;
}

/**
 * Get all notes that reference a specific chapter
 */
export function getBacklinksForChapter(book: string, chapter: number): Backlink[] {
    const query = `
        SELECT DISTINCT n.id, n.title, n.filename, n.created_at as createdAt
        FROM notes n
        INNER JOIN chapter_references cr ON n.id = cr.note_id
        WHERE cr.book = ? AND cr.chapter = ?
        ORDER BY n.created_at DESC
    `;

    return db.prepare(query).all(book, chapter) as Backlink[];
}

/**
 * Save chapter references for a note
 */
export function saveNoteReferences(noteId: number, references: ChapterReference[]): void {
    // First, delete existing references for this note
    deleteNoteReferences(noteId);

    // Insert new references
    if (references.length > 0) {
        const insert = db.prepare(`
            INSERT INTO chapter_references (note_id, book, chapter)
            VALUES (?, ?, ?)
        `);

        const insertMany = db.transaction((refs: ChapterReference[]) => {
            for (const ref of refs) {
                insert.run(noteId, ref.book, ref.chapter);
            }
        });

        insertMany(references);
    }
}

/**
 * Delete all references for a note
 */
export function deleteNoteReferences(noteId: number): void {
    db.prepare('DELETE FROM chapter_references WHERE note_id = ?').run(noteId);
}

/**
 * Get a note by ID
 */
export function getNoteById(id: number) {
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as {
        id: number;
        title: string;
        filename: string;
        created_at: string;
        updated_at: string;
    } | undefined;
}

/**
 * Get all notes
 */
export function getAllNotes() {
    return db.prepare('SELECT id, title, filename, created_at, updated_at FROM notes ORDER BY updated_at DESC').all() as Array<{
        id: number;
        title: string;
        filename: string;
        created_at: string;
        updated_at: string;
    }>;
}

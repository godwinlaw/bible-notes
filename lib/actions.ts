'use server';

import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import db from './db';
import { extractChapterReferences } from './note-parser';
import { saveNoteReferences } from './backlinks';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function saveNote(note: { title: string; content: string; id?: number }) {
    try {
        const notesDir = path.join(process.cwd(), 'notes');

        // Create notes directory if it doesn't exist
        await mkdir(notesDir, { recursive: true });

        // Generate filename from title
        const slug = slugify(note.title) || `note-${Date.now()}`;
        const filename = `${slug}.md`;
        const filePath = path.join(notesDir, filename);

        // Create markdown content with title as H1
        const markdownContent = `# ${note.title}\n\n${note.content}`;

        // Write file
        await writeFile(filePath, markdownContent, 'utf-8');

        // Extract chapter references from content
        const references = extractChapterReferences(note.content);

        let noteId: number;

        if (note.id) {
            // Update existing note
            db.prepare(
                'UPDATE notes SET title = ?, filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
            ).run(note.title, filename, note.id);
            noteId = note.id;
        } else {
            // Insert new note
            const result = db.prepare(
                'INSERT INTO notes (title, filename) VALUES (?, ?)'
            ).run(note.title, filename);
            noteId = result.lastInsertRowid as number;
        }

        // Save references
        saveNoteReferences(noteId, references);

        revalidatePath('/'); // Revalidate to show new notes if we had a list
        return { success: true, noteId };
    } catch (error) {
        console.error('Failed to save note:', error);
        return { success: false, error: 'Failed to save note' };
    }
}

export async function loadNote(id: number) {
    try {
        const noteRecord = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as {
            id: number;
            title: string;
            filename: string;
        } | undefined;

        if (!noteRecord) {
            return { success: false, error: 'Note not found' };
        }

        const notesDir = path.join(process.cwd(), 'notes');
        const filePath = path.join(notesDir, noteRecord.filename);
        const markdownContent = await readFile(filePath, 'utf-8');

        // Extract content (skip the H1 title line)
        const lines = markdownContent.split('\n');
        const content = lines.slice(2).join('\n').trim(); // Skip "# Title" and empty line

        return {
            success: true,
            note: {
                id: noteRecord.id,
                title: noteRecord.title,
                content
            }
        };
    } catch (error) {
        console.error('Failed to load note:', error);
        return { success: false, error: 'Failed to load note' };
    }
}


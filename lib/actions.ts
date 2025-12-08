'use server';

import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
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

export async function getPreachers() {
    try {
        const preachers = db.prepare('SELECT name FROM preachers ORDER BY name ASC').all() as { name: string }[];
        return { success: true, preachers: preachers.map(p => p.name) };
    } catch (error) {
        console.error('Failed to fetch preachers:', error);
        return { success: false, error: 'Failed to fetch preachers' };
    }
}

export async function saveNote(note: { title: string; content: string; id?: number; event?: string; preacher?: string }) {
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

        let preacherId: number | null = null;
        if (note.preacher && note.preacher.trim()) {
            const preacherName = note.preacher.trim();
            const existingPreacher = db.prepare('SELECT id FROM preachers WHERE name = ?').get(preacherName) as { id: number } | undefined;

            if (existingPreacher) {
                preacherId = existingPreacher.id;
            } else {
                const result = db.prepare('INSERT INTO preachers (name) VALUES (?)').run(preacherName);
                preacherId = result.lastInsertRowid as number;
            }
        }

        let noteId: number;

        if (note.id) {
            // Update existing note
            db.prepare(
                'UPDATE notes SET title = ?, filename = ?, event = ?, preacher_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
            ).run(note.title, filename, note.event || null, preacherId, note.id);
            noteId = note.id;
        } else {
            // Insert new note
            const result = db.prepare(
                'INSERT INTO notes (title, filename, event, preacher_id) VALUES (?, ?, ?, ?)'
            ).run(note.title, filename, note.event || null, preacherId);
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
        const noteRecord = db.prepare(`
            SELECT n.*, p.name as preacher_name 
            FROM notes n 
            LEFT JOIN preachers p ON n.preacher_id = p.id 
            WHERE n.id = ?
        `).get(id) as {
            id: number;
            title: string;
            filename: string;
            event?: string;
            preacher_name?: string;
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
                content,
                event: noteRecord.event,
                preacher: noteRecord.preacher_name
            }
        };
    } catch (error) {
        console.error('Failed to load note:', error);
        return { success: false, error: 'Failed to load note' };
    }
}

export async function getAllNotes() {
    try {
        const notes = db.prepare(`
            SELECT n.id, n.title, n.event, n.updated_at, p.name as preacher_name
            FROM notes n
            LEFT JOIN preachers p ON n.preacher_id = p.id
            ORDER BY n.updated_at DESC
        `).all() as {
            id: number;
            title: string;
            event?: string;
            updated_at: string;
            preacher_name?: string;
        }[];

        return { success: true, notes };
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        return { success: false, error: 'Failed to fetch notes' };
    }
}

export async function deleteNote(id: number) {
    try {
        const note = db.prepare('SELECT filename FROM notes WHERE id = ?').get(id) as { filename: string } | undefined;

        if (!note) {
            return { success: false, error: 'Note not found' };
        }

        // Delete file
        const notesDir = path.join(process.cwd(), 'notes');
        const filePath = path.join(notesDir, note.filename);

        try {
            await unlink(filePath);
        } catch (e) {
            // ignore if file doesn't exist
            console.warn('File not found for deletion:', filePath);
        }

        // Delete from DB
        db.prepare('DELETE FROM notes WHERE id = ?').run(id);

        // Also delete references?
        db.prepare('DELETE FROM chapter_references WHERE note_id = ?').run(id);

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete note:', error);
        return { success: false, error: 'Failed to delete note' };
    }
}

export async function exportNoteToPath(pathStr: string, filename: string, content: string) {
    try {
        // Resolve path to ensure it's absolute if not already, though we expect absolute
        const exportDir = path.resolve(pathStr);

        // Create directory recursively
        await mkdir(exportDir, { recursive: true });

        // Ensure filename ends with .md
        const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
        const filePath = path.join(exportDir, safeFilename);

        await writeFile(filePath, content, 'utf-8');

        return { success: true, message: `Successfully exported to ${filePath}` };
    } catch (error) {
        console.error('Failed to export note to path:', error);
        return { success: false, message: `Failed to export: ${(error as Error).message}` };
    }
}

// Audio attachment actions
export interface AudioAttachment {
    id: number;
    note_id: number;
    mime_type: string;
    duration_seconds: number | null;
    transcript: string | null;
    created_at: string;
}

export async function saveAudioAttachment(
    noteId: number,
    audioBase64: string,
    mimeType: string = 'audio/webm',
    durationSeconds: number | null = null,
    transcript: string | null = null
) {
    try {
        // Decode base64 to buffer
        const audioBuffer = Buffer.from(audioBase64, 'base64');

        const result = db.prepare(
            'INSERT INTO audio_attachments (note_id, audio_data, mime_type, duration_seconds, transcript) VALUES (?, ?, ?, ?, ?)'
        ).run(noteId, audioBuffer, mimeType, durationSeconds, transcript);

        return { success: true, attachmentId: result.lastInsertRowid as number };
    } catch (error) {
        console.error('Failed to save audio attachment:', error);
        return { success: false, error: 'Failed to save audio attachment' };
    }
}

export async function getAudioAttachments(noteId: number) {
    try {
        const attachments = db.prepare(
            'SELECT id, note_id, mime_type, duration_seconds, transcript, created_at FROM audio_attachments WHERE note_id = ? ORDER BY created_at DESC'
        ).all(noteId) as AudioAttachment[];

        return { success: true, attachments };
    } catch (error) {
        console.error('Failed to get audio attachments:', error);
        return { success: false, error: 'Failed to get audio attachments' };
    }
}

export async function getAudioBlob(attachmentId: number) {
    try {
        const attachment = db.prepare(
            'SELECT audio_data, mime_type FROM audio_attachments WHERE id = ?'
        ).get(attachmentId) as { audio_data: Buffer; mime_type: string } | undefined;

        if (!attachment) {
            return { success: false, error: 'Audio attachment not found' };
        }

        // Convert buffer to base64 for transfer
        const base64 = attachment.audio_data.toString('base64');
        return { success: true, audioBase64: base64, mimeType: attachment.mime_type };
    } catch (error) {
        console.error('Failed to get audio blob:', error);
        return { success: false, error: 'Failed to get audio blob' };
    }
}

export async function deleteAudioAttachment(attachmentId: number) {
    try {
        db.prepare('DELETE FROM audio_attachments WHERE id = ?').run(attachmentId);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete audio attachment:', error);
        return { success: false, error: 'Failed to delete audio attachment' };
    }
}

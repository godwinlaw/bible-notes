import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bible.db');
const db = new Database(dbPath);

try {
    console.log('Creating notes table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            filename TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Notes table created successfully!');

    console.log('Creating chapter_references table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS chapter_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            UNIQUE(note_id, book, chapter)
        )
    `);
    console.log('Chapter references table created successfully!');

    console.log('Creating indexes...');
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_chapter_refs_book_chapter ON chapter_references(book, chapter);
        CREATE INDEX IF NOT EXISTS idx_chapter_refs_note_id ON chapter_references(note_id);
    `);
    console.log('Indexes created successfully!');

    console.log('All migrations completed!');
} catch (error) {
    console.error('Error during migration:', error);
} finally {
    db.close();
}

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bible.db');
const db = new Database(dbPath);

console.log('Running migration: Add Preachers table...');

try {
    // Create preachers table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS preachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `).run();
    console.log('Created preachers table.');

    // Add preacher_id to notes table
    // Check if column exists first to avoid error
    const tableInfo = db.prepare("PRAGMA table_info(notes)").all();
    const hasPreacherId = tableInfo.some(col => col.name === 'preacher_id');

    if (!hasPreacherId) {
        db.prepare(`
            ALTER TABLE notes ADD COLUMN preacher_id INTEGER REFERENCES preachers(id)
        `).run();
        console.log('Added preacher_id column to notes table.');
    } else {
        console.log('preacher_id column already exists in notes table.');
    }

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

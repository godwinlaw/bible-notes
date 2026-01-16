const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'bible.db');
const db = new Database(dbPath);

console.log('Applying attachments migration...');

try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            mime_type TEXT,
            size INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON attachments(note_id);
    `).run();

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

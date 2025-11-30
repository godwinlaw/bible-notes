import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bible.db');
const sqlPath = path.join(process.cwd(), 'ESV_bible.sql');

// Delete existing DB if it exists to start fresh
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Deleted existing bible.db');
}

const db = new Database(dbPath);

try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Executing SQL...');
    db.exec(sql);

    console.log('Database initialized successfully!');

    // Verification query
    const stmt = db.prepare('SELECT * FROM esv LIMIT 1');
    const row = stmt.get();
    console.log('Verification row:', row);

} catch (error) {
    console.error('Error initializing database:', error);
} finally {
    db.close();
}

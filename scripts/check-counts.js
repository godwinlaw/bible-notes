
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'bible.db');
const db = new Database(dbPath);

console.log('Checking database counts...');

try {
    const noteCount = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
    const refCount = db.prepare('SELECT COUNT(*) as count FROM chapter_references').get().count;

    console.log(`Total Notes: ${noteCount}`);
    console.log(`Total References: ${refCount}`);

    if (refCount > 0) {
        const sample = db.prepare('SELECT * FROM chapter_references LIMIT 5').all();
        console.log('Sample references:', sample);
    }

} catch (error) {
    console.error('Error checking counts:', error);
}

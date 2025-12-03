
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'bible.db');
const db = new Database(dbPath);

console.log('Checking for orphaned references...');

try {
    const orphans = db.prepare(`
        SELECT * FROM chapter_references 
        WHERE note_id NOT IN (SELECT id FROM notes)
    `).all();

    if (orphans.length > 0) {
        console.log(`Found ${orphans.length} orphaned references.`);
        console.log(JSON.stringify(orphans, null, 2));
    } else {
        console.log('No orphaned references found.');
    }
} catch (error) {
    console.error('Error checking for orphans:', error);
}

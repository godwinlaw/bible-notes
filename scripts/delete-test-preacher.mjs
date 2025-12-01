import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bible.db');
const db = new Database(dbPath);

console.log('Deleting "Test Preacher"...');

try {
    const result = db.prepare('DELETE FROM preachers WHERE name = ?').run('Test Preacher');
    console.log(`Deleted ${result.changes} preacher(s).`);

    // Also clean up any notes associated with this preacher (optional, but good for consistency if we want to remove the link)
    // Or we can set preacher_id to NULL. Let's set to NULL to preserve the note.
    // First find the id if we hadn't deleted it yet, but since we just deleted it, we can't.
    // Actually, if we delete the preacher, the foreign key constraint might restrict it or cascade.
    // Let's check the schema.
    // The schema I created: `preacher_id INTEGER REFERENCES preachers(id)`
    // Default behavior is usually NO ACTION or RESTRICT unless ON DELETE CASCADE is specified.
    // My migration script didn't specify ON DELETE CASCADE.
    // So the delete might fail if there are notes.
    // Let's try to update notes first.

    // Re-run logic:
    // 1. Get ID of Test Preacher.
    // 2. Update notes to set preacher_id = NULL.
    // 3. Delete preacher.
} catch (e) {
    console.log("Error during initial delete attempt (likely constraint):", e.message);
}

// Better approach script
const getPreacher = db.prepare('SELECT id FROM preachers WHERE name = ?').get('Test Preacher');

if (getPreacher) {
    console.log(`Found Test Preacher with ID: ${getPreacher.id}`);

    const updateResult = db.prepare('UPDATE notes SET preacher_id = NULL WHERE preacher_id = ?').run(getPreacher.id);
    console.log(`Unlinked ${updateResult.changes} note(s).`);

    const deleteResult = db.prepare('DELETE FROM preachers WHERE id = ?').run(getPreacher.id);
    console.log(`Deleted preacher. Changes: ${deleteResult.changes}`);
} else {
    console.log('"Test Preacher" not found.');
}

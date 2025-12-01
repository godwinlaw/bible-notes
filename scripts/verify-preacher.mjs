import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bible.db');
const db = new Database(dbPath);

console.log('Verifying Preacher Data...');

const preachers = db.prepare('SELECT * FROM preachers').all();
console.log('Preachers:', preachers);

const notes = db.prepare(`
    SELECT n.title, n.preacher_id, p.name as preacher_name 
    FROM notes n 
    LEFT JOIN preachers p ON n.preacher_id = p.id
    WHERE n.title = 'Test Note'
`).all();
console.log('Notes with "Test Note" title:', notes);

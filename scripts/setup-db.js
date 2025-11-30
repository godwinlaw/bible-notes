const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = path.join(process.cwd(), 'bible.db');
const BIBLE_JSON_URL = 'https://raw.githubusercontent.com/jadenzaleski/bible-translations/main/KJV.json';

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function setup() {
    console.log('Fetching Bible data...');
    const bibleData = await fetchJson(BIBLE_JSON_URL);
    console.log('Data fetched. Initializing database...');

    if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
    }

    const db = new Database(DB_PATH);

    db.exec(`
    CREATE TABLE books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbrev TEXT
    );
    CREATE TABLE chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      number INTEGER NOT NULL,
      FOREIGN KEY(book_id) REFERENCES books(id)
    );
    CREATE TABLE verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      number INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY(chapter_id) REFERENCES chapters(id)
    );
  `);

    const insertBook = db.prepare('INSERT INTO books (name, abbrev) VALUES (?, ?)');
    const insertChapter = db.prepare('INSERT INTO chapters (book_id, number) VALUES (?, ?)');
    const insertVerse = db.prepare('INSERT INTO verses (chapter_id, number, text) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        for (const bookData of bibleData) {
            const bookResult = insertBook.run(bookData.name, bookData.abbrev);
            const bookId = bookResult.lastInsertRowid;

            for (let i = 0; i < bookData.chapters.length; i++) {
                const chapterNum = i + 1;
                const verses = bookData.chapters[i];

                const chapterResult = insertChapter.run(bookId, chapterNum);
                const chapterId = chapterResult.lastInsertRowid;

                for (let j = 0; j < verses.length; j++) {
                    const verseNum = j + 1;
                    const verseText = verses[j];
                    insertVerse.run(chapterId, verseNum, verseText);
                }
            }
        }
    });

    console.log('Inserting data...');
    transaction();
    console.log('Database setup complete.');
}

setup().catch(console.error);

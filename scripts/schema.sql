-- Bible text table (from ESV_bible.sql)
CREATE TABLE IF NOT EXISTS esv (
    book_id INTEGER NOT NULL,
    book VARCHAR(255) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text VARCHAR(1000) NOT NULL,
    PRIMARY KEY (book_id, chapter, verse)
);

-- Notes metadata table
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chapter references table (tracks which notes reference which chapters)
CREATE TABLE IF NOT EXISTS chapter_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    UNIQUE(note_id, book, chapter)
);

-- Index for efficient backlink queries
CREATE INDEX IF NOT EXISTS idx_chapter_refs_book_chapter ON chapter_references(book, chapter);
CREATE INDEX IF NOT EXISTS idx_chapter_refs_note_id ON chapter_references(note_id);

-- Audio attachments table (stores audio recordings linked to notes)
CREATE TABLE IF NOT EXISTS audio_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    audio_data BLOB NOT NULL,
    mime_type TEXT DEFAULT 'audio/webm',
    duration_seconds REAL,
    transcript TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audio_attachments_note_id ON audio_attachments(note_id);

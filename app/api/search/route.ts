import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    const sanitizedQuery = query.trim();

    // Check if query contains a number (potential chapter search)
    const hasNumber = /\d/.test(sanitizedQuery);

    let suggestions = [];

    if (hasNumber) {
        // Try to split into book and chapter
        // Matches "Book Name 1" or "1 Book 1"
        const match = sanitizedQuery.match(/^(.+?)\s+(\d+)$/);
        if (match) {
            const bookPart = match[1].trim();
            const chapterPart = parseInt(match[2], 10);

            const stmt = db.prepare(`
            SELECT book, chapter 
            FROM esv 
            WHERE book LIKE ? AND chapter = ?
            GROUP BY book, chapter
            LIMIT 5
        `);
            suggestions = stmt.all(`${bookPart}%`, chapterPart);
        } else {
            // Just search for book containing the query if it doesn't match the pattern perfectly yet
            const stmt = db.prepare(`
            SELECT book, chapter 
            FROM esv 
            WHERE book LIKE ?
            GROUP BY book, chapter
            LIMIT 5
        `);
            suggestions = stmt.all(`${sanitizedQuery}%`);
        }
    } else {
        // Search for books
        const stmt = db.prepare(`
      SELECT book, MIN(chapter) as chapter
      FROM esv
      WHERE book LIKE ?
      GROUP BY book
      ORDER BY book ASC
      LIMIT 10
    `);
        suggestions = stmt.all(`${sanitizedQuery}%`);
    }

    return NextResponse.json(suggestions);
}

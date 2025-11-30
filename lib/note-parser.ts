/**
 * Utilities for parsing chapter references from note content
 */

import { BOOK_ABBREVIATIONS } from './book-abbreviations';

export interface ChapterReference {
    book: string;
    chapter: number;
}

/**
 * Extract chapter references from note content
 * Matches format: [[Book-##]] where Book is abbreviated and ## is zero-padded chapter
 * Example: [[Gen-01]], [[Matt-05]], [[Rev-22]]
 */
export function extractChapterReferences(content: string): ChapterReference[] {
    const references: ChapterReference[] = [];
    const referencePattern = /\[\[([A-Za-z0-9\s]+)-(\d{2})\]\]/g;

    let match;
    while ((match = referencePattern.exec(content)) !== null) {
        const abbrev = match[1];
        const chapter = parseInt(match[2], 10);

        // Find the full book name from abbreviation
        const bookName = findBookNameByAbbrev(abbrev);
        if (bookName && chapter > 0) {
            // Avoid duplicates
            const exists = references.some(
                ref => ref.book === bookName && ref.chapter === chapter
            );
            if (!exists) {
                references.push({ book: bookName, chapter });
            }
        }
    }

    return references;
}

/**
 * Find book name by its abbreviation
 */
function findBookNameByAbbrev(abbrev: string): string | null {
    for (const [bookName, bookAbbrev] of Object.entries(BOOK_ABBREVIATIONS)) {
        if (bookAbbrev === abbrev) {
            return bookName;
        }
    }
    return null;
}

/**
 * Parse a single reference string
 * Example: "[[Gen-01]]" => { book: "Genesis", chapter: 1 }
 */
export function parseReference(refString: string): ChapterReference | null {
    const match = refString.match(/\[\[([A-Za-z0-9\s]+)-(\d{2})\]\]/);
    if (!match) return null;

    const abbrev = match[1];
    const chapter = parseInt(match[2], 10);
    const bookName = findBookNameByAbbrev(abbrev);

    if (bookName && chapter > 0) {
        return { book: bookName, chapter };
    }

    return null;
}

/**
 * Utility functions for note management
 */

/**
 * Gets the default event based on the day of week
 * Sunday returns 'SWS', all other days return 'WTT'
 */
export function getDefaultEvent(date: Date = new Date()): string {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 ? 'SWS' : 'WTT';
}

/**
 * Formats a date as YYYY.MM.DD
 */
export function formatNoteDate(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

/**
 * Generates a complete note title in the format: YYYY.MM.DD Event - Book Chapter
 * @param book - The Bible book name
 * @param chapter - The chapter number
 * @param date - Optional date (defaults to current date)
 * @returns Formatted note title
 */
export function generateNoteTitle(book: string, chapter: number, date: Date = new Date()): string {
    const formattedDate = formatNoteDate(date);
    const event = getDefaultEvent(date);
    return `${formattedDate} ${event} - ${book} ${chapter}`;
}

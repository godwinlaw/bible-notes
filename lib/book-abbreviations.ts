// Book name to abbreviation mapping based on user's existing notes structure
export const BOOK_ABBREVIATIONS: Record<string, string> = {
    'Genesis': 'Gen',
    'Exodus': 'Exod',
    'Leviticus': 'Lev',
    'Numbers': 'Num',
    'Deuteronomy': 'Deut',
    'Joshua': 'Josh',
    'Judges': 'Judg',
    'Ruth': 'Ruth',
    '1 Samuel': '1 Sam',
    '2 Samuel': '2 Sam',
    '1 Kings': '1 Kings',
    '2 Kings': '2 Kings',
    '1 Chronicles': '1 Chron',
    '2 Chronicles': '2 Chron',
    'Ezra': 'Ezr',
    'Nehemiah': 'Neh',
    'Esther': 'Esth',
    'Job': 'Job',
    'Psalm': 'Ps',
    'Psalms': 'Ps',
    'Proverbs': 'Prov',
    'Ecclesiastes': 'Eccles',
    'Song of Solomon': 'Song of Solomon',
    'Song of Songs': 'Song of Solomon',
    'Isaiah': 'Isa',
    'Jeremiah': 'Jer',
    'Lamentations': 'Lam',
    'Ezekiel': 'Ezek',
    'Daniel': 'Dan',
    'Hosea': 'Hos',
    'Joel': 'Joel',
    'Amos': 'Am',
    'Obadiah': 'Obad',
    'Jonah': 'Jonah',
    'Micah': 'Micah',
    'Nahum': 'Nah',
    'Habakkuk': 'Hab',
    'Zephaniah': 'Zeph',
    'Haggai': 'Hag',
    'Zechariah': 'Zech',
    'Malachi': 'Mal',
    'Matthew': 'Matt',
    'Mark': 'Mark',
    'Luke': 'Luke',
    'John': 'John',
    'Acts': 'Acts',
    'Romans': 'Rom',
    '1 Corinthians': '1 Cor',
    '2 Corinthians': '2 Cor',
    'Galatians': 'Gal',
    'Ephesians': 'Ephes',
    'Philippians': 'Phil',
    'Colossians': 'Col',
    '1 Thessalonians': '1 Thess',
    '2 Thessalonians': '2 Thess',
    '1 Timothy': '1 Tim',
    '2 Timothy': '2 Tim',
    'Titus': 'Titus',
    'Philemon': 'Philem',
    'Hebrews': 'Heb',
    'James': 'James',
    '1 Peter': '1 Pet',
    '2 Peter': '2 Pet',
    '1 John': '1 John',
    '2 John': '2 John',
    '3 John': '3 John',
    'Jude': 'Jude',
    'Revelation': 'Rev',
};

export function getBookAbbreviation(bookName: string): string {
    return BOOK_ABBREVIATIONS[bookName] || bookName;
}

export function formatChapterReference(book: string, chapter: number): string {
    const abbrev = getBookAbbreviation(book);
    return `[[${abbrev}-${chapter.toString().padStart(2, '0')}]]`;
}

export function formatVerseReference(book: string, chapter: number, verse: number): string {
    const abbrev = getBookAbbreviation(book);
    return `[[${abbrev}-${chapter.toString().padStart(2, '0')}]]:${verse}`;
}

export function formatVerseRangeReference(book: string, chapter: number, startVerse: number, endVerse: number): string {
    const abbrev = getBookAbbreviation(book);
    return `[[${abbrev}-${chapter.toString().padStart(2, '0')}]]:${startVerse}-${endVerse}`;
}

import { BibleViewer } from "@/components/BibleViewer";
import db from "@/lib/db";
import { getBacklinksForChapter } from "@/lib/backlinks";

export default async function ChapterPage({
    params,
}: {
    params: Promise<{ book: string; chapter: string }>;
}) {
    const { book, chapter } = await params;
    const decodedBook = decodeURIComponent(book);
    const chapterNum = parseInt(chapter, 10);

    const verses = db
        .prepare("SELECT * FROM esv WHERE book = ? AND chapter = ? ORDER BY verse ASC")
        .all(decodedBook, chapterNum) as { verse: number; text: string }[];

    const backlinks = getBacklinksForChapter(decodedBook, chapterNum);

    return <BibleViewer book={decodedBook} chapter={chapterNum} verses={verses} backlinks={backlinks} />;
}

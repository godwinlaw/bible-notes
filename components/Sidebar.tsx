import db from "@/lib/db";
import { SearchBar } from "./SearchBar";
import { SidebarList } from "./SidebarList";

export function Sidebar() {
    const books = db.prepare("SELECT book, MAX(chapter) as chapterCount FROM esv GROUP BY book ORDER BY book_id ASC").all() as { book: string; chapterCount: number }[];

    return (
        <aside className="w-full h-full overflow-y-auto">
            <div className="p-4">
                <h1 className="text-xl font-bold mb-6 px-3">Bible Notes</h1>
                <SearchBar />
                <SidebarList books={books} />
            </div>
        </aside>
    );
}

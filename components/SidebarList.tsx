"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SidebarListProps {
    books: { book: string; chapterCount: number }[]; // Updated interface
}

export function SidebarList({ books }: SidebarListProps) {
    const pathname = usePathname();
    // Decode pathname to handle spaces in book names correctly
    const currentBook = decodeURIComponent(pathname.split("/")[1] || "");
    const currentChapter = parseInt(pathname.split("/")[2] || "0", 10); // Added currentChapter

    // Initialize expanded state based on current URL
    // We use a map to track expansion if we want multiple open, or a single string for accordion.
    // Let's stick to single expanded book for now (accordion style) or allow the user to toggle.
    // Actually, standard accordion usually allows one open. Let's try to keep the active one open by default.

    // However, since this is a client component and we want to toggle, we need state.
    // We can default the expanded book to the current book in the URL.

    // Note: We need to handle the case where the user navigates and the component re-renders.
    // But for simple toggling, local state is fine.

    // Let's use a simple approach: clicking a book toggles it.

    // We can't easily use `useState` to initialize from props if props change (navigation), 
    // but `currentBook` changes on navigation, so we can use that to drive the "active" expansion if we want auto-expand.

    // Let's try a hybrid: 
    // 1. If `currentBook` matches a book, that book is definitely "active".
    // 2. We also want to allow expanding other books without navigating.

    // State to track the single expanded book
    const [expandedBook, setExpandedBook] = useState<string | null>(currentBook || null);

    // Effect to ensure the current book is expanded when navigating
    useEffect(() => {
        if (currentBook) {
            setExpandedBook(currentBook);
        }
    }, [currentBook]);

    const toggleBook = (book: string) => {
        setExpandedBook(prev => (prev === book ? null : book));
    };

    return (
        <nav className="space-y-1">
            {books.map(({ book, chapterCount }) => { // Destructured book and chapterCount
                const isActive = currentBook === book;
                const isExpanded = expandedBook === book;

                return (
                    <div key={book} className="space-y-1">
                        <button // Changed from Link to button
                            onClick={() => toggleBook(book)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-between",
                                isActive
                                    ? "bg-accent/10 text-accent-foreground font-bold" // distinct style for active book parent
                                    : "text-muted-foreground hover:bg-sidebar-border/50 hover:text-foreground"
                            )}
                        >
                            <span className={cn(isActive ? "text-accent" : "")}>{book}</span>
                            {/* Optional: Add chevron icon here */}
                        </button>

                        {isExpanded && ( // Conditionally render chapter grid
                            <div className="grid grid-cols-5 gap-1 px-2 pb-2">
                                {Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapter) => {
                                    const isChapterActive = isActive && currentChapter === chapter;
                                    return (
                                        <Link
                                            key={chapter}
                                            href={`/${book}/${chapter}`}
                                            className={cn(
                                                "text-xs text-center py-1 rounded-md transition-colors",
                                                isChapterActive
                                                    ? "bg-accent text-accent-foreground font-bold"
                                                    : "text-muted-foreground hover:bg-sidebar-border hover:text-foreground"
                                            )}
                                        >
                                            {chapter}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

"use client";

import { formatVerseReference, formatChapterReference, formatVerseRangeReference } from "@/lib/book-abbreviations";
import { useLayoutContext } from "./LayoutContext";
import { Backlinks } from "./Backlinks";

interface Backlink {
    id: number;
    title: string;
    filename: string;
    createdAt: string;
}

interface BibleViewerProps {
    book: string;
    chapter: number;
    verses: { verse: number; text: string }[];
    backlinks: Backlink[];
}

export function BibleViewer({ book, chapter, verses, backlinks }: BibleViewerProps) {
    const { appendVerseReference, isNotePanelOpen, openNotePanel, loadNote } = useLayoutContext();

    const handleVerseClick = (verseNumber: number) => {
        const reference = formatVerseReference(book, chapter, verseNumber);
        appendVerseReference(reference);
        if (!isNotePanelOpen) {
            openNotePanel();
        }
    };

    const handleChapterClick = () => {
        const reference = formatChapterReference(book, chapter);
        appendVerseReference(reference);
        if (!isNotePanelOpen) {
            openNotePanel();
        }
    };

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        // Get all verse elements within the selection
        const selectedText = selection.toString();
        if (!selectedText.trim()) return;

        // Find verse numbers in the selection
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Get the parent element that contains verses
        let parentElement = container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : container as Element;

        // Traverse up to find the prose container
        while (parentElement && !parentElement.classList.contains('prose')) {
            parentElement = parentElement.parentElement;
        }

        if (!parentElement) return;

        // Find all verse spans with data-verse attribute in selection
        const verseElements = Array.from(parentElement.querySelectorAll('[data-verse]'));
        const selectedVerses: number[] = [];

        verseElements.forEach((elem) => {
            if (selection.containsNode(elem, true)) {
                const verseNum = parseInt(elem.getAttribute('data-verse') || '0', 10);
                if (verseNum > 0) {
                    selectedVerses.push(verseNum);
                }
            }
        });

        if (selectedVerses.length === 0) return;

        // Sort and get range
        selectedVerses.sort((a, b) => a - b);
        const startVerse = selectedVerses[0];
        const endVerse = selectedVerses[selectedVerses.length - 1];

        // Format reference
        let reference: string;
        if (startVerse === endVerse) {
            reference = formatVerseReference(book, chapter, startVerse);
        } else {
            reference = formatVerseRangeReference(book, chapter, startVerse, endVerse);
        }

        appendVerseReference(reference);
        if (!isNotePanelOpen) {
            openNotePanel();
        }

        // Clear selection
        selection.removeAllRanges();
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <div className="mb-8 flex items-center justify-between">
                <h2
                    className="text-3xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors"
                    onClick={handleChapterClick}
                    title="Click to add chapter reference"
                >
                    {book} {chapter}
                </h2>
                <div className="flex gap-2">
                    {/* Navigation placeholders - can be implemented fully later */}
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none" onMouseUp={handleMouseUp}>
                {verses.map((v) => (
                    <span key={v.verse} className="leading-loose text-lg">
                        <sup className="text-xs text-muted-foreground font-medium mr-1 select-none">
                            {v.verse}
                        </sup>
                        <span
                            className="mr-1 hover:bg-accent/10 rounded transition-colors cursor-pointer"
                            onClick={() => handleVerseClick(v.verse)}
                            data-verse={v.verse}
                        >
                            {v.text}
                        </span>
                    </span>
                ))}
            </div>

            <Backlinks backlinks={backlinks} onBacklinkClick={loadNote} />
        </div>
    );
}

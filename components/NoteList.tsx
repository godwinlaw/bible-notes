"use client";

import { useEffect, useState, useRef } from "react";
import { getAllNotes, deleteNote } from "@/lib/actions";
import { useLayoutContext } from "./LayoutContext";
import { Plus, Calendar, User, Clock, Trash2, Filter, X, Check, Search } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

interface Note {
    id: number;
    title: string;
    event?: string;
    updated_at: string;
    preacher_name?: string;
}

export function NoteList() {
    const { loadNote, createNewNote } = useLayoutContext();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search state
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Filter state
    const [selectedEvent, setSelectedEvent] = useState<string>("");
    const [selectedAuthor, setSelectedAuthor] = useState<string>("");
    const [isEventFilterOpen, setIsEventFilterOpen] = useState(false);
    const [isAuthorFilterOpen, setIsAuthorFilterOpen] = useState(false);

    const eventFilterRef = useRef<HTMLDivElement>(null);
    const authorFilterRef = useRef<HTMLDivElement>(null);

    // Delete state
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

    const fetchNotes = () => {
        getAllNotes().then(result => {
            if (result.success && result.notes) {
                setNotes(result.notes);
            }
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // Click outside handler for filter dropdowns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (eventFilterRef.current && !eventFilterRef.current.contains(event.target as Node)) {
                setIsEventFilterOpen(false);
            }
            if (authorFilterRef.current && !authorFilterRef.current.contains(event.target as Node)) {
                setIsAuthorFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNewNote = () => {
        createNewNote();
    };

    const handleDelete = async () => {
        if (!noteToDelete) return;

        const idToDelete = noteToDelete.id;

        // Close the modal
        setNoteToDelete(null);

        // Delete the note immediately
        const result = await deleteNote(idToDelete);
        if (result.success) {
            // Refresh from server
            fetchNotes();
        } else {
            console.error("Failed to delete note:", result.error);
            // Optionally handle error (e.g., show toast)
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Extract unique events and authors
    const uniqueEvents = Array.from(new Set(notes.map(note => note.event).filter(Boolean))) as string[];
    const uniqueAuthors = Array.from(new Set(notes.map(note => note.preacher_name).filter(Boolean))) as string[];

    // Filter notes based on search and selected filters
    const filteredNotes = notes.filter(note => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesTitle = note.title.toLowerCase().includes(searchLower);
            if (!matchesTitle) return false;
        }

        // Event and author filters
        if (selectedEvent && note.event !== selectedEvent) return false;
        if (selectedAuthor && note.preacher_name !== selectedAuthor) return false;
        return true;
    });

    const hasActiveFilters = selectedEvent || selectedAuthor || searchTerm;

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedEvent("");
        setSelectedAuthor("");
    };

    const getEventColor = (event: string) => {
        switch (event) {
            case 'MBS':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'ATR':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'WTT':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'SWS':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'MMT':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
            case 'Workshop':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Training':
                return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-lg">Notes</h2>
                    <button
                        onClick={handleNewNote}
                        className="p-2 hover:bg-accent rounded-full transition-colors"
                        title="New Note"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Search input */}
                <div className="mb-3 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search notes..."
                        className="w-full pl-9 pr-8 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
                            title="Clear search"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter controls */}
                <div className="flex gap-2 items-center">
                    {/* Event filter */}
                    <div className="relative flex-1" ref={eventFilterRef}>
                        <div
                            onClick={() => setIsEventFilterOpen(!isEventFilterOpen)}
                            className="w-full pl-3 pr-8 py-1.5 bg-transparent border border-border rounded-md cursor-pointer flex items-center relative text-sm"
                        >
                            <span className={!selectedEvent ? 'text-muted-foreground' : ''}>
                                {selectedEvent || "All Events"}
                            </span>
                            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        </div>

                        {isEventFilterOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-md shadow-md z-[9999] py-1">
                                <div
                                    onClick={() => {
                                        setSelectedEvent("");
                                        setIsEventFilterOpen(false);
                                    }}
                                    className="px-3 py-1.5 text-sm hover:bg-accent cursor-pointer flex items-center justify-between"
                                >
                                    All Events
                                    {!selectedEvent && <Check className="w-3 h-3 text-primary" />}
                                </div>
                                {uniqueEvents.map((event) => (
                                    <div
                                        key={event}
                                        onClick={() => {
                                            setSelectedEvent(event);
                                            setIsEventFilterOpen(false);
                                        }}
                                        className="px-3 py-1.5 text-sm hover:bg-accent cursor-pointer flex items-center justify-between"
                                    >
                                        {event}
                                        {selectedEvent === event && <Check className="w-3 h-3 text-primary" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Author filter */}
                    <div className="relative flex-1" ref={authorFilterRef}>
                        <div
                            onClick={() => setIsAuthorFilterOpen(!isAuthorFilterOpen)}
                            className="w-full pl-3 pr-8 py-1.5 bg-transparent border border-border rounded-md cursor-pointer flex items-center relative text-sm"
                        >
                            <span className={!selectedAuthor ? 'text-muted-foreground' : ''}>
                                {selectedAuthor || "All Authors"}
                            </span>
                            <User className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        </div>

                        {isAuthorFilterOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-md shadow-md z-[9999] py-1 max-h-48 overflow-y-auto">
                                <div
                                    onClick={() => {
                                        setSelectedAuthor("");
                                        setIsAuthorFilterOpen(false);
                                    }}
                                    className="px-3 py-1.5 text-sm hover:bg-accent cursor-pointer flex items-center justify-between"
                                >
                                    All Authors
                                    {!selectedAuthor && <Check className="w-3 h-3 text-primary" />}
                                </div>
                                {uniqueAuthors.map((author) => (
                                    <div
                                        key={author}
                                        onClick={() => {
                                            setSelectedAuthor(author);
                                            setIsAuthorFilterOpen(false);
                                        }}
                                        className="px-3 py-1.5 text-sm hover:bg-accent cursor-pointer flex items-center justify-between"
                                    >
                                        {author}
                                        {selectedAuthor === author && <Check className="w-3 h-3 text-primary" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear filters button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="p-1.5 hover:bg-accent rounded transition-colors"
                            title="Clear Filters"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 overflow-x-hidden">
                {isLoading ? (
                    <div className="text-center text-muted-foreground py-8">Loading notes...</div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        {notes.length === 0 ? "No notes yet. Create one to get started!" : "No notes match the selected filters."}
                    </div>
                ) : (
                    filteredNotes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => loadNote(note.id)}
                            className="p-3 border border-border rounded-lg hover:bg-accent cursor-pointer flex flex-col gap-2 group relative transition-all duration-300 opacity-100 scale-100"
                        >
                            <div className="flex items-start justify-between gap-2 pr-6">
                                <h3 className="font-medium group-hover:text-accent-foreground transition-colors line-clamp-1">
                                    {note.title}
                                </h3>
                                {note.event && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${getEventColor(note.event)}`}>
                                        {note.event}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(note.updated_at)}
                                </div>
                                {note.preacher_name && (
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {note.preacher_name}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNoteToDelete(note);
                                }}
                                className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Note"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={!!noteToDelete}
                onClose={() => setNoteToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Note"
                message={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}

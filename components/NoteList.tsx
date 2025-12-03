"use client";

import { useEffect, useState, useRef } from "react";
import { getAllNotes, deleteNote } from "@/lib/actions";
import { useLayoutContext } from "./LayoutContext";
import { Plus, Calendar, User, Clock, Trash2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

interface Note {
    id: number;
    title: string;
    event?: string;
    updated_at: string;
    preacher_name?: string;
}

export function NoteList() {
    const { loadNote, setNotePanelView, setNoteTitle, setNoteContent, setNoteEvent, setNotePreacher, closeNotePanel } = useLayoutContext();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleNewNote = () => {
        setNoteTitle("");
        setNoteContent("");
        setNoteEvent("");
        setNotePreacher("");
        setNotePanelView('editor');
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
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-lg">Notes</h2>
                <button
                    onClick={handleNewNote}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 overflow-x-hidden">
                {isLoading ? (
                    <div className="text-center text-muted-foreground py-8">Loading notes...</div>
                ) : notes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No notes yet. Create one to get started!
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => loadNote(note.id)}
                            className="p-3 border border-border rounded-lg hover:bg-accent cursor-pointer flex flex-col gap-2 group relative transition-all duration-300 opacity-100 scale-100"
                        >
                            <div className="flex items-start justify-between gap-2 pr-6">
                                <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                                    {note.title}
                                </h3>
                                {note.event && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${getEventColor(note.event)}`}>
                                        {note.event}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

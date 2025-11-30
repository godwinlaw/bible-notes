"use client";

import { X, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { saveNote } from "@/lib/actions";
import { useLayoutContext } from "./LayoutContext";

interface NotePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotePanel({ isOpen, onClose }: NotePanelProps) {
    const { noteTitle, noteContent, loadedNoteId, setNoteTitle, setNoteContent } = useLayoutContext();
    const [isPending, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveNote({
                title: noteTitle,
                content: noteContent,
                id: loadedNoteId || undefined
            });
            if (result.success) {
                setSaveStatus(`Note ${loadedNoteId ? 'updated' : 'saved'} successfully!`);
                setTimeout(() => {
                    setSaveStatus(null);
                    setNoteTitle("");
                    setNoteContent("");
                    onClose();
                }, 1000);
            } else {
                setSaveStatus("Failed to save note");
                setTimeout(() => setSaveStatus(null), 3000);
            }
        });
    };

    return (
        <div className="w-1/3 border-l border-border bg-background h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">{loadedNoteId ? 'Edit Note' : 'New Note'}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isPending || !noteTitle.trim()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {isPending ? "Saving..." : "Save"}
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-accent rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {saveStatus && (
                <div className={`px-4 py-2 text-sm ${saveStatus.includes("success") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {saveStatus}
                </div>
            )}
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full px-3 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full flex-1 bg-transparent resize-none focus:outline-none border border-border rounded-md px-3 py-2"
                    placeholder="Start typing your note..."
                />
            </div>
        </div>
    );
}


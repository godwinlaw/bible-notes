"use client";

import { X, Save, FileUp, ChevronDown, User, Check, Calendar, ArrowLeft } from "lucide-react";
import { useState, useTransition, useEffect, useRef } from "react";
import { saveNote, getPreachers, exportNoteToPath } from "@/lib/actions";
import { useLayoutContext } from "./LayoutContext";
import { exportToObsidian } from "@/lib/obsidian";
import { NoteList } from "./NoteList";
import { AudioRecorder } from "./AudioRecorder";

interface NotePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotePanel({ isOpen, onClose }: NotePanelProps) {
    const {
        noteTitle, noteContent, noteEvent, notePreacher, loadedNoteId,
        setNoteTitle, setNoteContent, setNoteEvent, setNotePreacher,
        obsidianConfig, notePanelWidth, setNotePanelWidth,
        notePanelView, setNotePanelView, localExportPath
    } = useLayoutContext();
    const [isPending, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [preachers, setPreachers] = useState<string[]>([]);
    const [isResizing, setIsResizing] = useState(false);

    // Dropdown states
    const [isEventOpen, setIsEventOpen] = useState(false);
    const [isPreacherOpen, setIsPreacherOpen] = useState(false);

    const eventRef = useRef<HTMLDivElement>(null);
    const preacherRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && notePanelView === 'editor') {
            getPreachers().then(result => {
                if (result.success && result.preachers) {
                    setPreachers(result.preachers);
                }
            });
        }
    }, [isOpen, notePanelView]);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (eventRef.current && !eventRef.current.contains(event.target as Node)) {
                setIsEventOpen(false);
            }
            if (preacherRef.current && !preacherRef.current.contains(event.target as Node)) {
                setIsPreacherOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Resize handler
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
            // Clamp between 25% and 50%
            const clampedWidth = Math.min(Math.max(newWidth, 25), 50);
            setNotePanelWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; // Prevent text selection while dragging
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };
    }, [isResizing, setNotePanelWidth]);

    if (!isOpen) return null;

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveNote({
                title: noteTitle,
                content: noteContent,
                event: noteEvent,
                preacher: notePreacher,
                id: loadedNoteId || undefined
            });
            if (result.success) {
                setSaveStatus(`Note ${loadedNoteId ? 'updated' : 'saved'} successfully!`);
                // Refresh preachers list in case a new one was added
                getPreachers().then(res => {
                    if (res.success && res.preachers) setPreachers(res.preachers);
                });

                setTimeout(() => {
                    setSaveStatus(null);
                    // Don't close panel, maybe just stay or go back to list?
                    // For now, let's just stay in editor
                }, 1000);
            } else {
                setSaveStatus("Failed to save note");
                setTimeout(() => setSaveStatus(null), 3000);
            }
        });
    };

    const handleExport = async () => {
        if (!noteTitle.trim()) {
            setSaveStatus("Note must have a title to export");
            setTimeout(() => setSaveStatus(null), 3000);
            return;
        }

        setIsExporting(true);

        let result;
        if (obsidianConfig.enabled) {
            result = await exportToObsidian(noteTitle, noteContent, obsidianConfig);
        } else if (localExportPath) {
            result = await exportNoteToPath(localExportPath, noteTitle, noteContent);
        } else {
            result = { success: false, message: "No export path configured. Please check Settings." };
        }

        setIsExporting(false);

        setSaveStatus(result.message);
        setTimeout(() => setSaveStatus(null), 5000);
    };

    const filteredPreachers = preachers.filter(p =>
        p.toLowerCase().includes(notePreacher.toLowerCase())
    );

    return (
        <div
            className="border-l border-border bg-background h-full flex flex-col relative"
            style={{ width: `${notePanelWidth}%` }}
        >
            {/* Drag Handle */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50"
                onMouseDown={() => setIsResizing(true)}
            />

            {notePanelView === 'list' ? (
                <>
                    <NoteList />
                </>
            ) : (
                <>
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setNotePanelView('list')}
                                className="p-1 hover:bg-accent rounded mr-1"
                                title="Back to List"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <h2 className="font-semibold">{loadedNoteId ? 'Edit Note' : 'New Note'}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {(obsidianConfig.enabled || !obsidianConfig.enabled) && (
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting || !noteTitle.trim()}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={obsidianConfig.enabled ? "Export to Obsidian" : "Export to Local Disk"}
                                >
                                    <FileUp className="w-4 h-4" />
                                    {isExporting ? "Exporting..." : "Export"}
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isPending || !noteTitle.trim()}
                                className="p-2 hover:bg-accent rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isPending ? "Saving..." : "Save"}
                            >
                                <Save className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {saveStatus && (
                        <div className={`px-4 py-2 text-sm ${saveStatus.includes("success") ? "bg-green-500/10 text-green-500" : saveStatus.includes("Failed") || saveStatus.includes("missing") ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
                            {saveStatus}
                        </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="Note title..."
                                className="w-full px-3 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-medium text-lg"
                            />
                            <div className="flex gap-2">
                                {/* Custom Event Dropdown */}
                                <div className="relative w-1/3" ref={eventRef}>
                                    <div
                                        onClick={() => setIsEventOpen(!isEventOpen)}
                                        className="w-full pl-3 pr-8 py-2 bg-transparent border border-border rounded-md cursor-pointer flex items-center relative"
                                    >
                                        <span className={`text-sm ${!noteEvent ? 'text-muted-foreground' : ''}`}>
                                            {noteEvent || "Event"}
                                        </span>
                                        <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>

                                    {isEventOpen && (
                                        <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-md shadow-md z-[9999] py-1">
                                            {['MBS', 'SWS', 'ATR', 'WTT', 'MMT', 'Workshop', 'Training'].map((event) => (
                                                <div
                                                    key={event}
                                                    onClick={() => {
                                                        setNoteEvent(event);
                                                        setIsEventOpen(false);
                                                    }}
                                                    className="px-3 py-1.5 text-sm hover:bg-accent cursor-pointer flex items-center justify-between"
                                                >
                                                    {event}
                                                    {noteEvent === event && <Check className="w-3 h-3 text-primary" />}
                                                </div>
                                            ))}
                                            {noteEvent && (
                                                <div
                                                    onClick={() => {
                                                        setNoteEvent("");
                                                        setIsEventOpen(false);
                                                    }}
                                                    className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent cursor-pointer border-t border-border mt-1"
                                                >
                                                    Clear
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Custom Preacher Combobox */}
                                <div className="relative flex-1" ref={preacherRef}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={notePreacher}
                                            onChange={(e) => {
                                                setNotePreacher(e.target.value);
                                                setIsPreacherOpen(true);
                                            }}
                                            onFocus={() => setIsPreacherOpen(true)}
                                            placeholder="Preacher..."
                                            className="w-full pl-3 pr-8 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                        <User className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>

                                    {isPreacherOpen && filteredPreachers.length > 0 && (
                                        <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-md shadow-md z-[9999] py-1 max-h-48 overflow-y-auto">
                                            {filteredPreachers.map((preacher) => (
                                                <div
                                                    key={preacher}
                                                    onClick={() => {
                                                        setNotePreacher(preacher);
                                                        setIsPreacherOpen(false);
                                                    }}
                                                    className="px-3 py-1.5 text-sm hover:bg-accent cursor-pointer"
                                                >
                                                    {preacher}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="w-full flex-1 bg-transparent resize-none focus:outline-none border border-border rounded-md px-3 py-2"
                            placeholder="Start typing your note..."
                        />

                        {/* Audio Recordings Section */}
                        <div className="border-t border-border pt-4">
                            <AudioRecorder noteId={loadedNoteId} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


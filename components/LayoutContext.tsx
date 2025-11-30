'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { loadNote as loadNoteAction } from '@/lib/actions';

interface LayoutContextType {
    isSidebarOpen: boolean;
    isNotePanelOpen: boolean;
    noteTitle: string;
    noteContent: string;
    loadedNoteId: number | null;
    setNoteTitle: (title: string) => void;
    setNoteContent: (content: string) => void;
    appendVerseReference: (reference: string) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    openNotePanel: () => void;
    closeNotePanel: () => void;
    loadNote: (id: number) => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNotePanelOpen, setIsNotePanelOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [loadedNoteId, setLoadedNoteId] = useState<number | null>(null);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const setSidebarOpen = (isOpen: boolean) => setIsSidebarOpen(isOpen);

    const openNotePanel = () => {
        setIsNotePanelOpen(true);
        setIsSidebarOpen(false); // Auto-collapse sidebar
    };

    const closeNotePanel = () => {
        setIsNotePanelOpen(false);
        setLoadedNoteId(null);
        setNoteTitle("");
        setNoteContent("");
    };

    const appendVerseReference = (reference: string) => {
        setNoteContent(prev => prev ? `${prev}\n${reference}` : reference);
    };

    const loadNote = async (id: number) => {
        const result = await loadNoteAction(id);
        if (result.success && result.note) {
            setLoadedNoteId(id);
            setNoteTitle(result.note.title);
            setNoteContent(result.note.content);
            setIsNotePanelOpen(true);
            setIsSidebarOpen(false);
        }
    };

    return (
        <LayoutContext.Provider value={{
            isSidebarOpen,
            isNotePanelOpen,
            noteTitle,
            noteContent,
            loadedNoteId,
            setNoteTitle,
            setNoteContent,
            appendVerseReference,
            toggleSidebar,
            setSidebarOpen,
            openNotePanel,
            closeNotePanel,
            loadNote
        }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayoutContext() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayoutContext must be used within a LayoutProvider');
    }
    return context;
}


'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadNote as loadNoteAction } from '@/lib/actions';

type Theme = 'light' | 'dark' | 'system';

interface LayoutContextType {
    isSidebarOpen: boolean;
    isNotePanelOpen: boolean;
    noteTitle: string;
    noteContent: string;
    loadedNoteId: number | null;
    theme: Theme;
    setNoteTitle: (title: string) => void;
    setNoteContent: (content: string) => void;
    appendVerseReference: (reference: string) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    openNotePanel: () => void;
    closeNotePanel: () => void;
    loadNote: (id: number) => Promise<void>;
    setTheme: (theme: Theme) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNotePanelOpen, setIsNotePanelOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [loadedNoteId, setLoadedNoteId] = useState<number | null>(null);
    const [theme, setThemeState] = useState<Theme>('system');

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const setSidebarOpen = (isOpen: boolean) => setIsSidebarOpen(isOpen);

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    // Apply theme to document element
    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        if (theme === 'system') {
            // Remove explicit class and let CSS media query handle it
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches);

            // Listen for system theme changes
            const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // Apply explicit theme
            applyTheme(theme === 'dark');
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

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
            theme,
            setNoteTitle,
            setNoteContent,
            appendVerseReference,
            toggleSidebar,
            setSidebarOpen,
            openNotePanel,
            closeNotePanel,
            loadNote,
            setTheme
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


'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadNote as loadNoteAction } from '@/lib/actions';
import { generateNoteTitle, getDefaultEvent } from '@/lib/note-utils';

type Theme = 'light' | 'dark' | 'system';

interface LayoutContextType {
    isSidebarOpen: boolean;
    isNotePanelOpen: boolean;
    notePanelView: 'list' | 'editor';
    noteTitle: string;
    noteContent: string;
    noteEvent: string;
    notePreacher: string;
    loadedNoteId: number | null;
    theme: Theme;
    obsidianConfig: { apiKey: string; port: string; enabled: boolean };
    isSettingsOpen: boolean;
    setNoteTitle: (title: string) => void;
    setNoteContent: (content: string) => void;
    setNoteEvent: (event: string) => void;
    setNotePreacher: (preacher: string) => void;
    appendVerseReference: (reference: string) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    openNotePanel: (book?: string, chapter?: number) => void;
    closeNotePanel: () => void;
    toggleNotePanel: () => void;
    createNewNote: () => void;
    loadNote: (id: number) => Promise<void>;
    setTheme: (theme: Theme) => void;
    setObsidianConfig: (config: { apiKey: string; port: string; enabled: boolean }) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
    notePanelWidth: number;
    setNotePanelWidth: (width: number) => void;
    setNotePanelView: (view: 'list' | 'editor') => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNotePanelOpen, setIsNotePanelOpen] = useState(false);
    const [notePanelView, setNotePanelView] = useState<'list' | 'editor'>('list');
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [noteEvent, setNoteEvent] = useState("");
    const [notePreacher, setNotePreacher] = useState("");
    const [loadedNoteId, setLoadedNoteId] = useState<number | null>(null);
    const [theme, setThemeState] = useState<Theme>('system');
    const [obsidianConfig, setObsidianConfigState] = useState<{ apiKey: string; port: string; enabled: boolean }>({ apiKey: '', port: '27123', enabled: true });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [notePanelWidth, setNotePanelWidth] = useState(33); // Percentage

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const setSidebarOpen = (isOpen: boolean) => setIsSidebarOpen(isOpen);

    // Load theme and obsidian config from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }

        const savedObsidianConfig = localStorage.getItem('obsidianConfig');
        if (savedObsidianConfig) {
            try {
                setObsidianConfigState(JSON.parse(savedObsidianConfig));
            } catch (e) {
                console.error("Failed to parse obsidian config", e);
            }
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

    const setObsidianConfig = (config: { apiKey: string; port: string; enabled: boolean }) => {
        setObsidianConfigState(config);
        localStorage.setItem('obsidianConfig', JSON.stringify(config));
    };

    const openNotePanel = (book?: string, chapter?: number) => {
        // If book and chapter are provided and we're creating a new note (not editing)
        if (book && chapter && !loadedNoteId) {
            const title = generateNoteTitle(book, chapter);
            const event = getDefaultEvent();
            setNoteTitle(title);
            setNoteEvent(event);
            setNotePanelView('editor');
        } else if (!loadedNoteId) {
            setNotePanelView('list');
        }
        setIsNotePanelOpen(true);
        setIsSidebarOpen(false); // Auto-collapse sidebar
    };

    const closeNotePanel = () => {
        setIsNotePanelOpen(false);
        setLoadedNoteId(null);
        setNoteTitle("");
        setNoteContent("");
        setNoteEvent("");
        setNotePreacher("");
    };

    const toggleNotePanel = () => {
        if (isNotePanelOpen) {
            closeNotePanel();
        } else {
            openNotePanel();
        }
    };

    const appendVerseReference = (reference: string) => {
        setNoteContent(prev => prev ? `${prev}\n${reference}` : reference);
    };

    const createNewNote = () => {
        setLoadedNoteId(null);
        setNoteTitle("");
        setNoteContent("");
        setNoteEvent("");
        setNotePreacher("");
        setNotePanelView('editor');
        setIsNotePanelOpen(true);
    };

    const loadNote = async (id: number) => {
        const result = await loadNoteAction(id);
        if (result.success && result.note) {
            setLoadedNoteId(id);
            setNoteTitle(result.note.title);
            setNoteContent(result.note.content);
            setNoteEvent(result.note.event || "");
            setNotePreacher(result.note.preacher || "");
            setNotePanelView('editor');
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
            noteEvent,
            notePreacher,
            loadedNoteId,
            theme,
            obsidianConfig,
            isSettingsOpen,
            setNoteTitle,
            setNoteContent,
            setNoteEvent,
            setNotePreacher,
            appendVerseReference,
            toggleSidebar,
            setSidebarOpen,
            openNotePanel,
            closeNotePanel,
            toggleNotePanel,
            createNewNote,
            loadNote,
            setTheme,
            setObsidianConfig,
            setIsSettingsOpen,
            notePanelWidth,
            setNotePanelWidth,
            notePanelView,
            setNotePanelView
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


"use client";

import { LayoutProvider, useLayoutContext } from "@/components/LayoutContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { NotePanel } from "@/components/NotePanel";
import { clsx } from "clsx";

function MainLayoutContent({
    children,
    sidebar,
}: {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}) {
    const { isSidebarOpen, isNotePanelOpen, closeNotePanel } = useLayoutContext();

    return (
        <div className="flex min-h-screen bg-background overflow-hidden">
            <div className={clsx(
                "transition-all duration-300 ease-in-out overflow-hidden border-r border-sidebar-border bg-sidebar-bg h-screen sticky top-0",
                isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 border-none"
            )}>
                <div className="w-64 h-full">
                    {sidebar}
                </div>
            </div>
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <TopBar />
                <div className="flex-1 flex overflow-hidden">
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                    <NotePanel
                        isOpen={isNotePanelOpen}
                        onClose={closeNotePanel}
                    />
                </div>
            </div>
        </div>
    );
}

export function MainLayout(props: { children: React.ReactNode; sidebar: React.ReactNode }) {
    return (
        <LayoutProvider>
            <MainLayoutContent {...props} />
        </LayoutProvider>
    );
}

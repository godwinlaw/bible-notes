import { Plus, PanelLeft } from "lucide-react";
import { useLayoutContext } from "./LayoutContext";

interface TopBarProps {
    onNewNote: () => void;
}

export function TopBar({ onNewNote }: TopBarProps) {
    const { toggleSidebar } = useLayoutContext();

    return (
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background sticky top-0 z-10">
            <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle Sidebar"
            >
                <PanelLeft className="w-5 h-5" />
            </button>
            <button
                onClick={onNewNote}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                New Note
            </button>
        </div>
    );
}

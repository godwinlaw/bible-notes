import { PanelLeft, Settings, Menu } from "lucide-react";
import { useLayoutContext } from "./LayoutContext";
import { SettingsModal } from "./SettingsModal";

export function TopBar() {
    const { toggleSidebar, setIsSettingsOpen, isSettingsOpen, toggleNotePanel } = useLayoutContext();

    return (
        <>
            <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background sticky top-0 z-10">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Toggle Sidebar"
                >
                    <PanelLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggleNotePanel}
                        className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        title="Toggle Notes Panel"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}

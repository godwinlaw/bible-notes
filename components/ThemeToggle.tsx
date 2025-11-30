'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useLayoutContext } from './LayoutContext';

export function ThemeToggle() {
    const { theme, setTheme } = useLayoutContext();

    const cycleTheme = () => {
        const themes = ['system', 'light', 'dark'] as const;
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="w-5 h-5" />;
            case 'dark':
                return <Moon className="w-5 h-5" />;
            case 'system':
                return <Monitor className="w-5 h-5" />;
        }
    };

    const getTooltip = () => {
        switch (theme) {
            case 'light':
                return 'Light mode';
            case 'dark':
                return 'Dark mode';
            case 'system':
                return 'System theme';
        }
    };

    return (
        <button
            onClick={cycleTheme}
            className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title={getTooltip()}
            aria-label={`Current theme: ${getTooltip()}. Click to cycle themes.`}
        >
            {getIcon()}
        </button>
    );
}

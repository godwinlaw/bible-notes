"use client";

import { X, Moon, Sun, Monitor } from "lucide-react";
import { useLayoutContext } from "./LayoutContext";
import { useState, useEffect } from "react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme, obsidianConfig, setObsidianConfig } = useLayoutContext();
    const [apiKey, setApiKey] = useState(obsidianConfig.apiKey);
    const [port, setPort] = useState(obsidianConfig.port);
    const [enabled, setEnabled] = useState(obsidianConfig.enabled);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setApiKey(obsidianConfig.apiKey);
            setPort(obsidianConfig.port);
            setEnabled(obsidianConfig.enabled);
            setIsDirty(false);
        }
    }, [isOpen, obsidianConfig]);

    const handleSave = () => {
        setObsidianConfig({ apiKey, port, enabled });
        setIsDirty(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-background border border-border rounded-lg shadow-lg w-[500px] max-w-full m-4 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <button onClick={onClose} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Appearance Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-md border ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent hover:text-accent-foreground'}`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="text-sm">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-md border ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent hover:text-accent-foreground'}`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="text-sm">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-md border ${theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent hover:text-accent-foreground'}`}
                            >
                                <Monitor className="w-6 h-6" />
                                <span className="text-sm">System</span>
                            </button>
                        </div>
                    </section>

                    {/* Obsidian Integration Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Obsidian Integration</h3>
                                <p className="text-xs text-muted-foreground">
                                    Configure connection to Obsidian Local REST API.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => {
                                        setEnabled(e.target.checked);
                                        setIsDirty(true);
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {enabled && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">API Key</label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            setIsDirty(true);
                                        }}
                                        placeholder="Enter your Obsidian Local REST API Key"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Port</label>
                                    <input
                                        type="text"
                                        value={port}
                                        onChange={(e) => {
                                            setPort(e.target.value);
                                            setIsDirty(true);
                                        }}
                                        placeholder="27123" // Default port for Obsidian Local REST API
                                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">Default is usually 27123 or 27124.</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

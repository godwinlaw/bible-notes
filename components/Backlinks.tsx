"use client";

import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Backlink {
    id: number;
    title: string;
    filename: string;
    createdAt: string;
}

interface BacklinksProps {
    backlinks: Backlink[];
    onBacklinkClick: (noteId: number) => void;
}

export function Backlinks({ backlinks, onBacklinkClick }: BacklinksProps) {
    if (backlinks.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Referenced in {backlinks.length} {backlinks.length === 1 ? 'note' : 'notes'}
            </h3>
            <div className="space-y-2">
                {backlinks.map((backlink) => (
                    <button
                        key={backlink.id}
                        onClick={() => onBacklinkClick(backlink.id)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                                    {backlink.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {formatDistanceToNow(new Date(backlink.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

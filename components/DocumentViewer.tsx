"use client";

import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { useEffect, useState } from "react";

interface DocumentViewerProps {
    isOpen: boolean;
    onClose: () => void;
    data: string | null; // base64 data
    mimeType: string | null;
    filename: string | null;
}

export function DocumentViewer({ isOpen, onClose, data, mimeType, filename }: DocumentViewerProps) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setScale(1);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !data || !mimeType) return null;

    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `data:${mimeType};base64,${data}`;
        link.download = filename || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
                <h3 className="font-semibold truncate max-w-md">{filename}</h3>
                <div className="flex items-center gap-2">
                    {isImage && (
                        <>
                            <button
                                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                                className="p-2 hover:bg-accent rounded-full text-muted-foreground"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>
                            <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
                            <button
                                onClick={() => setScale(s => Math.min(3, s + 0.1))}
                                className="p-2 hover:bg-accent rounded-full text-muted-foreground"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-border mx-2" />
                        </>
                    )}
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-accent rounded-full text-muted-foreground"
                        title="Download"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-zinc-100/5 dark:bg-zinc-900/50">
                {isImage && (
                    <img
                        src={`data:${mimeType};base64,${data}`}
                        alt={filename || "Image"}
                        className="max-w-none transition-transform duration-200"
                        style={{ transform: `scale(${scale})` }}
                    />
                )}

                {isPdf && (
                    <iframe
                        src={`data:application/pdf;base64,${data}`}
                        className="w-full h-full border-0 rounded-md shadow-sm bg-white"
                        title={filename || "PDF Document"}
                    />
                )}

                {!isImage && !isPdf && (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <p>Preview not available for this file type.</p>
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                            Download to View
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

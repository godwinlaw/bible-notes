"use client";

import { useState, useEffect, useTransition } from "react";
import { Paperclip, X, Download, File, FileText, Image as ImageIcon, Music, Video, Trash2, Loader2 } from "lucide-react";
import { saveAttachment, getAttachments, deleteAttachment, getAttachmentContent, Attachment } from "@/lib/actions";
import { DocumentViewer } from "./DocumentViewer";

interface AttachmentListProps {
    noteId: number;
}

export function AttachmentList({ noteId }: AttachmentListProps) {
    const [items, setAttachments] = useState<Attachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewingAttachment, setViewingAttachment] = useState<{ data: string | null, mimeType: string | null, filename: string | null }>({ data: null, mimeType: null, filename: null });
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAttachments();
    }, [noteId]);

    async function loadAttachments() {
        setIsLoading(true);
        const result = await getAttachments(noteId);
        if (result.success && result.attachments) {
            setAttachments(result.attachments);
        } else {
            console.error(result.error);
        }
        setIsLoading(false);
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setError(null);

        try {
            const result = await saveAttachment(noteId, formData);
            if (result.success) {
                await loadAttachments();
            } else {
                setError("Failed to upload file");
            }
        } catch (err) {
            setError("Error uploading file");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    }

    async function handleDelete(id: number) {
        startTransition(async () => {
            const result = await deleteAttachment(id);
            if (result.success) {
                setAttachments(prev => prev.filter(a => a.id !== id));
            } else {
                setError("Failed to delete attachment");
            }
        });
    }

    async function handleView(attachment: Attachment) {
        setViewingAttachment({ data: null, mimeType: null, filename: attachment.original_filename });
        setViewerOpen(true);

        const result = await getAttachmentContent(attachment.id);
        if (result.success && result.data) {
            setViewingAttachment({
                data: result.data,
                mimeType: result.mimeType || attachment.mime_type,
                filename: attachment.original_filename
            });
        } else {
            setError("Failed to load document content");
            setViewerOpen(false);
        }
    }

    function getFileIcon(mimeType: string) {
        if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
        if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
        if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
        if (mimeType.includes('pdf')) return <FileText className="w-4 h-4" />;
        return <File className="w-4 h-4" />;
    }

    function formatSize(bytes: number) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                </h3>
                <label className={`cursor-pointer text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded hover:bg-secondary/80 transition-colors flex items-center gap-1 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlusIcon className="w-3 h-3" />}
                    Add File
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                </label>
            </div>

            {error && <div className="text-xs text-red-500">{error}</div>}

            {isLoading ? (
                <div className="text-xs text-muted-foreground">Loading attachments...</div>
            ) : items.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">No attachments</div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {items.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-2 rounded border border-border bg-card/50 hover:bg-card transition-colors group">
                            <div className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1" onClick={() => handleView(att)}>
                                <div className="text-muted-foreground">
                                    {getFileIcon(att.mime_type)}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm truncate cursor-pointer hover:underline" title={att.original_filename}>
                                        {att.original_filename}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatSize(att.size)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(att.id)}
                                disabled={isPending}
                                className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <DocumentViewer
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                data={viewingAttachment.data}
                mimeType={viewingAttachment.mimeType}
                filename={viewingAttachment.filename}
            />
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}

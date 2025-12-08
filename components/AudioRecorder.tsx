"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
    saveAudioAttachment,
    getAudioAttachments,
    getAudioBlob,
    deleteAudioAttachment,
    AudioAttachment,
} from "@/lib/actions";

interface AudioRecorderProps {
    noteId: number | null;
    onRecordingComplete?: () => void;
}

export function AudioRecorder({ noteId, onRecordingComplete }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [attachments, setAttachments] = useState<AudioAttachment[]>([]);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [loadingAudioId, setLoadingAudioId] = useState<number | null>(null);
    const [expandedTranscriptId, setExpandedTranscriptId] = useState<number | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const finalTranscriptRef = useRef<string>("");

    // Speech recognition hook
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    // Load existing attachments when noteId changes
    useEffect(() => {
        if (noteId) {
            loadAttachments();
        } else {
            setAttachments([]);
        }
    }, [noteId]);

    // Update final transcript ref while recording
    useEffect(() => {
        if (isRecording && transcript) {
            finalTranscriptRef.current = transcript;
        }
    }, [transcript, isRecording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            SpeechRecognition.stopListening();
        };
    }, []);

    const loadAttachments = async () => {
        if (!noteId) return;
        const result = await getAudioAttachments(noteId);
        if (result.success && result.attachments) {
            setAttachments(result.attachments);
        }
    };

    const startRecording = async () => {
        try {
            // Reset transcript
            resetTranscript();
            finalTranscriptRef.current = "";

            // Start speech recognition
            if (browserSupportsSpeechRecognition) {
                SpeechRecognition.startListening({ continuous: true, interimResults: true });
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });

                // Stop speech recognition and capture final transcript
                SpeechRecognition.stopListening();
                const transcriptText = finalTranscriptRef.current.trim();

                await saveRecording(blob, transcriptText);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((t) => t + 1);
            }, 1000);
        } catch (error) {
            console.error("Failed to start recording:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const saveRecording = async (blob: Blob, transcriptText: string) => {
        if (!noteId) {
            alert("Please save the note before adding audio recordings.");
            return;
        }

        setIsSaving(true);

        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(",")[1];
                const result = await saveAudioAttachment(
                    noteId,
                    base64,
                    "audio/webm",
                    recordingTime,
                    transcriptText || null
                );

                if (result.success) {
                    await loadAttachments();
                    onRecordingComplete?.();
                    resetTranscript();
                } else {
                    alert("Failed to save recording");
                }
                setIsSaving(false);
                setRecordingTime(0);
            };
        } catch (error) {
            console.error("Failed to save recording:", error);
            setIsSaving(false);
        }
    };

    const playAudio = async (attachmentId: number) => {
        // Stop current playback
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (playingId === attachmentId) {
            setPlayingId(null);
            return;
        }

        setLoadingAudioId(attachmentId);

        try {
            const result = await getAudioBlob(attachmentId);
            if (result.success && result.audioBase64 && result.mimeType) {
                const audio = new Audio(`data:${result.mimeType};base64,${result.audioBase64}`);
                audioRef.current = audio;

                audio.onended = () => {
                    setPlayingId(null);
                };

                audio.play();
                setPlayingId(attachmentId);
            }
        } catch (error) {
            console.error("Failed to play audio:", error);
        } finally {
            setLoadingAudioId(null);
        }
    };

    const handleDelete = async (attachmentId: number) => {
        if (!confirm("Delete this recording?")) return;

        const result = await deleteAudioAttachment(attachmentId);
        if (result.success) {
            setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
            if (playingId === attachmentId) {
                audioRef.current?.pause();
                setPlayingId(null);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const toggleTranscript = (attachmentId: number) => {
        setExpandedTranscriptId(expandedTranscriptId === attachmentId ? null : attachmentId);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Audio Recordings</span>

                {!noteId && (
                    <span className="text-xs text-muted-foreground">(Save note first)</span>
                )}

                {isSaving && (
                    <span className="text-xs text-blue-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                    </span>
                )}

                {!browserSupportsSpeechRecognition && (
                    <span className="text-xs text-amber-500">(Transcription not supported in this browser)</span>
                )}
            </div>

            {/* Record button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!noteId || isSaving}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        }`}
                >
                    {isRecording ? (
                        <>
                            <Square className="w-4 h-4" />
                            Stop ({formatTime(recordingTime)})
                        </>
                    ) : (
                        <>
                            <Mic className="w-4 h-4" />
                            Record
                        </>
                    )}
                </button>

                {isRecording && (
                    <span className="flex items-center gap-1 text-sm text-red-500">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Recording...
                    </span>
                )}

                {listening && (
                    <span className="text-xs text-green-500">🎤 Transcribing...</span>
                )}
            </div>

            {/* Live transcript during recording */}
            {isRecording && transcript && (
                <div className="p-3 bg-accent/30 rounded-md border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Live Transcript:</div>
                    <div className="text-sm whitespace-pre-wrap">{transcript}</div>
                </div>
            )}

            {/* Attachments list */}
            {attachments.length > 0 && (
                <div className="space-y-2">
                    {attachments.map((attachment) => (
                        <div key={attachment.id} className="bg-accent/50 rounded-md overflow-hidden">
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => playAudio(attachment.id)}
                                        className="p-1.5 hover:bg-accent rounded transition-colors"
                                        disabled={loadingAudioId === attachment.id}
                                    >
                                        {loadingAudioId === attachment.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : playingId === attachment.id ? (
                                            <Pause className="w-4 h-4" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                    </button>
                                    <span className="text-sm">
                                        {attachment.duration_seconds
                                            ? formatTime(Math.round(attachment.duration_seconds))
                                            : "Audio"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(attachment.created_at).toLocaleTimeString()}
                                    </span>
                                    {attachment.transcript && (
                                        <button
                                            onClick={() => toggleTranscript(attachment.id)}
                                            className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                                            title="Toggle transcript"
                                        >
                                            {expandedTranscriptId === attachment.id ? (
                                                <ChevronUp className="w-3 h-3" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(attachment.id)}
                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-accent rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {/* Expanded transcript */}
                            {expandedTranscriptId === attachment.id && attachment.transcript && (
                                <div className="px-3 pb-3 pt-1 border-t border-border/50">
                                    <div className="text-xs text-muted-foreground mb-1">Transcript:</div>
                                    <div className="text-sm whitespace-pre-wrap">{attachment.transcript}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

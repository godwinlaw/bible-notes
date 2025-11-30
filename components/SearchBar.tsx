'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Suggestion {
    book: string;
    chapter: number;
}

export function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (suggestion: Suggestion) => {
        setQuery(`${suggestion.book} ${suggestion.chapter}`);
        setIsOpen(false);
        router.push(`/${suggestion.book}/${suggestion.chapter}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (suggestions.length > 0) {
                handleSelect(suggestions[0]);
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full px-3 mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder="Search book & chapter..."
                    className={twMerge(
                        "w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200",
                        "bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        "placeholder:text-gray-400"
                    )}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={`${suggestion.book}-${suggestion.chapter}-${index}`}
                            onClick={() => handleSelect(suggestion)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between group"
                        >
                            <span className="font-medium text-gray-700 group-hover:text-blue-600">
                                {suggestion.book}
                            </span>
                            <span className="text-gray-400 text-xs group-hover:text-blue-500">
                                Chapter {suggestion.chapter}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

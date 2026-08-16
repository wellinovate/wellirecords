import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, ShieldCheck, Plus } from 'lucide-react';
import { NHIA_ACCREDITED_HMOS, POPULAR_HMOS } from '@/shared/constants/accreditedHmos';

interface HmoSearchPickerProps {
    value: string;
    onChange: (value: string) => void;
    variant?: 'dark' | 'light';
    placeholder?: string;
    disabled?: boolean;
}

export function HmoSearchPicker({
    value,
    onChange,
    variant = 'dark',
    placeholder = 'Search or select HMO...',
    disabled = false,
}: HmoSearchPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isDark = variant === 'dark';

    // Styling tokens
    const styles = isDark
        ? {
            triggerBg: '#0A1624',
            triggerBorder: 'rgba(56,189,248,0.12)',
            triggerText: '#E6EDF3',
            triggerMuted: '#7BA3C8',
            dropdownBg: '#0F1C2E',
            dropdownBorder: 'rgba(56,189,248,0.2)',
            searchBg: '#0A1624',
            searchBorder: 'rgba(56,189,248,0.15)',
            searchText: '#E6EDF3',
            hoverBg: 'rgba(56,189,248,0.08)',
            accent: '#38bdf8',
            subText: '#64748b',
        }
        : {
            triggerBg: '#f8fafc',
            triggerBorder: '#e2e8f0',
            triggerText: '#1e293b',
            triggerMuted: '#94a3b8',
            dropdownBg: '#ffffff',
            dropdownBorder: '#cbd5e1',
            searchBg: '#f1f5f9',
            searchBorder: '#e2e8f0',
            searchText: '#1e293b',
            hoverBg: '#f0fdfa',
            accent: '#0d9488',
            subText: '#94a3b8',
        };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Filtered HMOs
    const filteredHmos = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return NHIA_ACCREDITED_HMOS;
        return NHIA_ACCREDITED_HMOS.filter((hmo) => hmo.toLowerCase().includes(q));
    }, [query]);

    const handleSelect = (hmoName: string) => {
        onChange(hmoName);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    const hasExactMatch = useMemo(() => {
        const q = query.trim().toLowerCase();
        return NHIA_ACCREDITED_HMOS.some((hmo) => hmo.toLowerCase() === q);
    }, [query]);

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                    isDark ? 'text-sm' : 'text-sm py-2.5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                    background: styles.triggerBg,
                    border: `1px solid ${isOpen ? styles.accent : styles.triggerBorder}`,
                    color: value ? styles.triggerText : styles.triggerMuted,
                }}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <ShieldCheck
                        size={15}
                        className="flex-shrink-0"
                        style={{ color: value ? styles.accent : styles.triggerMuted }}
                    />
                    <span className="truncate font-medium">
                        {value || placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {value && !disabled && (
                        <div
                            role="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-700/20 rounded-md transition-colors"
                            style={{ color: styles.triggerMuted }}
                            title="Clear selection"
                        >
                            <X size={13} />
                        </div>
                    )}
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: styles.triggerMuted }}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl shadow-2xl overflow-hidden border animate-fade-in"
                    style={{
                        background: styles.dropdownBg,
                        borderColor: styles.dropdownBorder,
                        maxHeight: '340px',
                    }}
                >
                    {/* Search Bar */}
                    <div
                        className="p-2.5 border-b sticky top-0 z-10"
                        style={{
                            background: styles.dropdownBg,
                            borderColor: styles.triggerBorder,
                        }}
                    >
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                            style={{
                                background: styles.searchBg,
                                borderColor: styles.searchBorder,
                            }}
                        >
                            <Search size={14} style={{ color: styles.triggerMuted }} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search HMO..."
                                className="w-full text-xs outline-none bg-transparent"
                                style={{ color: styles.searchText }}
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    style={{ color: styles.triggerMuted }}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results list */}
                    <div className="overflow-y-auto max-h-60 p-1.5 space-y-0.5 scrollbar-thin">
                        {/* Custom write-in option if user typed something not matching exactly */}
                        {query.trim() && !hasExactMatch && (
                            <button
                                type="button"
                                onClick={() => handleSelect(query.trim())}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors mb-1"
                                style={{
                                    background: 'rgba(56,189,248,0.06)',
                                    color: styles.accent,
                                    border: `1px dashed ${styles.triggerBorder}`,
                                }}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <Plus size={13} />
                                    <span>Use custom: <strong>"{query.trim()}"</strong></span>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/40">Custom</span>
                            </button>
                        )}

                        {/* Popular HMOs section (only when search query is empty) */}
                        {!query && (
                            <div className="mb-2">
                                <div
                                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                                    style={{ color: styles.subText }}
                                >
                                    Popular HMOs
                                </div>
                                {POPULAR_HMOS.map((hmo) => {
                                    const isSelected = value === hmo;
                                    return (
                                        <button
                                            key={`popular-${hmo}`}
                                            type="button"
                                            onClick={() => handleSelect(hmo)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors group"
                                            style={{
                                                background: isSelected ? styles.hoverBg : 'transparent',
                                                color: isSelected ? styles.accent : styles.triggerText,
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = styles.hoverBg;
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <span className="truncate font-medium">{hmo}</span>
                                            {isSelected && <Check size={13} style={{ color: styles.accent }} />}
                                        </button>
                                    );
                                })}
                                <div
                                    className="my-1 border-t"
                                    style={{ borderColor: styles.triggerBorder }}
                                />
                                <div
                                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                                    style={{ color: styles.subText }}
                                >
                                    All Accredited HMOs ({NHIA_ACCREDITED_HMOS.length})
                                </div>
                            </div>
                        )}

                        {/* Filtered HMO List */}
                        {filteredHmos.length === 0 && !query.trim() ? (
                            <div className="py-4 text-center text-xs" style={{ color: styles.triggerMuted }}>
                                No HMOs found.
                            </div>
                        ) : null}

                        {filteredHmos.map((hmo) => {
                            const isSelected = value === hmo;
                            return (
                                <button
                                    key={hmo}
                                    type="button"
                                    onClick={() => handleSelect(hmo)}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors group"
                                    style={{
                                        background: isSelected ? styles.hoverBg : 'transparent',
                                        color: isSelected ? styles.accent : styles.triggerText,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = styles.hoverBg;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span className="truncate font-medium">{hmo}</span>
                                    {isSelected && <Check size={13} style={{ color: styles.accent }} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

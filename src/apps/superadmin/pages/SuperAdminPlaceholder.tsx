import React from 'react';
import { Construction } from 'lucide-react';

interface SuperAdminPlaceholderProps {
    title: string;
    description: string;
}

export function SuperAdminPlaceholder({ title, description }: SuperAdminPlaceholderProps) {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: '#e2e8f0' }}>
                    {title}
                </h1>
                <p className="text-base" style={{ color: 'var(--sa-muted)' }}>
                    {description}
                </p>
            </header>

            <div
                className="w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4"
                style={{ borderColor: 'var(--sa-border)', background: 'rgba(13,18,51,0.5)' }}
            >
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--sa-accent-dim)', color: 'var(--sa-accent)' }}
                >
                    <Construction size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>Module Under Construction</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--sa-muted)' }}>
                        The {title} module is currently being implemented.
                    </p>
                </div>
            </div>
        </div>
    );
}

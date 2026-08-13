import React from 'react';
import { AlertCircle } from 'lucide-react';

export function WorkloadPlaceholder({ title, detail }: { title: string; detail: string }) {
    return (
        <div className="rounded-2xl border p-4 flex items-start gap-3"
            style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
                <div className="text-xs font-bold" style={{ color: '#e2eaf4' }}>{title}</div>
                <div className="text-[11px] mt-0.5" style={{ color: '#7ba3c8' }}>{detail}</div>
            </div>
        </div>
    );
}

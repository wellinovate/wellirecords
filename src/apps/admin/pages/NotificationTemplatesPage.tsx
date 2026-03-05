import React, { useState } from 'react';
import { notificationApi } from '@/shared/api/notificationApi';
import { Bell, MessageSquare, Mail, Smartphone, CheckCircle, XCircle, Activity } from 'lucide-react';

const CHANNEL_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    sms: { label: 'SMS', icon: Smartphone, color: '#10b981' },
    email: { label: 'Email', icon: Mail, color: '#38bdf8' },
    whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: '#34d399' },
    in_app: { label: 'In-App', icon: Bell, color: '#a78bfa' },
};

export function NotificationTemplatesPage() {
    const [channel, setChannel] = useState<string | undefined>(undefined);
    const templates = notificationApi.getTemplates(channel as any);
    const delivery = notificationApi.getDeliverySummary();

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Notification Templates</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Manage SMS, email, WhatsApp, and in-app notification templates.</p>
            </div>

            {/* Delivery stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(delivery.last30Days).map(([ch, d]) => {
                    const m = CHANNEL_META[ch];
                    const Icon = m.icon;
                    return (
                        <div key={ch} className="rounded-2xl p-4" style={{ background: '#111827', border: `1px solid ${m.color}22` }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Icon size={14} style={{ color: m.color }} />
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>{m.label}</span>
                            </div>
                            <div className="text-xl font-black" style={{ color: m.color }}>{d.deliveryRate}%</div>
                            <div className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                                {d.delivered.toLocaleString()} delivered · {d.failed} failed
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Channel filter */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setChannel(undefined)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: !channel ? 'rgba(245,158,11,0.15)' : '#111827', color: !channel ? '#f59e0b' : '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}>
                    All
                </button>
                {Object.entries(CHANNEL_META).map(([ch, m]) => {
                    const Icon = m.icon;
                    return (
                        <button key={ch} onClick={() => setChannel(ch)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{ background: channel === ch ? `${m.color}18` : '#111827', color: channel === ch ? m.color : '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Icon size={11} /> {m.label}
                        </button>
                    );
                })}
            </div>

            {/* Templates list */}
            <div className="space-y-3">
                {templates.map(t => {
                    const m = CHANNEL_META[t.channel];
                    const Icon = m.icon;
                    return (
                        <div key={t.id} className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${m.color}18` }}>
                                        <Icon size={15} style={{ color: m.color }} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: '#e5e7eb' }}>{t.name}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: m.color }}>{m.label}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {t.isActive
                                        ? <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle size={11} /> Active</span>
                                        : <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,114,128,0.1)', color: '#6b7280' }}><XCircle size={11} /> Inactive</span>
                                    }
                                </div>
                            </div>
                            {t.subject && (
                                <div className="text-xs mb-1" style={{ color: '#6b7280' }}>
                                    <span className="font-bold">Subject:</span> {t.subject}
                                </div>
                            )}
                            <div className="text-xs px-3 py-2 rounded-lg leading-relaxed whitespace-pre-wrap"
                                style={{ background: 'rgba(255,255,255,0.03)', color: '#9ca3af', fontFamily: 'monospace' }}>
                                {t.body}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {t.variables.map(v => (
                                    <span key={v} className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                        style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>
                                        {`{{${v}}}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

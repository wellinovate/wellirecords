import React, { useState } from 'react';
import { supportApi } from '@/shared/api/supportApi';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

const PROVIDER_CATEGORIES = [
    { value: 'sync_issue', label: 'Results not syncing' },
    { value: 'access_issue', label: 'User access / permissions' },
    { value: 'billing', label: 'Billing / subscription' },
    { value: 'integration', label: 'Integration / API' },
    { value: 'other', label: 'Other' },
];

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
    open: { color: '#f59e0b', label: 'Open' },
    in_progress: { color: '#38bdf8', label: 'In Progress' },
    resolved: { color: '#10b981', label: 'Resolved' },
    escalated: { color: '#ef4444', label: 'Escalated' },
    closed: { color: '#6b7280', label: 'Closed' },
};

const PROVIDER_FAQS = [
    { q: 'Why are lab results not appearing in a patient chart?', a: 'Sync runs every 15 minutes. If results are older than 1 hour and still missing, check that the lab has the correct API key and that consent is active.' },
    { q: 'How do I add a new staff member?', a: 'Go to Team Management then Invite Staff. They will receive an email with a sign-up link scoped to your facility.' },
    { q: 'How do I regenerate my API key?', a: 'Go to Integrations → API Keys → Regenerate. The old key will be invalidated immediately.' },
];

export function ProviderSupportPage() {
    const [tab, setTab] = useState<'submit' | 'facility_tickets' | 'faq'>('submit');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [desc, setDesc] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const facilityTickets = supportApi.getTickets({ userType: 'provider' });

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>Facility Support</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Submit technical issues, track facility-level tickets, or read the FAQ.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {[{ key: 'submit', label: 'New Issue' }, { key: 'facility_tickets', label: 'Facility Tickets' }, { key: 'faq', label: 'FAQ' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: tab === t.key ? 'rgba(13,148,136,0.2)' : 'transparent', color: tab === t.key ? '#0d9488' : '#64748b' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'submit' && !submitted && (
                <div className="space-y-4 rounded-2xl p-5 max-w-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#64748b' }}>Issue category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PROVIDER_CATEGORIES.map(c => (
                                <button key={c.value} onClick={() => setCategory(c.value)}
                                    className="text-sm font-semibold px-3 py-2.5 rounded-xl text-left transition-all"
                                    style={{ background: category === c.value ? 'rgba(13,148,136,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${category === c.value ? '#0d9488' : 'rgba(255,255,255,0.07)'}`, color: category === c.value ? '#0d9488' : '#94a3b8' }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#64748b' }}>Subject</label>
                        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary"
                            className="w-full px-3 py-2.5 rounded-xl text-sm"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#64748b' }}>Description</label>
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                            placeholder="Describe the issue in detail…"
                            className="w-full resize-none px-3 py-2.5 rounded-xl text-sm"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }} />
                    </div>
                    <button onClick={() => setSubmitted(true)} disabled={!category || !subject || !desc}
                        className="w-full py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 transition-all"
                        style={{ background: 'rgba(13,148,136,0.2)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.3)' }}>
                        Submit Issue
                    </button>
                </div>
            )}
            {tab === 'submit' && submitted && (
                <div className="rounded-2xl p-8 text-center max-w-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={32} className="mx-auto mb-2" style={{ color: '#10b981' }} />
                    <div className="font-black text-base" style={{ color: '#e2e8f0' }}>Issue submitted</div>
                    <div className="text-xs mt-1" style={{ color: '#64748b' }}>WelliRecord support will respond within the SLA window. Check Facility Tickets to track progress.</div>
                </div>
            )}

            {tab === 'facility_tickets' && (
                <div className="space-y-2 max-w-2xl">
                    {facilityTickets.map(t => {
                        const st = STATUS_STYLE[t.status];
                        return (
                            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <span className="text-[11px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: t.priority === 'P1' ? 'rgba(239,68,68,0.15)' : t.priority === 'P2' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)', color: t.priority === 'P1' ? '#ef4444' : t.priority === 'P2' ? '#f59e0b' : '#9ca3af' }}>
                                    {t.priority}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate" style={{ color: '#e2e8f0' }}>{t.subject}</div>
                                    <div className="text-xs" style={{ color: '#64748b' }}>{t.ref} · {t.submittedBy}{t.facility ? ` · ${t.facility}` : ''}</div>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 'faq' && (
                <div className="space-y-2 max-w-lg">
                    {PROVIDER_FAQS.map((f, i) => (
                        <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                                style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <span className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{f.q}</span>
                                <HelpCircle size={14} style={{ color: '#475569', flexShrink: 0 }} />
                            </button>
                            {openFaq === i && (
                                <div className="px-4 pb-4 text-sm" style={{ background: 'rgba(255,255,255,0.02)', color: '#94a3b8' }}>{f.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { supportApi } from '@/shared/api/supportApi';
import { MessageSquare, ChevronRight, Plus, HelpCircle, CheckCircle, Clock } from 'lucide-react';

const PATIENT_CATEGORIES = [
    { value: 'records_issue', label: "Can't find my records" },
    { value: 'access_issue', label: 'Access / login problem' },
    { value: 'billing', label: 'Billing or payment' },
    { value: 'other', label: 'Something else' },
];

const STATUS_STYLE: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    open: { color: '#f59e0b', label: 'Open', icon: Clock },
    in_progress: { color: '#38bdf8', label: 'In Progress', icon: MessageSquare },
    resolved: { color: '#10b981', label: 'Resolved', icon: CheckCircle },
    escalated: { color: '#ef4444', label: 'Escalated', icon: MessageSquare },
    closed: { color: '#6b7280', label: 'Closed', icon: CheckCircle },
};

const FAQS = [
    { q: 'Why can\'t I see some of my records?', a: 'Your records are only visible if the healthcare provider has shared them through WelliRecord. Check your consents in the Data Sovereignty page.' },
    { q: 'How do I update my blood type?', a: 'Blood type must be confirmed by a verified lab result. Contact your provider to upload an updated result.' },
    { q: 'How do I revoke a provider\'s access?', a: 'Go to Share & Consent → Revoke next to the provider you want to remove.' },
];

export function PatientSupportPage() {
    const [tab, setTab] = useState<'submit' | 'my_tickets' | 'faq'>('submit');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const myTickets = supportApi.getTickets().filter(t => t.userType === 'patient' && t.submittedBy === 'Amara Okafor');

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>Get Help</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Submit an issue, check your tickets, or find an answer in our FAQ.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                {[{ key: 'submit', label: 'Submit Issue' }, { key: 'my_tickets', label: 'My Tickets' }, { key: 'faq', label: 'FAQ' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: tab === t.key ? '#0d9488' : 'transparent', color: tab === t.key ? '#fff' : '#64748b' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'submit' && !submitted && (
                <div className="space-y-4 rounded-2xl p-6 border" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>What type of issue?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PATIENT_CATEGORIES.map(c => (
                                <button key={c.value} onClick={() => setCategory(c.value)}
                                    className="text-sm font-semibold px-3 py-2.5 rounded-xl text-left transition-all"
                                    style={{ background: category === c.value ? 'rgba(13,148,136,0.1)' : '#f8fafc', border: `1px solid ${category === c.value ? '#0d9488' : '#e2e8f0'}`, color: category === c.value ? '#0d9488' : '#475569' }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>Subject</label>
                        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of the issue"
                            className="w-full px-3 py-2.5 rounded-xl text-sm border"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                            placeholder="Describe what happened… the more detail, the faster we can help."
                            className="w-full resize-none px-3 py-2.5 rounded-xl text-sm border"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                    </div>
                    <button onClick={() => setSubmitted(true)} disabled={!category || !subject || !description}
                        className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all"
                        style={{ background: '#0d9488' }}>
                        Submit Support Request
                    </button>
                </div>
            )}
            {tab === 'submit' && submitted && (
                <div className="rounded-2xl p-8 text-center border" style={{ background: '#f0fdfa', borderColor: 'rgba(13,148,136,0.2)' }}>
                    <CheckCircle size={36} className="mx-auto mb-3" style={{ color: '#0d9488' }} />
                    <div className="font-black text-lg" style={{ color: '#1e293b' }}>Request Submitted</div>
                    <div className="text-sm mt-1" style={{ color: '#475569' }}>We'll respond within 4–24 hours depending on priority. Check "My Tickets" to track progress.</div>
                    <button onClick={() => { setSubmitted(false); setCategory(''); setSubject(''); setDescription(''); setTab('my_tickets'); }}
                        className="mt-4 text-sm font-bold" style={{ color: '#0d9488' }}>View my tickets →</button>
                </div>
            )}

            {tab === 'my_tickets' && (
                <div className="space-y-2">
                    {myTickets.length === 0 && (
                        <div className="text-center py-10 text-sm" style={{ color: '#94a3b8' }}>No support tickets yet.</div>
                    )}
                    {myTickets.map(t => {
                        const st = STATUS_STYLE[t.status];
                        const StIcon = st.icon;
                        return (
                            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border"
                                style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                                <StIcon size={15} style={{ color: st.color, flexShrink: 0 }} />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate" style={{ color: '#1e293b' }}>{t.subject}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{t.ref} · {new Date(t.updatedAt).toLocaleDateString('en-NG')}</div>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 'faq' && (
                <div className="space-y-2">
                    {FAQS.map((f, i) => (
                        <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                                style={{ background: '#fff' }}>
                                <span className="font-semibold text-sm" style={{ color: '#1e293b' }}>{f.q}</span>
                                <HelpCircle size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            </button>
                            {openFaq === i && (
                                <div className="px-4 pb-4 text-sm leading-relaxed" style={{ background: '#f8fafc', color: '#475569' }}>{f.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

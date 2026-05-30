import React, { useState, useMemo } from 'react';
import { supportApi } from '@/shared/api/supportApi';
import {
    MessageSquare, ChevronRight, ChevronDown, HelpCircle, CheckCircle, Clock, Lock, Shield, 
    Mail, MessageCircle, AlertCircle, Search, ArrowRight, CheckCircle2
} from 'lucide-react';

const PATIENT_FAQS = [
    {
        q: 'How do I create my Health Vault?',
        a: 'Your Health Vault is automatically created when you sign up for WelliRecord. Simply complete your profile setup, verify your email, and your vault is ready. You can start uploading records immediately.'
    },
    {
        q: 'How do I upload a record?',
        a: 'Navigate to your Health Vault, click "Upload Record", select the file type (lab results, prescriptions, etc.), and upload your file. Records are processed and stored securely in your vault.'
    },
    {
        q: 'How do I share my records with a doctor or hospital?',
        a: 'Use the "Share & Consent" section in your dashboard. Select the healthcare provider, choose which records to share, and set access permissions. Providers receive a notification and can access shared records after consent.'
    },
    {
        q: 'How do I revoke access from a provider?',
        a: 'Go to "Share & Consent" → Find the provider → Click "Revoke Access". This immediately removes their access to your records. You can always re-share later if needed.'
    },
    {
        q: 'What does Full Access vs Limited Access mean?',
        a: 'Full Access: Provider can view all your records. Limited Access: You control which specific records the provider can see. You can change permissions anytime without revoking their access.'
    },
    {
        q: 'Who can see my records?',
        a: 'Only you and healthcare providers you explicitly grant access to can see your records. WelliRecord staff cannot access your data. All access is encrypted and logged for your security.'
    },
    {
        q: 'How do I use my Emergency QR Card?',
        a: 'Your QR Card contains encrypted information that emergency responders can scan to access your critical health data. You can customize which information is included and deactivate it anytime.'
    },
    {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. The link expires in 24 hours for security.'
    },
    {
        q: 'How do I connect my wallet? (Web3)',
        a: 'In Settings, go to "Web3 Integration" and connect your crypto wallet. This enables you to receive health tokens and participate in the Web3 health ecosystem.'
    },
    {
        q: 'How do I delete my account?',
        a: 'Go to Settings → Account → Delete Account. This action is permanent and will delete all your data after a 30-day grace period. During this period, you can cancel the deletion.'
    },
    {
        q: 'Is my data safe?',
        a: 'Yes. Your data is encrypted end-to-end, protected by blockchain technology, and complies with NDPR, GDPR, and HIPAA standards. We conduct regular security audits and never sell your data.'
    },
];

const PATIENT_GETTING_STARTED = [
    { step: 1, title: 'Create Health Vault', description: 'Set up your profile and start your health data journey' },
    { step: 2, title: 'Upload First Record', description: 'Add your medical documents and health information' },
    { step: 3, title: 'Share with a Provider', description: 'Grant access to a doctor or hospital' },
    { step: 4, title: 'Set Access Permissions', description: 'Control what data each provider can see' },
];

const SECURITY_TOPICS = [
    {
        q: 'Who owns my data?',
        a: 'You do. As the patient, you retain complete ownership of your health data. You control who can access it and can revoke access at any time. WelliRecord is just a custodian of your data.'
    },
    {
        q: 'Can WelliRecord staff see my records?',
        a: 'No. Your records are encrypted end-to-end and WelliRecord staff cannot decrypt or access them. We have technical and legal safeguards to ensure staff privacy compliance.'
    },
    {
        q: 'What happens if I delete my account?',
        a: 'Your records are permanently deleted after a 30-day grace period (to prevent accidental loss). All provider access is immediately revoked. You can restore your account within 30 days.'
    },
    {
        q: 'How is my data encrypted?',
        a: 'We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. Records are additionally protected by blockchain hashing to ensure data integrity and tamper-proof storage.'
    },
    {
        q: 'What are my rights under NDPR?',
        a: 'You have the right to access, correct, delete, or port your data. You can withdraw consent anytime. We respect your privacy rights under the Nigeria Data Protection Regulation and other applicable laws.'
    },
];

const STATUS_STYLE: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    open: { color: '#f59e0b', label: 'Open', icon: Clock },
    in_progress: { color: '#38bdf8', label: 'In Progress', icon: MessageSquare },
    resolved: { color: '#10b981', label: 'Resolved', icon: CheckCircle },
    escalated: { color: '#ef4444', label: 'Escalated', icon: MessageSquare },
    closed: { color: '#6b7280', label: 'Closed', icon: CheckCircle },
};

export function PatientSupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [tab, setTab] = useState<'support_center' | 'submit' | 'my_tickets'>('support_center');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const myTickets = supportApi.getTickets().filter(t => t.userType === 'patient' && t.submittedBy === 'Amara Okafor');

    const filteredFaqs = useMemo(() => {
        let faqs = PATIENT_FAQS;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            faqs = faqs.filter(f => f.q.toLowerCase().includes(query) || f.a.toLowerCase().includes(query));
        }
        return faqs;
    }, [searchQuery]);

    const FaqCard = ({ faq, index }: { faq: typeof PATIENT_FAQS[0]; index: number }) => (
        <div className="rounded-2xl border overflow-hidden transition-all" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
            <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-80 transition-opacity"
                style={{ background: openFaqIndex === index ? '#f0fdfa' : '#ffffff' }}>
                <span className="font-semibold text-sm flex-1" style={{ color: '#1e293b' }}>{faq.q}</span>
                <ChevronDown size={18} style={{ color: '#0d9488', transform: openFaqIndex === index ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
            </button>
            {openFaqIndex === index && (
                <div className="px-5 pb-4 text-sm leading-relaxed" style={{ background: '#f0fdfa', color: '#475569' }}>
                    {faq.a}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            {/* Main Support Center View */}
            {tab === 'support_center' && (
                <div>
                    {/* Hero Section with Search */}
                    <div className="px-6 py-12" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-4xl font-black" style={{ color: '#1e293b' }}>How can we help?</h1>
                            <p className="mb-8" style={{ color: '#475569' }}>Find answers, guides, and support for your health data journey</p>
                            
                            {/* Search Bar */}
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-3.5" style={{ color: '#64748b' }} />
                                <input
                                    type="text"
                                    placeholder="Search for help..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 transition-all"
                                    style={{ background: '#ffffff', color: '#1e293b', borderColor: '#dbeafe', '--tw-ring-color': '#0d9488' } as any}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 py-12">
                        {/* Getting Started Section */}
                        {!searchQuery && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-black mb-6" style={{ color: '#1e293b' }}>Getting Started</h2>
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {PATIENT_GETTING_STARTED.map((item, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-48 p-4 rounded-2xl border" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mb-3" style={{ background: '#0d9488' }}>
                                                {item.step}
                                            </div>
                                            <h4 className="font-semibold text-sm" style={{ color: '#1e293b' }}>{item.title}</h4>
                                            <p className="text-xs mt-2" style={{ color: '#475569' }}>{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQ Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-black mb-6" style={{ color: '#1e293b' }}>
                                {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
                            </h2>
                            <div className="space-y-3">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, idx) => <FaqCard key={idx} faq={faq} index={idx} />)
                                ) : (
                                    <div className="text-center py-8" style={{ color: '#64748b' }}>
                                        <HelpCircle size={32} className="mx-auto mb-3 opacity-50" />
                                        <p>No results found for "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security & Privacy Section */}
                        {!searchQuery && (
                            <div className="mb-12 rounded-2xl border p-8" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield size={24} style={{ color: '#0d9488' }} />
                                    <h2 className="text-2xl font-black" style={{ color: '#1e293b' }}>Security & Privacy</h2>
                                </div>
                                <div className="space-y-3 mb-6">
                                    {SECURITY_TOPICS.slice(0, 3).map((topic, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <CheckCircle2 size={18} style={{ color: '#0d9488', marginTop: '2px', flexShrink: 0 }} />
                                            <div>
                                                <h4 className="font-semibold text-sm" style={{ color: '#1e293b' }}>{topic.q}</h4>
                                                <p className="text-xs mt-1" style={{ color: '#475569' }}>{topic.a.substring(0, 80)}...</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="text-sm font-bold flex items-center gap-2 hover:opacity-85 transition-opacity" style={{ color: '#0d9488' }}>
                                    View all security information <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* System Status */}
                        {!searchQuery && (
                            <div className="mb-12 rounded-2xl border p-6" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: '#1e293b' }}>System Status</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                                            <span className="text-sm" style={{ color: '#475569' }}>All systems operational</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} style={{ color: '#94a3b8' }} />
                                </div>
                            </div>
                        )}

                        {/* Contact Support Section */}
                        {!searchQuery && (
                            <div className="rounded-2xl border p-8" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
                                <h2 className="text-2xl font-black mb-6" style={{ color: '#1e293b' }}>Need Direct Support?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { icon: Mail, title: 'Email Support', contact: 'support@wellirecord.com', time: '24-48 hours' },
                                        { icon: MessageCircle, title: 'WhatsApp Support', contact: '+234 801 234 5678', time: 'Within 4 hours' },
                                        { icon: AlertCircle, title: 'Emergency Support', contact: 'emergency@wellirecord.com', time: 'Immediate' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                                            <item.icon size={24} style={{ color: '#0d9488', marginBottom: '8px' }} />
                                            <h4 className="font-semibold text-sm" style={{ color: '#1e293b' }}>{item.title}</h4>
                                            <p className="text-xs mt-2 font-mono font-bold" style={{ color: '#0d9488' }}>{item.contact}</p>
                                            <p className="text-[11px] mt-1" style={{ color: '#64748b' }}>{item.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setTab('submit')}
                                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:bg-[#0f766e] active:scale-[0.99] shadow-sm"
                                    style={{ background: '#0d9488' }}>
                                    Contact Support Team
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Support Ticket View */}
            {tab === 'submit' && !submitted && (
                <div className="max-w-2xl mx-auto px-6 py-12">
                    <button onClick={() => setTab('support_center')} className="mb-6 flex items-center gap-2" style={{ color: '#0d9488' }}>
                        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Support Center
                    </button>
                    <div className="mb-6">
                        <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>Contact Us</h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>We respond within 24 hours. Tell us how we can help.</p>
                    </div>
                    <div className="space-y-4 rounded-2xl p-6 border animate-fade-in-up" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <div>
                            <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>What type of issue?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'records', label: "Can't find my records" },
                                    { value: 'access', label: 'Access/login problem' },
                                    { value: 'sharing', label: 'Data sharing issue' },
                                    { value: 'security', label: 'Security concern' },
                                    { value: 'technical', label: 'Technical issue' },
                                    { value: 'other', label: 'Something else' },
                                ].map(c => (
                                    <button key={c.value} onClick={() => setCategory(c.value)}
                                        className="text-sm font-semibold px-3 py-2.5 rounded-xl text-left transition-all"
                                        style={{ background: category === c.value ? 'rgba(13,148,136,0.08)' : '#f8fafc', border: `1px solid ${category === c.value ? '#0d9488' : '#e2e8f0'}`, color: category === c.value ? '#0d9488' : '#475569' }}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>Subject</label>
                            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of the issue"
                                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b', '--tw-ring-color': '#0d9488' } as any} />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                                placeholder="Describe what happened… the more detail, the faster we can help."
                                className="w-full resize-none px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b', '--tw-ring-color': '#0d9488' } as any} />
                        </div>
                        <button onClick={() => setSubmitted(true)} disabled={!category || !subject || !description}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:bg-[#0f766e] active:scale-[0.99]"
                            style={{ background: '#0d9488' }}>
                            Submit Support Request
                        </button>
                    </div>
                </div>
            )}

            {tab === 'submit' && submitted && (
                <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in-up">
                    <div className="rounded-2xl p-8 text-center border" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <CheckCircle size={48} className="mx-auto mb-3" style={{ color: '#0d9488' }} />
                        <div className="font-black text-2xl" style={{ color: '#1e293b' }}>Request Submitted!</div>
                        <div className="text-sm mt-2" style={{ color: '#475569' }}>We'll respond within 24 hours. Check "My Support Tickets" to track progress.</div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setSubmitted(false); setCategory(''); setSubject(''); setDescription(''); setTab('my_tickets'); }}
                                className="flex-1 py-2 rounded-xl font-bold text-sm text-white hover:bg-[#0f766e] transition-all"
                                style={{ background: '#0d9488' }}>
                                View My Tickets
                            </button>
                            <button
                                onClick={() => { setTab('support_center'); setSubmitted(false); setCategory(''); setSubject(''); setDescription(''); }}
                                className="flex-1 py-2 rounded-xl font-bold text-sm border hover:bg-gray-50 transition-all"
                                style={{ borderColor: '#e2e8f0', color: '#0d9488', background: '#ffffff' }}>
                                Back to Help Center
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* My Tickets View */}
            {tab === 'my_tickets' && (
                <div className="max-w-2xl mx-auto px-6 py-12">
                    <button onClick={() => setTab('support_center')} className="mb-6 flex items-center gap-2" style={{ color: '#0d9488' }}>
                        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Support Center
                    </button>
                    <div className="mb-6">
                        <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>My Support Tickets</h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Track your support requests and get updates</p>
                    </div>
                    <div className="space-y-2">
                        {myTickets.length === 0 && (
                            <div className="text-center py-10 rounded-2xl border" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                                <HelpCircle size={32} className="mx-auto mb-2 opacity-50" style={{ color: '#64748b' }} />
                                <div className="text-sm" style={{ color: '#475569' }}>No support tickets yet.</div>
                                <button onClick={() => setTab('submit')} className="text-sm font-bold mt-3 hover:opacity-85 transition-opacity" style={{ color: '#0d9488' }}>
                                    Create your first ticket →
                                </button>
                            </div>
                        )}
                        {myTickets.map(t => {
                            const st = STATUS_STYLE[t.status];
                            const StIcon = st.icon;
                            return (
                                <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border animate-fade-in-up"
                                    style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                                    <StIcon size={18} style={{ color: st.color, flexShrink: 0 }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm" style={{ color: '#1e293b' }}>{t.subject}</div>
                                        <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{t.ref} · {new Date(t.updatedAt).toLocaleDateString('en-NG')}</div>
                                    </div>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

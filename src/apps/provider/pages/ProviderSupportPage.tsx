import React, { useState, useMemo } from 'react';
import { supportApi } from '@/shared/api/supportApi';
import {
    MessageSquare, ChevronRight, ChevronDown, HelpCircle, CheckCircle, Clock, Lock, Shield,
    Mail, MessageCircle, AlertCircle, Search, ArrowRight, CheckCircle2
} from 'lucide-react';


const PROVIDER_FAQS = [
    {
        q: 'How do I register my organisation?',
        a: 'Visit the Provider Portal, click "Register Organisation", provide your healthcare organisation credentials, tax ID, and licensing information. We verify this within 1-2 business days.'
    },
    {
        q: 'How long does account verification take?',
        a: 'Verification typically takes 1-2 business days. We verify your medical license, organisation registration, and credentials. You\'ll receive email updates throughout the process.'
    },
    {
        q: 'How do I request access to a patient\'s records?',
        a: 'Search for the patient using their ID or email, click "Request Access", specify which records you need, and submit. The patient receives a consent request and can approve or deny within 24 hours.'
    },
    {
        q: 'What is consent-scoped access?',
        a: 'Consent-scoped access means you can only view the specific records and data types the patient has approved. This gives patients granular control over their data while protecting their privacy.'
    },
    {
        q: 'How do I scan a patient QR code?',
        a: 'Use the Provider Portal mobile app or dashboard camera feature to scan the patient\'s QR code. This retrieves their access permissions and critical health information instantly.'
    },
    {
        q: 'How do I upload a record for a patient?',
        a: 'In the patient\'s chart, click "Upload Record", select the record type (lab results, imaging, etc.), and upload the file. The patient receives a notification and can review before accepting.'
    },
    {
        q: 'How do I add a team member to my organisation?',
        a: 'Go to Team Management, click "Invite Member", enter their email and role (doctor, admin, receptionist, etc.), and send the invite. They can join by accepting the email invitation.'
    },
    {
        q: 'How do I order a lab test through the platform?',
        a: 'Create a patient encounter, select "Order Lab Test", choose from available tests, and submit. The lab receives the order and results are uploaded directly to the patient\'s chart.'
    },
    {
        q: 'What does the access control dashboard show?',
        a: 'It displays all patients you have access to, access level (full/limited), access expiration date, and audit logs showing who accessed what and when.'
    },
    {
        q: 'How do I integrate with our existing systems?',
        a: 'We offer API endpoints and HL7/FHIR integration. Contact our integration team for setup. Most integrations take 1-2 weeks and we provide 24/7 technical support.'
    },
    {
        q: 'What compliance standards does WelliRecord meet?',
        a: 'WelliRecord is compliant with NDPR (Nigeria), GDPR (Europe), HIPAA (USA), and other international healthcare data protection regulations. We maintain SOC 2 Type II certification.'
    },
];

const PROVIDER_GETTING_STARTED = [
    { step: 1, title: 'Register Organisation', description: 'Set up your healthcare organisation account' },
    { step: 2, title: 'Get Verified', description: 'Complete identity and license verification' },
    { step: 3, title: 'Find Patient', description: 'Search and connect with patients' },
    { step: 4, title: 'Request Access', description: 'Ask for permission to view patient records' },
    { step: 5, title: 'Start Encounter', description: 'Begin clinical workflows and care coordination' },
];

const COMPLIANCE_TOPICS = [
    {
        q: 'Who owns patient data?',
        a: 'Patients own their data. Your organisation has access only to data patients have explicitly approved. You are a custodian, not an owner, of patient health information.'
    },
    {
        q: 'What is our compliance responsibility?',
        a: 'You must comply with NDPR, GDPR, HIPAA, and applicable healthcare regulations. WelliRecord provides audit logs and access controls; you must implement proper access policies and staff training.'
    },
    {
        q: 'How do I generate compliance reports?',
        a: 'Go to Admin Dashboard → Compliance → Generate Report. You can export access logs, consent records, and data processing reports for audits and regulatory submissions.'
    },
    {
        q: 'How are audit logs maintained?',
        a: 'All access to patient records is logged with timestamps, user IDs, and purposes. Logs are retained for 7 years and are immutable for compliance audits.'
    },
    {
        q: 'What data privacy protections are in place?',
        a: 'Patient data is encrypted end-to-end, access is consent-scoped, and all communications use TLS 1.3. WelliRecord never sells patient data and maintains strict vendor agreements.'
    },
];

const STATUS_STYLE: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    open: { color: '#f59e0b', label: 'Open', icon: Clock },
    in_progress: { color: '#38bdf8', label: 'In Progress', icon: MessageSquare },
    resolved: { color: '#10b981', label: 'Resolved', icon: CheckCircle },
    escalated: { color: '#ef4444', label: 'Escalated', icon: MessageSquare },
    closed: { color: '#6b7280', label: 'Closed', icon: CheckCircle },
};

export function ProviderSupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [tab, setTab] = useState<'support_center' | 'submit' | 'my_tickets'>('support_center');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const facilityTickets = supportApi.getTickets({ userType: 'provider' });

    const filteredFaqs = useMemo(() => {
        let faqs = PROVIDER_FAQS;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            faqs = faqs.filter(f => f.q.toLowerCase().includes(query) || f.a.toLowerCase().includes(query));
        }
        return faqs;
    }, [searchQuery]);

    const FaqCard = ({ faq, index }: { faq: typeof PROVIDER_FAQS[0]; index: number }) => (
        <div className="rounded-2xl border overflow-hidden transition-all" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
            <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-opacity-50 transition-colors"
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
                    <div className="px-6 py-12" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-4xl font-black text-white mb-2">Healthcare Provider Support</h1>
                            <p className="text-teal-500/10 mb-8" style={{ color: '#f0fdfa' }}>Enterprise support for hospitals, clinics, and healthcare organizations</p>

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
                                    {PROVIDER_GETTING_STARTED.map((item, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-56 p-4 rounded-2xl border" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
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

                        {/* Compliance & Security Section */}
                        {!searchQuery && (
                            <div className="mb-12 rounded-2xl border p-8" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield size={24} style={{ color: '#0d9488' }} />
                                    <h2 className="text-2xl font-black" style={{ color: '#1e293b' }}>Compliance & Security</h2>
                                </div>
                                <div className="space-y-3 mb-6">
                                    {COMPLIANCE_TOPICS.slice(0, 3).map((topic, idx) => (
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
                                    View all compliance information <ArrowRight size={16} />
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
                                <h2 className="text-2xl font-black mb-6" style={{ color: '#1e293b' }}>Enterprise Support</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { icon: Mail, title: 'Email Support', contact: 'enterprise@wellirecord.com', time: '4-24 hours' },
                                        { icon: MessageCircle, title: 'WhatsApp Support', contact: '+234 901 234 5678', time: 'Within 2 hours' },
                                        { icon: AlertCircle, title: 'Emergency Support', contact: 'emergency@wellirecord.com', time: 'Immediate (P1)' },
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
                        <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>Contact Support Team</h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>We respond within 24 hours. Tell us how we can help your organization.</p>
                    </div>
                    <div className="space-y-4 rounded-2xl p-6 border animate-fade-in-up" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <div>
                            <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>What type of issue?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'integration', label: 'Integration / API' },
                                    { value: 'sync', label: 'Data sync issue' },
                                    { value: 'access', label: 'User access/permissions' },
                                    { value: 'compliance', label: 'Compliance question' },
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
                        <div className="text-sm mt-2" style={{ color: '#475569' }}>Our enterprise support team will contact you within 24 hours. Track your request in "My Support Tickets".</div>
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
                        {facilityTickets.length === 0 && (
                            <div className="text-center py-10 rounded-2xl border" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                                <HelpCircle size={32} className="mx-auto mb-2 opacity-50" style={{ color: '#64748b' }} />
                                <div className="text-sm" style={{ color: '#475569' }}>No support tickets yet.</div>
                                <button onClick={() => setTab('submit')} className="text-sm font-bold mt-3 hover:opacity-85 transition-opacity" style={{ color: '#0d9488' }}>
                                    Create your first ticket →
                                </button>
                            </div>
                        )}
                        {facilityTickets.map(t => {
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

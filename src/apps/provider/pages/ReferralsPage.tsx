import React, { useEffect, useState } from 'react';
import {
    GitBranch, Search, Loader2, CheckCircle2, XCircle, Clock,
    ArrowRight, AlertTriangle, ChevronDown, ChevronUp, Send,
} from 'lucide-react';
import { authApi, type SearchPatientResponse } from '@/shared/api/authApi';
import { searchOrganizationDirectory, type OrganizationDirectoryItem } from '@/shared/api/organizationApi';
import { referralsApi, type Referral, type ReferralUrgency, type ReferralStatus } from '@/shared/api/referralsApi';

const URGENCY_STYLE: Record<ReferralUrgency, { color: string; bg: string; label: string }> = {
    routine: { color: '#7ba3c8', bg: 'rgba(123,163,200,0.12)', label: 'Routine' },
    urgent: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Urgent' },
    emergency: { color: '#f87171', bg: 'rgba(248,113,113,0.14)', label: 'Emergency' },
};

const STATUS_STYLE: Record<ReferralStatus, { color: string; bg: string; label: string; icon: React.ElementType }> = {
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending', icon: Clock },
    accepted: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', label: 'Accepted', icon: CheckCircle2 },
    declined: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Declined', icon: XCircle },
    completed: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'Completed', icon: CheckCircle2 },
    cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Cancelled', icon: XCircle },
};

// --- New referral form ---

function NewReferralForm({ onCreated }: { onCreated: (r: Referral) => void }) {
    const [identifier, setIdentifier] = useState('');
    const [identifierType, setIdentifierType] = useState<'wrId' | 'email' | 'phone'>('wrId');
    const [patient, setPatient] = useState<SearchPatientResponse | null>(null);
    const [patientSearching, setPatientSearching] = useState(false);
    const [patientError, setPatientError] = useState('');

    const [orgQuery, setOrgQuery] = useState('');
    const [orgResults, setOrgResults] = useState<OrganizationDirectoryItem[]>([]);
    const [orgSearching, setOrgSearching] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationDirectoryItem | null>(null);

    const [specialty, setSpecialty] = useState('');
    const [urgency, setUrgency] = useState<ReferralUrgency>('routine');
    const [reason, setReason] = useState('');
    const [clinicalSummary, setClinicalSummary] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!orgQuery.trim() || selectedOrg) {
            setOrgResults([]);
            return;
        }
        const t = setTimeout(() => {
            setOrgSearching(true);
            searchOrganizationDirectory(orgQuery.trim())
                .then(setOrgResults)
                .catch(() => setOrgResults([]))
                .finally(() => setOrgSearching(false));
        }, 350);
        return () => clearTimeout(t);
    }, [orgQuery, selectedOrg]);

    const handlePatientSearch = async () => {
        if (!identifier.trim() || patientSearching) return;
        setPatientSearching(true);
        setPatientError('');
        setPatient(null);
        try {
            const result = await authApi.searchPatientRequest(identifier.trim(), identifierType);
            setPatient(result);
        } catch (err: any) {
            setPatientError(err?.message || "Couldn't find a patient with that identifier.");
        } finally {
            setPatientSearching(false);
        }
    };

    const canSubmit = patient && selectedOrg && reason.trim() && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit || !patient || !selectedOrg) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const referral = await referralsApi.create({
                patientId: patient.patientIdentityId,
                receivingOrganizationId: selectedOrg._id,
                specialty: specialty.trim() || undefined,
                urgency,
                reason: reason.trim(),
                clinicalSummary: clinicalSummary.trim() || undefined,
            });
            onCreated(referral);
            setPatient(null);
            setIdentifier('');
            setSelectedOrg(null);
            setOrgQuery('');
            setSpecialty('');
            setUrgency('routine');
            setReason('');
            setClinicalSummary('');
        } catch (err: any) {
            setSubmitError(err?.response?.data?.message || err?.message || "Couldn't send the referral — try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card-provider p-6 space-y-5 max-w-2xl">
            {/* Patient */}
            <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Patient</label>
                {!patient ? (
                    <div className="flex gap-2">
                        <select value={identifierType} onChange={(e) => setIdentifierType(e.target.value as any)}
                            className="text-sm rounded-xl px-2 outline-none"
                            style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }}>
                            <option value="wrId">WR ID</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                        </select>
                        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePatientSearch()}
                            placeholder={identifierType === 'wrId' ? 'WR-1234-ABCD' : identifierType === 'email' ? 'patient@email.com' : '080…'}
                            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
                        <button onClick={handlePatientSearch} disabled={!identifier.trim() || patientSearching}
                            className="px-4 rounded-xl text-sm font-bold disabled:opacity-40"
                            style={{ background: '#163761', color: '#dbe6f2' }}>
                            {patientSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <div>
                            <div className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>{patient.fullName}</div>
                            <div className="text-xs" style={{ color: '#7ba3c8' }}>{patient.wrId || 'No WR ID'}</div>
                        </div>
                        <button onClick={() => setPatient(null)} className="text-xs font-bold" style={{ color: '#f87171' }}>Change</button>
                    </div>
                )}
                {patientError && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{patientError}</p>}
            </div>

            {/* Receiving org */}
            <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Refer to</label>
                {!selectedOrg ? (
                    <div className="relative">
                        <input value={orgQuery} onChange={(e) => setOrgQuery(e.target.value)}
                            placeholder="Search facility by name…"
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
                        {orgSearching && (
                            <Loader2 size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#7ba3c8' }} />
                        )}
                        {orgResults.length > 0 && (
                            <div className="mt-1 rounded-xl overflow-hidden" style={{ border: '1px solid #163761' }}>
                                {orgResults.map((o) => (
                                    <button key={o._id} onClick={() => { setSelectedOrg(o); setOrgResults([]); }}
                                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                                        style={{ background: 'rgba(7,24,48,0.7)', color: '#dbe6f2', borderBottom: '1px solid #163761' }}>
                                        <div className="font-semibold">{o.organizationName}</div>
                                        {o.officeAddress && <div className="text-xs" style={{ color: '#7ba3c8' }}>{o.officeAddress}</div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
                        <div>
                            <div className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>{selectedOrg.organizationName}</div>
                            {selectedOrg.officeAddress && <div className="text-xs" style={{ color: '#7ba3c8' }}>{selectedOrg.officeAddress}</div>}
                        </div>
                        <button onClick={() => { setSelectedOrg(null); setOrgQuery(''); }} className="text-xs font-bold" style={{ color: '#f87171' }}>Change</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Specialty (optional)</label>
                    <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiology"
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
                </div>
                <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Urgency</label>
                    <select value={urgency} onChange={(e) => setUrgency(e.target.value as ReferralUrgency)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }}>
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Reason for referral</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
            </div>

            <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Clinical summary (optional)</label>
                <textarea value={clinicalSummary} onChange={(e) => setClinicalSummary(e.target.value)} rows={4}
                    placeholder="Relevant history, findings, or context for the receiving facility…"
                    className="w-full resize-none px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
            </div>

            {submitError && <p className="text-xs" style={{ color: '#f87171' }}>{submitError}</p>}

            <button onClick={handleSubmit} disabled={!canSubmit}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: '#38bdf8' }}>
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Referral
            </button>
        </div>
    );
}

// --- Referral list row ---

function ReferralRow({ referral, mode, onUpdated }: { referral: Referral; mode: 'sent' | 'received'; onUpdated: (r: Referral) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [responseNote, setResponseNote] = useState('');
    const [acting, setActing] = useState<ReferralStatus | null>(null);
    const [error, setError] = useState('');

    const st = STATUS_STYLE[referral.status];
    const ug = URGENCY_STYLE[referral.urgency];
    const StIcon = st.icon;

    const act = async (status: ReferralStatus) => {
        setActing(status);
        setError('');
        try {
            const updated = await referralsApi.updateStatus(referral._id, status, responseNote.trim() || undefined);
            onUpdated(updated);
            setResponseNote('');
        } catch (err: any) {
            setError(err?.response?.data?.message || "Couldn't update this referral.");
        } finally {
            setActing(null);
        }
    };

    return (
        <div className="card-provider overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <StIcon size={15} style={{ color: st.color, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: '#e2eaf4' }}>
                        {referral.patientName} → {mode === 'sent' ? referral.receivingOrganizationName : referral.referringOrganizationName}
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: '#7ba3c8' }}>
                        {referral.reason} · {new Date(referral.createdAt).toLocaleDateString('en-NG')}
                    </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: ug.color, background: ug.bg }}>{ug.label}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                {expanded ? <ChevronUp size={14} style={{ color: '#4c6a8c' }} /> : <ChevronDown size={14} style={{ color: '#4c6a8c' }} />}
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: '#163761' }}>
                    <div className="pt-3 text-sm" style={{ color: '#dbe6f2' }}>
                        <div className="text-xs font-bold mb-1" style={{ color: '#7ba3c8' }}>Reason</div>
                        {referral.reason}
                    </div>
                    {referral.specialty && (
                        <div className="text-sm" style={{ color: '#dbe6f2' }}>
                            <div className="text-xs font-bold mb-1" style={{ color: '#7ba3c8' }}>Specialty</div>
                            {referral.specialty}
                        </div>
                    )}
                    {referral.clinicalSummary && (
                        <div className="text-sm" style={{ color: '#dbe6f2' }}>
                            <div className="text-xs font-bold mb-1" style={{ color: '#7ba3c8' }}>Clinical summary</div>
                            {referral.clinicalSummary}
                        </div>
                    )}
                    {referral.responseNote && (
                        <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', color: '#dbe6f2' }}>
                            <div className="text-xs font-bold mb-1" style={{ color: '#7ba3c8' }}>
                                {referral.respondedByName ? `Note from ${referral.respondedByName}` : 'Response note'}
                            </div>
                            {referral.responseNote}
                        </div>
                    )}

                    {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}

                    {mode === 'received' && referral.status === 'pending' && (
                        <div className="space-y-2 pt-1">
                            <textarea value={responseNote} onChange={(e) => setResponseNote(e.target.value)} rows={2}
                                placeholder="Optional note back to the referring facility…"
                                className="w-full resize-none px-3 py-2 rounded-xl text-sm outline-none"
                                style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
                            <div className="flex gap-2">
                                <button onClick={() => act('accepted')} disabled={!!acting}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-950 disabled:opacity-40 flex items-center justify-center gap-1.5"
                                    style={{ background: '#34d399' }}>
                                    {acting === 'accepted' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Accept
                                </button>
                                <button onClick={() => act('declined')} disabled={!!acting}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1.5"
                                    style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                                    {acting === 'declined' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Decline
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'received' && referral.status === 'accepted' && (
                        <button onClick={() => act('completed')} disabled={!!acting}
                            className="w-full py-2 rounded-xl text-xs font-bold text-slate-950 disabled:opacity-40 flex items-center justify-center gap-1.5"
                            style={{ background: '#38bdf8' }}>
                            {acting === 'completed' ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />} Mark Completed
                        </button>
                    )}

                    {mode === 'sent' && referral.status === 'pending' && (
                        <button onClick={() => act('cancelled')} disabled={!!acting}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                            {acting === 'cancelled' ? 'Cancelling…' : 'Cancel referral'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Page ---

export function ReferralsPage() {
    const [tab, setTab] = useState<'received' | 'sent' | 'new'>('received');
    const [sent, setSent] = useState<Referral[]>([]);
    const [received, setReceived] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorCode, setErrorCode] = useState('');

    const load = (which: 'sent' | 'received') => {
        setLoading(true);
        setError('');
        setErrorCode('');
        const call = which === 'sent' ? referralsApi.listSent() : referralsApi.listReceived();
        call
            .then(which === 'sent' ? setSent : setReceived)
            .catch((err: any) => {
                setError(err?.response?.data?.message || "Couldn't load referrals right now.");
                setErrorCode(err?.response?.data?.code || '');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (tab === 'sent' || tab === 'received') load(tab);
    }, [tab]);

    const pendingReceivedCount = received.filter((r) => r.status === 'pending').length;

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Referrals</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Send and track patient referrals across organisations</p>
            </div>

            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761' }}>
                {[
                    { key: 'received', label: `Received${pendingReceivedCount ? ` (${pendingReceivedCount})` : ''}` },
                    { key: 'sent', label: 'Sent' },
                    { key: 'new', label: 'New Referral' },
                ].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: tab === t.key ? '#38bdf8' : 'transparent', color: tab === t.key ? '#04101f' : '#7ba3c8' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'new' && (
                <NewReferralForm onCreated={() => { setTab('sent'); load('sent'); }} />
            )}

            {(tab === 'sent' || tab === 'received') && (
                <div className="space-y-2 max-w-2xl">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: '#7ba3c8' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading referrals…
                        </div>
                    )}
                    {!loading && error && (
                        <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)' }}>
                                <AlertTriangle size={26} style={{ color: '#f87171' }} />
                            </div>
                            <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>
                                {errorCode === 'ORG_NOT_VERIFIED' ? 'Verification required' : errorCode === 'PERMISSION_DENIED' ? "You don't have access to referrals" : "Couldn't load referrals"}
                            </p>
                            <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>{error}</p>
                        </div>
                    )}
                    {!loading && !error && (tab === 'sent' ? sent : received).length === 0 && (
                        <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,.1)' }}>
                                <GitBranch size={26} style={{ color: '#6366f1' }} />
                            </div>
                            <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>
                                {tab === 'sent' ? "You haven't sent any referrals yet." : 'No referrals received yet.'}
                            </p>
                        </div>
                    )}
                    {!loading && !error && (tab === 'sent' ? sent : received).map((r) => (
                        <ReferralRow
                            key={r._id}
                            referral={r}
                            mode={tab}
                            onUpdated={(updated) => {
                                const setter = tab === 'sent' ? setSent : setReceived;
                                setter((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReferralsPage;

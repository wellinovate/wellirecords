import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '@/shared/api/adminApi';
import {
    ArrowLeft, FileText, CheckCircle, XCircle, MessageSquare,
    Building2, User, Calendar, AlertTriangle,
} from 'lucide-react';

export function VerificationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [note, setNote] = useState('');
    const [done, setDone] = useState<'approved' | 'rejected' | 'info' | null>(null);

    const v = adminApi.getVerificationById(id ?? '');
    if (!v) return (
        <div className="text-center py-20" style={{ color: '#6b7280' }}>
            <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
            <p>Verification request not found.</p>
        </div>
    );

    const handleApprove = () => { adminApi.approveVerification(v.id, note || undefined); setDone('approved'); };
    const handleReject = () => { adminApi.rejectVerification(v.id, note || 'Rejected by admin.'); setDone('rejected'); };
    const handleInfo = () => { adminApi.requestMoreInfo(v.id, note || 'Please provide additional documentation.'); setDone('info'); };

    if (done) {
        const msgs = { approved: { icon: CheckCircle, color: '#10b981', text: 'Verification approved and applicant notified.' }, rejected: { icon: XCircle, color: '#ef4444', text: 'Verification rejected and applicant notified.' }, info: { icon: MessageSquare, color: '#38bdf8', text: 'More information requested. Applicant notified.' } };
        const m = msgs[done];
        return (
            <div className="flex flex-col items-center justify-center min-h-96 text-center gap-4 animate-fade-in">
                <m.icon size={48} style={{ color: m.color }} />
                <p className="font-bold text-lg" style={{ color: '#e5e7eb' }}>{m.text}</p>
                <button onClick={() => navigate('/admin/verifications')}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                    ← Back to Queue
                </button>
            </div>
        );
    }

    const isPending = v.status === 'pending' || v.status === 'more_info_requested';

    return (
        <div className="animate-fade-in space-y-6 max-w-3xl">
            <button onClick={() => navigate('/admin/verifications')}
                className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: '#6b7280' }}>
                <ArrowLeft size={15} /> Back to Queue
            </button>

            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.1)' }}>
                    {v.type === 'facility' ? <Building2 size={22} style={{ color: '#f59e0b' }} /> : <User size={22} style={{ color: '#f59e0b' }} />}
                </div>
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#e5e7eb' }}>{v.submittedByName}</h1>
                    <p className="text-sm capitalize mt-0.5" style={{ color: '#6b7280' }}>
                        {v.type} verification · Submitted {new Date(v.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Details card */}
            <div className="rounded-2xl p-5 space-y-4" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.1)' }}>
                <h2 className="font-bold text-sm" style={{ color: '#9ca3af' }}>Applicant Details</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {v.specialty && <div><div className="text-xs" style={{ color: '#4b5563' }}>Specialty</div><div style={{ color: '#e5e7eb' }}>{v.specialty}</div></div>}
                    {v.licenseId && <div><div className="text-xs" style={{ color: '#4b5563' }}>License ID</div><div style={{ color: '#e5e7eb' }}>{v.licenseId}</div></div>}
                    {v.medicalCouncil && <div><div className="text-xs" style={{ color: '#4b5563' }}>Medical Council</div><div style={{ color: '#e5e7eb' }}>{v.medicalCouncil}</div></div>}
                    {v.cacNumber && <div><div className="text-xs" style={{ color: '#4b5563' }}>CAC / RC Number</div><div style={{ color: '#e5e7eb' }}>{v.cacNumber}</div></div>}
                    {v.facilityType && <div><div className="text-xs" style={{ color: '#4b5563' }}>Facility Type</div><div className="capitalize" style={{ color: '#e5e7eb' }}>{v.facilityType}</div></div>}
                    {v.facilityLicense && <div><div className="text-xs" style={{ color: '#4b5563' }}>Facility License</div><div style={{ color: '#e5e7eb' }}>{v.facilityLicense}</div></div>}
                </div>
            </div>

            {/* Documents */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.1)' }}>
                <h2 className="font-bold text-sm" style={{ color: '#9ca3af' }}>Submitted Documents ({v.documents.length})</h2>
                {v.documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <FileText size={16} style={{ color: '#f59e0b' }} />
                        <div className="flex-1">
                            <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>{doc.label}</div>
                            <div className="text-xs" style={{ color: '#4b5563' }}>
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>View</span>
                    </div>
                ))}
            </div>

            {/* Previous decision note */}
            {v.decisionNote && (
                <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>Previous Note</div>
                    <p className="text-sm" style={{ color: '#d1d5db' }}>{v.decisionNote}</p>
                </div>
            )}

            {/* Action section — only for pending/more-info */}
            {isPending && (
                <div className="rounded-2xl p-5 space-y-4" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h2 className="font-bold text-sm" style={{ color: '#9ca3af' }}>Decision Note (optional)</h2>
                    <textarea
                        value={note} onChange={e => setNote(e.target.value)}
                        rows={3} placeholder="Add a note for the applicant…"
                        className="w-full resize-none rounded-xl p-3 text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                    <div className="flex gap-3 flex-wrap">
                        <button onClick={handleApprove}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                            <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={handleInfo}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                            <MessageSquare size={15} /> Request More Info
                        </button>
                        <button onClick={handleReject}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <XCircle size={15} /> Reject
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Upload, FileText, ArrowRight, XCircle, MessageSquare, Loader2 } from 'lucide-react';
import {
    getOrgVerificationStatus,
    uploadOrgVerificationDocument,
    type VerificationStatusResponse,
} from '@/shared/api/organizationApi';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const STATUS_COPY: Record<string, { title: string; desc: string; icon: React.ElementType; color: string }> = {
    not_submitted: {
        title: 'Document Required',
        desc: 'Upload your CAC certificate or operating licence to start review.',
        icon: Upload,
        color: '#38bdf8',
    },
    pending: {
        title: 'Under Review',
        desc: 'Our compliance team is reviewing your document. This usually takes 24-48 hours.',
        icon: Clock,
        color: '#f59e0b',
    },
    more_info_requested: {
        title: 'More Information Needed',
        desc: 'The reviewer asked for additional documentation. See the note below and re-upload.',
        icon: MessageSquare,
        color: '#38bdf8',
    },
    approved: {
        title: 'Approved & Active',
        desc: 'Your organisation is verified. You have full access to the provider portal.',
        icon: CheckCircle,
        color: '#10b981',
    },
    rejected: {
        title: 'Verification Rejected',
        desc: 'Your submission was rejected. See the note below, then re-upload a corrected document.',
        icon: XCircle,
        color: '#ef4444',
    },
};

export function OrgVerificationPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [status, setStatus] = useState<VerificationStatusResponse | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const loadStatus = () => {
        setLoadingStatus(true);
        setLoadError('');
        getOrgVerificationStatus()
            .then(setStatus)
            .catch((err: any) => {
                setLoadError(
                    err?.response?.data?.message ||
                    err?.message ||
                    'Could not load your verification status. Please log in again.',
                );
            })
            .finally(() => setLoadingStatus(false));
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleFileSelect = async (file: File | undefined) => {
        if (!file) return;

        setUploadError('');

        if (!ALLOWED_TYPES.includes(file.type)) {
            setUploadError('Only PDF, JPG, and PNG files are accepted.');
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            setUploadError('File must be under 10MB.');
            return;
        }

        try {
            setUploading(true);
            const updated = await uploadOrgVerificationDocument(file);
            setStatus((prev) => ({ ...prev, ...updated }));
        } catch (err: any) {
            setUploadError(
                err?.response?.data?.message || err?.message || 'Upload failed. Please try again.',
            );
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const currentStatus = status?.verificationStatus || 'not_submitted';
    const copy = STATUS_COPY[currentStatus] || STATUS_COPY.not_submitted;
    const canUpload = currentStatus === 'not_submitted' || currentStatus === 'rejected' || currentStatus === 'more_info_requested';

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(145deg, #050d1a 0%, #0c1e35 60%, #0f3050 100%)' }}>
            <div className="w-full max-w-lg">
                <div className="card-provider p-8 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: `${copy.color}1f`, border: `2px solid ${copy.color}4d` }}>
                        <copy.icon size={28} style={{ color: copy.color }} />
                    </div>
                    <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#e2eaf4' }}>
                        Organisation Verification
                    </h2>
                    <p className="text-sm mb-6" style={{ color: '#7ba3c8' }}>
                        {copy.title} — {copy.desc}
                    </p>

                    {loadingStatus ? (
                        <div className="py-8 flex flex-col items-center gap-2" style={{ color: '#7ba3c8' }}>
                            <Loader2 size={22} className="animate-spin" />
                            <span className="text-sm">Loading your verification status…</span>
                        </div>
                    ) : loadError ? (
                        <div className="mb-6 p-3 rounded-xl text-sm text-left"
                            style={{ background: 'rgba(239,68,68,.08)', color: '#f87171', border: '1px solid rgba(239,68,68,.25)' }}>
                            {loadError}
                        </div>
                    ) : (
                        <>
                            {status?.verificationDocumentName && (
                                <div className="flex items-center gap-3 p-3 rounded-xl mb-4 text-left"
                                    style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                                    <FileText size={16} style={{ color: '#7ba3c8' }} />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium truncate" style={{ color: '#e2eaf4' }}>
                                            {status.verificationDocumentName}
                                        </div>
                                        {status.verificationDocumentUploadedAt && (
                                            <div className="text-xs" style={{ color: '#7ba3c8' }}>
                                                Uploaded {new Date(status.verificationDocumentUploadedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {status?.verificationDecisionNote && (currentStatus === 'rejected' || currentStatus === 'more_info_requested') && (
                                <div className="p-3 rounded-xl mb-4 text-left text-sm"
                                    style={{ background: 'rgba(56,189,248,.08)', color: '#93c5fd', border: '1px solid rgba(56,189,248,.2)' }}>
                                    <span className="font-semibold">Reviewer note: </span>{status.verificationDecisionNote}
                                </div>
                            )}

                            {canUpload && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full border-2 border-dashed rounded-xl p-6 mb-2 cursor-pointer hover:border-sky-400 transition-colors disabled:opacity-60"
                                        style={{ borderColor: 'rgba(56,189,248,.3)', background: 'rgba(56,189,248,.04)' }}
                                    >
                                        {uploading ? (
                                            <Loader2 size={24} className="mx-auto mb-2 animate-spin" style={{ color: '#38bdf8' }} />
                                        ) : (
                                            <Upload size={24} className="mx-auto mb-2" style={{ color: '#38bdf8' }} />
                                        )}
                                        <p className="text-sm font-medium" style={{ color: '#e2eaf4' }}>
                                            {uploading ? 'Uploading…' : 'Upload CAC Certificate / Operating License'}
                                        </p>
                                        <p className="text-xs" style={{ color: '#7ba3c8' }}>PDF, JPG, PNG up to 10MB</p>
                                    </button>
                                    {uploadError && (
                                        <p className="text-sm mb-4" style={{ color: '#f87171' }}>{uploadError}</p>
                                    )}
                                </>
                            )}

                            {currentStatus === 'pending' && (
                                <button
                                    type="button"
                                    onClick={loadStatus}
                                    className="text-sm hover:underline mb-6"
                                    style={{ color: '#38bdf8' }}
                                >
                                    Refresh status
                                </button>
                            )}
                        </>
                    )}

                    <button onClick={() => navigate(currentStatus === 'approved' ? '/provider/overview' : '/auth/provider/login')}
                        className="btn btn-provider-outline justify-center w-full mt-4">
                        {currentStatus === 'approved' ? 'Go to Provider Portal' : 'Back to Login'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

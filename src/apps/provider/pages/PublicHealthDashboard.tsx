import React, { useState } from 'react';
import { Activity, Bell, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { waitlistApi } from '@/shared/api/waitlistApi';

// No backend public health surveillance endpoints exist yet. The
// previous version showed hardcoded disease case counts (malaria,
// hypertension, respiratory infections, diabetes) with fabricated
// trend percentages, presented as real facility surveillance data.
// Honest placeholder until real aggregation is built.
export function PublicHealthDashboard() {
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || status === 'loading') return;
        setStatus('loading');
        try {
            await waitlistApi.join({ feature: 'public-health', email });
            setStatus('done');
        } catch (err) {
            console.warn('Could not join waitlist:', err);
            setStatus('error');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Public Health Surveillance</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Disease burden tracking across your facility</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <Activity size={26} style={{ color: '#ef4444' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Surveillance data isn't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Disease case tracking and trend reporting need a real diagnosis aggregation endpoint on the backend — none exists yet.
                </p>

                <div className="mt-4 w-full max-w-sm rounded-xl border p-5" style={{ borderColor: '#163761', background: 'rgba(7,24,48,0.5)' }}>
                    {status === 'done' ? (
                        <div className="flex items-center gap-3" style={{ color: '#6ee7b7' }}>
                            <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#34d399' }} />
                            <p className="text-xs font-semibold text-left" style={{ color: '#e2eaf4' }}>
                                You're on the list — we'll notify {email} when Public Health Surveillance is ready.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleJoinWaitlist} className="space-y-2.5">
                            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#e2eaf4' }}>
                                <Bell size={14} style={{ color: '#ef4444' }} />
                                <span>Get notified when Surveillance launches</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none focus:border-red-400 transition-colors"
                                    style={{ borderColor: '#163761', background: '#0b2447', color: '#e2eaf4' }}
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:opacity-60"
                                    style={{ background: '#ef4444' }}
                                >
                                    {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <><span>Join</span><ArrowRight size={13} /></>}
                                </button>
                            </div>
                            {status === 'error' && (
                                <p className="text-[11px] text-left" style={{ color: '#f87171' }}>
                                    Couldn't join the waitlist right now — try again in a moment.
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

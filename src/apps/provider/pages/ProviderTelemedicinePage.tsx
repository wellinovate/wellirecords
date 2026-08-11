import React, { useState } from 'react';
import { Video, Sparkles, ShieldCheck, Activity, Pill, CheckCircle2, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '@/shared/auth/AuthProvider';

export function ProviderTelemedicinePage() {
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [submitted, setSubmitted] = useState(false);

    const handleJoinWaitlist = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubmitted(true);
    };

    return (
        <div className="animate-fade-in space-y-8 p-2 md:p-4">
            {/* Header / Banner */}
            <div className="rounded-2xl border border-[#163761] bg-[#081b35]/60 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
                
                <div className="max-w-3xl space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                        <Sparkles size={14} className="text-sky-400" />
                        <span>Launching Q4 2026 • Early Access Program</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Telemedicine & Virtual Consultations
                    </h1>

                    <p className="text-sm md:text-base text-[#9FB3CF] leading-relaxed">
                        Secure, HIPAA & NDPA-compliant WebRTC video consultations, live remote patient vital monitoring, and direct electronic prescription dispatch for your healthcare facility.
                    </p>
                </div>

                {/* Waitlist Form Card */}
                <div className="mt-8 rounded-xl border border-[#163761] bg-[#071830]/80 p-5 md:p-6 max-w-xl">
                    {!submitted ? (
                        <form onSubmit={handleJoinWaitlist} className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Bell size={16} className="text-sky-400" />
                                <span>Get Notified for Facility Early Access</span>
                            </div>
                            <p className="text-xs text-[#7ba3c8]">
                                Register your facility to receive priority access to our WebRTC telemedicine beta.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your facility email address"
                                    className="flex-1 rounded-xl border border-[#163761] bg-[#0b2447] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none focus:border-sky-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg shadow-sky-500/20 active:scale-95 flex-shrink-0"
                                >
                                    <span>Join Waitlist</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center gap-3 text-emerald-300 py-2">
                            <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-white">You're on the Early Access Waitlist!</p>
                                <p className="text-xs text-[#7ba3c8] mt-0.5">
                                    We'll notify {email} as soon as the beta environment opens for your facility.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Roadmap / Capability Cards */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Video size={18} className="text-sky-400" />
                    <span>Upcoming Telemedicine Capabilities</span>
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-[#163761] bg-[#081b35]/40 p-5 space-y-3 hover:border-sky-500/40 transition">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-base font-semibold text-white">Encrypted HD Video Consultations</h3>
                        <p className="text-xs text-[#9FB3CF] leading-relaxed">
                            Low-latency, end-to-end encrypted WebRTC audio and video streaming built directly into patient encounter workflows.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#163761] bg-[#081b35]/40 p-5 space-y-3 hover:border-sky-500/40 transition">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Activity size={20} />
                        </div>
                        <h3 className="text-base font-semibold text-white">Remote Vital Monitoring (RPM)</h3>
                        <p className="text-xs text-[#9FB3CF] leading-relaxed">
                            Real-time ingestion of patient blood pressure, pulse rate, and SpO2 telemetry directly during live virtual sessions.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#163761] bg-[#081b35]/40 p-5 space-y-3 hover:border-sky-500/40 transition">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Pill size={20} />
                        </div>
                        <h3 className="text-base font-semibold text-white">Instant E-Prescribing & Lab Orders</h3>
                        <p className="text-xs text-[#9FB3CF] leading-relaxed">
                            Issue digital prescriptions and lab test requisitions seamlessly to connected pharmacies and diagnostics centers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

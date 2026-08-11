import React from 'react';
import { Video, Sparkles, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TeleConsultSessionPage() {
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in space-y-6 p-2 md:p-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/provider/queue')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#163761] bg-[#081b35] px-3.5 py-2 text-xs font-semibold text-[#9FB3CF] hover:text-white hover:bg-white/5 transition"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Live Queue</span>
                </button>
            </div>

            <div className="rounded-2xl border border-[#163761] bg-[#081b35]/60 p-8 text-center flex flex-col items-center gap-4 max-w-2xl mx-auto my-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <Video size={30} />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    <Clock size={13} />
                    <span>Launching Q4 2026</span>
                </div>

                <h1 className="text-2xl font-bold text-white">Live Virtual Consultation Room</h1>
                
                <p className="text-sm text-[#9FB3CF] max-w-md leading-relaxed">
                    Interactive WebRTC video sessions with integrated SOAP clinical documentation and real-time vital telemetry will launch in Q4 2026.
                </p>

                <div className="pt-2">
                    <button
                        onClick={() => navigate('/provider/telemedicine')}
                        className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg shadow-sky-500/20"
                    >
                        <Sparkles size={14} />
                        <span>View Telemedicine Roadmap & Early Access</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

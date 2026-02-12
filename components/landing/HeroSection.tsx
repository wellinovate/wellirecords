import React from "react";
import { Shield, ChevronRight, Play, Check, Activity } from "lucide-react";

type Props = {
  onGetStarted: () => void;
  onWatchDemo: () => void;
};

export function HeroSection({ onGetStarted, onWatchDemo }: Props) {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100">
            <Shield size={12} /> HIPAA Compliant & Secure
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Your complete medical history,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              accessible anywhere.
            </span>
          </h1>

          <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
            Stop chasing down faxed records. WelliRecord connects your doctors,
            labs, and wearables into one secure timeline—owned completely by
            you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
            >
              Create Free Account <ChevronRight size={18} />
            </button>

            <button
              onClick={onWatchDemo}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" className="text-slate-400" />{" "}
              Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                >
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                </div>
              ))}
            </div>
            <div>Trusted by 50,000+ patients</div>
          </div>
        </div>

        <div className="relative lg:h-[600px] flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-slate-900 overflow-hidden ring-1 ring-slate-900/5">
            <div className="h-14 bg-slate-800 flex items-center justify-between px-6">
              <div className="w-20 h-4 bg-slate-700 rounded-full"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            </div>

            <div className="p-6 space-y-4">
              <div className="h-32 bg-slate-800 rounded-2xl w-full p-4 space-y-2">
                <div className="flex justify-between">
                  <div className="w-24 h-4 bg-slate-700 rounded"></div>
                  <div className="w-12 h-4 bg-emerald-500/20 rounded"></div>
                </div>
                <div className="w-full h-12 bg-slate-700/50 rounded-lg mt-4"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-slate-800 rounded-2xl"></div>
                <div className="h-24 bg-slate-800 rounded-2xl"></div>
              </div>

              <div className="h-16 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center px-4 gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                <div className="space-y-1.5">
                  <div className="w-32 h-3 bg-blue-200/20 rounded"></div>
                  <div className="w-20 h-2 bg-blue-200/10 rounded"></div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-full text-white shadow-lg">
                <Check size={20} strokeWidth={3} />
              </div>
              <div className="text-white">
                <div className="font-bold text-sm">Records Synced</div>
                <div className="text-xs opacity-80">
                  Mount Sinai Hospital • Just now
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute top-1/4 -right-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                Vitals
              </div>
              <div className="font-bold text-slate-900">Perfect Score</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

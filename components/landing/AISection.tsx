import React from "react";
import { Check } from "lucide-react";

export function AISection() {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-500/30">
            Powered by Gemini 2.5
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Medical jargon, translated into plain English.
          </h2>

          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Don&apos;t just read your lab results—understand them. WelliRecord&apos;s AI
            assistant analyzes complex clinical notes and explains them simply,
            highlighting what actually matters for your health.
          </p>

          <ul className="space-y-4">
            {[
              "Instant lab result analysis & trends",
              "Drug interaction warnings",
              "Personalized wellness recommendations",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-1 rounded-full text-emerald-400">
                  <Check size={16} />
                </div>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl relative">
          <div className="flex gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-white">AI</span>
            </div>

            <div className="bg-slate-700 rounded-2xl rounded-tl-none p-4 text-sm text-slate-200 leading-relaxed shadow-sm">
              <p className="mb-2">I&apos;ve analyzed your Comprehensive Metabolic Panel.</p>
              <p>
                <strong>Good news:</strong> Your Kidney Function (eGFR) has improved
                by 15% since last year. However, your Vitamin D is slightly low
                (28 ng/mL).
              </p>
              <p className="mt-2 text-blue-300 cursor-pointer hover:underline">
                View suggested supplements &rarr;
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 text-sm shadow-sm">
              That&apos;s great! What foods should I eat for Vitamin D?
            </div>
            <div className="w-10 h-10 bg-slate-600 rounded-full overflow-hidden shrink-0">
              <img src="https://i.pravatar.cc/100?img=12" alt="User" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

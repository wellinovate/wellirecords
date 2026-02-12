import React from "react";
import {
  Lock,
  ShieldCheck,
  ExternalLink,
  Key,
  FileText,
  Database,
  Server,
} from "lucide-react";
import type { SecurityFeature } from "../modals/SecurityModal";

type Props = {
  onOpen: (feature: SecurityFeature) => void;
};

export function SecuritySection({ onOpen }: Props) {
  return (
    <section
      className="py-24 bg-slate-900 text-white border-y border-slate-800"
      id="security"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wide border border-emerald-500/20 mb-4">
            <Lock size={12} /> Iron-Clad Protection
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your health data, secured like a vault.
          </h2>

          <p className="text-lg text-slate-400">
            We use military-grade encryption and decentralized storage to ensure
            that you—and only you—hold the keys to your medical history.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-colors flex flex-col">
            <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">NDPR & HIPAA Compliant</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              Fully compliant with the Nigeria Data Protection Regulation (NDPR)
              and US HIPAA standards, ensuring your rights are protected globally.
            </p>
            <button
              onClick={() => onOpen("certificate")}
              className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
            >
              View Certificate <ExternalLink size={12} />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-colors flex flex-col">
            <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <Key size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Zero-Knowledge Architecture
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              Your data is encrypted on your device before it ever touches our
              servers. We cannot see your records, even if we wanted to.
            </p>
            <button
              onClick={() => onOpen("whitepaper")}
              className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
            >
              Read Whitepaper <FileText size={12} />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition-colors flex flex-col">
            <div className="w-12 h-12 bg-purple-900/30 text-purple-400 rounded-xl flex items-center justify-center mb-4">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Data Sovereignty</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              Your records are stored on the WelliChain, an immutable ledger. You
              grant and revoke access permissions in real-time.
            </p>
            <button
              onClick={() => onOpen("network")}
              className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider"
            >
              Explore Network <Server size={12} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

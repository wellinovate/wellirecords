import React from "react";
import {
  X,
  ShieldCheck,
  Award,
  CheckCircle,
  FileCode,
  User,
  Server,
  Database,
  Download,
  Activity,
  Clock,
} from "lucide-react";

export type SecurityFeature = "certificate" | "whitepaper" | "network" | null;

type Props = {
  active: SecurityFeature;
  onClose: () => void;
};

export function SecurityModal({ active, onClose }: Props) {
  if (!active) return null;

  // 1) Certificate
  if (active === "certificate") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white text-slate-900 w-full max-w-2xl rounded-sm shadow-2xl relative flex flex-col max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>

          <div className="p-12 border-8 border-slate-100 h-full flex flex-col items-center text-center overflow-y-auto relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <ShieldCheck size={400} />
            </div>

            <div className="mb-8">
              <Award size={64} className="text-emerald-600 mx-auto mb-4" />
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                Certificate of Compliance
              </h2>
              <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">
                WelliRecord Data Systems
              </p>
            </div>

            <div className="prose prose-slate max-w-lg mx-auto text-sm leading-relaxed mb-8">
              <p>
                This document certifies that the{" "}
                <strong>WelliRecord™ Health Ecosystem</strong> has successfully
                passed all security audits and compliance verifications for the
                handling of Protected Health Information (PHI).
              </p>
              <p>
                The architecture strictly adheres to the data privacy and
                security mandates defined by:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-8">
              <div className="border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center bg-slate-50">
                <div className="font-bold text-lg text-slate-900">NDPR</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Nitda Nigeria
                </div>
                <div className="mt-2 text-emerald-600">
                  <CheckCircle size={20} />
                </div>
              </div>
              <div className="border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center bg-slate-50">
                <div className="font-bold text-lg text-slate-900">HIPAA</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                  United States
                </div>
                <div className="mt-2 text-emerald-600">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>

            <div className="mt-auto w-full border-t border-slate-200 pt-6 flex justify-between items-end text-left">
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold">
                  Certificate ID
                </div>
                <div className="font-mono text-slate-700">
                  CERT-8921-NDPR-2024
                </div>
              </div>
              <div className="text-right">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_sample.svg"
                  alt="Signature"
                  className="h-8 mb-1 opacity-50"
                />
                <div className="text-xs text-slate-400 uppercase font-bold">
                  Chief Compliance Officer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2) Whitepaper
  if (active === "whitepaper") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl relative flex flex-col max-h-[85vh] border border-slate-800">
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                <FileCode size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  Technical Whitepaper
                </h3>
                <p className="text-xs text-slate-500">
                  Protocol v2.1 • Zero-Knowledge Architecture
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto prose prose-invert max-w-none prose-sm">
            <h2 className="text-white">Abstract</h2>
            <p className="text-slate-400">
              This paper introduces the WelliRecord Protocol, a decentralized
              framework for health data interoperability that prioritizes
              patient sovereignty through Zero-Knowledge Proofs (ZKPs). By
              utilizing client-side encryption and verifiable credentials,
              WelliRecord ensures that no central authority—including WelliCare
              itself—ever possesses the decryption keys to raw patient data.
            </p>

            <div className="my-8 p-6 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-900/10 text-emerald-400">
                    <User size={24} />
                  </div>
                  <span>Client (Keys)</span>
                </div>

                <div className="h-px w-12 bg-slate-700 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 px-1">
                    Encrypted Blob
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-lg border-2 border-slate-700 flex items-center justify-center bg-slate-800 text-slate-400">
                    <Server size={24} />
                  </div>
                  <span>Welli Server</span>
                </div>

                <div className="h-px w-12 bg-slate-700 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 px-1">
                    ZKP Proof
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-lg border-2 border-blue-500 flex items-center justify-center bg-blue-900/10 text-blue-400">
                    <Database size={24} />
                  </div>
                  <span>Blockchain</span>
                </div>
              </div>
            </div>

            <h3 className="text-white">1.0 Zero-Knowledge Proofs</h3>
            <p className="text-slate-400">
              WelliRecord employs zk-SNARKs to allow patients to prove
              eligibility (e.g., insurance coverage, age requirement) without
              revealing underlying data.
            </p>

            <h3 className="text-white">2.0 Client-Side Encryption</h3>
            <p className="text-slate-400">
              All health records are encrypted on the user&apos;s device using
              AES-256-GCM before transmission. The private key is derived from
              the user&apos;s master seed phrase and never leaves the local
              environment.
            </p>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">
              <Download size={18} /> Download PDF (2.4 MB)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3) Network
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300 font-mono">
      <div className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-black">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-400 text-sm ml-4">
              admin@wellichain-mainnet:~
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-4 border border-emerald-500/30 bg-emerald-900/10 rounded-lg">
              <div className="text-xs text-emerald-500 uppercase mb-1">
                Network Status
              </div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity size={20} className="animate-pulse" /> ONLINE
              </div>
            </div>

            <div className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-slate-500 uppercase mb-1">
                Block Height
              </div>
              <div className="text-2xl font-bold text-blue-400">#12,894,021</div>
            </div>

            <div className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-slate-500 uppercase mb-1">
                Validator Nodes
              </div>
              <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                <Server size={20} /> 128
              </div>
            </div>

            <div className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-slate-500 uppercase mb-1">
                Avg Block Time
              </div>
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                <Clock size={20} /> 2.1s
              </div>
            </div>
          </div>

          {/* Keep your existing network body here (tx list + node map) */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
}

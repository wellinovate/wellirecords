import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, Eye, Server, Key, Globe, ArrowRight } from 'lucide-react';
import { welliIcon } from '@/assets';
import WelliFooter from '../../../../components/ui/Footer';

const PILLARS = [
  {
    Icon: Lock,
    title: 'End-to-End Encryption',
    desc: 'All health records are encrypted at rest (AES-256) and in transit (TLS 1.3). Only the patient and explicitly consented parties can access data.',
  },
  {
    Icon: Shield,
    title: 'NDPA 2023 Compliance',
    desc: 'Designed from day one to align with the Nigeria Data Protection Act (NDPA) 2023, administered by the National Data Protection Commission (NDPC).',
  },
  {
    Icon: Eye,
    title: 'Immutable Audit Trails',
    desc: 'Every access event is permanently logged. Patients see exactly who accessed what and when — with full provenance on every record.',
  },
  {
    Icon: Key,
    title: 'Patient-Controlled Access',
    desc: 'Patients grant and revoke provider access explicitly. WelliRecord never shares your data without your direct consent.',
  },
  {
    Icon: Server,
    title: 'Sovereign Data Hosting',
    desc: 'Data is hosted on NG-CERTs compliant infrastructure in Nigerian data centres, maintaining data sovereignty under Nigerian law.',
  },
  {
    Icon: Globe,
    title: 'FHIR R4 Standards',
    desc: 'All records are stored in HL7 FHIR R4 format, ensuring portability and interoperability with any compliant system globally.',
  },
];

export function SecurityPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <style>{`
        .sec-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px;
          display: flex;
          align-items: flex-start;
          gap: 18px;
          box-shadow: 0 2px 12px rgba(7,27,63,0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .sec-card:hover {
          box-shadow: 0 8px 32px rgba(7,27,63,0.10);
          transform: translateY(-2px);
        }
        .sec-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(30,58,138,0.07);
          border: 1px solid rgba(30,58,138,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={welliIcon} alt="WelliRecord" className="h-8 w-8 object-contain" />
            <span className="font-black text-[#071B3F] text-base" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif', letterSpacing: '-0.02em' }}>
              Welli<span className="font-normal text-slate-400">Record</span>™
            </span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3a8a] hover:text-[#071B3F] transition"
          >
            <ArrowLeft size={15} /> Back to Home
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#1e3a8a] mb-3">Security & Privacy</p>
          <h1 className="text-4xl font-black tracking-tight text-[#071B3F] sm:text-5xl mb-4" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
            Built to be trusted with your most sensitive data
          </h1>
          <p className="text-slate-500 text-lg leading-8 max-w-2xl mx-auto">
            Patient data security is a foundational principle at WelliRecord, not an afterthought. Every design decision starts with consent and privacy.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {PILLARS.map((p) => (
            <div key={p.title} className="sec-card">
              <div className="sec-icon-wrap">
                <p.Icon size={22} color="#1e3a8a" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#071B3F] mb-1">{p.title}</h2>
                <p className="text-sm text-slate-500 leading-6">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bug bounty block */}
        <div className="rounded-2xl bg-[#071B3F] px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Shield size={28} color="#60A5FA" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
                Responsible Disclosure
              </h2>
              <p className="text-[#9FB2D6] text-sm leading-6">
                We run a responsible disclosure programme. If you discover a security vulnerability in WelliRecord, please report it to{' '}
                <a href="mailto:security@wellirecord.com" className="text-[#60A5FA] hover:underline">security@wellirecord.com</a>.
                We respond within 48 hours and acknowledge responsible researchers.
              </p>
            </div>
            <a
              href="mailto:security@wellirecord.com?subject=Security%20Disclosure"
              className="flex items-center gap-2 flex-shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#071B3F] shadow-sm transition hover:bg-slate-100"
            >
              Report a Vulnerability <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </main>

      <WelliFooter />
    </div>
  );
}

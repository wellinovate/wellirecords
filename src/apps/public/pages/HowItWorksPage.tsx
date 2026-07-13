import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Building2, Shield, Eye, ArrowRight } from 'lucide-react';
import { welliIcon } from '@/assets';
import WelliFooter from '../../../../components/ui/Footer';

const STEPS = [
  {
    step: '01',
    Icon: UserPlus,
    title: 'Create Your Vault',
    desc: 'Sign up as a patient with your email. Your encrypted health vault is created instantly — free forever.',
    portal: 'Patient',
    portalColor: '#1e3a8a',
    portalBg: 'rgba(30,58,138,0.08)',
  },
  {
    step: '02',
    Icon: Building2,
    title: 'Providers Join',
    desc: 'Hospitals, labs, and other providers register and verify their organisation. Patient access requires explicit patient consent.',
    portal: 'Provider',
    portalColor: '#0c2d66',
    portalBg: 'rgba(12,45,102,0.08)',
  },
  {
    step: '03',
    Icon: Shield,
    title: 'You Grant Consent',
    desc: 'When you visit a provider, you choose exactly what they can see and for how long. You can revoke access at any time.',
    portal: 'Patient',
    portalColor: '#1e3a8a',
    portalBg: 'rgba(30,58,138,0.08)',
  },
  {
    step: '04',
    Icon: Eye,
    title: 'Provider Views Records',
    desc: 'With consent, providers securely access your relevant records. Every access is logged in your personal audit trail.',
    portal: 'Provider',
    portalColor: '#0c2d66',
    portalBg: 'rgba(12,45,102,0.08)',
  },
  {
    step: '05',
    Icon: ArrowRight,
    title: 'Records Contributed Back',
    desc: 'Labs publish results, doctors add notes, pharmacies confirm dispense — all contributing back to your vault automatically.',
    portal: 'Both',
    portalColor: '#4338ca',
    portalBg: 'rgba(67,56,202,0.08)',
  },
];

export function HowItWorksPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <style>{`
        .hiw-step-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 32px;
          display: flex;
          align-items: flex-start;
          gap: 24px;
          box-shadow: 0 2px 16px rgba(7,27,63,0.05);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .hiw-step-card:hover {
          box-shadow: 0 8px 32px rgba(7,27,63,0.10);
          transform: translateY(-2px);
        }
        .hiw-step-num {
          font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: rgba(30,58,138,0.12);
          line-height: 1;
          flex-shrink: 0;
          width: 60px;
        }
        .hiw-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(30,58,138,0.07);
          border: 1px solid rgba(30,58,138,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hiw-portal-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 100px;
        }
        .hiw-connector {
          width: 2px;
          height: 32px;
          background: linear-gradient(to bottom, #BFDBFE, transparent);
          margin: 0 auto;
        }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
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

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#1e3a8a] mb-3">How It Works</p>
          <h1 className="text-4xl font-black tracking-tight text-[#071B3F] sm:text-5xl mb-4" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
            A consent-first health record platform
          </h1>
          <p className="text-slate-500 text-lg leading-8 max-w-xl mx-auto">
            Built around patient ownership — your records, your rules, accessible when it matters most.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="hiw-step-card">
                <div className="hiw-step-num">{s.step}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="hiw-icon-wrap">
                      <s.Icon size={20} color="#1e3a8a" />
                    </div>
                    <h2 className="font-bold text-lg text-[#071B3F]">{s.title}</h2>
                    <span
                      className="hiw-portal-badge ml-auto"
                      style={{ background: s.portalBg, color: s.portalColor }}
                    >
                      {s.portal}
                    </span>
                  </div>
                  <p className="text-slate-500 leading-7">{s.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hiw-connector" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auth/patient/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071B3F] px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#0c2d66]"
          >
            Start as Patient <ArrowRight size={16} />
          </Link>
          <Link
            to="/auth/provider/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#071B3F] bg-white px-8 py-4 text-base font-semibold text-[#071B3F] transition hover:bg-slate-50"
          >
            Register as Provider <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <WelliFooter />
    </div>
  );
}

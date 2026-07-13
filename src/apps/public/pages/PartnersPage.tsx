import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, FlaskConical, Pill, ShieldCheck, Video, Watch, HandHeart, Landmark } from 'lucide-react';
import { welliIcon } from '@/assets';
import WelliFooter from '../../../../components/ui/Footer';

const PARTNER_TYPES = [
  {
    Icon: Building2,
    type: 'Hospital / Clinic',
    desc: 'SOAP notes, lab orders, prescriptions, referrals, and discharge summaries — structured and patient-accessible.',
  },
  {
    Icon: FlaskConical,
    type: 'Diagnostic Lab',
    desc: 'Lab order queue, result publishing, verification and digital signatures — no more paper results.',
  },
  {
    Icon: Pill,
    type: 'Pharmacy',
    desc: 'ePrescription inbox, dispense tracking, and medication history write-back into the patient vault.',
  },
  {
    Icon: ShieldCheck,
    type: 'Insurance / HMO',
    desc: 'Claims submission, eligibility verification, and evidence delivery via explicit patient consent.',
  },
  {
    Icon: Video,
    type: 'Telehealth Provider',
    desc: 'Session creation, pre-session consent linking, and visit note export to the patient record.',
  },
  {
    Icon: Watch,
    type: 'Wearable Vendor',
    desc: 'OAuth device connection, data ingestion, and patient-controlled sync with health history.',
  },
  {
    Icon: HandHeart,
    type: 'NGO / Health Programme',
    desc: 'Programme enrollment, population-level analytics, and subsidy linkage — with patient consent at the centre.',
  },
  {
    Icon: Landmark,
    type: 'Government / Ministry',
    desc: 'Anonymised analytics dashboards, programme management, and subsidy tracking for public health.',
  },
];

export function PartnersPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <style>{`
        .partner-card {
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
        .partner-card:hover {
          box-shadow: 0 8px 32px rgba(7,27,63,0.10);
          transform: translateY(-2px);
        }
        .partner-icon-wrap {
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
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#1e3a8a] mb-3">Partner Ecosystem</p>
          <h1 className="text-4xl font-black tracking-tight text-[#071B3F] sm:text-5xl mb-4" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
            Every stakeholder. One platform.
          </h1>
          <p className="text-slate-500 text-lg leading-8 max-w-2xl mx-auto">
            WelliRecord connects every participant in the healthcare journey — with patient consent at the centre of every interaction.
          </p>
        </div>

        {/* Partner grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {PARTNER_TYPES.map((p) => (
            <div key={p.type} className="partner-card">
              <div className="partner-icon-wrap">
                <p.Icon size={22} color="#1e3a8a" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#071B3F] mb-1">{p.type}</h2>
                <p className="text-sm text-slate-500 leading-6">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pilot CTA block */}
        <div className="rounded-2xl bg-[#071B3F] px-8 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#60A5FA] mb-3">Pilot Programme — Abuja</p>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
            Become an anchor facility
          </h2>
          <p className="text-[#9FB2D6] text-base leading-7 mb-8 max-w-lg mx-auto">
            We're onboarding a small, deliberate first cohort of hospitals, diagnostic centres, and HMOs in Abuja. Free setup, no commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/provider/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#071B3F] shadow-sm transition hover:bg-slate-100"
            >
              Register your organisation <ArrowRight size={16} />
            </Link>
            <a
              href="mailto:inquiry@wellirecord.com?subject=Pilot%20Partner%20Enquiry"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Contact us about the pilot
            </a>
          </div>
        </div>
      </main>

      <WelliFooter />
    </div>
  );
}

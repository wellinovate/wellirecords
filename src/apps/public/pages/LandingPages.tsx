import React, { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Hospital,
  Microscope,
  Pill,
  Shield,
  Stethoscope,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WelliFooter from "../../../../components/ui/Footer";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  control_access_image,
  diagonize,
  government,
  HealthRecord,
  hopistal,
  insurance,
  logos,
  NGOs,
  pharmacies,
  qr_card_image,
  telehealth,
  wearable,
  wellirecordimage,
  yourhealthrecord,
} from "../../../assets";
import { hero, welliIcon } from "@/assets";
import { getCurrentUser } from "@/shared/utils/utilityFunction";

const navItems = [
  { label: "Solutions", href: "#solutions", hasChevron: true },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About Us", href: "/about" },
];

const painPoints = [
  "Lost hospital cards & paper folders",
  "Repeating expensive diagnostic tests",
  "Carrying physical folders to every clinic",
  "Switching hospitals means starting from scratch",
  "Emergency doctors lacking instant patient history",
];

const timelineSteps = [
  {
    title: "Receive Care",
    description:
      "Hospitals, labs, and pharmacies generate your medical records.",
  },
  {
    title: "Records Go To Your Health Vault",
    description:
      "Your data is entered and securely stored in your WelliRecord health vault.",
  },
  {
    title: "You Control Access",
    description:
      "Share your records securely with doctors or hospitals whenever needed.",
  },
];

const featureCards = [
  {
    title: "Own Your Health Record",
    description: "Your complete medical history in one secure vault.",
    icon: yourhealthrecord,
  },
  {
    title: "Control Access Instantly",
    description: "Grant or revoke provider access anytime.",
    icon: control_access_image,
  },
  {
    title: "Emergency QR Card",
    description: "Share critical health data instantly in emergencies.",
    icon: qr_card_image,
  },
];

const stakeholders = [
  { label: "Hospitals", icon: hopistal },
  { label: "Diagnostic Labs", icon: diagonize },
  { label: "Pharmacies", icon: pharmacies },
  { label: "Telehealth", icon: telehealth },
  { label: "Insurance", icon: insurance },
  { label: "Wearables", icon: wearable },
  { label: "NGOs", icon: NGOs },
  { label: "Government", icon: government },
];

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mx-auto max-w-5xl mb-12 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-[#1F4E79] md:text-5xl mb-2">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-[850px] text-base leading-7 text-slate-500 md:text-xl">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({ children, href = "" }) {
  return (
    <Link
      to={href}
      className="inline-flex items-center justify-center rounded-xl bg-[#071B3F] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0c2d66] focus:outline-none focus:ring-2 focus:ring-[#071B3F] focus:ring-offset-2"
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const users = getCurrentUser();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur overflow-x-hidden">
      <div className="mx-auto flex w-full sm:max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
            <img src={welliIcon} alt="WelliRecord" className="h-8 w-8 sm:h-9 sm:w-9 object-contain flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-[#1e3a8a] font-black text-base sm:text-lg tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                Welli<span className="font-normal">Record</span><sup className="text-[10px] font-normal align-super">™</sup>
              </span>
              <span className="text-[#1e3a8a] text-[7px] sm:text-[8px] font-bold tracking-[0.12em] uppercase opacity-60">One patient. One trusted record. Accessible when it matters.</span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.label}
                to={item.href}
                className="inline-flex items-center gap-1 text-base font-semibold text-[#1F4E79] transition hover:text-slate-950 xl:text-lg"
              >
                {item.label}
                {item.hasChevron ? <ChevronDown className="h-4 w-4" /> : null}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-1 text-base font-semibold text-[#1F4E79] transition hover:text-slate-950 xl:text-lg"
              >
                {item.label}
                {item.hasChevron ? <ChevronDown className="h-4 w-4" /> : null}
              </a>
            )
          )}
        </nav>

        {/* Desktop Actions */}
        {!user ? (
          <div className="hidden items-center gap-4 lg:flex">
            <Link
              to="/auth/login"
              className="text-base font-semibold text-[#1F4E79] transition hover:text-[#071B3F] xl:text-lg"
            >
              Login
            </Link>
            <Link
              to="/auth/provider/login"
              className="text-base font-semibold text-[#1F4E79] transition hover:text-[#071B3F] xl:text-lg"
            >
              Provider Login
            </Link>
            <PrimaryButton href="/auth/pre-signup">
              Create Health Vault
            </PrimaryButton>
          </div>
        ) : (
          <div className="hidden items-center gap-4 lg:flex">
            <button
              onClick={handleSignOut}
              className="text-base font-semibold text-[#1F4E79] transition hover:text-[#071B3F] xl:text-lg"
            >
              Log Out
            </button>
            <PrimaryButton
              href={
                user?.data?.account?.accountType === "user"
                  ? "/patient/overview"
                  : "/provider/overview"
              }
            >
              My Dashboard
            </PrimaryButton>
          </div>
        )}

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-[#1F4E79] transition hover:bg-slate-100 lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) =>
                item.href.startsWith("/") ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-between rounded-lg px-2 py-2 text-base font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                  >
                    <span>{item.label}</span>
                    {item.hasChevron ? <ChevronDown className="h-4 w-4" /> : null}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-between rounded-lg px-2 py-2 text-base font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                  >
                    <span>{item.label}</span>
                    {item.hasChevron ? <ChevronDown className="h-4 w-4" /> : null}
                  </a>
                )
              )}
            </nav>

            <div className="flex flex-col gap-3 pt-2">
              {!user ? (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-center text-base font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                  >
                    Login
                  </Link>

                  <Link
                    to="/auth/provider/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-center text-base font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                  >
                    Provider Login
                  </Link>

                  <Link
                    to="/auth/pre-signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-[#071B3F] px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-[#0c2d66]"
                  >
                    Create Health Vault
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={
                      user?.data?.account?.accountType === "user"
                        ? "/patient/overview"
                        : "/provider/overview"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-[#071B3F] px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-[#0c2d66]"
                  >
                    My Dashboard
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-base font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroIllustration() {
  return (
    <div className="relative min-h-[440px] w-full overflow-hidden rounded-[24px] shadow-sm border border-slate-200/80 bg-slate-100">
      <img
        src={hero}
        alt="WelliRecord Hero"
        className="h-full w-full object-cover"
      />
      <div className="absolute left-4 top-4 rounded-full bg-[#071B3F] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 z-10">
        <Shield className="h-3.5 w-3.5 text-emerald-400" />
        Trusted Health Vault
      </div>
      <div className="absolute right-6 top-12 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur px-3.5 py-2.5 shadow-md border border-slate-200/80 z-10">
        <BadgeCheck className="h-5 w-5 text-emerald-600" />
        <span className="text-xs font-semibold text-slate-800">NDPA Compliant</span>
      </div>
    </div>
  );
}

function ProblemVisual() {
  return (
    <div className="relative mt-6 sm:mt-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <img
          src={HealthRecord}
          alt="Fragmented Medical Records"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="bg-slate-50/70 border-y border-slate-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Healthcare Records Shouldn't Be This Hard"
          subtitle="Healthcare data across Nigeria is fragmented, siloed, and difficult to access when it matters most."
        />

        <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 xl:gap-20">
          <div className="order-1">
            <ProblemVisual />
          </div>

          <div className="order-2">
            <h3 className="max-w-xl text-xl font-bold text-slate-950 sm:text-2xl lg:max-w-sm">
              Some of the pain points include:
            </h3>

            <div className="mt-6 space-y-5 sm:mt-8">
              {painPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d4f82] text-white">
                    <ArrowRight className="h-3 w-3" />
                  </div>

                  <p className="text-base font-semibold leading-7 text-[#002353] sm:text-lg">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 flex items-center gap-2 text-sm font-semibold text-[#1F4E79]">
              <span>See how WelliRecord solves this below</span>
              <ArrowRight className="h-4 w-4 rotate-90 text-[#1F4E79]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-300" />

      <div className="space-y-8 sm:space-y-10">
        {timelineSteps.map((step) => (
          <div
            key={step.title}
            className="relative flex items-start gap-4 sm:gap-6"
          >
            <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1d4f82] bg-white">
              <div className="h-3.5 w-3.5 rounded-full bg-[#1d4f82]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-950 sm:text-lg">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowVisual() {
  return (
    <div className="relative mt-6 w-full sm:mt-8 lg:mt-10">
      <div className="relative z-10 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg">
        <img
          src={wellirecordimage}
          alt="Workflow Illustration"
          className="block h-auto w-full rounded-xl object-cover"
        />
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 xl:gap-20">
          <div>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl lg:max-w-sm">
              How WelliRecord Works
            </h2>

            <div className="mt-8 sm:mt-10">
              <Timeline />
            </div>
          </div>

          <div className="w-full">
            <WorkflowVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureVisual({ icon: Icon }) {
  return (
    <div className="relative h-52 overflow-hidden rounded-t-xl bg-[linear-gradient(135deg,#e7f0fb_0%,#ffffff_50%,#eef4f8_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.18),transparent_35%)]" />
      <div className="absolute inset-0 h-full w-full rounded-t-2xl overflow-hidden">
        <img src={Icon} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function Features() {
  return (
    <section className="bg-slate-50/70 border-t border-slate-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Core Features"
          subtitle="What can you actually do with WelliRecord?"
        />

        <div className="relative mt-8 sm:mt-12">
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <FeatureVisual icon={feature.icon} />

                <div className="px-5 pb-8 pt-6 text-center sm:px-6">
                  <h3 className="text-base font-bold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StakeholderCard({ label, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8 text-center cursor-pointer shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm overflow-hidden p-2">
        <img src={Icon} alt="" className="w-full h-full object-contain" />
      </div>
      <p className="mt-4 text-base font-semibold text-[#002353]">{label}</p>
    </div>
  );
}

function Solutions() {
  return (
    <section id="solutions" className="bg-white border-t border-slate-100 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title="One Platform, Every Healthcare Stakeholder." />

        <div className="mt-12 mx-auto grid max-w-5xl gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4">
          {stakeholders.map((item) => (
            <StakeholderCard
              key={item.label}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/auth/provider/signup"
            className="font-semibold text-base bg-[#071B3F] py-4 px-8 text-white shadow-md transition hover:bg-[#0c2d66] rounded-2xl inline-block"
          >
            Register Your Organisation
          </Link>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section
      id="proof"
      className="border-t border-slate-100 bg-[#F8FAFC] px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <style>{`
        /* ── Pilot Programme block ─────────────────── */
        .pilot-block {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.06);
          max-width: 900px;
          margin: 0 auto;
        }
        .pilot-header {
          background: linear-gradient(135deg, #071B3F 0%, #0c2d66 100%);
          padding: 40px 48px;
          position: relative;
          overflow: hidden;
        }
        .pilot-header::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 500px 250px at 110% 50%, rgba(16,185,129,0.14), transparent 65%);
          pointer-events: none;
        }
        .pilot-header-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #34D399;
          margin: 0 0 12px;
        }
        .pilot-header h2 {
          font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
          font-size: clamp(22px, 3.5vw, 32px);
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.2;
          letter-spacing: -0.015em;
          margin: 0 0 10px;
        }
        .pilot-header p {
          font-size: 15px;
          color: #9FB2D6;
          margin: 0;
          line-height: 1.6;
        }
        .pilot-body {
          padding: 40px 48px;
        }
        .pilot-what-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #64748B;
          margin: 0 0 20px;
        }
        .pilot-items {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px 24px;
          margin-bottom: 32px;
        }
        @media (min-width: 640px) {
          .pilot-items {
            grid-template-columns: 1fr 1fr;
          }
        }
        .pilot-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .pilot-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(30, 58, 138, 0.07);
          border: 1px solid rgba(30, 58, 138, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .pilot-item-text strong {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #0F172A;
          margin-bottom: 2px;
        }
        .pilot-item-text span {
          font-size: 13px;
          color: #64748B;
          line-height: 1.5;
        }
        .pilot-metric {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 14px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
        }
        .pilot-metric-icon {
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pilot-metric-text {
          font-size: 14px;
          color: #1e3a8a;
          line-height: 1.55;
        }
        .pilot-metric-text strong {
          font-weight: 700;
        }
        .pilot-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          border-top: 1px solid #F1F5F9;
          padding-top: 28px;
        }
        .pilot-footer-note {
          font-size: 14px;
          color: #64748B;
          line-height: 1.6;
          max-width: 440px;
        }
        .pilot-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #071B3F;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 10px;
          text-decoration: none;
          transition: background .15s ease, transform .15s ease, box-shadow .15s ease;
          white-space: nowrap;
          flex: none;
        }
        .pilot-cta-btn:hover {
          background: #0c2d66;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(7,27,63,0.25);
        }
        .pilot-cta-btn svg {
          width: 15px;
          height: 15px;
          transition: transform .15s ease;
        }
        .pilot-cta-btn:hover svg {
          transform: translateX(2px);
        }
        @media (max-width: 600px) {
          .pilot-header, .pilot-body { padding: 28px 24px; }
          .pilot-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#1e3a8a] mb-3">
            Pilot Programme
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl mb-4">
            Building with anchor facilities in Abuja
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-500 leading-7">
            In conversation with hospitals, diagnostic centres and HMOs across the FCT.
          </p>
        </div>

        <div className="pilot-block">
          {/* Header */}
          <div className="pilot-header">
            <p className="pilot-header-eyebrow">What the pilot includes</p>
            <h2>A structured first cohort</h2>
            <p>
              A small, deliberate group of anchor facilities in Abuja testing one
              thing: whether a patient's record, created at one facility, is
              immediately accessible at the next.
            </p>
          </div>

          {/* Body */}
          <div className="pilot-body">
            <p className="pilot-what-label">Each pilot partner gets</p>

            <div className="pilot-items">
              <div className="pilot-item">
                <div className="pilot-item-icon">
                  <svg className="text-[#1e3a8a]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                    <path d="M9 22V12h6v10"/>
                    <path d="M12 5V2"/>
                    <path d="M10 3h4"/>
                  </svg>
                </div>
                <div className="pilot-item-text">
                  <strong>Free setup &amp; onboarding</strong>
                  <span>We configure the platform for your facility at no cost during the pilot.</span>
                </div>
              </div>
              <div className="pilot-item">
                <div className="pilot-item-icon">
                  <svg className="text-emerald-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className="pilot-item-text">
                  <strong>Patient-owned records</strong>
                  <span>Records belong to the patient — shared with your facility by consent, not by default.</span>
                </div>
              </div>
              <div className="pilot-item">
                <div className="pilot-item-icon">
                  <svg className="text-emerald-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="pilot-item-text">
                  <strong>NDPA-compliant data handling</strong>
                  <span>Full compliance with the Nigeria Data Protection Act 2023 built in from day one.</span>
                </div>
              </div>
              <div className="pilot-item">
                <div className="pilot-item-icon">
                  <svg className="text-emerald-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="pilot-item-text">
                  <strong>Direct input into the product</strong>
                  <span>Your clinical team's feedback shapes what we build next.</span>
                </div>
              </div>
            </div>

            {/* Success metric */}
            <div className="pilot-metric">
              <span className="pilot-metric-icon">
                <svg className="text-[#1e3a8a]" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </span>
              <p className="pilot-metric-text">
                <strong>How we define success:</strong> a patient seen at one pilot
                facility can walk into a second pilot facility and have their record
                available to the receiving clinician — with consent — before the
                consultation begins.
              </p>
            </div>

            {/* Footer */}
            <div className="pilot-footer">
              <p className="pilot-footer-note">
                Named facilities will be listed here once pilot agreements are
                signed. If you represent a hospital, diagnostic centre or HMO
                in Abuja and want to be part of the first cohort, reach out.
              </p>
              <a
                href="mailto:inquiry@wellirecord.com?subject=Pilot%20Partner%20Enquiry"
                className="pilot-cta-btn"
              >
                Become a pilot partner
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Who can see my health records?",
      a: "Only you — and only the providers you explicitly authorise. Access is granted per session: you can open your record for a single consultation, for 24 hours, or permanently for a trusted doctor. You revoke it instantly from your dashboard at any time. WelliRecord staff have zero visibility into your clinical data."
    },
    {
      q: "How does consent work in practice?",
      a: "When a hospital or lab requests access, you receive a one-time code on your registered phone via SMS or WhatsApp. The provider sees nothing until you read out or type that code. Every access event — who viewed what, at what time — is permanently logged in your audit trail."
    },
    {
      q: "What if I lose my phone or Emergency Card?",
      a: "Your data lives in our encrypted vault, not on the physical card or your device. If your card is lost or stolen, log into any browser, go to Settings › Emergency Card, and lock or replace it in under 60 seconds. Your records are never interrupted — only the card token is invalidated."
    },
    {
      q: "What's free and what costs money?",
      a: "Creating your health vault, storing unlimited basic records, WhatsApp registration, and QR emergency card access are permanently free for patients. Optional add-ons — teleconsultations, home lab bookings, and physical card delivery — carry small disclosed fees. Hospitals pay a separate subscription; patients never subsidise that cost."
    },
    {
      q: "What happens the moment I'm brought into an emergency room?",
      a: "The attending nurse or doctor scans the QR code on your card with any smartphone camera — no app required. Within seconds they see your critical allergy warning, blood group, active medications, and two emergency contacts. Your full medical history stays locked unless you (or your listed next-of-kin) grant explicit access."
    },
    {
      q: "Is my data stored in Nigeria?",
      a: "Yes. All personal health data for Nigerian patients is stored on servers located in Nigeria, in full compliance with the Nigeria Data Protection Act (NDPA) 2023. We do not transfer your records to foreign jurisdictions without your written consent."
    }
  ];

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="bg-slate-50/80 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 border-t border-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1e3a8a] mb-3">Common Questions</p>
          <h2
            className="text-3xl font-extrabold text-[#071B3F] sm:text-4xl tracking-tight"
            style={{ fontFamily: "Bricolage Grotesque, Inter, sans-serif" }}
          >
            Every question a Nigerian family asks before enrolling
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm">
            Plain answers. No fine print.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#1e3a8a]/30 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex-shrink-0 text-xs font-black w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isOpen
                          ? "bg-[#071B3F] text-white"
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-semibold transition-colors ${
                        isOpen ? "text-[#071B3F]" : "text-slate-800"
                      }`}
                    >
                      {faq.q}
                    </span>
                  </div>
                  <span
                    className={`ml-4 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isOpen
                        ? "bg-[#071B3F] text-white rotate-45"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? "200px" : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-6 pb-6 ml-11">
                    <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-[#1e3a8a]/20 pl-4">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Still have a question?{" "}
            <a
              href="https://wa.me/2348053355504?text=HELLO"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1e3a8a] hover:underline underline-offset-2"
            >
              Ask us on WhatsApp →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function ConversionBanner() {
  return (
    <section className="bg-[#071B3F] text-white px-4 py-20 sm:py-24 text-center border-t border-white/10 relative overflow-hidden">
      <div className="mx-auto max-w-4xl relative z-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9FB2D6] mb-4">
          Now onboarding partner facilities in Abuja
        </p>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 font-display">
          Create your health vault in minutes, not paperwork.
        </h2>
        <p className="text-lg text-[#9FB2D6] max-w-2xl mx-auto mb-8">
          Your complete medical history — hospitals, labs, prescriptions — in one secure, private vault. You control who sees it, always.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <Link
            to="/auth/patient/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#071B3F] shadow-lg transition hover:bg-slate-100"
          >
            Create Health Vault — Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <p className="text-xs font-medium text-slate-400">
          NDPA Compliant • Encrypted at Rest & Transit • Patient-Controlled Access
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOUNDING STORY CARD
───────────────────────────────────────────── */
function FoundingStory() {
  return (
    <section id="story" className="bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-[#071B3F] text-white p-8 sm:p-12 lg:p-16 border border-[#1e3a8a]/40 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#60A5FA] mb-4">
                Why We Built This
              </p>
              <blockquote className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-white font-display">
                "A doctor needed one piece of information — an allergy — and it wasn't there. We almost lost someone because a record didn't follow the patient."
              </blockquote>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#10B981]">
                — The moment WelliRecord began, Abuja, Nigeria
              </p>
            </div>

            <div className="space-y-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              <p>
                Nigeria has some of Africa's finest doctors. But patient records don't travel with patients.
                Every hospital visit starts from zero — hand-written forms, verbal histories, repeated tests.
                In an emergency, that gap costs lives.
              </p>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
                <p className="text-sm text-slate-200 leading-normal">
                  <strong className="text-white font-semibold">One patient. One trusted record.</strong> Accessible at any facility, with the patient's explicit consent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <div className="w-full bg-[#F8FAFC] py-8 pt-4 text-slate-900 sm:py-10 lg:py-12 border-b border-slate-100">
      <main className="flex w-full flex-col overflow-hidden lg:min-h-[500px] lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="flex flex-1 items-center justify-center py-8 sm:py-12 lg:py-14">
          <div className="w-full max-w-2xl">
            <h1 className="max-w-[580px] text-4xl font-extrabold leading-tight tracking-tight text-[#002353] sm:text-5xl lg:text-[54px] lg:leading-[1.08]">
              Own Your Complete Medical History
            </h1>

            <p className="mt-6 max-w-[640px] text-base leading-7 text-[#475569] sm:mt-7 sm:text-lg sm:leading-8 lg:text-[19px] lg:leading-[1.45]">
              The first patient-owned health vault in Africa, WelliRecord
              securely connects your hospitals, labs, and pharmacies into a
              single private health vault, giving you full control over who can
              access your medical history.
            </p>

            {/* Clear, Single Primary CTA + Demoted Secondary Options */}
            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:items-start">
              <Link
                to="/auth/patient/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#071B3F] px-8 py-4 text-center text-lg font-bold text-white shadow-lg transition hover:bg-[#0c2d66]"
              >
                Create Health Vault <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <a
                  href="https://wa.me/2348053355504?text=REGISTER"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#25D366] hover:underline"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Register via WhatsApp
                </a>
                <span className="text-slate-300">•</span>
                <Link
                  to="/auth/provider/signup"
                  className="font-medium text-[#1e3a8a] hover:underline"
                >
                  Healthcare Provider or Hospital? Register Org →
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c6f85] sm:text-xs">
              <Link to="/privacy" className="hover:underline text-[#1e3a8a]">NDPA Compliant</Link>
              <span className="text-slate-300">•</span>
              <span>Encrypted Vault</span>
              <span className="text-slate-300">•</span>
              <span>Patient-Controlled Access</span>
            </div>
          </div>
        </section>

        {/* Hero Illustration / Graphic Container */}
        <section className="relative min-h-[300px] w-full overflow-hidden sm:min-h-[380px] lg:min-h-[500px] lg:w-[45%] flex items-center justify-center p-4">
          <HeroIllustration />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <div
      id="top"
      className="min-h-screen overflow-x-hidden w-full scroll-smooth bg-white text-slate-900"
    >
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <ProblemSection />
        <FoundingStory />
        <HowItWorks />
        <Features />
        <Solutions />
        <SocialProof />
        <FAQ />
        <ConversionBanner />
        <WelliFooter />
      </main>
    </div>
  );
}

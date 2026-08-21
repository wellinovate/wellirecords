import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import howItWorksHub from "./how-it-works-hub.jpg";

import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Eye,
  FileText,
  FlaskConical,
  HeartPulse,
  Lock,
  Network,
  Pill,
  QrCode,
  Shield,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  diagonize,
  government,
  hopistal,
  insurance,
  NGOs,
  pharmacies,
  telehealth,
  wearable,
} from "../../../assets";
import { hero, welliIcon } from "@/assets";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* ─────────────────────────────────────────────
   NAV DATA
───────────────────────────────────────────── */
const navItems = [
  { label: "Solution", href: "#solutions" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Ecosystem", href: "#ecosystem" },
];

/* ─────────────────────────────────────────────
   CORE SOLUTIONS
───────────────────────────────────────────── */
const coreSolutions = [
  {
    number: "01",
    icon: HeartPulse,
    title: "Patient-Owned Health Record",
    description:
      "A lifelong digital health record that stays with the patient rather than being trapped inside one hospital.",
    listLabel: "Solves",
    list: [
      "Lost paper files",
      "Repeated medical history",
      "Fragmented patient information",
      "Difficulty accessing previous records",
    ],
  },
  {
    number: "02",
    icon: Network,
    title: "Connected Provider Records",
    description:
      "Connects hospitals, clinics, laboratories, pharmacies, eye clinics, diagnostic centers, and other authorized providers around the patient's record.",
    listLabel: "Solves",
    list: [
      "Providers working with incomplete information",
      "Patients moving between facilities",
      "Disconnected healthcare providers",
      "Poor continuity of care",
    ],
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "Laboratory & Diagnostic Record Integration",
    description:
      "Diagnostic centers can send verified results directly into the patient's WelliRecord.",
    listLabel: "Features",
    list: [
      "Lab results",
      "Radiology reports",
      "Imaging records",
      "Diagnostic history",
      "Result notifications",
      "Provider access with patient authorization",
    ],
    note: "Nigerian evidence indicates that better digital documentation can substantially improve health-data quality.",
  },
  {
    number: "04",
    icon: Pill,
    title: "Medication & Pharmacy Records",
    description: "A longitudinal medication history.",
    listLabel: "Includes",
    list: [
      "Prescriptions",
      "Dispensing history",
      "Current medications",
      "Medication allergies",
      "Refill information",
      "Pharmacy encounters",
    ],
    note: "Solves medication duplication, missing medication history, and poor coordination between prescribers and pharmacies.",
  },
  {
    number: "05",
    icon: ShieldCheck,
    title: "Consent & Patient-Controlled Data Sharing",
    description:
      "The patient decides who can access what, for what purpose, and for how long.",
    examples: [
      "Allow Dr. A to access my complete clinical history for 30 days.",
      "Allow this laboratory to add my test results but not view my previous records.",
    ],
    note: "One of WelliRecord's core differentiators.",
  },
  {
    number: "06",
    icon: Siren,
    title: "Emergency Health Information",
    description:
      "Gives authorized clinicians rapid access to critical information.",
    listLabel: "Emergency profile",
    list: [
      "Blood group",
      "Genotype",
      "Allergies",
      "Current medications",
      "Chronic conditions",
      "Emergency contacts",
      "Important medical history",
      "Previous major procedures",
    ],
    note: "Less guessing. Faster decisions.",
  },
];

const welliBridgeChannels = [
  "QR",
  "NFC",
  "Secure PDF summary",
  "SMS/USSD",
  "WhatsApp",
  "Offline access",
  "Smart health card",
];

/* ─────────────────────────────────────────────
   SETUP STEPS (FEATURES)
───────────────────────────────────────────── */
const setupSteps = [
  {
    number: "01",
    icon: UserRound,
    title: "Establish Your Secure Identity",
    description:
      "Verify your identity using government-issued ID and biometrics to create a unique ID tied to your encrypted wallet.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Import and Digitize Documents",
    description:
      "Connect hospitals, labs, and pharmacies to upload existing documents into your health vault.",
  },
  {
    number: "03",
    icon: Eye,
    title: "Control of Your Health History",
    description:
      "Grant granular, time-limited access to any provider, with instant revocation capabilities.",
  },
  {
    number: "04",
    icon: Clock,
    title: "Grant Secure Access to Doctors",
    description:
      "Access your records anywhere with emergency QR codes, offline mode, and cross-border compatibility.",
  },
];

/* ─────────────────────────────────────────────
   TIMELINE STEPS (HOW IT WORKS)
───────────────────────────────────────────── */
const timelineSteps = [
  {
    icon: Stethoscope,
    title: "Receive Care",
    description:
      "When you receive care, your health records are created by hospitals, labs, pharmacies, and other providers.",
  },
  {
    icon: Shield,
    title: "Records Go to Your Health Vault",
    description:
      "Your health information is securely gathered in your personal WelliRecord health vault, keeping your health story in one place.",
  },
  {
    icon: BadgeCheck,
    title: "You Control Access",
    description:
      "You decide who can access your health information and what you choose to share.",
  },
  {
    icon: ArrowRight,
    title: "Access When It Matters",
    description:
      "Your critical health information is available when you need it most, including during emergencies and when connectivity is limited.",
  },
];

/* ─────────────────────────────────────────────
   STAKEHOLDERS
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
const stats = [
  { value: "100%", label: "Patient data ownership" },
  { value: "0", label: "Central key repositories" },
  { value: "∞", label: "Lifetime record storage" },
];

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */
function SectionHeading({ title, subtitle, eyebrow = "" }) {
  return (
    <div className="mx-auto max-w-4xl text-center mb-10 sm:mb-12">
      {eyebrow && (
        <span className="inline-block px-4 py-1.5 rounded-full bg-sky-50 text-[#1F4E79] text-xs font-bold uppercase tracking-widest mb-3.5 border border-sky-100 shadow-sm">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#002353] leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-3.5 max-w-2xl text-base sm:text-lg text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({ children, href = "", className = "" }) {
  return (
    <Link
      to={href}
      className={`inline-flex items-center justify-center rounded-xl bg-[#071B3F] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0c2d66] hover:shadow whitespace-nowrap ${className}`}
    >
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
export function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src={welliIcon}
              alt="WelliRecord"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain flex-shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col leading-tight">
              <span
                className="text-[#1e3a8a] font-black text-base sm:text-lg tracking-tight"
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Welli<span className="font-normal">Record</span>
                <sup className="text-[10px] font-normal align-super">™</sup>
              </span>
              <span className="text-[#1e3a8a] text-[7px] sm:text-[8px] font-bold tracking-[0.12em] uppercase opacity-70">
                One patient. One trusted record. Accessible when it matters.
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-[#1F4E79] transition-colors hover:text-[#071B3F]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        {!user ? (
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link
              to="/auth/login"
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1F4E79] transition hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap"
            >
              Patient Sign in
            </Link>
            <Link
              to="/auth/provider/login"
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1F4E79] transition hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap"
            >
              Provider Sign in
            </Link>
            <PrimaryButton href="/auth/pre-signup">
              Create Health Vault
            </PrimaryButton>
          </div>
        ) : (
          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold text-[#1F4E79] transition hover:text-[#071B3F]"
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
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#1F4E79] transition hover:bg-slate-100 lg:hidden"
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
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-base font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
              {!user ? (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                  >
                    Patient Sign in
                  </Link>

                  <Link
                    to="/auth/provider/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-[#1F4E79] transition hover:bg-slate-50"
                  >
                    Provider Sign in
                  </Link>

                  <Link
                    to="/auth/pre-signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-[#071B3F] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0c2d66] shadow-md"
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
                    className="rounded-xl bg-[#071B3F] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0c2d66] shadow-md"
                  >
                    My Dashboard
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-[#1F4E79] transition hover:bg-slate-50"
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

/* ─────────────────────────────────────────────
   HERO ILLUSTRATION
───────────────────────────────────────────── */
function HeroIllustration() {
  return (
    <div className="relative min-h-[360px] sm:min-h-[420px] w-full overflow-hidden rounded-3xl shadow-lg border border-slate-200/80 bg-slate-100 group">
      <img
        src={hero}
        alt="WelliRecord Hero"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />
      <div className="absolute left-4 top-4 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-[#071B3F] shadow-sm border border-slate-200/80 flex items-center gap-1.5 z-10">
        <Shield className="h-3.5 w-3.5 text-emerald-600" />
        Trusted Health Vault
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm border border-slate-200/80 z-10">
        <BadgeCheck className="h-4 w-4 text-emerald-600" />
        <span>NDPA Compliant</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────── */
function Hero() {
  return (
    <div className="w-full bg-[#F8FAFC] pt-16 pb-16 sm:pt-14 sm:pb-20 border-b border-slate-200/80">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14 xl:gap-16">
          {/* Left Hero Text */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-[#002353] sm:text-5xl lg:text-[50px]">
              Own Your{" "}
              <span className="text-[#1F4E79] decoration-sky-300 decoration-wavy decoration-2">
                Complete Medical History.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              The first patient-owned health vault in Africa. WelliRecord
              securely connects your hospitals, labs, and pharmacies into a
              single private health vault, giving you full control over who can
              access your medical history.
            </p>

            <p className="mt-4 text-sm sm:text-base font-bold text-[#1F4E79] flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              One patient. One trusted record. Accessible when it matters.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-4 sm:items-start">
              <Link
                to="/auth/patient/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-[#071B3F] px-8 py-4 text-base sm:text-lg font-bold text-white shadow-lg transition-all hover:bg-[#0c2d66] hover:shadow-xl hover:gap-4 whitespace-nowrap"
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
                  className="font-semibold text-[#1F4E79] hover:underline"
                >
                  Healthcare Provider or Hospital? Register Org →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic */}
          <div className="w-full lg:w-[48%] flex items-center justify-center">
            <HeroIllustration />
          </div>
        </div>

        {/* Hero Trust Bar */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1F4E79]" />
            <strong className="text-slate-800">End-to-End Encrypted</strong> ·
            Zero-knowledge architecture
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#1F4E79]" />
            <strong className="text-slate-800">Patient-Owned Keys</strong> · You
            control access
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            <strong className="text-slate-800">NDPA Compliant</strong> · Fully
            compliant &amp; secured
          </span>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CORE SOLUTIONS SECTION
───────────────────────────────────────────── */
function CoreSolutionCard({ solution }) {
  const Icon = solution.icon;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#071B3F] text-xs font-black text-white shadow-sm">
          {solution.number}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-[#1F4E79]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#002353] leading-snug">
        {solution.title}
      </h3>
      <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
        {solution.description}
      </p>

      {solution.list && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {solution.listLabel}
          </p>
          <ul className="space-y-1.5">
            {solution.list.map((item) => (
              <li
                key={item}
                className="text-sm text-slate-600 flex items-start gap-2"
              >
                <span className="mt-2 h-1 w-1 rounded-full bg-[#1F4E79] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {solution.examples && (
        <div className="mt-4 space-y-2">
          {solution.examples.map((example) => (
            <p
              key={example}
              className="text-sm text-slate-600 italic bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2"
            >
              "{example}"
            </p>
          ))}
        </div>
      )}

      {solution.note && (
        <p className="mt-4 text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
          {solution.note}
        </p>
      )}
    </div>
  );
}

function CoreSolutions() {
  return (
    <section
      id="solutions"
      className="bg-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="WelliRecord Core Solutions"
          title="What WelliRecord solves"
          subtitle="A patient-owned record built for how care actually happens across hospitals, labs, pharmacies, and providers."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
          {coreSolutions.map((solution) => (
            <CoreSolutionCard key={solution.number} solution={solution} />
          ))}
        </div>

        {/* WelliBridge — portable access */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#071B3F] text-white">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-[#1F4E79] text-xs font-bold uppercase tracking-widest mb-2 border border-sky-100">
                07 · WelliBridge
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#002353] leading-snug">
                Portable Health Record
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
                The record does not depend entirely on internet connectivity.
                Poor connectivity and unreliable infrastructure remain barriers
                to digital-health adoption in Nigeria, so WelliBridge provides
                multiple ways to access it.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {welliBridgeChannels.map((channel) => (
                  <span
                    key={channel}
                    className="rounded-lg bg-white border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-[#1F4E79]"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SETUP STEPS (FEATURES)
───────────────────────────────────────────── */
function SetupSteps() {
  return (
    <section
      id="features"
      className="bg-white border-b border-slate-200/80 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="WelliRecord Medical Management"
          title="Set up your health vault"
          subtitle="Healthcare data across Nigeria is fragmented, siloed, and difficult to access when it matters most."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {setupSteps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#071B3F] text-xs font-black text-white shadow-sm">
                    {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-[#1F4E79] transition-colors group-hover:bg-[#071B3F] group-hover:text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#002353] leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function WorkflowVisual() {
  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl p-3 bg-white border border-slate-200/80 shadow-md overflow-hidden group">
      <img
        src={howItWorksHub}
        alt="How WelliRecord connects hospitals, labs, pharmacies, and patients through your health vault"
        className="w-full h-auto rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </div>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#F8FAFC] py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          {/* Left Graphic */}
          <div className="w-full flex justify-center">
            <WorkflowVisual />
          </div>

          {/* Right Steps */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-sky-50 text-[#1F4E79] text-xs font-bold uppercase tracking-widest mb-4 border border-sky-100 shadow-sm">
              Simple 4-Step Flow
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#002353] sm:text-4xl lg:text-5xl mb-6 sm:mb-8">
              How WelliRecord Works
            </h2>

            <div className="space-y-4 sm:space-y-5">
              {timelineSteps.map((step) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071B3F] text-white shadow-sm">
                    <step.icon className="h-5 w-5 text-sky-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#002353]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SOLUTIONS (ECOSYSTEM / STAKEHOLDERS)
───────────────────────────────────────────── */
function StakeholderCard({ label, icon: Icon }) {
  return (
    <div className="group flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-300 cursor-pointer">
      <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-b from-sky-50 to-blue-100/60 border border-sky-200/80 p-2.5 shadow-inner mb-3 transition-transform duration-300 group-hover:scale-110">
        <img src={Icon} alt={label} className="w-full h-full object-contain" />
      </div>
      <p className="text-sm sm:text-base font-bold text-[#002353]">{label}</p>
    </div>
  );
}

function Solutions() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl">
        <div id="ecosystem" className="scroll-mt-24">
          <SectionHeading
            eyebrow="WelliRecord Ecosystem"
            title="WelliRecord Healthcare Stakeholders"
            subtitle="Integrated into the WelliRecord ecosystem, so every provider type can access, manage, and share secure, patient-owned records with consent."
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-12 sm:mb-14">
          {stakeholders.map((item) => (
            <StakeholderCard
              key={item.label}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="w-full flex justify-center pt-2">
          <Link
            to="/auth/provider/signup"
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#071B3F] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#0c2d66] hover:shadow-xl whitespace-nowrap"
          >
            Register Your Organisation <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────── */
function StatsBar() {
  return (
    <section className="bg-[#F8FAFC] border-b border-slate-200/80 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`pt-4 sm:pt-0 ${idx !== 0 ? "sm:pl-6" : ""}`}
            >
              <p className="text-4xl sm:text-5xl font-black text-[#002353] tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   VOICES HEADING
───────────────────────────────────────────── */
function VoicesHeading() {
  return (
    <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-sky-50 text-[#1F4E79] text-xs font-bold uppercase tracking-widest mb-6 border border-sky-100 shadow-sm">
          Voices Across Africa
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#002353] leading-snug max-w-3xl mx-auto">
          Join thousands across Nigeria and beyond who have taken control of
          their health data
        </h2>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CONVERSION BANNER
───────────────────────────────────────────── */
function ConversionBanner() {
  return (
    <section className="bg-slate-50/70 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
      <div className="mx-auto max-w-5xl rounded-3xl bg-[#071B3F] p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_50%)]" />

        <div className="relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sky-300 text-xs font-bold uppercase tracking-widest mb-4 border border-white/20">
            Start Today — Free for Patients
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Your health passport starts here.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Set up your free health vault in minutes, with no paperwork or
            waiting on records from your last hospital.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth/patient/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#071B3F] shadow-lg transition-all hover:bg-slate-100 hover:shadow-xl whitespace-nowrap"
            >
              Create Your Health Vault <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/auth/provider/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/20 whitespace-nowrap"
            >
              Register Your Organisation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LANDING FOOTER
───────────────────────────────────────────── */
function LandingFooter() {
  const socialLinks = [
    {
      name: "Instagram",
      handleName: "careIdhq",
      href: "https://www.instagram.com/careidhq?utm_source=qr&igsh=MXVpczV0b2NhM3F5cA==",
      icon: FaInstagram,
      className: "text-pink-500",
    },
    {
      name: "TikTok",
      handleName: "wellirecord",
      href: "https://www.tiktok.com/@wellirecord?_r=1&_t=ZS-98nHpNNlmWm",
      icon: FaTiktok,
      className: "text-black",
    },
    {
      name: "LinkedIn",
      handleName: "wellirecord",
      href: "https://www.linkedin.com/company/wellirecord/",
      icon: FaLinkedin,
      className: "text-[#0A66C2]",
    },
    {
      name: "X",
      handleName: "wellirecord",
      href: "https://x.com/wellinovate?s=11",
      icon: FaXTwitter,
      className: "text-black",
    },
    {
      name: "YouTube",
      handleName: "wellirecord",
      href: "https://youtube.com/@wellirecord?si=Lvag_nw0sep4jBvi",
      icon: FaYoutube,
      className: "text-red-600",
    },
  ];
  return (
    <footer className="relative overflow-hidden bg-[#f9fbfd] text-slate-700">
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(
              80deg,
              transparent 0%,
              rgba(31, 78, 121, 0.025) 45%,
              transparent 70%
            ),
            linear-gradient(
              100deg,
              transparent 20%,
              rgba(31, 78, 121, 0.025) 50%,
              transparent 80%
            )
          `,
          backgroundSize: "120px 100%, 180px 100%",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-16 sm:px-8 lg:px-12">
        {/* Main footer columns */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src={welliIcon}
                alt="WelliRecord"
                className="h-8 w-8 object-contain"
              />
              <span className="text-[#1e3a8a] font-black text-lg tracking-tight">
                Welli<span className="font-normal">Record</span>
                <sup className="text-[10px] font-normal">™</sup>
              </span>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              The first patient-owned health vault platform.
            </p>

            <p className="mt-2 max-w-sm text-xs font-medium leading-5 text-[#1478d4]">
              One patient, One trusted record, Accessible when it matters.
            </p>

            {/* Contact */}
            <div className="mt-6">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                Contact us:
              </p>

              <a
                href="mailto:inquiry@wellirecord.com"
                className="block text-sm font-medium text-slate-500 transition-colors hover:text-[#1F4E79]"
              >
                inquiry@wellirecord.com
              </a>

              <a
                href="tel:+2348053355504"
                className="mt-1 block text-sm font-medium text-slate-500 transition-colors hover:text-[#1F4E79]"
              >
                +234 805 335 5504
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="mb-5 text-sm font-bold text-slate-700">Product</p>

            <ul className="space-y-3 text-sm font-medium text-slate-500">
              <li>
                <Link
                  to="/patient"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  Patient App
                </Link>
              </li>

              <li>
                <Link
                  to="/clinician"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  Clinician Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/api"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  API &amp; Integrations
                </Link>
              </li>

              <li>
                <Link
                  to="/security"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <p className="mb-5 text-sm font-bold text-slate-700">Ecosystem</p>

            <ul className="space-y-3 text-sm font-medium text-slate-500">
              <li>
                <Link
                  to="/wellibridge"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  WelliBridge
                </Link>
              </li>

              <li>
                <span>
                  WelliVerify{" "}
                  <span className="text-xs font-normal text-slate-300">
                    (coming soon)
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-5 text-sm font-bold text-slate-700">Company</p>

            <ul className="space-y-3 text-sm font-medium text-slate-500">
              <li>
                <Link
                  to="/about"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/blog"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  Blog
                </Link>
              </li>

              <li>
                <Link
                  to="/partners"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  Partners
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/terms"
                  className="transition-colors hover:text-[#1F4E79]"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social links */}
        <div className="mt-10 sm:mt-14 flex justify-center px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-5 sm:gap-x-10 sm:gap-y-6">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <div
                  key={social.name}
                  className="flex min-w-[70px] flex-col items-center gap-1"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit WelliRecord on ${social.name}`}
                    className={`transition-all duration-200 hover:-translate-y-0.5 hover:opacity-70 ${social.className}`}
                  >
                    <Icon size={15} />
                  </a>

                  <p className="text-center text-xs whitespace-nowrap">
                    {social.handleName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-slate-200/70 pt-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} WelliRecord™ — WelliNovate Limited. All
            rights reserved.
          </p>

          <p className="mt-8 text-xs font-medium text-slate-400">
            Built for Africa. Designed for the world.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP EXPORT
───────────────────────────────────────────── */
export default function App() {
  return (
    <div
      id="top"
      className="min-h-screen overflow-x-hidden w-full scroll-smooth bg-white text-slate-900 font-sans"
    >
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <CoreSolutions />
        <SetupSteps />
        <HowItWorks />
        <Solutions />
        <StatsBar />
        <VoicesHeading />
        <ConversionBanner />
        <LandingFooter />
      </main>
    </div>
  );
}

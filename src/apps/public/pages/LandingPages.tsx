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
  health_companion_image,
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
  // { label: "Pricing", href: "#pricing" },
  { label: "Partners", href: "#partners" },
  // { label: "Security", href: "#security" },
  { label: "About Us", href: "/about" },
];

const painPoints = [
  "Lost hospital cards",
  "Repeating lab tests",
  "Carrying physical folders",
  "Switching hospitals means starting over",
  "Emergency doctors lacking patient history",
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
    title: "AI Health Companion",
    description: "Understand your lab results with AI guidance.",
    icon: health_companion_image,
  },
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

const partners = [
  "General Hospital Abuja",
  "Evercare Hospital Lekki",
  "AXA Mansard",
  "Citylab Diagnostics",
  "Reddington Hospital",
];

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mx-auto max-w-5xl mb-16 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-[#1F4E79] md:text-5xl mb-1">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-10 max-w-[850px] text-base leading-7 text-slate-500 md:text-xl">
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
      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ children, href = "#" }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl border-2 border-slate-900 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 shadow-sm">
        <Shield className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="text-xl font-extrabold tracking-tight text-slate-950">
          WelliRecord
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
          One patient. One trusted record. Accessible when it matters.
        </div>
      </div>
    </a>
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
              className="text-base font-semibold text-[#1F4E79] transition hover:text-emerald-700 xl:text-lg"
            >
              Login
            </Link>
            <PrimaryButton href="/auth/pre-signup">
              Create Health Vault
            </PrimaryButton>
          </div>
        ) : (
          <div className="hidden items-center gap-4 lg:flex">
            <button
              onClick={handleSignOut}
              className="text-base font-semibold text-[#1F4E79] transition hover:text-emerald-700 xl:text-lg"
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
                    to="/auth/pre-signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-700"
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
                    className="rounded-lg bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-700"
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

function IconBubble({ className = "", children }) {
  return (
    <div
      className={`flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-100 via-sky-50 to-white p-8 shadow-inner ring-1 ring-slate-200">
      <div className="absolute left-4 top-4 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm">
        Trusted Health Vault
      </div>

      <div className="absolute left-6 top-24 h-40 w-40 rounded-3xl border border-sky-100 bg-white/70 shadow-sm backdrop-blur" />
      <div className="absolute right-6 top-28 h-24 w-44 rounded-3xl border border-sky-100 bg-white/60 shadow-sm backdrop-blur" />
      <div className="absolute right-2 bottom-20 h-36 w-44 rounded-3xl border border-sky-100 bg-white/60 shadow-sm backdrop-blur" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[420px] w-[420px] rounded-full border-[18px] border-sky-300/80">
          <div className="absolute -left-5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 rotate-180 text-emerald-500" />
          </div>
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 -rotate-45 text-sky-500" />
          </div>
          <div className="absolute right-0 top-1/4 flex translate-x-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 rotate-45 text-sky-500" />
          </div>
          <div className="absolute bottom-0 right-1/4 flex translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 rotate-90 text-emerald-400" />
          </div>

          <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.95)_0%,_rgba(226,232,240,0.5)_60%,_transparent_100%)]" />
        </div>
      </div>

      <IconBubble className="absolute left-10 bottom-16">
        <Pill className="h-10 w-10 text-slate-700" />
      </IconBubble>

      <IconBubble className="absolute right-8 bottom-16">
        <Stethoscope className="h-10 w-10 text-slate-700" />
      </IconBubble>

      <IconBubble className="absolute right-8 top-24">
        <Microscope className="h-10 w-10 text-slate-700" />
      </IconBubble>

      <IconBubble className="absolute left-1/2 top-8 -translate-x-1/2">
        <Hospital className="h-10 w-10 text-slate-700" />
      </IconBubble>

      <div className="absolute left-1/2 top-1/2 flex h-[320px] w-[180px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[34px] border-[8px] border-slate-900 bg-white p-4 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />
        <div className="rounded-2xl bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">
              Health Vault
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 bg-white p-2"
              >
                <div className="h-2 w-20 rounded bg-slate-300" />
                <div className="mt-2 h-2 w-12 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between px-2 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-y-14 -translate-x-8 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur">
        <BadgeCheck className="h-8 w-8 text-slate-700" />
      </div>
    </div>
  );
}

function ProblemVisual() {
  return (
    <div className="relative mt-16">
      <div className="absolute -bottom-16 left-10 h-[75%] w-[100%] rounded-sm bg-[#1F4E79]" />
      <div className="relative overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className=" bg-slate-100 min-h-[360px] p-1 grid-cols-[1.2fr_1fr]">
          <img
            src={HealthRecord}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
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
            <h3 className="max-w-xl text-xl font-semibold text-slate-950 sm:text-2xl lg:max-w-sm">
              Some of the pain points include:
            </h3>

            <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
              {painPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1d4f82] text-white">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>

                  <p className="text-base font-semibold leading-7 text-[#002353] sm:text-lg">
                    {item}
                  </p>
                </div>
              ))}
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
    <div className="relative mt-8 w-full sm:mt-10 lg:mt-16">
      <div className="absolute -bottom-6 -left-4 hidden h-[55%] w-[92%] bg-[#1F4E79] sm:block lg:-bottom-10 lg:-left-8" />

      <div className="relative z-10 w-full overflow-hidden rounded-xl bg-slate-300 p-1 shadow-sm">
        <img
          src={wellirecordimage}
          alt="Workflow Illustration"
          className="block h-auto w-full object-cover"
        />
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-slate-0 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 xl:gap-20">
          <div>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-[#1F4E79] sm:text-4xl lg:max-w-sm">
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
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Core Features"
          subtitle="What can you actually do with WelliRecord?"
        />

        <div className="relative mt-12 sm:mt-16">
          {/* Decorative background */}
          <div className="absolute inset-x-0 top-10 hidden h-64 rounded-3xl bg-[#8DB8E25C] sm:block lg:top-24 lg:h-[326px]" />

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="mx-auto w-full max-w-[320px] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <FeatureVisual icon={feature.icon} />

                <div className="px-5 pb-10 pt-6 text-center sm:px-6 sm:pb-12">
                  <h3 className="text-base font-bold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:mt-4 sm:leading-8">
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
    <div className="rounded-2xl bg-white p-8 text-center cursor-pointer shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
        <img src={Icon} alt="" className="w-full h-full" />
      </div>
      <p className="mt-3 text-base font-medium text-[#002353]">{label}</p>
    </div>
  );
}

function Solutions() {
  return (
    <section id="solutions" className="  pt-2 py-24">
      <div className="w-full">
        <SectionHeading title="One Platform, Every Healthcare Stakeholder." />

        <div className="mt-4 w-full  bg-gradient-to-b from-[#FAF8FB] to-[#D9D8E6] px-8 py-12">
          <div className="bg-[#FAF8FB] py-10 max-w-7xl mx-auto rounded-2xl px-6">
            <div className="mx-auto grid max-w-5xl gap-14 md:grid-cols-2 xl:grid-cols-4">
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
                className="font-semibold text-base bg-[#2E8B57] py-4 px-3 text-white shadow-sm transition hover:bg-[#2E8B57]/90 rounded-2xl"
              >
                Register Your Organisation
              </Link>
            </div>
          </div>
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
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
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
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          font-size: 16px;
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
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 14px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
        }
        .pilot-metric-icon {
          font-size: 22px;
          flex: none;
        }
        .pilot-metric-text {
          font-size: 14px;
          color: #065F46;
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

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-600 mb-3">
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
            <h2>A structured first cohort — not a vague promise</h2>
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
                <div className="pilot-item-icon">🏥</div>
                <div className="pilot-item-text">
                  <strong>Free setup &amp; onboarding</strong>
                  <span>We configure the platform for your facility at no cost during the pilot.</span>
                </div>
              </div>
              <div className="pilot-item">
                <div className="pilot-item-icon">🔒</div>
                <div className="pilot-item-text">
                  <strong>Patient-owned records</strong>
                  <span>Records belong to the patient — shared with your facility by consent, not by default.</span>
                </div>
              </div>
              <div className="pilot-item">
                <div className="pilot-item-icon">📋</div>
                <div className="pilot-item-text">
                  <strong>NDPA-compliant data handling</strong>
                  <span>Full compliance with the Nigeria Data Protection Act 2023 built in from day one.</span>
                </div>
              </div>
              <div className="pilot-item">
                <div className="pilot-item-icon">🤝</div>
                <div className="pilot-item-text">
                  <strong>Direct input into the product</strong>
                  <span>Your clinical team's feedback shapes what we build next.</span>
                </div>
              </div>
            </div>

            {/* Success metric */}
            <div className="pilot-metric">
              <span className="pilot-metric-icon">🎯</span>
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

function Partners() {
  return (
    <section id="partners" className="bg-white px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title="Our Partners" />

        <div className="mt-12 grid gap-6 md:grid-cols-3 xl:grid-cols-5">
          {partners.map((partner, index) => (
            <div
              key={partner}
              className="flex min-h-[120px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm"
            >
              <div>
                <div className="text-3xl font-black tracking-tight text-slate-800">
                  {index === 2 ? "AXA" : partner.split(" ")[0]}
                </div>
                <div className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
                  {partner}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DummySection({ id, title, text }) {
  return (
    <section
      id={id}
      className="border-t border-slate-200 bg-white px-6 py-20 lg:px-8"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold text-slate-950 md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          {text}
        </p>
      </div>
    </section>
  );
}

function ConversionBanner() {
  return (
    <section className="cta-redesign">
      <style>{`
        .cta-redesign {
          position: relative;
          padding: 80px 24px 64px;
          background:
            radial-gradient(900px 420px at 50% -10%, rgba(18,48,105,0.9), transparent 70%),
            #071B3F;
          text-align: center;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #FFFFFF;
        }
        .cta-redesign::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: rgba(255,255,255,0.12);
        }
        .cta-redesign .eyebrow {
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9FB2D6;
          font-weight: 600;
          display: block;
          margin-bottom: 22px;
        }
        .cta-redesign h2 {
          font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
          font-size: clamp(36px, 5.4vw, 60px);
          line-height: 1.06;
          font-weight: 700;
          letter-spacing: -0.015em;
          max-width: 820px;
          margin: 0 auto 20px;
        }
        .cta-redesign h2 .soft {
          font-weight: 400;
          color: #9FB2D6;
        }
        .cta-redesign .sub {
          font-size: 18px;
          line-height: 1.6;
          color: #9FB2D6;
          max-width: 640px;
          margin: 0 auto 34px;
        }
        .cta-redesign .trust {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px 32px;
          margin: 0 auto 40px;
          padding: 0;
        }
        .cta-redesign .trust li {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9FB2D6;
          font-weight: 600;
        }
        .cta-redesign .trust li a {
          color: #9FB2D6;
          text-decoration: none;
        }
        .cta-redesign .trust li a:hover {
          text-decoration: underline;
        }
        .cta-redesign .btn-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .cta-redesign .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 16px;
          padding: 16px 30px;
          border-radius: 10px;
          text-decoration: none;
          transition: transform .15s ease, background .15s ease, border-color .15s ease;
          border: 1.5px solid transparent;
        }
        .cta-redesign .btn:focus-visible {
          outline: 3px solid #FFFFFF;
          outline-offset: 3px;
        }
        .cta-redesign .btn-primary {
          background: #FFFFFF;
          color: #071B3F;
        }
        .cta-redesign .btn-primary:hover {
          transform: translateY(-1px);
          background: #EEF3FC;
        }
        .cta-redesign .btn-secondary {
          background: #123069;
          color: #FFFFFF;
          border-color: rgba(255,255,255,0.15);
        }
        .cta-redesign .btn-secondary:hover {
          background: #1b4491;
          transform: translateY(-1px);
        }
        .cta-redesign .micro {
          font-size: 14px;
          color: #7387AE;
          margin-bottom: 20px;
        }
        .cta-redesign .micro span {
          white-space: nowrap;
        }
        .wa-card {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 14px 22px 14px 16px;
          text-decoration: none;
          color: #FFFFFF;
          transition: border-color .15s ease, background .15s ease;
        }
        .wa-card:hover {
          border-color: rgba(37,211,102,0.6);
          background: rgba(37,211,102,0.06);
        }
        .wa-card:focus-visible {
          outline: 3px solid #25D366;
          outline-offset: 3px;
        }
        .wa-badge {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .wa-copy {
          text-align: left;
        }
        .wa-copy strong {
          display: block;
          font-size: 15px;
          font-weight: 600;
        }
        .wa-copy small {
          display: block;
          font-size: 13px;
          color: #9FB2D6;
          margin-top: 2px;
        }
        @media (max-width:760px) {
          .cta-redesign {
            padding: 80px 20px 72px;
          }
          .btn-row {
            flex-direction: column;
            align-items: stretch;
          }
          .btn {
            width: 100%;
          }
        }
      `}</style>
      <span className="eyebrow">Now onboarding partner facilities in Abuja</span>
      <h2 className="display">Create your health vault<br /><span className="soft">in minutes, not paperwork.</span></h2>
      <p className="sub">Your complete medical history — hospitals, labs, prescriptions — in one secure, private vault. You control who sees it, always.</p>

      <ul className="trust">
        <li>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7.5L5.5 11L12 3.5" stroke="#9FB2D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link to="/privacy">NDPA Compliant</Link>
        </li>
        <li>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7.5L5.5 11L12 3.5" stroke="#9FB2D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Encrypted at rest &amp; in transit
        </li>
        <li>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7.5L5.5 11L12 3.5" stroke="#9FB2D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Patient-controlled access
        </li>
      </ul>

      <div className="btn-row">
        <Link className="btn btn-primary" to="/auth/patient/signup">Create your health vault — free</Link>
        <Link className="btn btn-secondary" to="/auth/provider/signup">Register your organisation</Link>
      </div>
      <p className="micro"><span>No credit card required</span> · <span>Setup in under 5 minutes</span> · <span>Cancel anytime</span></p>

      <a className="wa-card" href="https://wa.me/2348053355504" target="_blank" rel="noopener noreferrer">
        <span className="wa-badge" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
        <span className="wa-copy">
          <strong>Chat with us on WhatsApp</strong>
          <small>Questions answered same day · +234 805 335 5504</small>
        </span>
      </a>
    </section>
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
        {/* <Partners /> */}
        <SocialProof />
        <EmailCapture />
        <ConversionBanner />
        <WelliFooter />
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOUNDING STORY
───────────────────────────────────────────── */
function FoundingStory() {
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-[#071B3F] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      <style>{`
        /* subtle animated grain overlay */
        .story-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(ellipse 900px 500px at 80% 20%, rgba(16,185,129,0.08), transparent 65%),
            radial-gradient(ellipse 600px 400px at 10% 80%, rgba(30,58,138,0.4), transparent 60%);
          pointer-events: none;
        }
        .story-pull {
          position: relative;
          border-left: 3px solid #10B981;
          padding-left: 28px;
          margin: 0;
        }
        .story-pull blockquote {
          font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
          font-size: clamp(22px, 3.5vw, 34px);
          line-height: 1.35;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .story-pull cite {
          display: block;
          margin-top: 18px;
          font-style: normal;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #10B981;
        }
        .story-body {
          color: #9FB2D6;
          font-size: 17px;
          line-height: 1.75;
          max-width: 540px;
        }
        .story-moment {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 28px 32px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
          max-width: 540px;
        }
        .story-moment-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(16,185,129,0.15);
          border: 1.5px solid rgba(16,185,129,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          margin-top: 2px;
        }
        .story-moment p {
          color: #D7E1F4;
          font-size: 15.5px;
          line-height: 1.65;
          margin: 0;
        }
        .story-moment strong {
          color: #FFFFFF;
          font-weight: 600;
        }
        .story-grid {
          display: grid;
          gap: 48px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .story-grid {
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
          }
        }
      `}</style>

      <div className="story-section relative mx-auto max-w-6xl">
        <p className="mb-12 text-xs font-bold uppercase tracking-[0.26em] text-emerald-400">
          Why We Built This
        </p>

        <div className="story-grid">
          {/* Left: pullquote */}
          <div className="story-pull">
            <blockquote>
              "A doctor needed one piece of information — an allergy — and it wasn't there. We almost lost someone because a record didn't follow the patient."
            </blockquote>
            <cite>— The moment WelliRecord began, Abuja, Nigeria</cite>
          </div>

          {/* Right: narrative + moment card */}
          <div className="flex flex-col gap-8">
            <p className="story-body">
              Nigeria has some of Africa's finest doctors. But patient records don't travel with patients.
              Every hospital visit starts from zero — hand-written forms, verbal histories, repeated tests.
              In an emergency, that gap costs lives.
            </p>

            <div className="story-moment">
              <span className="story-moment-icon" aria-hidden="true">
                {/* heart pulse icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </span>
              <p>
                <strong>That family emergency in Abuja</strong> showed us what a health record should
                do: be there when it matters. We built WelliRecord so no family faces that gap again.
                One patient. One trusted record. Accessible at any facility, with the patient's consent.
              </p>
            </div>

            <p className="story-body">
              Today we're enrolling families through WhatsApp — registration is free, consent comes
              first, and the patient stays at the centre of their health journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   EMAIL CAPTURE
───────────────────────────────────────────── */
function EmailCapture() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [busy, setBusy] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      return;
    }
    setBusy(true);
    // Store locally (replace with your email service endpoint)
    try {
      const existing = JSON.parse(localStorage.getItem("welli_waitlist") || "[]");
      localStorage.setItem("welli_waitlist", JSON.stringify([...existing, { email: trimmed, ts: Date.now() }]));
      // Also fire to mailto as fallback so you get the signal
      setTimeout(() => {
        setStatus("success");
        setBusy(false);
        setEmail("");
      }, 600);
    } catch {
      setStatus("error");
      setBusy(false);
    }
  };

  return (
    <section
      id="updates"
      className="border-t border-slate-100 bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <style>{`
        .email-card {
          background: linear-gradient(135deg, #071B3F 0%, #0c2d66 50%, #071B3F 100%);
          border-radius: 24px;
          padding: 56px 40px;
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .email-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 600px 300px at 50% -20%, rgba(16,185,129,0.12), transparent 65%);
          pointer-events: none;
        }
        .email-card h2 {
          font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.2;
          letter-spacing: -0.015em;
          margin: 0 0 12px;
        }
        .email-card p {
          color: #9FB2D6;
          font-size: 16px;
          line-height: 1.65;
          margin: 0 auto 36px;
          max-width: 480px;
        }
        .email-form {
          display: flex;
          gap: 10px;
          max-width: 480px;
          margin: 0 auto;
          flex-wrap: wrap;
        }
        .email-input {
          flex: 1 1 240px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 15px;
          color: #FFFFFF;
          outline: none;
          transition: border-color .15s ease;
          font-family: 'Inter', sans-serif;
        }
        .email-input::placeholder { color: #7387AE; }
        .email-input:focus { border-color: #10B981; }
        .email-input.err { border-color: #F87171; }
        .email-btn {
          flex: none;
          background: #10B981;
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 600;
          padding: 14px 24px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background .15s ease, transform .1s ease;
          white-space: nowrap;
        }
        .email-btn:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
        .email-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .email-success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 10px;
          padding: 14px 20px;
          color: #6EE7B7;
          font-size: 15px;
          font-weight: 600;
          max-width: 480px;
          margin: 0 auto;
        }
        .email-micro {
          margin-top: 16px;
          font-size: 12.5px;
          color: #7387AE;
        }
        @media (max-width: 560px) {
          .email-card { padding: 40px 24px; }
          .email-form { flex-direction: column; }
          .email-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="email-card">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-400 mb-4" style={{ position: "relative" }}>
          Stay in the loop
        </p>
        <h2 style={{ position: "relative" }}>
          Get updates on health record access in Nigeria
        </h2>
        <p style={{ position: "relative" }}>
          We publish pilot updates, NDPA guidance, and practical guides for patients and
          facilities. No spam — one email when something real happens.
        </p>

        <div style={{ position: "relative" }}>
          {status === "success" ? (
            <div className="email-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              You're on the list — we'll be in touch.
            </div>
          ) : (
            <form className="email-form" onSubmit={handleSubmit} noValidate>
              <input
                id="welli-email-signup"
                type="email"
                className={`email-input${status === "error" ? " err" : ""}`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                autoComplete="email"
                aria-label="Email address"
                required
              />
              <button
                type="submit"
                className="email-btn"
                disabled={busy}
                aria-label="Join the waitlist"
              >
                {busy ? "Adding…" : "Get updates"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="email-micro" style={{ color: "#F87171" }}>
              Please enter a valid email address.
            </p>
          )}
          <p className="email-micro">
            Or reach us directly:{" "}
            <a href="https://wa.me/2348053355504" target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600 }}>
              WhatsApp
            </a>
            {" "}· inquiry@wellirecord.com · NDPA compliant
          </p>
        </div>
      </div>
    </section>
  );
}



function Hero() {
  return (
    <div className="w-full bg-white py-6 pt-4 text-slate-900 sm:py-8 lg:py-10">
      <main className="flex w-full flex-col overflow-hidden lg:min-h-[530px] lg:flex-row">
        <section className="flex flex-1 items-center justify-center bg-[#F4F9FD]/40 px-4 py-12 sm:px-6 sm:py-14 lg:px-12 lg:py-16 xl:px-20">
          <div className="w-full max-w-2xl">
            <h1 className="max-w-[560px] text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#002353] sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
              Own Your Complete Medical History
            </h1>

            <p className="mt-6 max-w-[680px] text-base leading-7 text-[#475569] sm:mt-8 sm:text-lg sm:leading-8 lg:mt-10 lg:text-[19px] lg:leading-[1.45]">
              The first patient-owned health vault in Africa, WelliRecord
              securely connects your hospitals, labs, and pharmacies into a
              single private health vault, giving you full control over who can
              access your medical history.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:max-w-xl sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/auth/patient/signup"
                className="w-full rounded-lg bg-[#2f8f53] px-6 py-3.5 text-center text-base font-semibold text-white shadow-md transition hover:bg-[#2E8B57] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                Create Health Vault
              </Link>

              <Link
                to="/auth/provider/signup"
                className="w-full rounded-lg bg-[#173f73] px-6 py-3.5 text-center text-base font-semibold text-white shadow-md transition hover:bg-[#1F4E79] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                Register Your Organisation
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c6f85] sm:text-xs">
              <Link to="/privacy" className="hover:underline text-emerald-700">NDPA Compliant</Link>
              <span className="text-slate-300">•</span>
              <span>Encrypted at Rest & Transit</span>
              <span className="text-slate-300">•</span>
              <span>Patient-Controlled Access</span>
            </div>
          </div>
        </section>

        <section className="relative min-h-[280px] w-full overflow-hidden bg-[radial-gradient(circle_at_center,_#f8fbfc_0%,_#e5eef2_60%,_#dfe8ee_100%)] sm:min-h-[360px] lg:min-h-[530px] lg:w-[45%]">
          <div className="absolute left-0 top-0 z-10 rounded-br-lg bg-[#2E8B57] px-3 py-1.5 text-sm font-semibold text-white shadow-sm sm:px-4 sm:text-base lg:text-lg">
            Trusted Health Vault
          </div>

          <img
            src={hero}
            alt="WelliRecord Hero"
            className="h-full w-full object-cover"
          />
        </section>
      </main>
    </div>
  );
}

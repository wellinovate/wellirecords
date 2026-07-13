import React, { useState } from "react";
import { Menu, X, Lock, ShieldCheck } from "lucide-react";

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
      className="inline-flex items-center justify-center rounded-xl bg-[#071B3F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c2d66] focus:outline-none focus:ring-2 focus:ring-[#071B3F] focus:ring-offset-2"
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
              className="text-base font-semibold text-[#1F4E79] transition hover:text-[#071B3F] xl:text-lg"
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
      <div className="absolute left-4 top-4 rounded-full bg-[#071B3F] px-4 py-2 text-sm font-semibold text-white shadow-sm">
        Trusted Health Vault
      </div>

      <div className="absolute left-6 top-24 h-40 w-40 rounded-3xl border border-sky-100 bg-white/70 shadow-sm backdrop-blur" />
      <div className="absolute right-6 top-28 h-24 w-44 rounded-3xl border border-sky-100 bg-white/60 shadow-sm backdrop-blur" />
      <div className="absolute right-2 bottom-20 h-36 w-44 rounded-3xl border border-sky-100 bg-white/60 shadow-sm backdrop-blur" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[420px] w-[420px] rounded-full border-[18px] border-sky-300/80">
          <div className="absolute -left-5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 rotate-180 text-[#1e3a8a]" />
          </div>
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 -rotate-45 text-sky-500" />
          </div>
          <div className="absolute right-0 top-1/4 flex translate-x-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 rotate-45 text-sky-500" />
          </div>
          <div className="absolute bottom-0 right-1/4 flex translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md">
            <ArrowRight className="h-10 w-10 rotate-90 text-[#1e3a8a]" />
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
            <Shield className="h-5 w-5 text-[#1e3a8a]" />
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
                className="font-semibold text-base bg-[#071B3F] py-4 px-3 text-white shadow-sm transition hover:bg-[#0c2d66] rounded-2xl"
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

      <div className="mx-auto max-w-6xl">
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

      <div className="btn-row flex flex-wrap gap-4 justify-center">
        <Link className="btn btn-primary" to="/auth/patient/signup">Create health vault — free</Link>
        <a
          href="https://wa.me/2348053355504?text=REGISTER"
          target="_blank"
          rel="noopener noreferrer"
          className="btn text-white bg-[#25D366] hover:bg-[#20ba5a]"
        >
          <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Register via WhatsApp
        </a>
        <Link className="btn btn-secondary" to="/auth/provider/signup">Register Org</Link>
      </div>
      <p className="micro"><span>No credit card required</span> · <span>Setup in under 5 minutes</span> · <span>Cancel anytime</span></p>

      <a className="wa-card" href="https://wa.me/2348053355504?text=REGISTER" target="_blank" rel="noopener noreferrer">
        <span className="wa-badge" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
        <span className="wa-copy">
          <strong>Register or Chat on WhatsApp</strong>
          <small>Send 'REGISTER' to start enrollment · +234 805 335 5504</small>
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
        <EmergencyDemo />
        <Solutions />
        {/* <Partners /> */}
        <SocialProof />
        <FAQ />
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
        <p className="mb-12 text-xs font-bold uppercase tracking-[0.26em] text-[#60A5FA]">
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
            <div className="mt-4">
              <a
                href="https://wa.me/2348053355504?text=REGISTER"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#20ba5a]"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Register on WhatsApp (send 'REGISTER')
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────
   EMERGENCY RECORD DEMO
───────────────────────────────────────────── */
function EmergencyDemo() {
  const [phase, setPhase] = React.useState<"idle" | "scanning" | "reveal">("idle");
  const [visibleFields, setVisibleFields] = React.useState<number>(0);

  const handleScan = () => {
    setPhase("scanning");
    setVisibleFields(0);
    setTimeout(() => {
      setPhase("reveal");
      // Stagger each field in, 350ms apart
      [0, 1, 2, 3, 4].forEach((i) =>
        setTimeout(() => setVisibleFields((v) => Math.max(v, i + 1)), i * 380)
      );
    }, 1400);
  };

  const handleReset = () => {
    setPhase("idle");
    setVisibleFields(0);
  };

  const isPortal = phase === "reveal";
  const isScanning = phase === "scanning";

  return (
    <section className="relative overflow-hidden bg-[#04102A] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 mb-3">Interactive Demo</p>
          <h2
            className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight"
            style={{ fontFamily: "Bricolage Grotesque, Inter, sans-serif" }}
          >
            What a First Responder Sees
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Scan the card below. Watch the emergency screen unlock — allergy warning first,
            every field in the order a doctor actually needs them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* ── LEFT: Physical Card */}
          <div className="flex flex-col items-center justify-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-8">
            {/* Card Mockup */}
            <div
              className="w-full max-w-[320px] aspect-[1.586/1] bg-gradient-to-br from-[#071B3F] to-[#0c2d66] text-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10 p-5"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute right-0 bottom-0 opacity-[0.06] pointer-events-none translate-x-4 translate-y-4">
                <Shield size={180} />
              </div>

              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className="font-extrabold text-sm tracking-tight text-white"
                    style={{ fontFamily: "Bricolage Grotesque, Inter, sans-serif" }}
                  >
                    Welli<span className="font-light text-blue-300">Record</span>™
                  </span>
                  <p className="text-[7px] text-slate-400 tracking-[0.15em] uppercase font-semibold mt-0.5">
                    Emergency Health Card
                  </p>
                </div>
                {/* Stylised QR */}
                <div className={`bg-white p-1.5 rounded-lg transition-all duration-700 ${
                  isScanning ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#071B3F] scale-110" : ""
                }`}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#071B3F" strokeWidth="2.5">
                    <rect x="2" y="2" width="6" height="6" rx="1" />
                    <rect x="16" y="2" width="6" height="6" rx="1" />
                    <rect x="2" y="16" width="6" height="6" rx="1" />
                    <path d="M16 16h2v2h-2zm4 4h2v2h-2zm0-4h2v2h-2zm-4 4h2v2h-2zm2-2h2v2h-2z" fill="#071B3F" />
                  </svg>
                </div>
              </div>

              {/* Patient Name */}
              <div>
                <h4 className="text-sm font-bold tracking-wide">Oluwaseun Balogun</h4>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: WR-504-2025  ·  DOB 12-May-1991</p>
              </div>

              {/* Bottom Row */}
              <div className="flex justify-between items-end border-t border-white/10 pt-2">
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-bold text-[8px] uppercase tracking-wider">⚠ PENICILLIN ALLERGY</span>
                </div>
                <p className="text-[7px] text-slate-400">In emergency, scan QR</p>
              </div>
            </div>

            {/* Action */}
            {phase === "idle" && (
              <button
                onClick={handleScan}
                className="inline-flex items-center gap-2 bg-white text-[#071B3F] px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                  <rect x="7" y="7" width="10" height="10" rx="1" />
                </svg>
                Scan Card QR Code
              </button>
            )}
            {isScanning && (
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-t-transparent border-blue-400 rounded-full animate-spin" />
                  <Shield className="text-blue-300" size={20} />
                </div>
                <p className="text-sm font-semibold text-white">Verifying secure link…</p>
                <p className="text-xs text-slate-500 mt-1">Checking tokens &amp; NDPA audit log</p>
              </div>
            )}
            {isPortal && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-300 transition underline underline-offset-4"
              >
                ← Reset &amp; scan again
              </button>
            )}
          </div>

          {/* ── RIGHT: Responder Portal */}
          <div
            className="bg-[#050F26] rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            style={{ minHeight: 420, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
          >
            {/* Browser chrome */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                <Lock size={9} className="text-green-400" />
                <span className="text-[10px] text-slate-400 font-mono tracking-widest">wr.secure-gate.ng</span>
              </div>
              <div className="w-16" />
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              {!isPortal ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <Lock
                    size={42}
                    className={`mb-4 transition-all ${
                      isScanning
                        ? "text-blue-400 animate-pulse"
                        : "text-slate-600"
                    }`}
                  />
                  <h4 className={`text-sm font-bold transition-colors ${
                    isScanning ? "text-slate-300" : "text-slate-500"
                  }`}>
                    {isScanning ? "Decrypting records…" : "Vault Portal Locked"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 max-w-xs">
                    {isScanning
                      ? "Matching QR token against identity chain…"
                      : "Scan the emergency QR card to unlock and load triage records."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* FIELD 1 — Critical Allergy (always first) */}
                  {visibleFields >= 1 && (
                    <div
                      className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-start gap-3 animate-fadeInUp"
                      style={{ animation: "fadeInUp 0.35s ease forwards" }}
                    >
                      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 font-bold text-xs text-white shadow-lg shadow-red-500/30">
                        !
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-0.5">Critical Allergy Alert</p>
                        <p className="text-sm font-bold text-white">Severe Penicillin Allergy — Anaphylaxis Risk</p>
                        <p className="text-[11px] text-red-300 mt-0.5">Patient carries auto-injector (left jacket pocket)</p>
                      </div>
                    </div>
                  )}

                  {/* FIELD 2 — Blood Type + Genotype */}
                  {visibleFields >= 2 && (
                    <div
                      className="grid grid-cols-2 gap-3"
                      style={{ animation: "fadeInUp 0.35s ease forwards" }}
                    >
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Blood Group</p>
                        <p className="text-xl font-black text-white">O<span className="text-red-400">−</span></p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Universal donor</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Genotype</p>
                        <p className="text-xl font-black text-white">AA</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Confirmed 2024</p>
                      </div>
                    </div>
                  )}

                  {/* FIELD 3 — Medications */}
                  {visibleFields >= 3 && (
                    <div
                      className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5"
                      style={{ animation: "fadeInUp 0.35s ease forwards" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">Active Medications</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-medium">Ventolin (Salbutamol) Inhaler</span>
                          <span className="text-amber-300">As needed</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-medium">Amlodipine 5mg</span>
                          <span className="text-amber-300">Daily (AM)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FIELD 4 — Chronic Conditions */}
                  {visibleFields >= 4 && (
                    <div
                      className="bg-white/5 border border-white/10 rounded-xl p-3.5"
                      style={{ animation: "fadeInUp 0.35s ease forwards" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Chronic Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20 rounded-lg px-2.5 py-1">Mild Asthma</span>
                        <span className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20 rounded-lg px-2.5 py-1">Stage 1 Hypertension</span>
                      </div>
                    </div>
                  )}

                  {/* FIELD 5 — Emergency Contacts */}
                  {visibleFields >= 5 && (
                    <div
                      className="bg-white/5 border border-white/10 rounded-xl p-3.5"
                      style={{ animation: "fadeInUp 0.35s ease forwards" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#60A5FA] mb-2.5">Emergency Contacts</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-semibold text-white">Funmi Balogun</p>
                            <p className="text-[10px] text-slate-500">Wife · +234 805 333 4444</p>
                          </div>
                          <a
                            href="tel:+2348053334444"
                            className="text-[10px] bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg text-white font-medium transition"
                          >
                            Call
                          </a>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <div>
                            <p className="text-xs font-semibold text-white">Dr. Tunde Balogun</p>
                            <p className="text-[10px] text-slate-500">Brother · Cardiologist</p>
                          </div>
                          <a
                            href="tel:+2348031112222"
                            className="text-[10px] bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg text-white font-medium transition"
                          >
                            Call
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  {visibleFields >= 5 && (
                    <p className="text-center text-[10px] text-slate-600 pt-1">
                      Session logged under NDPA 2023 · Responder access only
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe for field reveals */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FAQ SECTION
───────────────────────────────────────────── */
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
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8 border-t border-slate-100">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
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

        {/* Accordion */}
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

        {/* Bottom CTA */}
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

  React.useEffect(() => {
    if (step === "scanning") {
      const timer = setTimeout(() => {
        setStep("portal");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 border-t border-b border-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1e3a8a] mb-3">Live Simulation</p>
          <h2 className="text-3xl font-extrabold text-[#071B3F] sm:text-4xl tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
            Emergency QR Code Simulator
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            See exactly what a first responder or doctor sees in an emergency when they scan your physical QR card.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Card / Scanner Side */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[360px]">
            {step === "card" && (
              <div className="w-full max-w-sm">
                {/* Physical Card Mockup */}
                <div className="aspect-[1.586/1] bg-gradient-to-br from-[#071B3F] to-[#0f3473] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between border border-white/10">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                    <Shield size={200} />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-sm tracking-tight text-white" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
                        Welli<span className="font-normal text-slate-300">Record</span>™
                      </span>
                      <p className="text-[7px] text-slate-300 tracking-wider uppercase font-semibold">Emergency Health Card</p>
                    </div>
                    <div className="bg-white p-1 rounded-lg">
                      {/* Fake QR */}
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#071B3F" strokeWidth="2.5">
                        <rect x="2" y="2" width="6" height="6" rx="1"/>
                        <rect x="16" y="2" width="6" height="6" rx="1"/>
                        <rect x="2" y="16" width="6" height="6" rx="1"/>
                        <path d="M16 16h2v2h-2zm4 4h2v2h-2zm0-4h2v2h-2zm-4 4h2v2h-2zm2-2h2v2h-2z" fill="#071B3F"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-wide">Oluwaseun Balogun</h4>
                    <p className="text-[9px] text-slate-300 font-mono mt-0.5">ID: WR-504-2025</p>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[8px] text-slate-300">
                    <div>
                      <p className="font-semibold text-red-400">⚠️ PENICILLIN ALLERGY</p>
                    </div>
                    <div className="text-right">
                      <p>In emergency, scan QR</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <p className="text-xs text-slate-500 mb-3">Click below to simulate scanning this card</p>
                  <button
                    onClick={() => setStep("scanning")}
                    className="inline-flex items-center gap-2 bg-[#071B3F] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#0c2d66] transition shadow-md"
                  >
                    Scan Card QR Code
                  </button>
                </div>
              </div>
            )}

            {step === "scanning" && (
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-t-transparent border-[#071B3F] rounded-full animate-spin" />
                  <Shield className="text-[#071B3F]" size={36} />
                </div>
                <h4 className="text-lg font-bold text-[#071B3F]">Processing Secure Link...</h4>
                <p className="text-sm text-slate-500 mt-2">Checking validation tokens & audit log...</p>
              </div>
            )}

            {step === "portal" && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-[#1e3a8a]">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-lg font-bold text-[#071B3F]">Demo Loaded Successfully</h4>
                <p className="text-sm text-slate-500 mt-2">The responder portal is now active on the right side.</p>
                <button
                  onClick={() => setStep("card")}
                  className="mt-6 text-xs font-semibold text-[#1e3a8a] hover:underline"
                >
                  ← Reset & Scan Again
                </button>
              </div>
            )}
          </div>

          {/* Simulator View Side */}
          <div className="bg-[#050F26] text-white rounded-3xl p-6 shadow-xl border border-white/5 relative overflow-hidden min-h-[420px]">
            {/* Phone/Portal Chrome */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest">WR.SECURE-GATE.NG</span>
              <Lock size={12} className="text-slate-400" />
            </div>

            {step === "card" || step === "scanning" ? (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <Lock size={44} className="text-[#9FB2D6] opacity-35 mb-4 animate-pulse" />
                <h4 className="text-base font-bold text-slate-300">Vault Portal Locked</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-xs">
                  Scan the emergency QR card on the left side to unlock this screen and load the triage records.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Allergy Banner First (Crucial alert!) */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">!</div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-red-400">Critical Medical Alert</h5>
                    <p className="text-sm font-semibold text-white mt-1">Severe Penicillin Allergy (Anaphylaxis Risk)</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Patient carries an auto-injector.</p>
                  </div>
                </div>

                {/* Patient Overview */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-bold text-base text-white">Oluwaseun Balogun</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">DOB: 12-May-1991 (Male)</p>
                    </div>
                    <span className="bg-blue-500/20 text-[#60A5FA] border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Emergency Info Only</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">Blood Group</p>
                      <p className="font-semibold text-white mt-0.5">O- (Universal)</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Genotype</p>
                      <p className="font-semibold text-white mt-0.5">AA</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Chronic Conditions</p>
                      <p className="font-semibold text-white mt-0.5">Mild Asthma</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Active Meds</p>
                      <p className="font-semibold text-white mt-0.5">Ventolin (As needed)</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#60A5FA] mb-2.5">Emergency Contacts</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">Funmi Balogun</p>
                        <p className="text-[10px] text-slate-400">Wife</p>
                      </div>
                      <a href="tel:+2348053334444" className="bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-white font-medium">Call</a>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <div>
                        <p className="font-semibold text-white">Dr. Tunde Balogun</p>
                        <p className="text-[10px] text-slate-400">Brother / Cardiologist</p>
                      </div>
                      <a href="tel:+2348031112222" className="bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-white font-medium">Call</a>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-slate-500">Secure session authorized under NDPA 2023 rules. All access logged.</p>
                </div>
              </div>
            )}
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
          background: radial-gradient(ellipse 600px 300px at 50% -20%, rgba(96,165,250,0.12), transparent 65%);
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
        .email-input:focus { border-color: #60A5FA; }
        .email-input.err { border-color: #F87171; }
        .email-btn {
          flex: none;
          background: #FFFFFF;
          color: #071B3F;
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
        .email-btn:hover:not(:disabled) {
          background: #EEF3FC;
          transform: translateY(-1px);
        }
        .email-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .email-success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(96,165,250,0.12);
          border: 1px solid rgba(96,165,250,0.3);
          border-radius: 10px;
          padding: 14px 20px;
          color: #93C5FD;
          font-size: 15px;
          font-weight: 600;
          max-width: 480px;
          margin: 0 auto;
        }
        .email-consent {
          margin-top: 16px;
          font-size: 12.5px;
          color: #7387AE;
          text-align: center;
        }
        .email-consent a {
          color: #9FB2D6;
          text-decoration: underline;
          transition: color .15s ease;
        }
        .email-consent a:hover {
          color: #FFFFFF;
        }
        .email-micro {
          margin-top: 24px;
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
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#60A5FA] mb-4" style={{ position: "relative" }}>
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
            <>
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
              <p className="email-consent">
                By subscribing you agree to our{" "}
                <Link to="/privacy">
                  privacy policy
                </Link>
                .
              </p>
            </>
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
            {" "}· inquiry@wellirecord.com
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
                className="w-full rounded-lg bg-[#071B3F] px-6 py-3.5 text-center text-base font-semibold text-white shadow-md transition hover:bg-[#0c2d66] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                Create Health Vault
              </Link>

              <a
                href="https://wa.me/2348053355504?text=REGISTER"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-center text-base font-semibold text-white shadow-md transition hover:bg-[#20ba5a] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Register on WhatsApp
              </a>

              <Link
                to="/auth/provider/signup"
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-6 py-3.5 text-center text-base font-semibold text-[#071B3F] hover:bg-slate-50 transition sm:w-auto sm:px-8 sm:py-4"
              >
                Register Provider Org
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c6f85] sm:text-xs">
              <Link to="/privacy" className="hover:underline text-[#1e3a8a]">NDPA Compliant</Link>
              <span className="text-slate-300">•</span>
              <span>Encrypted at Rest & Transit</span>
              <span className="text-slate-300">•</span>
              <span>Patient-Controlled Access</span>
            </div>
          </div>
        </section>

        <section className="relative min-h-[280px] w-full overflow-hidden bg-[radial-gradient(circle_at_center,_#f8fbfc_0%,_#e5eef2_60%,_#dfe8ee_100%)] sm:min-h-[360px] lg:min-h-[530px] lg:w-[45%]">
          <div className="absolute left-0 top-0 z-10 rounded-br-lg bg-[#071B3F] px-3 py-1.5 text-sm font-semibold text-white shadow-sm sm:px-4 sm:text-base lg:text-lg">
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

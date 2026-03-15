import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Hospital,
  Microscope,
  Pill,
  Shield,
  Stethoscope
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WelliFooter from "../../../../components/ui/Footer";
import { useAuth } from "@/shared/auth/AuthProvider";
import logos from "../../../assets/logos.png";
// import hero from "../../../assets/hero.png";
import { hero } from "@/assets";

const navItems = [
  { label: "About Us", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Solutions", href: "#solutions", hasChevron: true },
  { label: "Pricing", href: "#pricing" },
  { label: "Partners", href: "#partners" },
  { label: "Security", href: "#security" },
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
    icon: "/health_companion_image.png",
  },
  {
    title: "Own Your Health Record",
    description: "Your complete medical history in one secure vault.",
    icon: "/yourhealthrecord.png",
  },
  {
    title: "Control Access Instantly",
    description: "Grant or revoke provider access anytime.",
    icon: "/control_access_image.png",
  },
  {
    title: "Emergency QR Card",
    description: "Share critical health data instantly in emergencies.",
    icon: "/qr_card_image.png",
  },
];

const stakeholders = [
  { label: "Hospitals", icon: "/hopistal.png" },
  { label: "Diagnostic Labs", icon: "/diagonize.png" },
  { label: "Pharmacies", icon: "/pharmacies.png" },
  { label: "Telehealth", icon: "/telehealth.png" },
  { label: "Insurance", icon: "/insurance.png" },
  { label: "Wearables", icon: "/wearable.png" },
  { label: "NGOs", icon: "/NGOs.png" },
  { label: "Government", icon: "/government.png" },
];

const partners = [
  "General Hospital Lagos",
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
          Your health, secured
        </div>
      </div>
    </a>
  );
}

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
  };


  return (
    <header className="sticky top-0  z-50 border-b border-slate-100/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-full items-center justify-between gap-6 px-6 py-3 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-72 overflow-hidden items-center justify-center rounded-md bg-[#0b3870] text-white shadow-sm">
            <img src={logos} alt="wellirecord" className=" w-full h- full object-cover" />
          </div>
          
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-1 text-lg font-semibold text-[#1F4E79] transition hover:text-slate-950"
            >
              {item.label}
              {item.hasChevron ? <ChevronDown className="h-4 w-4" /> : null}
            </a>
          ))}
        </nav>
        

        {!user ? (
        <div className="hidden items-center gap-5 lg:flex">
          <Link
            to={"/auth/pre-login"}
            className="text-lg font-semibold text-[#1F4E79] transition hover:text-emerald-700"
          >
            Login
          </Link>
          <PrimaryButton href={"/auth/pre-signup"}>Create Health Vault</PrimaryButton>
        </div>

        ): (

        <div className="hidden items-center gap-5 lg:flex">
          <button
            
            onClick={handleSignOut}
            className="text-lg font-semibold text-[#1F4E79] transition hover:text-emerald-700"
          >
            Log Out
          </button>
          <PrimaryButton href={"/patient/overview"}>My Dashboard</PrimaryButton>
        </div>
        )}

        <a
          href="#cta"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 lg:hidden"
        >
          Get Started
        </a>
      </div>
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

function Herort() {
  return (
    <section id="about" className="bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <h1 className="max-w-xl text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">
            Own Your Complete Medical History
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
            The first patient-owned health vault in Africa, WelliRecord securely
            connects your hospitals, labs, and pharmacies into a single private
            health vault, giving you full control over who can access your
            medical history.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <PrimaryButton href="#cta">Create Health Vault</PrimaryButton>
            <SecondaryButton href="#solutions">
              For Healthcare Providers
            </SecondaryButton>
          </div>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
            NDPR Compliant • NHR Interoperability • HIPAA Ready • ISO 27001
          </p>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function ProblemVisual() {
  return (
    <div className="relative mt-16">
      <div className="absolute -bottom-16 left-10 h-[75%] w-[100%] rounded-sm bg-[#1F4E79]" />
      <div className="relative overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className=" bg-slate-100 min-h-[360px] p-1 grid-cols-[1.2fr_1fr]">
        

          <img src="/HealthRecord.png" alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="bg-white px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-[90rem]  ">
        <SectionHeading
          title="Healthcare Records Should not Be This Hard"
          subtitle="Healthcare data across Nigeria is fragmented, siloed, and difficult to access when it matters most."
        />

        <div className="mt-16 space-x-10  grid items-center gap-20 lg:grid-cols-[1.1fr_0.9fr]">
          <ProblemVisual />

          <div>
            <h3 className="max-w-xs text-xl font-semibold text-slate-950">
              Some of The Pain Points <br /> include:
            </h3>

            <div className="mt-8 space-y-10">
              {painPoints.map((item) => (
                <div key={item} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1d4f82] text-white">
                    <ArrowRight className="h-3 w-4 font-bold" />
                  </div>
                  <p className="text-lg text-[#002353] font-semibold">{item}</p>
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
    <div className="relative">
      <div className="absolute left-[15px] top-4 h-[calc(100%-100px)] w-px bg-slate-300" />
      <div className="space-y-12  w-[346px]">
        {timelineSteps.map((step) => (
          <div key={step.title} className="relative flex gap-6">
            <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1d4f82] bg-white">
              <div className="h-3.5 w-3.5 rounded-full bg-[#1d4f82]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[15rem]  text-base leading-6 text-slate-600">
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
    <div className="relative mt-10 lg:mt-20">
      <div className="absolute -bottom-16 -left-16 h-[356px] w-[749px] rounded-none bg-[#1F4E79] zf10"  />
      <div className="p-1 bg-slate-300 h-[539px] w-[727px] relative overflow-hidden ">
      <img
        src="/wellirecordimage.png"
        alt="Workflow Illustration"
        className="  z-20 w-full h-full shadow-sm"
      />
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-0 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-30 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <h2 className="max-w-sm text-4xl font-semibold tracking-tight text-[#1F4E79] md:text-4.5xl">
              How WelliRecords Work
            </h2>
            <div className="mt-10">
              <Timeline />
            </div>
          </div>

          <WorkflowVisual />
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
    <section className="bg-white px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Core Features"
          subtitle="What can you actually do with WelliRecord?"
        />

        <div className="relative mt-16">
          <div className="absolute inset-x-0 top-24 h-[326px] w-[1249px] rounded-none bg-[#8DB8E25C]" />
          <div className="relative flex justify-center gap-12 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="overflow-hidden w-[250px] rounded-xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <FeatureVisual icon={feature.icon} />
                
                <div className="px-6 pb-16 pt-6 text-center">
                  <h3 className="text-base font-bold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-8 text-slate-600">
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
            <Link to="#" className="font-semibold text-base bg-[#2E8B57] py-4 px-3 text-white shadow-sm transition hover:bg-[#2E8B57]/90 rounded-2xl">
              Register Your Organisation
            </Link>
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

        <div
          id="cta"
          className="mt-24 rounded-[32px] bg-slate-50 px-6 py-20 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Take Control of Your Health Records
          </h2>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PrimaryButton href="#top">[Create Health Vault]</PrimaryButton>
            <a
              href="#solutions"
              className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-600 bg-transparent px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Register Your Organisation
            </a>
          </div>
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

export default function App() {
  return (
    <div
      id="top"
      className="min-h-screen w-full scroll-smooth bg-white text-slate-900"
    >
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <Solutions />
        {/* <Partners /> */}
        <WelliFooter />
       
     
      </main>
    </div>
  );
}

function Hero() {
  return (
    <div className="min-h-[] w-full pt-10 py-5  text-slate-900">
      <main className=" flex w-full bg-white grid-cols-1  overflow-hidden ">
        <section className="flex  flex-1 justify-center items-center bg-[#F4F9FD]/40 px-8 py-16 lg:min-h-[530px] lg:px-16 xl:px-24">
          <div className="w-">
            <h1 className="max-w-[560px] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#002353] md:text-[60px]">
              Own Your Complete Medical History
            </h1>

            <p className="mt-10 max-w-[680px] text-[19px] leading-[1.45] text-[#475569]">
              The first patient-owned health vault in Africa, WelliRecord
              securely connects your hospitals, labs, and pharmacies into a
              single private health vault , giving you full control over who can
              access your medical history.
            </p>

            <div className="mt-10 md:w-[85%] flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <button className="rounded-lg bg-[#2f8f53] px-8 py-4 text-[18px] font-semibold text-white shadow-sm transition hover:bg-[#2E8B57]">
                Create Health Vault
              </button>
              <button className="rounded-lg border-4 border-[#173f73] bg-white px-8 py-[14px] text-[18px] font-semibold text-[#173f73] transition hover:bg-slate-50">
                For Healthcare Providers
              </button>
            </div>

            <div className="mt-8 text-[13px] uppercase tracking-[0.35em] text-[#5c6f85]">
              • NDPR Compliant &nbsp;&nbsp;•&nbsp;&nbsp; NHR Interoperability
              &nbsp;&nbsp;•&nbsp;&nbsp; <br /> HIPAA Ready
              &nbsp;&nbsp;•&nbsp;&nbsp; ISO 27001
            </div>
          </div>
        </section>

        <section className="relative min-h-[518px] w-[45%] border-red-600 overflow-hidden bg-[radial-gradient(circle_at_center,_#f8fbfc_0%,_#e5eef2_60%,_#dfe8ee_100%)]">
            <div className="bg-[#2E8B57] absolute  top-0 left-0 z-10 text-white pr-4 pl-2.5 pt-1.5 text-lg font-semibold rounded-br-lg shadow-sm">
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

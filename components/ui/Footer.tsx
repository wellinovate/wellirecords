import { welliIcon } from "@/assets";
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function WelliFooter() {
  return (
    <footer className="w-full bg-[#002A66]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-3 mb-10 sm:mb-12 lg:mb-16">
          <img src={welliIcon} alt="WelliRecord" className="h-10 w-10 object-contain flex-shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-black text-xl" style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
              Welli<span className="font-normal">Record</span><sup className="text-sm font-normal align-super">™</sup>
            </span>
            <span className="text-blue-300 text-[9px] font-bold tracking-[0.14em] uppercase opacity-80">
              Your Health, Secured. Everywhere.
            </span>
          </div>
        </Link>

        {/* Columns */}
        <div className="grid grid-cols-1 gap-10 text-white sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-12 xl:gap-20">

          {/* Contact */}
          <div>
            <p className="text-base font-semibold uppercase tracking-[0.15em] text-blue-300 mb-5">
              Contact Us
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-blue-300 shrink-0" />
                <span className="text-base leading-7 tracking-[-0.02em] sm:text-lg">
                  Abuja, Nigeria 🇳🇬
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-blue-300 shrink-0" />
                <a href="tel:+2348053355504" className="text-base leading-7 tracking-[-0.02em] sm:text-lg hover:text-blue-200 transition">
                  +234 805 335 5504
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-blue-300 shrink-0" />
                <a href="mailto:inquiry@wellirecord.com" className="text-base leading-7 tracking-[-0.02em] sm:text-lg hover:text-blue-200 transition">
                  inquiry@wellirecord.com
                </a>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-4 text-white">
            <p className="text-base font-semibold uppercase tracking-[0.15em] text-blue-300 mb-1">Company</p>
            {["About Us", "Solutions", "Pricing", "Partners"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-base leading-7 tracking-[-0.02em] transition hover:text-blue-200 sm:text-lg"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA links — unified labels */}
          <nav className="flex flex-col gap-4 text-white">
            <p className="text-base font-semibold uppercase tracking-[0.15em] text-blue-300 mb-1">Get Started</p>
            <Link
              to="/auth/patient/signup"
              className="text-base leading-7 tracking-[-0.02em] transition hover:text-blue-200 sm:text-lg"
            >
              Create Health Vault
            </Link>
            <Link
              to="/auth/provider/signup"
              className="text-base leading-7 tracking-[-0.02em] transition hover:text-blue-200 sm:text-lg"
            >
              Register Your Organisation
            </Link>
            <Link
              to="/auth/login"
              className="text-base leading-7 tracking-[-0.02em] transition hover:text-blue-200 sm:text-lg"
            >
              Log In
            </Link>
          </nav>
        </div>

        {/* Copyright & Legal links */}
        <div className="mt-12 border-t border-blue-900/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-blue-200/70">
          <p>© {new Date().getFullYear()} WelliRecord Ltd. Abuja, Nigeria. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white transition underline decoration-blue-800">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white transition underline decoration-blue-800">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

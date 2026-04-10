import { logos } from "@/assets";
import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function WelliFooter() {
  return (
    <footer className="w-full bg-[#002A66]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* logo */}
        <div className="flex min-w-0 items-center">
                  <Link to="/" className="block">
                    <div className="flex h-8 w- items-center justify-center overflow-hidden rounded-md bg-[#0b3870] shadow-sm sm:h-10 sm:w-36 lg:w-52 mb-10 sm:mb-12 lg:mb-16">
                      <img
                        src={logos}
                        alt="wellirecord"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                </div>

        {/* columns */}
        <div className="grid grid-cols-1 gap-10 text-white sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:gap-12 xl:gap-20">
          {/* contact */}
          <div>
            <p className="text-lg leading-7 tracking-[-0.02em] sm:text-xl">
              Reach out to us @
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl leading-none sm:text-[28px]">🇳🇬</span>
              <span className="text-lg leading-7 tracking-[-0.02em] sm:text-xl">
                Lagos, Nigeria.
              </span>
            </div>

            <p className="mt-4 text-lg leading-7 tracking-[-0.02em] sm:text-xl">
              08053355504
            </p>
          </div>

          {/* middle links */}
          <nav className="flex flex-col gap-4 text-white">
            {["About Us", "Solutions", "Pricing", "Partners"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-base leading-7 tracking-[-0.02em] transition hover:text-slate-200 sm:text-lg"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* right links */}
          <nav className="flex flex-col gap-4 text-white">
            {[
              "Create Health Vault",
              "Register Your Organisation",
              "For Healthcare Providers",
              "Log In",
            ].map((item) => (
              <a
                key={item}
                href="/auth/login"
                className="text-base leading-7 tracking-[-0.02em] transition hover:text-slate-200 sm:text-lg"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* social */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white sm:mt-14 sm:gap-8 lg:mt-16">
          <a href="#" aria-label="Instagram">
            <Instagram size={24} strokeWidth={2} />
          </a>

          <a href="#" aria-label="Twitter">
            <Twitter size={24} strokeWidth={2} />
          </a>

          <a href="#" aria-label="Facebook">
            <Facebook size={24} strokeWidth={2} />
          </a>

          <a href="#" aria-label="LinkedIn">
            <Linkedin size={24} strokeWidth={2} />
          </a>
        </div>

        {/* Copyright */}
        <p className="mt-10 text-center text-sm leading-6 tracking-[-0.02em] text-white sm:mt-12 sm:text-base lg:mt-14">
          © {new Date().getFullYear()} WelliRecord Ltd. Lagos, Nigeria.
        </p>
      </div>
    </footer>
  );
}

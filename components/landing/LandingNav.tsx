import React from "react";

type Props = {
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
  onLogin: () => void;
  onGetStarted: () => void;
};

export function LandingNav({ scrollToSection, onLogin, onGetStarted }: Props) {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 text-blue-600">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                d="M50 95C50 95 85 78.4 85 45V18L50 5L15 18V45C15 78.4 50 95 50 95Z"
                fill="currentColor"
              />
              <path
                d="M50 25V65M30 45H70"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            WelliRecord
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, "features")}
            className="hover:text-blue-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#security"
            onClick={(e) => scrollToSection(e, "security")}
            className="hover:text-blue-600 transition-colors"
          >
            Security
          </a>
          <a
            href="#partners"
            onClick={(e) => scrollToSection(e, "partners")}
            className="hover:text-blue-600 transition-colors"
          >
            Partners
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onLogin}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 hidden sm:block"
          >
            Log In
          </button>
          <button
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-blue-600/20"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

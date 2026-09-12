import { Link } from "react-router-dom";
import { welliIcon } from "@/assets";

export function SupportPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={welliIcon} alt="WelliRecord" className="h-8 w-8 object-contain" />
            <span className="font-black text-[#1e3a8a] text-base" style={{ letterSpacing: "-0.02em" }}>
              Welli<span className="font-normal">Record</span>™
            </span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-[#1e3a8a] hover:underline">← Back to Home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1e3a8a] mb-3">Help</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl mb-4">
          Support
        </h1>
        <p className="text-slate-500 text-sm mb-12">We're here to help with your Health Vault.</p>

        <div className="prose prose-slate prose-lg max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Contact Us</h2>
            <p className="text-slate-600 leading-8">
              For account issues, technical support, or general questions about WelliRecord,
              reach out to us directly:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>Email: <a href="mailto:inquiry@wellirecord.com" className="text-[#1e3a8a] hover:underline">inquiry@wellirecord.com</a></li>
              <li>Phone / WhatsApp: <a href="tel:+2348053355504" className="text-[#1e3a8a] hover:underline">+234 805 335 5504</a></li>
            </ul>
            <p className="text-slate-600 leading-8 mt-4">
              We aim to respond to all support requests within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Common Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">How do I access my health records?</h3>
                <p className="text-slate-600 leading-8">
                  Sign in to your WelliRecord account via the app or at wellirecord.com. Your
                  complete health vault, including lab results, medications, and diagnoses, is
                  available under Health Record.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">How do I share records with a provider?</h3>
                <p className="text-slate-600 leading-8">
                  Use the consent dashboard in your Health Vault to grant time-limited, scoped
                  access to any provider. You can revoke access at any time.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">How do I delete my account?</h3>
                <p className="text-slate-600 leading-8">
                  You can permanently delete your WelliRecord account and all associated data
                  directly from the app:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600 leading-8 mt-2">
                  <li>Sign in to your WelliRecord account</li>
                  <li>Go to <strong>Settings → Privacy &amp; Security</strong></li>
                  <li>Select <strong>Delete Account</strong> and confirm</li>
                </ol>
                <p className="text-slate-600 leading-8 mt-2">
                  This permanently removes your profile, health records, medications, diagnoses,
                  vitals, and any consent grants you've issued to providers. Data is purged within
                  30 days, except where retention is required by Nigerian law.
                </p>
                <p className="text-slate-600 leading-8 mt-2">
                  If you can't access the app, email{" "}
                  <a href="mailto:privacy@wellirecord.com" className="text-[#1e3a8a] hover:underline">
                    privacy@wellirecord.com
                  </a>{" "}
                  from your account's registered email and we'll process the deletion within 30 days.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} WelliRecord Ltd ·{" "}
        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>{" "}·{" "}
        <Link to="/terms" className="hover:underline">Terms of Service</Link>
      </footer>
    </div>
  );
}

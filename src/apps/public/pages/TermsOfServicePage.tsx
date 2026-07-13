import { Link } from "react-router-dom";
import { welliIcon } from "@/assets";

export function TermsOfServicePage() {
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">Legal</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl mb-4">
          Terms of Service
        </h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: July 2025 · Effective immediately</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-8">
              By creating an account or using the WelliRecord platform (wellirecord.com), you agree
              to these Terms of Service and our{" "}
              <Link to="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
              If you do not agree, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p className="text-slate-600 leading-8">
              WelliRecord provides a patient-owned digital health vault that enables individuals
              to securely store, manage, and share medical records with authorised healthcare
              providers. We also provide tools for healthcare organisations to deliver care
              through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Eligibility</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>You must be at least 18 years old to create an account independently</li>
              <li>Accounts for minors must be created and managed by a parent or legal guardian</li>
              <li>Healthcare organisations must be duly registered in their jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Your Health Vault</h2>
            <p className="text-slate-600 leading-8">
              Your health data belongs to you. WelliRecord acts as a data processor, not a data
              owner. You may export, delete, or transfer your records at any time. We do not
              alter, interpret, or use your health data for any purpose other than delivering
              the services you have requested.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Provider & Organisation Accounts</h2>
            <p className="text-slate-600 leading-8">
              Healthcare organisations registering on WelliRecord agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>Use patient data exclusively for the delivery of care to that patient</li>
              <li>Not export, share, or monetise patient data outside the platform</li>
              <li>Maintain valid registration with the relevant Nigerian regulatory body (MDCN, MLSCN, PCN, etc.)</li>
              <li>Comply with NDPA obligations as a data controller for your organisation's staff</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Prohibited Use</h2>
            <p className="text-slate-600 leading-8">You may not:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>Submit false, fraudulent, or misleading information</li>
              <li>Attempt to access another user's health data without authorisation</li>
              <li>Reverse engineer, scrape, or otherwise extract data from the platform</li>
              <li>Use the platform to distribute malware or conduct cyberattacks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Medical Disclaimer</h2>
            <p className="text-slate-600 leading-8">
              WelliRecord is a health record management platform, not a medical provider.
              Nothing on this platform constitutes medical advice, diagnosis, or treatment.
              Always consult a qualified healthcare professional for medical decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
            <p className="text-slate-600 leading-8">
              To the maximum extent permitted by Nigerian law, WelliRecord shall not be liable
              for indirect, incidental, or consequential damages arising from your use of the
              platform. Our total liability in any dispute shall not exceed the amount you paid
              us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Governing Law</h2>
            <p className="text-slate-600 leading-8">
              These Terms are governed by the laws of the Federal Republic of Nigeria.
              Any disputes shall be resolved in the courts of the Federal Capital Territory, Abuja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to Terms</h2>
            <p className="text-slate-600 leading-8">
              We may update these Terms from time to time. We will notify you via email and
              an in-app notice at least 14 days before material changes take effect.
              Continued use of the platform constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact</h2>
            <p className="text-slate-600 leading-8">
              WelliRecord Ltd<br />
              Abuja, Federal Capital Territory, Nigeria<br />
              <a href="mailto:inquiry@wellirecord.com" className="text-emerald-600 hover:underline">inquiry@wellirecord.com</a>
            </p>
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

import { Link } from "react-router-dom";
import { welliIcon } from "@/assets";

export function PrivacyPolicyPage() {
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1e3a8a] mb-3">Legal</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl mb-4">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: July 2025 · Effective immediately</p>

        <div className="prose prose-slate prose-lg max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Who We Are</h2>
            <p className="text-slate-600 leading-8">
              WelliRecord Ltd is a health technology company registered in Nigeria. We operate
              <strong> wellirecord.com</strong> — a patient-owned electronic health vault that allows
              individuals to securely store, manage, and share their medical records. Our registered
              office is in Abuja, Federal Capital Territory, Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Data We Collect</h2>
            <p className="text-slate-600 leading-8">We collect only what is necessary to deliver our services:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li><strong>Identity data</strong>: full name, date of birth, NIN (where provided), gender</li>
              <li><strong>Contact data</strong>: email address, phone number, home address</li>
              <li><strong>Health data</strong>: medical records, lab results, prescriptions, diagnoses uploaded by you or your care providers</li>
              <li><strong>Usage data</strong>: login timestamps, pages visited, features accessed</li>
              <li><strong>Device data</strong>: IP address, browser type, operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>To create and maintain your Health Vault</li>
              <li>To facilitate sharing of records with care providers you explicitly authorise</li>
              <li>To send transactional notifications (appointment reminders, access alerts)</li>
              <li>To improve platform security and detect fraud</li>
              <li>To comply with Nigerian law, including the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and the <strong>Nigeria Health Records Officers Act</strong></li>
            </ul>
            <p className="text-slate-600 leading-8 mt-4">
              We do <strong>not</strong> sell, rent, or broker your health data to insurers, employers,
              pharmaceutical companies, or any third party for commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. NDPA Compliance</h2>
            <p className="text-slate-600 leading-8">
              WelliRecord processes personal data in accordance with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong>,
              administered by the National Data Protection Commission (NDPC). The NDPA 2023 superseded the
              earlier NDPR 2019 and establishes the current legal framework for data protection in Nigeria. This means:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>We obtain your explicit consent before processing sensitive health data</li>
              <li>You may request access to, correction of, or deletion of your data at any time</li>
              <li>We maintain a Data Protection Officer (DPO) — contact: <a href="mailto:privacy@wellirecord.com" className="text-[#1e3a8a] hover:underline">privacy@wellirecord.com</a></li>
              <li>We conduct Data Protection Impact Assessments for high-risk processing activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Security</h2>
            <p className="text-slate-600 leading-8">
              All data is encrypted in transit using TLS 1.3 and encrypted at rest using AES-256.
              Access to health records is role-based and audit-logged. You control which providers
              can view your records through the consent dashboard in your Health Vault.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data Retention</h2>
            <p className="text-slate-600 leading-8">
              We retain your data for as long as your account is active. If you delete your account,
              your personal data is purged within 30 days, except where retention is required by
              Nigerian law (e.g., health records regulations require retention for a minimum period).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
            <p className="text-slate-600 leading-8">Under the NDPA 2023, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>Access a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data ("right to erasure")</li>
              <li>Withdraw consent at any time without affecting prior processing</li>
              <li>Lodge a complaint with the National Data Protection Commission (NDPC)</li>
            </ul>
            <p className="text-slate-600 leading-8 mt-4">
              To exercise any right, email <a href="mailto:privacy@wellirecord.com" className="text-[#1e3a8a] hover:underline">privacy@wellirecord.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact</h2>
            <p className="text-slate-600 leading-8">
              WelliRecord Ltd<br />
              Abuja, Federal Capital Territory, Nigeria<br />
              General: <a href="mailto:inquiry@wellirecord.com" className="text-[#1e3a8a] hover:underline">inquiry@wellirecord.com</a><br />
              Privacy / DPO: <a href="mailto:privacy@wellirecord.com" className="text-[#1e3a8a] hover:underline">privacy@wellirecord.com</a>
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

import { Link } from "react-router-dom";
import { welliIcon } from "@/assets";

export function DeleteAccountPage() {
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1e3a8a] mb-3">Account</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl mb-4">
          Delete Your Account
        </h1>
        <p className="text-slate-500 text-sm mb-12">How to permanently delete your WelliRecord account and data.</p>

        <div className="prose prose-slate prose-lg max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Delete In-App</h2>
            <p className="text-slate-600 leading-8">
              You can delete your WelliRecord account directly from the mobile app or web portal:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 leading-8">
              <li>Sign in to your WelliRecord account</li>
              <li>Go to <strong>Settings → Privacy &amp; Security</strong></li>
              <li>Select <strong>Delete Account</strong></li>
              <li>Confirm the deletion when prompted</li>
            </ol>
            <p className="text-slate-600 leading-8 mt-4">
              Your account will be deleted immediately, and access will be revoked right away.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">What Gets Deleted</h2>
            <p className="text-slate-600 leading-8">
              Deleting your account permanently removes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-8">
              <li>Your profile and identity information</li>
              <li>Your health records, including lab results, medications, diagnoses, and vitals</li>
              <li>Any pending or active consent grants you've issued to providers</li>
              <li>Family member records linked under your account</li>
            </ul>
            <p className="text-slate-600 leading-8 mt-4">
              Data is purged within 30 days of deletion, except where retention is required by
              Nigerian law (see our <Link to="/privacy" className="text-[#1e3a8a] hover:underline">Privacy Policy</Link> for details).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Request Deletion Without App Access</h2>
            <p className="text-slate-600 leading-8">
              If you're unable to access the app, you can request account deletion by emailing{" "}
              <a href="mailto:privacy@wellirecord.com" className="text-[#1e3a8a] hover:underline">privacy@wellirecord.com</a>{" "}
              from the email address associated with your account. We'll process your request
              within 30 days.
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

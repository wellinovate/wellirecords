import React from "react";

type Props = {
  onGetStarted: () => void;
  onContactSales: () => void;
};

export function CTASection({ onGetStarted, onContactSales }: Props) {
  return (
    <section className="py-20 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          Ready to take control of your health?
        </h2>

        <p className="text-slate-500 mb-10 text-lg">
          Join thousands of patients who have already secured their medical future.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-600/20 transition-all transform hover:scale-105"
          >
            Get Started Free
          </button>

          <button
            onClick={onContactSales}
            className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-lg transition-all"
          >
            Contact Sales
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          WelliRecord complies with NDPR, HIPAA, GDPR, and SOC2 Type II standards.
          Your data is encrypted at rest and in transit.
        </p>
      </div>
    </section>
  );
}

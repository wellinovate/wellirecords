import React from "react";
import { X, CheckCircle2, Building2, Send } from "lucide-react";

export type SalesForm = {
  name: string;
  email: string;
  company: string;
  message: string;
};

type Props = {
  open: boolean;
  loading: boolean;
  salesSubmitted: boolean;
  salesForm: SalesForm;
  setSalesForm: (next: SalesForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onResetSubmitted: () => void;
};

export function SalesContactModal({
  open,
  loading,
  salesSubmitted,
  salesForm,
  setSalesForm,
  onSubmit,
  onClose,
  onResetSubmitted,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]">
        <button
          onClick={() => {
            onClose();
            onResetSubmitted();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {salesSubmitted ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-slate-500 mb-8 max-w-xs">
              Thank you for your interest in WelliRecord Enterprise. Our sales
              team will contact you at <strong>{salesForm.email}</strong> within
              24 hours.
            </p>
            <button
              onClick={() => {
                onClose();
                onResetSubmitted();
                setSalesForm({ name: "", email: "", company: "", message: "" });
              }}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Contact Sales
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Interested in deploying WelliRecord for your hospital, clinic,
                or insurance network? Let&apos;s talk.
              </p>
            </div>

            <form onSubmit={onSubmit} className="p-8 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm"
                    placeholder="Jane Doe"
                    value={salesForm.name}
                    onChange={(e) =>
                      setSalesForm({ ...salesForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm"
                    placeholder="jane@company.com"
                    value={salesForm.email}
                    onChange={(e) =>
                      setSalesForm({ ...salesForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Organization Name
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-3 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm"
                    placeholder="Hospital / Clinic / Company"
                    value={salesForm.company}
                    onChange={(e) =>
                      setSalesForm({ ...salesForm, company: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  How can we help?
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm resize-none"
                  placeholder="Tell us about your needs..."
                  value={salesForm.message}
                  onChange={(e) =>
                    setSalesForm({ ...salesForm, message: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Inquiry"}
                {!loading && <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Building2 } from "lucide-react";

type Props = {
  partners?: string[];
  onPartnerClick?: (name: string) => void;
};

const DEFAULT_PARTNERS = [
  "Lagoon Hospitals",
  "Reddington Hospital",
  "Eko Hospital",
  "First Cardiology",
  "Cedarcrest Hospitals",
];

export function PartnersSection({
  partners = DEFAULT_PARTNERS,
  onPartnerClick,
}: Props) {
  return (
    <section className="border-y border-slate-100 bg-slate-50 py-16" id="partners">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">
          Trusted by Top Nigerian Healthcare Providers
        </p>

        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {partners.map((name, i) => (
            <button
              key={i}
              onClick={() =>
                onPartnerClick
                  ? onPartnerClick(name)
                  : alert(`Initiating secure connection request to ${name} Portal...`)
              }
              className="group flex items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
            >
              <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                <Building2 size={24} />
              </div>
              <span className="text-lg font-serif font-bold text-slate-700 group-hover:text-slate-900">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

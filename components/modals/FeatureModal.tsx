import React from "react";
import { X, CheckCircle2 } from "lucide-react";

export type FeatureModalData = {
  title: string;
  desc: string;
  details: string;
  benefits: string[];
  color: string; // e.g. "text-blue-600"
  modalColor: string; // e.g. "bg-blue-600"
  icon: React.ElementType;
};

type Props = {
  feature: FeatureModalData | null;
  onClose: () => void;
};

export function FeatureModal({ feature, onClose }: Props) {
  if (!feature) return null;

  const Icon = feature.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`p-8 ${feature.modalColor} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white">
            <Icon size={32} />
          </div>

          <h2 className="text-3xl font-bold mb-2">{feature.title}</h2>
          <p className="text-white/90 text-lg leading-relaxed">
            {feature.desc}
          </p>
        </div>

        <div className="p-8 overflow-y-auto">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
            Deep Dive
          </h4>
          <p className="text-slate-600 leading-relaxed mb-8">
            {feature.details}
          </p>

          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
            Key Benefits
          </h4>

          <div className="space-y-3">
            {feature.benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <CheckCircle2
                  className={`shrink-0 mt-0.5 ${feature.color.split(" ")[1] ?? ""}`}
                  size={18}
                />
                <span className="text-slate-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

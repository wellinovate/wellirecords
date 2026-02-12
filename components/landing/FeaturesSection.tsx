import React from "react";
import { ArrowRight } from "lucide-react";
import type { FeatureModalData } from "../modals/FeatureModal";

type Props = {
  features: FeatureModalData[];
  onOpenFeature: (feature: FeatureModalData) => void;
};

export function FeaturesSection({ features, onOpenFeature }: Props) {
  return (
    <section className="py-24" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to manage your health
          </h2>
          <p className="text-lg text-slate-500">
            Traditional patient portals are fragmented. WelliRecord brings it all
            together in one beautiful, secure dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-500 leading-relaxed mb-6">
                  {feature.desc}
                </p>

                <button
                  onClick={() => onOpenFeature(feature)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group/btn"
                >
                  Learn more{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Icons } from '../layout/Icons';

export const WelliRootComponent: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">WelliRoot™ Lifestyle</h2>
           <p className="text-slate-500 text-sm">Nutrition, Culture & Community Wellness.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2">
            <Icons.Sprout className="w-4 h-4" /> My Plan
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Daily Wisdom */}
         <div className="md:col-span-2 bg-[#fdf8f0] border border-[#eaddcf] rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200">
                Daily African Wisdom
            </span>
            <h3 className="text-3xl font-serif text-slate-900 mb-4 leading-tight italic">
                "Good health is the crown on the well person’s head that only the sick person can see."
            </h3>
            <p className="text-slate-600 font-medium text-sm">— Yoruba Proverb</p>
         </div>

         {/* Nutrition Card */}
         <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                    <Icons.Sprout className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-slate-900">Nutrition Guide</h3>
            </div>
            <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b border-slate-50">
                    <img src="https://picsum.photos/100/100?random=20" className="w-12 h-12 rounded-lg object-cover" alt="Moringa" />
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Moringa Oleifera</h4>
                        <p className="text-xs text-slate-500">Superfood boost. Add to morning pap/oatmeal.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <img src="https://picsum.photos/100/100?random=21" className="w-12 h-12 rounded-lg object-cover" alt="Garden Egg" />
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Garden Egg</h4>
                        <p className="text-xs text-slate-500">Rich in fiber and potassium.</p>
                    </div>
                </div>
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                View Meal Plan
            </button>
         </div>
      </div>

      {/* Community Circles */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Icons.Globe className="w-5 h-5 text-slate-400" /> Community Circles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { name: 'Lagos Runners', members: 1205, active: true },
                { name: 'New Moms Support', members: 840, active: true },
                { name: 'Diabetic Living', members: 540, active: false },
                { name: 'Meditation & Peace', members: 320, active: true },
            ].map((circle, idx) => (
                <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl hover:border-welli-200 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-welli-50 group-hover:text-welli-600 transition-colors">
                            {circle.name.charAt(0)}
                        </div>
                        {circle.active && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{circle.name}</h4>
                    <p className="text-xs text-slate-500">{circle.members} Members</p>
                    <button className="mt-3 text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-full w-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Join Circle
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
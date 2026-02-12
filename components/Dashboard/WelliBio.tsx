import React from 'react';
import { Icons } from '../layout/Icons';

export const WelliBioComponent: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">WelliBio™ Labs</h2>
           <p className="text-slate-500 text-sm">AI-Powered Diagnostics & Zonal Labs.</p>
        </div>
        <button className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-2">
          <Icons.FlaskConical className="w-4 h-4" /> Book Home Collection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Test Status */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Icons.Activity className="w-5 h-5 text-rose-500" /> Current Samples
          </h3>
          <div className="space-y-4">
            <div className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold text-xs">
                   BIO
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900">Full Blood Count (FBC)</h4>
                   <p className="text-xs text-slate-500">Sample ID: #WB-9283 • Collected: Oct 25, 9:00 AM</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Processing</span>
                    <span className="text-[10px] text-slate-400">Est. 4 hours</span>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
               </div>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50 transition-colors opacity-75">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                   RAD
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900">Chest X-Ray Analysis</h4>
                   <p className="text-xs text-slate-500">Sample ID: #WB-9211 • Oct 24</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed</span>
                    <button className="text-[10px] font-bold underline text-slate-500 hover:text-welli-600">View Report</button>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
               </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Lab Packages */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-full blur-[50px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="font-bold mb-1 relative z-10">Preventive Care</h3>
              <p className="text-xs text-slate-400 mb-4 relative z-10">AI-driven packages tailored to your history.</p>
              
              <div className="space-y-3 relative z-10">
                 <button className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl text-left transition-colors flex items-center justify-between group">
                    <div>
                      <div className="text-sm font-bold text-white">Malaria + Typhoid</div>
                      <div className="text-[10px] text-slate-400">Common seasonal check</div>
                    </div>
                    <Icons.ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                 </button>
                 <button className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl text-left transition-colors flex items-center justify-between group">
                    <div>
                      <div className="text-sm font-bold text-white">Diabetes Screen</div>
                      <div className="text-[10px] text-slate-400">HbA1c + Glucose</div>
                    </div>
                    <Icons.ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                 </button>
              </div>
           </div>
           
           <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100">
              <div className="flex items-start gap-3">
                 <Icons.Dna className="w-6 h-6 text-rose-600 mt-1" />
                 <div>
                    <h4 className="font-bold text-rose-900 text-sm">Did you know?</h4>
                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                       WelliBio labs use AI to detect predictive biomarkers for heart disease 3 years earlier than standard tests.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Locations */}
      <div>
         <h3 className="font-bold text-slate-900 mb-4">Nearby Zonal Labs</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
               <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all cursor-pointer">
                  <div className="h-24 bg-slate-100 rounded-xl mb-3 overflow-hidden relative">
                     <img src={`https://picsum.photos/400/200?random=${i+10}`} alt="Lab" className="w-full h-full object-cover" />
                     <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800">1.{i} km</div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">WelliBio Center - Lagos {i}</h4>
                  <p className="text-xs text-slate-500 mt-1">Mon-Sat • 8am - 6pm</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
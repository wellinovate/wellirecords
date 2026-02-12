import React from 'react';
import { Icons } from '../layout/Icons';

export const WelliTrackComponent: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">WelliTrack™ Logistics</h2>
           <p className="text-slate-500 text-sm">Real-time tracking for medicines & lab samples.</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
          <Icons.Truck className="w-4 h-4" /> Track ID
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Live Map Area (Simulated) */}
         <div className="lg:col-span-2 bg-slate-100 rounded-3xl border border-slate-200 h-96 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/3.3792,6.5244,12,0/800x600?access_token=Pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGphZCJ9')] bg-cover bg-center opacity-60 group-hover:opacity-70 transition-opacity"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border border-white/20">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-1">Live Tracking</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Courier is 12 mins away
                    </p>
                 </div>
            </div>
            
            {/* Markers (Simulated) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-12 -translate-y-8">
                <div className="w-8 h-8 bg-slate-900 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
                    <Icons.Truck className="w-4 h-4" />
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 translate-x-12 translate-y-12">
                <div className="w-8 h-8 bg-welli-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
                    <Icons.MapPin className="w-4 h-4" />
                </div>
            </div>
         </div>

         {/* Deliveries List */}
         <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="font-bold text-slate-900 mb-6">Active Deliveries</h3>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-10 before:bottom-0 before:w-0.5 before:bg-slate-100">
                
                {/* Item 1 */}
                <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-10 h-10 bg-welli-50 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10">
                        <Icons.ShoppingBag className="w-4 h-4 text-welli-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">Pharmacy Order #8821</h4>
                        <p className="text-xs text-slate-500 mb-2">Malaria Kit • 2 Items</p>
                        <div className="bg-slate-50 rounded-lg p-2 text-xs font-medium text-slate-600 border border-slate-100">
                            Out for Delivery - Rider: Musa A.
                        </div>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="relative pl-10 opacity-60">
                     <div className="absolute left-0 top-1 w-10 h-10 bg-slate-50 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10">
                        <Icons.FlaskConical className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">Lab Sample Pickup</h4>
                        <p className="text-xs text-slate-500 mb-2">Scheduled: Tomorrow, 9 AM</p>
                    </div>
                </div>
                
                <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                    View History
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};
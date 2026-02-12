import React from 'react';
import { Icons } from '../layout/Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

const heartRateData = [
  { time: '00:00', bpm: 62 },
  { time: '04:00', bpm: 58 },
  { time: '08:00', bpm: 75 },
  { time: '12:00', bpm: 82 },
  { time: '16:00', bpm: 78 },
  { time: '20:00', bpm: 70 },
  { time: '23:59', bpm: 65 },
];

const stressData = [
  { day: 'Mon', level: 30 },
  { day: 'Tue', level: 45 },
  { day: 'Wed', level: 25 },
  { day: 'Thu', level: 60 },
  { day: 'Fri', level: 40 },
  { day: 'Sat', level: 20 },
  { day: 'Sun', level: 15 },
];

export const WelliBitComponent: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">
               WelliAI Core Engine
             </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Predictive Monitoring</h2>
          <p className="text-slate-500 text-sm mt-1">Acting BEFORE you get sick. Powered by WelliBit™.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Last Sync: Just now</span>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10">
            <Icons.Activity className="w-4 h-4" /> Sync Wearable
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Score Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
           
           <h3 className="text-cyan-100 font-bold uppercase tracking-widest text-xs mb-6 relative z-10">Daily WelliScore™</h3>
           
           <div className="relative w-48 h-48 flex items-center justify-center mb-6 z-10">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold tracking-tighter">86</span>
                <span className="text-sm font-medium text-cyan-100">EXCELLENT</span>
              </div>
           </div>

           <p className="text-sm text-cyan-50 leading-relaxed max-w-xs relative z-10">
             Your biosignals are stable. Slight elevation in stress markers detected this afternoon.
           </p>
        </div>

        {/* AI Predictions */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-red-50 rounded-lg">
                 <Icons.Heart className="w-5 h-5 text-red-500" />
               </div>
               <h4 className="font-bold text-slate-900">Heart Health Prediction</h4>
             </div>
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-slate-500">Risk Level</span>
               <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">LOW</span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
               <div className="w-[15%] h-full bg-green-500 rounded-full"></div>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               <strong className="text-slate-700">AI Note:</strong> No arrhythmia patterns detected. HR variability is optimal.
             </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-orange-50 rounded-lg">
                 <Icons.Activity className="w-5 h-5 text-orange-500" />
               </div>
               <h4 className="font-bold text-slate-900">Burnout & Stress</h4>
             </div>
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-slate-500">Risk Level</span>
               <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">MODERATE</span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
               <div className="w-[45%] h-full bg-orange-400 rounded-full"></div>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               <strong className="text-slate-700">AI Note:</strong> Cortisol markers elevated. Recommended: 10min breathing exercise.
             </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-purple-50 rounded-lg">
                 <Icons.User className="w-5 h-5 text-purple-500" />
               </div>
               <h4 className="font-bold text-slate-900">Chronic Flare-Up</h4>
             </div>
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-slate-500">Prediction</span>
               <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">STABLE</span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
               <div className="w-[5%] h-full bg-green-500 rounded-full"></div>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               <strong className="text-slate-700">AI Note:</strong> No precursors for asthma or hypertension flare-ups in last 48h.
             </p>
          </div>

          {/* Card 4 - Action */}
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-inner flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2">
               <Icons.Sprout className="w-4 h-4 text-indigo-600" />
               <span className="text-xs font-bold text-indigo-700 uppercase">Recommendation</span>
             </div>
             <p className="text-sm font-bold text-indigo-900 mb-3">
               "Take a 15-minute walk to lower stress levels."
             </p>
             <button className="bg-indigo-600 text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors w-fit">
               Start Activity (+20 WelliCoin)
             </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
             <span>Heart Rate (24h)</span>
             <span className="text-xs text-slate-400 font-normal">Avg: 72 BPM</span>
           </h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={heartRateData}>
                 <defs>
                   <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                 <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Area type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorBpm)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
             <span>Stress Analysis (Weekly)</span>
             <span className="text-xs text-slate-400 font-normal">Peak: Thu</span>
           </h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stressData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                    {stressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.level > 50 ? '#f97316' : '#2dd4bf'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Icons } from '../layout/Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const vitalData = [
  { date: 'Mon', systolic: 120, diastolic: 80 },
  { date: 'Tue', systolic: 118, diastolic: 79 },
  { date: 'Wed', systolic: 122, diastolic: 82 },
  { date: 'Thu', systolic: 121, diastolic: 80 },
  { date: 'Fri', systolic: 119, diastolic: 78 },
  { date: 'Sat', systolic: 124, diastolic: 84 },
  { date: 'Sun', systolic: 120, diastolic: 81 },
];

export const RecordsComponent: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">WelliRecord™</h2>
           <p className="text-slate-500 text-sm">Portable, Sovereign Health Records on Blockchain.</p>
        </div>
        <button className="flex items-center gap-2 text-welli-700 text-sm font-bold hover:bg-welli-50 bg-white border border-welli-200 px-4 py-2 rounded-xl transition-colors">
          <Icons.ShieldCheck className="w-4 h-4" /> Data Permissions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vitals Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-welli-50 rounded-lg">
                <Icons.Activity className="w-5 h-5 text-welli-600" /> 
              </div>
              Blood Pressure
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 7 Days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Line type="monotone" dataKey="systolic" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="diastolic" stroke="#94a3b8" strokeWidth={3} dot={{r: 4, fill: '#94a3b8'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-welli-600"></div>
              <span className="text-slate-600 font-medium">Systolic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <span className="text-slate-600 font-medium">Diastolic</span>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icons.FileText className="w-5 h-5 text-blue-600" />
                </div>
                Recent Documents
             </h3>
             <button className="text-xs font-bold text-welli-600 hover:text-welli-700">View All</button>
          </div>
          
          <div className="space-y-4 flex-1">
            {[
              { title: 'WelliBio Lab Results', date: 'Oct 24, 2023', type: 'PDF', color: 'bg-red-50 text-red-600' },
              { title: 'Vaccination Certificate', date: 'Sep 12, 2023', type: 'CERT', color: 'bg-purple-50 text-purple-600' },
              { title: 'Radiology Report', date: 'Aug 05, 2023', type: 'IMG', color: 'bg-orange-50 text-orange-600' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${doc.color} rounded-xl flex items-center justify-center font-bold text-[10px]`}>
                    {doc.type}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-welli-700 transition-colors">{doc.title}</p>
                    <p className="text-xs text-slate-500">{doc.date}</p>
                  </div>
                </div>
                <Icons.ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-welli-600 transition-colors" />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm font-bold hover:border-welli-500 hover:text-welli-600 transition-all hover:bg-welli-50">
            + Upload New Record
          </button>
        </div>
      </div>
    </div>
  );
};
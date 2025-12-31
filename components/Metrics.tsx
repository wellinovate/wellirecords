import React from 'react';
import { Activity, Heart, Scale, Moon } from 'lucide-react';
import { HealthMetric } from '../types';

// Mock Data for charts
const METRICS_DATA: HealthMetric[] = [
    {
        id: 'bp',
        label: 'Blood Pressure (Sys)',
        unit: 'mmHg',
        color: '#f87171', // Red-400
        status: 'stable',
        data: [
            { date: 'Mon', value: 120 },
            { date: 'Tue', value: 118 },
            { date: 'Wed', value: 122 },
            { date: 'Thu', value: 119 },
            { date: 'Fri', value: 121 },
            { date: 'Sat', value: 118 },
            { date: 'Sun', value: 118 }
        ]
    },
    {
        id: 'hr',
        label: 'Heart Rate',
        unit: 'bpm',
        color: '#60a5fa', // Blue-400
        status: 'improving',
        data: [
            { date: 'Mon', value: 75 },
            { date: 'Tue', value: 72 },
            { date: 'Wed', value: 74 },
            { date: 'Thu', value: 70 },
            { date: 'Fri', value: 71 },
            { date: 'Sat', value: 68 },
            { date: 'Sun', value: 72 }
        ]
    },
    {
        id: 'weight',
        label: 'Weight',
        unit: 'kg',
        color: '#34d399', // Emerald-400
        status: 'stable',
        data: [
            { date: 'Mon', value: 71.0 },
            { date: 'Tue', value: 70.8 },
            { date: 'Wed', value: 70.9 },
            { date: 'Thu', value: 70.6 },
            { date: 'Fri', value: 70.5 },
            { date: 'Sat', value: 70.4 },
            { date: 'Sun', value: 70.5 }
        ]
    }
];

const SimpleLineChart: React.FC<{ data: { value: number }[], color: string, height?: number }> = ({ data, color, height = 100 }) => {
    const min = Math.min(...data.map(d => d.value)) * 0.95;
    const max = Math.max(...data.map(d => d.value)) * 1.05;
    const range = max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-sm"
            />
            {data.map((d, i) => {
                 const x = (i / (data.length - 1)) * 100;
                 const y = 100 - ((d.value - min) / range) * 100;
                 return (
                     <circle key={i} cx={x} cy={y} r="1.5" fill="#0f172a" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                 )
            })}
        </svg>
    );
};

export const Metrics: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
       <div className="flex items-center justify-between">
           <div>
               <h2 className="text-2xl font-bold text-slate-100">Health Metrics</h2>
               <p className="text-slate-500">Track your vital signs and progress over time.</p>
           </div>
           <button className="bg-slate-900 border border-slate-800 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-slate-200">
               Last 7 Days
           </button>
       </div>

       <div className="grid md:grid-cols-2 gap-6">
           {METRICS_DATA.map((metric) => (
               <div key={metric.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md hover:border-slate-700 transition-all">
                   <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-slate-950/50" style={{ color: metric.color }}>
                               {metric.id === 'bp' && <Heart size={20} />}
                               {metric.id === 'hr' && <Activity size={20} />}
                               {metric.id === 'weight' && <Scale size={20} />}
                           </div>
                           <div>
                               <h3 className="font-bold text-slate-200">{metric.label}</h3>
                               <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{metric.status}</p>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-2xl font-bold text-slate-100">
                               {metric.data[metric.data.length - 1].value}
                               <span className="text-sm font-normal text-slate-500 ml-1">{metric.unit}</span>
                           </div>
                       </div>
                   </div>
                   
                   <div className="h-32 w-full">
                        <SimpleLineChart data={metric.data} color={metric.color} />
                   </div>

                   <div className="flex justify-between mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 font-medium uppercase">
                       {metric.data.map((d, i) => (
                           <span key={i}>{d.date}</span>
                       ))}
                   </div>
               </div>
           ))}
           
           {/* Sleep Card Placeholder */}
           <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden border border-slate-800">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-white/10">
                            <Moon size={20} />
                        </div>
                        <h3 className="font-bold text-indigo-100">Sleep Quality</h3>
                    </div>
                    <div className="text-4xl font-bold mb-1">7.2 <span className="text-lg font-normal opacity-70">hrs</span></div>
                    <p className="text-indigo-300 text-sm">Average this week</p>
                </div>
                
                <div className="relative z-10 mt-6">
                     <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                         <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                     </div>
                     <p className="text-xs text-indigo-300 text-right">85% Goal Reached</p>
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Moon size={120} />
                </div>
           </div>
       </div>
    </div>
  );
};
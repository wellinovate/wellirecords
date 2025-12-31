import React, { useState } from 'react';
import { MOCK_RECORDS } from '../constants';
import { 
  Calendar, Activity, Pill, FileText, Stethoscope, 
  ChevronDown, ChevronUp, AlertCircle, TrendingUp, 
  TrendingDown, Minus, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';

// --- Types & Helpers for Enhanced UI ---

type Urgency = 'critical' | 'attention' | 'routine' | 'stable';

interface EnrichedRecord {
  id: string;
  original: typeof MOCK_RECORDS[0];
  urgency: Urgency;
  trend?: number[]; // Mock data for sparklines
  metricLabel?: string;
  metricValue?: string;
  metricUnit?: string;
}

// Enrich mock data to demonstrate the UI capabilities since raw mock data is simple
const ENRICHED_RECORDS: EnrichedRecord[] = MOCK_RECORDS.map((rec) => {
  let urgency: Urgency = 'routine';
  let trend: number[] | undefined = undefined;
  let metricLabel: string | undefined = undefined;
  let metricValue: string | undefined = undefined;
  let metricUnit: string | undefined = undefined;

  // Simulate intelligence logic
  if (rec.type === 'Lab Result') {
    urgency = 'attention';
    trend = [95, 98, 97, 102, 105, 101, 99]; // Mock Glucose trend
    metricLabel = 'Glucose';
    metricValue = '105';
    metricUnit = 'mg/dL';
  } else if (rec.type === 'Prescription') {
    urgency = 'routine';
  } else if (rec.type === 'Imaging') {
    urgency = 'stable';
  } else if (rec.title.includes('Annual')) {
    urgency = 'routine';
  }

  return {
    id: rec.id,
    original: rec,
    urgency,
    trend,
    metricLabel,
    metricValue,
    metricUnit
  };
}).sort((a, b) => new Date(b.original.date).getTime() - new Date(a.original.date).getTime());


// --- Micro-Components ---

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-12 w-24">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End Dot */}
        <circle 
            cx="100" 
            cy={100 - ((data[data.length-1] - min) / range) * 100} 
            r="4" 
            fill={color} 
        />
      </svg>
    </div>
  );
};

export const Timeline: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getUrgencyStyles = (urgency: Urgency) => {
    switch (urgency) {
      case 'critical':
        return {
          border: 'border-red-500',
          bg: 'bg-red-950/30',
          iconBg: 'bg-red-500',
          text: 'text-red-400',
          icon: AlertCircle
        };
      case 'attention':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/20',
          iconBg: 'bg-amber-600',
          text: 'text-amber-400',
          icon: AlertTriangle
        };
      case 'stable':
        return {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/20',
          iconBg: 'bg-emerald-600',
          text: 'text-emerald-400',
          icon: CheckCircle2
        };
      case 'routine':
      default:
        return {
          border: 'border-slate-700',
          bg: 'bg-slate-900',
          iconBg: 'bg-blue-600',
          text: 'text-blue-400',
          icon: FileText
        };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Lab Result': return Activity;
      case 'Prescription': return Pill;
      case 'Imaging': return FileText;
      default: return Stethoscope;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-10 px-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-blue-500" />
            Clinical Timeline
          </h2>
          <p className="text-slate-500 mt-1">
            Chronological analysis of your health events, trends, and outcomes.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-medium">
             <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
             </div>
             <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Attention
             </div>
             <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Stable
             </div>
        </div>
      </div>

      <div className="relative pl-6 md:pl-8">
        {/* Timeline Track */}
        <div className="absolute left-[27px] md:left-[35px] top-4 bottom-0 w-0.5 bg-slate-800"></div>

        {ENRICHED_RECORDS.map((item, index) => {
          const styles = getUrgencyStyles(item.urgency);
          const RecordIcon = getIcon(item.original.type);
          const isExpanded = expandedId === item.id;
          
          // Date Formatting
          const dateObj = new Date(item.original.date);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
          const year = dateObj.getFullYear();
          
          // Determine if we need a year/month break visually (simplified for this demo)
          const showYear = index === 0 || new Date(ENRICHED_RECORDS[index-1].original.date).getFullYear() !== year;

          return (
            <div key={item.id} className="relative mb-8 last:mb-0 group">
              
              {/* Year Marker (if needed) */}
              {showYear && (
                 <div className="absolute -left-6 md:-left-8 -top-8 bg-slate-950 px-2 py-1 text-xs font-bold text-slate-500 font-mono border border-slate-800 rounded">
                    {year}
                 </div>
              )}

              <div className="flex gap-6">
                 {/* Left Column: Date & Time Visuals */}
                 <div className="flex flex-col items-center shrink-0 w-14 pt-1 z-10 bg-slate-950">
                    <div className="font-bold text-slate-300 text-lg leading-none">{day}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase">{month}</div>
                 </div>

                 {/* Timeline Node */}
                 <div className={`absolute left-[20px] md:left-[28px] top-4 w-4 h-4 rounded-full border-4 border-slate-950 shadow-sm z-20 ${styles.iconBg} transition-transform group-hover:scale-125`}></div>

                 {/* Main Content Card */}
                 <div 
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className={`flex-1 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${styles.border} ${styles.bg} hover:border-opacity-100 hover:shadow-lg hover:bg-opacity-50 relative`}
                 >
                    {/* Status Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.iconBg}`}></div>

                    <div className="p-4 md:p-5">
                       {/* Header Row */}
                       <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                             <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-800/50 ${styles.text}`}>
                                <RecordIcon size={20} />
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                   <h3 className={`font-bold text-base md:text-lg text-slate-100 ${item.urgency === 'critical' ? 'text-red-100' : ''}`}>
                                      {item.original.title}
                                   </h3>
                                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-700/50 px-1.5 rounded">
                                      {item.original.type}
                                   </span>
                                </div>
                                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                                   <Stethoscope size={12} /> {item.original.provider}
                                </p>
                             </div>
                          </div>
                          
                          {/* Right Side Metrics (Sparkline or Status) */}
                          <div className="flex items-center gap-4">
                             {item.trend && item.metricValue ? (
                                <div className="hidden sm:flex items-center gap-3 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                                   <div>
                                      <div className="text-[10px] text-slate-500 uppercase font-bold">{item.metricLabel}</div>
                                      <div className={`text-lg font-bold leading-none ${styles.text}`}>
                                         {item.metricValue} <span className="text-xs font-normal text-slate-500">{item.metricUnit}</span>
                                      </div>
                                   </div>
                                   <Sparkline data={item.trend} color={item.urgency === 'attention' ? '#fbbf24' : '#10b981'} />
                                </div>
                             ) : (
                                <div className={`hidden sm:flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles.text} border-current opacity-70`}>
                                   {item.urgency}
                                </div>
                             )}
                             <div className="text-slate-500">
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                             </div>
                          </div>
                       </div>

                       {/* Expanded Content (Progressive Disclosure) */}
                       {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-700/30 animate-in slide-in-from-top-2">
                             <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-3">
                                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Summary</h4>
                                   <p className="text-sm text-slate-300 leading-relaxed">
                                      {item.original.summary}
                                   </p>
                                   
                                   <div className="flex gap-2 mt-4">
                                      <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-medium transition-colors border border-slate-700">
                                         View Full Report
                                      </button>
                                      {item.trend && (
                                         <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-medium transition-colors border border-slate-700">
                                            Analyze Trend
                                         </button>
                                      )}
                                   </div>
                                </div>
                                
                                <div className="space-y-3">
                                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metadata</h4>
                                   <div className="space-y-2">
                                      <div className="flex justify-between text-xs">
                                         <span className="text-slate-500">Status</span>
                                         <span className="text-emerald-400 flex items-center gap-1 font-medium"><CheckCircle2 size={10} /> Verified</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                         <span className="text-slate-500">Record ID</span>
                                         <span className="text-slate-300 font-mono">{item.id}</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                         <span className="text-slate-500">Source</span>
                                         <span className="text-slate-300">HIE Direct</span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* End of Timeline */}
      <div className="relative pl-8 mt-4">
         <div className="absolute left-[35px] top-0 h-12 w-0.5 bg-gradient-to-b from-slate-800 to-transparent"></div>
         <div className="flex items-center gap-3 text-slate-600 pt-4 pl-14">
             <Clock size={16} />
             <span className="text-sm italic">Account created April 2024</span>
         </div>
      </div>

    </div>
  );
};
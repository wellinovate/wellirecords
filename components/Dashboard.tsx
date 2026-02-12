import React, { useEffect, useState } from 'react';
import { VITALS, MOCK_RECORDS } from '../constants';
import { 
  Activity, ArrowUp, ArrowDown, Minus, Clock, FileText, UploadCloud, 
  Shield, ChevronRight, Zap, CreditCard, ScanLine, Sparkles, 
  BrainCircuit, Lock, Crown, X, Calendar, CheckSquare, Flame,
  TrendingUp, Pill, Stethoscope, Microscope
} from 'lucide-react';
import { AppView } from '../types';
import { predictHealthTrends } from '../services/geminiService';
import { useFetchUser } from '@/hooks/useFetchUser';

interface Props {
  onChangeView: (view: AppView) => void;
  isPremium: boolean;
  onUpgrade: () => void;
  daysRemaining?: number;
}

// --- Micro-Components ---

const Sparkline = ({ data, color, rising }: { data: number[]; color: string; rising: boolean }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 100;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-10 w-24 opacity-80">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path 
            d={`M0,${height} ${points} V${height} Z`} 
            fill={`url(#gradient-${color})`} 
            stroke="none" 
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={width} cy={height - ((data[data.length-1] - min) / range) * height} r="2" fill={color} />
      </svg>
    </div>
  );
};

const QuickStat = ({ icon: Icon, label, value, subtext, color }: any) => (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon size={18} className={color.replace('bg-', 'text-')} />
        </div>
        <div>
            <div className="text-sm font-bold text-slate-200">{value}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{label}</div>
        </div>
    </div>
);

// --- Main Component ---

export const Dashboard: React.FC<Props> = ({ onChangeView, isPremium, onUpgrade, daysRemaining }) => {
    const { user, loading, error, refetch } = useFetchUser();
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [showTrialBanner, setShowTrialBanner] = useState(true);

  // Mock data for sparklines to make vitals look alive
  const MOCK_HISTORY: Record<string, number[]> = {
    'Heart Rate': [68, 70, 72, 75, 71, 72, 72],
    'Blood Pressure': [115, 116, 118, 120, 119, 118, 118],
    'Weight': [71, 70.8, 70.9, 70.6, 70.5, 70.4, 70.5],
    'Sleep Avg': [6.5, 6.8, 7.0, 7.2, 7.5, 7.1, 7.2]
  };

  useEffect(() => {
    if (isPremium) {
        const fetchPrediction = async () => {
            const vitalsSummary = VITALS.map(v => `${v.label}: ${v.value} ${v.unit} (${v.trend})`).join(', ');
            const result = await predictHealthTrends(vitalsSummary);
            setPrediction(result);
            setLoadingPrediction(false);
        };
        fetchPrediction();
    }
  }, [isPremium]);

  const PremiumLockOverlay = () => (
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-slate-800/50">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg mb-2 shadow-lg">
              <Lock size={16} className="text-white" />
          </div>
          <p className="text-xs text-slate-300 font-medium mb-3">Premium Feature</p>
          <button 
            onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
            className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[10px] font-bold transition-all hover:scale-105 shadow-md flex items-center gap-1.5"
          >
              <Crown size={10} fill="currentColor" className="text-amber-500" /> Unlock
          </button>
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Trial Banner (Slimmer) */}
      {showTrialBanner && (
        <div className={`relative overflow-hidden rounded-xl p-0.5 ${isPremium ? 'bg-gradient-to-r from-blue-500/50 to-purple-500/50' : 'bg-red-500/30'}`}>
            <div className="bg-slate-950 rounded-[10px] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isPremium ? <Crown size={16} className="text-amber-400" fill="currentColor" /> : <Lock size={16} className="text-red-400" />}
                    <span className="text-xs font-medium text-slate-300">
                        {isPremium 
                            ? `Full Access Active (${daysRemaining} days left in trial)` 
                            : "Your trial has ended. View-only mode active."}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onUpgrade} className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline">
                        {isPremium ? "Extend Plan" : "Restore Access"}
                    </button>
                    <button onClick={() => setShowTrialBanner(false)} className="text-slate-600 hover:text-slate-400">
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 2. Header & Quick Stats */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div>
              <h1 className="text-2xl font-bold text-slate-100">Good Morning, {user?.name}</h1>
              <p className="text-slate-500 text-sm">You're on a 12-day data streak! Keep it up.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <QuickStat icon={Flame} value="12 Days" label="Streak" color="bg-amber-500" />
              <QuickStat icon={Calendar} value="May 24" label="Check-up" color="bg-blue-500" />
              <QuickStat icon={CheckSquare} value="2 Pending" label="Actions" color="bg-emerald-500" />
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          
          {/* 3. Vitals & Analytics Column (Left, 2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Compact Vitals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VITALS.map((vital, idx) => {
                      const trendData = MOCK_HISTORY[vital.label] || [0,0,0,0,0,0,0];
                      const isPositive = vital.trend === 'up' || vital.trend === 'stable';
                      const color = isPositive ? '#10b981' : '#f59e0b'; // Emerald or Amber

                      return (
                        <div key={idx} className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-700 transition-colors">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{vital.label}</span>
                                    {vital.trend === 'up' && <ArrowUp size={12} className="text-rose-400" />}
                                    {vital.trend === 'down' && <ArrowDown size={12} className="text-emerald-400" />}
                                    {vital.trend === 'stable' && <Minus size={12} className="text-slate-600" />}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-100">{vital.value}</span>
                                    <span className="text-xs text-slate-500 font-medium">{vital.unit}</span>
                                </div>
                            </div>
                            <Sparkline data={trendData} color={color} rising={isPositive} />
                        </div>
                      );
                  })}
              </div>

              {/* AI Insights (Redesigned) */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-900 rounded-2xl border border-indigo-500/30 overflow-hidden relative group">
                  {!isPremium && <PremiumLockOverlay />}
                  
                  {/* Subtle Background Mesh */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

                  <div className={`p-6 relative z-10 flex flex-col md:flex-row gap-6 ${!isPremium ? 'opacity-30 blur-[1px]' : ''}`}>
                      <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-2">
                              <Sparkles size={16} className="text-indigo-400" />
                              <h3 className="font-bold text-indigo-100 text-sm uppercase tracking-wide">Weekly Health Insight</h3>
                          </div>
                          
                          {loadingPrediction ? (
                              <div className="h-16 flex items-center gap-3 text-slate-500 text-sm">
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                                  Processing vitals...
                              </div>
                          ) : (
                              <div>
                                  <p className="text-slate-200 text-sm leading-relaxed font-medium mb-3">
                                      {prediction ? prediction.split('.')[0] + '.' : "Your metabolic recovery is trending positively this week."}
                                  </p>
                                  <div className="flex items-start gap-2 bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
                                      <TrendingUp size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                      <div className="text-xs text-indigo-200">
                                          <span className="font-bold block text-indigo-100 mb-0.5">Recommendation:</span>
                                          {prediction ? "Consider maintaining current sleep schedule." : "Consider increasing hydration by 500ml daily based on your sodium intake."}
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      {/* Visual Context */}
                      <div className="md:w-1/3 bg-slate-950/50 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center text-center">
                          <div className="relative w-20 h-20 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90">
                                  <circle cx="40" cy="40" r="36" fill="none" stroke="#1e293b" strokeWidth="6" />
                                  <circle cx="40" cy="40" r="36" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray="226" strokeDashoffset="45" strokeLinecap="round" />
                              </svg>
                              <div className="absolute flex flex-col items-center">
                                  <span className="text-xl font-bold text-white">82</span>
                                  <span className="text-[9px] text-slate-500 uppercase">Score</span>
                              </div>
                          </div>
                          <div className="text-xs font-medium text-slate-400 mt-2">Recovery Index</div>
                      </div>
                  </div>
              </div>

              {/* Consistent Action Grid */}
              <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Quick Actions</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                          { id: AppView.UPLOAD, icon: UploadCloud, label: 'Upload', sub: 'Scan Docs', color: 'text-blue-400', locked: false },
                          { id: AppView.LIVE_ASSISTANT, icon: Zap, label: 'Welli Voice', sub: 'AI Assistant', color: 'text-amber-400', locked: !isPremium },
                          { id: AppView.INTEGRATION, icon: CreditCard, label: 'WelliCard', sub: 'Insurance ID', color: 'text-purple-400', locked: !isPremium },
                          { id: AppView.PORTABILITY, icon: Shield, label: 'Share Data', sub: 'Portability', color: 'text-emerald-400', locked: !isPremium },
                      ].map((action, i) => (
                          <div 
                              key={i}
                              onClick={() => onChangeView(action.id)}
                              className="group relative bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-1 overflow-hidden"
                          >
                              {action.locked && <PremiumLockOverlay />}
                              <div className={`p-3 rounded-lg bg-slate-950 w-fit mb-3 group-hover:bg-slate-800 transition-colors ${action.color}`}>
                                  <action.icon size={20} />
                              </div>
                              <div className={`transition-opacity ${action.locked ? 'opacity-30' : 'opacity-100'}`}>
                                  <div className="font-bold text-slate-200 text-sm">{action.label}</div>
                                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{action.sub}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* 4. Timeline Column (Right, 1/3 width) */}
          <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 h-full flex flex-col">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/30 rounded-t-2xl">
                      <h3 className="font-bold text-slate-200 flex items-center gap-2">
                          <Activity size={18} className="text-slate-500" /> Recent Activity
                      </h3>
                      <button onClick={() => onChangeView(AppView.TIMELINE)} className="text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline">
                          View All
                      </button>
                  </div>
                  
                  <div className="flex-1 p-5 space-y-0">
                      {MOCK_RECORDS.slice(0, 5).map((rec, i) => {
                          // Icon Logic
                          let Icon = FileText;
                          let iconColor = "text-slate-400";
                          let bg = "bg-slate-800";
                          
                          if (rec.type === 'Lab Result') { Icon = Microscope; iconColor = "text-blue-400"; bg = "bg-blue-900/20"; }
                          else if (rec.type === 'Prescription') { Icon = Pill; iconColor = "text-emerald-400"; bg = "bg-emerald-900/20"; }
                          else if (rec.type === 'Clinical Note') { Icon = Stethoscope; iconColor = "text-amber-400"; bg = "bg-amber-900/20"; }

                          return (
                              <div key={rec.id} className="relative pb-6 pl-4 last:pb-0 border-l border-slate-800 ml-2 group">
                                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-slate-900 ${bg} ${iconColor} flex items-center justify-center`}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1 cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg -mt-2 transition-colors">
                                      <div className="flex justify-between items-start">
                                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{rec.date}</span>
                                          <Icon size={12} className={iconColor} />
                                      </div>
                                      <h4 className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">{rec.title}</h4>
                                      <p className="text-xs text-slate-500 line-clamp-1">{rec.provider}</p>
                                  </div>
                              </div>
                          );
                      })}
                      
                      <button 
                        onClick={() => onChangeView(AppView.TIMELINE)}
                        className="w-full mt-4 py-2 border border-dashed border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all"
                      >
                          + View older records
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Activity, 
  Calendar, 
  MapPin, 
  Download, 
  Filter, 
  BrainCircuit, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Siren,
  Megaphone,
  Truck,
  CheckCircle2,
  Stethoscope,
  ClipboardList,
  ChevronRight,
  Target,
  Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';

// Mock Data for Care Delivery Trends (Time Series)
const careDeliveryData = [
  { day: 'Mon', inPerson: 42, telehealth: 15, total: 57 },
  { day: 'Tue', inPerson: 38, telehealth: 22, total: 60 },
  { day: 'Wed', inPerson: 35, telehealth: 28, total: 63 },
  { day: 'Thu', inPerson: 30, telehealth: 35, total: 65 },
  { day: 'Fri', inPerson: 28, telehealth: 42, total: 70 },
  { day: 'Sat', inPerson: 20, telehealth: 45, total: 65 },
  { day: 'Sun', inPerson: 15, telehealth: 40, total: 55 },
];

// Mock Data for Heatmap
const diseaseHeatmap = [
    { region: 'Lagos Coastal', malaria: 85, cholera: 12, respiratory: 92, diabetes: 45 },
    { region: 'Abuja Central', malaria: 45, cholera: 5, respiratory: 30, diabetes: 60 },
    { region: 'Kano North', malaria: 60, cholera: 78, respiratory: 40, diabetes: 35 },
    { region: 'Port Harcourt', malaria: 70, cholera: 15, respiratory: 25, diabetes: 50 },
    { region: 'Enugu East', malaria: 30, cholera: 8, respiratory: 20, diabetes: 55 },
];

// Mock Data for Risk Cohorts
const riskCohorts = [
    { name: 'Uncontrolled Hypertension', count: 1240, trend: '+5%', risk: 'high', impact: 'Stroke Risk' },
    { name: 'Diabetic Non-Compliance', count: 850, trend: '-2%', risk: 'high', impact: 'Neuropathy' },
    { name: 'Prenatal High Risk', count: 320, trend: '+12%', risk: 'medium', impact: 'Maternal Health' },
    { name: 'Post-Op Infection Risk', count: 45, trend: '0%', risk: 'low', impact: 'Readmission' },
];

const AnalyticsModule: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [diseaseFilter, setDiseaseFilter] = useState('All Conditions');

  // Helper for Heatmap Color
  const getHeatmapColor = (value: number) => {
      if (value >= 80) return 'bg-red-500 text-white font-bold';
      if (value >= 50) return 'bg-amber-400 text-amber-950 font-semibold';
      if (value >= 20) return 'bg-yellow-200 text-yellow-900';
      return 'bg-emerald-100 text-emerald-800';
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP CONTROLS & HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            Population Health Intelligence
          </h2>
          <p className="text-slate-500 mt-1">Epidemiological surveillance and resource allocation dashboard.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
           <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                  <option>All Regions</option>
                  <option>West Africa (Coastal)</option>
                  <option>West Africa (Inland)</option>
                  <option>North America</option>
              </select>
           </div>
           
           <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select 
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                  <option>All Conditions</option>
                  <option>Infectious Diseases</option>
                  <option>Chronic Conditions</option>
                  <option>Maternal Health</option>
              </select>
           </div>

           <div className="h-full w-px bg-slate-200 mx-1"></div>

           <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last Quarter</option>
              </select>
           </div>
        </div>
      </div>

      {/* 2. HERO: CRITICAL AI ALERT */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Siren className="w-40 h-40 text-red-900" />
          </div>
          
          <div className="flex items-start gap-5 relative z-10">
              <div className="p-4 bg-red-100 text-red-600 rounded-full border-4 border-white shadow-sm animate-pulse">
                  <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-red-900">CRITICAL ANOMALY DETECTED</h3>
                      <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-bold uppercase rounded border border-red-300">New Outbreak</span>
                  </div>
                  <p className="text-red-800 text-sm font-medium leading-relaxed max-w-2xl">
                      AI analysis indicates a <span className="font-bold underline">92% probability</span> of a viral respiratory outbreak in the <span className="font-bold">Lagos Coastal Region</span>. 
                      Case reports are <span className="font-bold">+15% vs Seasonal Baseline</span> over the last 48 hours.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs font-bold text-red-700/70 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 5 Clinics Affected</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> ~450 At-Risk Patients</span>
                  </div>
              </div>
          </div>

          <div className="flex gap-3 relative z-10">
              <button className="px-5 py-3 bg-white text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm">
                  <Megaphone className="w-4 h-4" /> Broadcast Alert
              </button>
              <button className="px-5 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md shadow-red-200">
                  <Truck className="w-4 h-4" /> Deploy Resources
              </button>
          </div>
      </div>

      {/* 3. CONTEXTUAL KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
              label="Total Patients Managed" 
              value="2.4M" 
              trend="+12%" 
              context="vs Q3 Baseline"
              status="positive"
              icon={Users} 
              color="blue" 
          />
          <KPICard 
              label="Telehealth Adoption" 
              value="34%" 
              trend="+5%" 
              context="Above Target"
              status="positive"
              icon={TrendingUp} 
              color="purple" 
          />
          <KPICard 
              label="Avg. Recovery Time" 
              value="4.2 Days" 
              trend="-0.5d" 
              context="vs Benchmark"
              status="positive"
              icon={Clock} 
              color="green" 
          />
          <KPICard 
              label="System Load" 
              value="88%" 
              trend="+14%" 
              context="High Utilization"
              status="negative"
              icon={Activity} 
              color="amber" 
          />
      </div>

      {/* 4. MAIN VISUALIZATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: DISEASE HEATMAP (2/3) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-slate-900 text-lg">Regional Disease Hotspots</h3>
                      <p className="text-xs text-slate-500 mt-1">Prevalence per 10,000 population • Real-time Sync</p>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                          <span className="w-3 h-3 bg-emerald-100 rounded-sm"></span> Low
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                          <span className="w-3 h-3 bg-amber-400 rounded-sm"></span> Med
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                          <span className="w-3 h-3 bg-red-500 rounded-sm"></span> High
                      </div>
                  </div>
              </div>
              
              <div className="p-6 overflow-x-auto">
                  <table className="w-full text-sm">
                      <thead>
                          <tr>
                              <th className="text-left font-bold text-slate-500 uppercase text-xs pb-4 w-1/4">Region</th>
                              <th className="text-center font-bold text-slate-500 uppercase text-xs pb-4">Malaria</th>
                              <th className="text-center font-bold text-slate-500 uppercase text-xs pb-4">Cholera</th>
                              <th className="text-center font-bold text-slate-500 uppercase text-xs pb-4">Respiratory</th>
                              <th className="text-center font-bold text-slate-500 uppercase text-xs pb-4">Diabetes</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {diseaseHeatmap.map((row, i) => (
                              <tr key={i} className="group">
                                  <td className="py-3 font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{row.region}</td>
                                  <td className="py-2 px-2"><div className={`w-full py-2 rounded text-center text-xs ${getHeatmapColor(row.malaria)}`}>{row.malaria}</div></td>
                                  <td className="py-2 px-2"><div className={`w-full py-2 rounded text-center text-xs ${getHeatmapColor(row.cholera)}`}>{row.cholera}</div></td>
                                  <td className="py-2 px-2"><div className={`w-full py-2 rounded text-center text-xs ${getHeatmapColor(row.respiratory)}`}>{row.respiratory}</div></td>
                                  <td className="py-2 px-2"><div className={`w-full py-2 rounded text-center text-xs ${getHeatmapColor(row.diabetes)}`}>{row.diabetes}</div></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* RIGHT: HIGH RISK COHORTS (1/3) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg">High-Risk Cohorts</h3>
                  <p className="text-xs text-slate-500 mt-1">Patient segments requiring intervention.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-50">
                          {riskCohorts.map((cohort, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                  <td className="p-4">
                                      <div className="flex justify-between items-start mb-1">
                                          <div className="font-bold text-slate-800 text-sm group-hover:text-teal-600">{cohort.name}</div>
                                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                              cohort.risk === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                                              cohort.risk === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                              'bg-slate-50 text-slate-600 border-slate-200'
                                          }`}>{cohort.risk}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                                          <span>Impact: {cohort.impact}</span>
                                          <span className={cohort.trend.includes('+') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                              {cohort.trend} vs LM
                                          </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div className="h-full bg-slate-400 rounded-full" style={{ width: '65%' }}></div>
                                          </div>
                                          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                                              Enroll ({cohort.count})
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                  <button className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
                      View All Segments
                  </button>
              </div>
          </div>
      </div>

      {/* 5. SECONDARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CARE DELIVERY TRENDS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="font-bold text-slate-900 text-lg">Care Delivery Shift</h3>
                      <p className="text-xs text-slate-500 mt-1">In-Person vs. Telehealth Volume (7 Days)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1 text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span> In-Person
                      </div>
                      <div className="flex items-center gap-1 text-teal-600">
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span> Telehealth
                      </div>
                  </div>
              </div>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={careDeliveryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Line type="monotone" dataKey="inPerson" stroke="#94a3b8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="telehealth" stroke="#0d9488" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* INTERVENTION QUEUE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-teal-600" />
                      Intervention Queue
                  </h3>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200">
                      15 Actions Pending
                  </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-red-200 hover:shadow-sm transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                              <Target className="w-5 h-5" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 text-sm">Missed Critical Follow-ups</div>
                              <div className="text-xs text-slate-500">Hypertension Cohort • Region A</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="text-right">
                              <div className="font-bold text-slate-900">24</div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Patients</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                      </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-amber-200 hover:shadow-sm transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                              <Activity className="w-5 h-5" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 text-sm">Abnormal Lab Results</div>
                              <div className="text-xs text-slate-500">Unacknowledged (24h)</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="text-right">
                              <div className="font-bold text-slate-900">8</div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Results</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                      </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                              <Truck className="w-5 h-5" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 text-sm">Medication Adherence</div>
                              <div className="text-xs text-slate-500">Refill Overdue (7+ Days)</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="text-right">
                              <div className="font-bold text-slate-900">56</div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Patients</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

// Reusable KPI Card Component
const KPICard = ({ label, value, trend, context, status, icon: Icon, color }: any) => {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    const isPositive = status === 'positive';

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-slate-600">{label}</span>
                    <span className="text-xs text-slate-400 font-medium border-l border-slate-300 pl-1.5">{context}</span>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsModule;

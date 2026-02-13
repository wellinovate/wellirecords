
import React, { useState } from 'react';
import { SystemNode, Metric, ActivityLog, Language } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  FileText, 
  Shield, 
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Activity,
  Server,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  Terminal,
  AlertCircle,
  Check,
  XCircle,
  Plus,
  X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock Data for Throughput
const throughputData = [
  { name: '00:00', value: 400 },
  { name: '04:00', value: 300 },
  { name: '08:00', value: 550 },
  { name: '12:00', value: 800 },
  { name: '16:00', value: 700 },
  { name: '20:00', value: 900 },
  { name: '24:00', value: 600 },
];

// Helper to generate mock sparkline data
const generateSparkline = (base: number, volatility: number) => 
  Array.from({ length: 15 }, (_, i) => ({ i, value: base + Math.random() * volatility - (volatility/2) }));

interface DashboardProps {
  language: Language;
}

// Enhanced System Node Type for Dashboard
interface DashboardSystemNode extends SystemNode {
  latencyHistory: { i: number; value: number }[];
  errorMessage?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSystem, setNewSystem] = useState({
    name: '',
    type: 'clinic' as SystemNode['type'],
    region: 'NA'
  });

  // Expanded Mock Data with Operational Details
  const [systems, setSystems] = useState<DashboardSystemNode[]>([
    { 
      id: '1', name: 'Metro General Clinic', type: 'clinic', status: 'connected', 
      lastSync: 'Just now', healthScore: 99, region: 'NA', latency: 45,
      latencyHistory: generateSparkline(45, 10) 
    },
    { 
      id: '2', name: 'BioCore Labs', type: 'lab', status: 'syncing', 
      lastSync: 'Syncing...', healthScore: 92, region: 'EU', latency: 120,
      latencyHistory: generateSparkline(120, 30)
    },
    { 
      id: '4', name: 'TeleHealth Connect', type: 'telemedicine', status: 'error', 
      lastSync: '4h ago', healthScore: 45, region: 'AP', latency: 0, errorMessage: 'Handshake Timeout',
      latencyHistory: generateSparkline(0, 0)
    },
    { 
      id: '7', name: 'Nairobi Research', type: 'lab', status: 'offline', 
      lastSync: '2d ago', healthScore: 0, region: 'AF', latency: 0, errorMessage: 'Node Unreachable',
      latencyHistory: generateSparkline(0, 0)
    },
    { 
      id: '3', name: 'GlobalID Verify', type: 'identity', status: 'connected', 
      lastSync: '1 min ago', healthScore: 100, region: 'Global', latency: 15,
      latencyHistory: generateSparkline(15, 5)
    },
    { 
      id: '5', name: 'Priestley Pharmacy', type: 'pharmacy', status: 'connected', 
      lastSync: '10 min ago', healthScore: 96, region: 'AF', latency: 180,
      latencyHistory: generateSparkline(180, 40)
    },
    { 
      id: '6', name: 'Lagos City Hospital', type: 'clinic', status: 'connected', 
      lastSync: '5 min ago', healthScore: 94, region: 'AF', latency: 165,
      latencyHistory: generateSparkline(165, 20)
    },
    { 
      id: '8', name: 'Tokyo Genetix', type: 'lab', status: 'connected', 
      lastSync: '1 min ago', healthScore: 98, region: 'AP', latency: 85,
      latencyHistory: generateSparkline(85, 15)
    },
  ]);

  const activities: ActivityLog[] = [
    { id: '1', type: 'alert', message: 'Connection lost: Nairobi Research Center', timestamp: '2 min ago', source: 'Network Monitor', status: 'error' },
    { id: '2', type: 'data_transfer', message: 'Bulk transfer from Metro General completed', timestamp: '15 min ago', source: 'Clinic Node', status: 'success' },
    { id: '3', type: 'alert', message: 'High latency detected in West Africa Region', timestamp: '1 hour ago', source: 'Latency Guard', status: 'warning' },
    { id: '4', type: 'system', message: 'Automated backup completed successfully', timestamp: '2 hours ago', source: 'System Core', status: 'success' },
  ];

  // Calculate Operational Metrics
  const attentionNeeded = systems.filter(s => s.status === 'error' || s.status === 'offline').length;
  const highLatency = systems.filter(s => s.latency > 150 && s.status === 'connected').length;
  const healthyCount = systems.filter(s => s.healthScore >= 90).length;
  const syncFailures = 2; // Mocked for demo

  const handleAddSystem = (e: React.FormEvent) => {
    e.preventDefault();
    const systemId = (systems.length + 1).toString();
    const newSystemNode: DashboardSystemNode = {
        id: systemId,
        name: newSystem.name,
        type: newSystem.type,
        region: newSystem.region,
        status: 'syncing',
        lastSync: 'Connecting...',
        healthScore: 100,
        latency: 0,
        latencyHistory: generateSparkline(0, 0),
        coordinates: { x: 50, y: 50 }, // Default coordinates
        ipAddress: '10.0.0.' + Math.floor(Math.random() * 255)
    };
    
    setSystems([newSystemNode, ...systems]);
    setIsAddModalOpen(false);
    setNewSystem({ name: '', type: 'clinic', region: 'NA' });
    
    // Simulate connection established
    setTimeout(() => {
        setSystems(prev => prev.map(s => s.id === systemId ? {
            ...s,
            status: 'connected',
            lastSync: 'Just now',
            latency: Math.floor(Math.random() * 50) + 20,
            latencyHistory: generateSparkline(40, 10)
        } : s));
    }, 2000);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
             <Activity className="w-6 h-6 text-teal-600" />
             System Operations Center
          </h2>
          <p className="text-slate-500 mt-1">Real-time infrastructure monitoring and node health status.</p>
        </div>
        <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> Generate Report
            </button>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors shadow-sm shadow-teal-200 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Connection
            </button>
        </div>
      </div>

      {/* OPERATIONAL METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OperationalMetricCard 
            label="Systems Needing Attention" 
            value={attentionNeeded} 
            status={attentionNeeded > 0 ? "critical" : "good"}
            subtext="Error or Offline State"
            icon={AlertCircle}
        />
        <OperationalMetricCard 
            label="High Latency Connections" 
            value={highLatency} 
            status={highLatency > 0 ? "warning" : "good"}
            subtext="> 150ms Response Time"
            icon={Zap}
        />
        <OperationalMetricCard 
            label="Failed Syncs (1h)" 
            value={syncFailures} 
            status={syncFailures > 0 ? "warning" : "good"}
            subtext="Retrying automatically..."
            icon={RefreshCw}
        />
        <OperationalMetricCard 
            label="Healthy Nodes" 
            value={`${healthyCount}/${systems.length}`} 
            status="good"
            subtext="Operating Normally"
            icon={Server}
        />
      </div>

      {/* HERO SECTION: CRITICAL INFRASTRUCTURE STATUS */}
      <div>
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Server className="w-5 h-5 text-slate-500" />
                  Connected Systems Status
              </h3>
              <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Healthy
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Degraded
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
                  </span>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {systems.map(sys => (
                  <DashboardSystemCard key={sys.id} system={sys} />
              ))}
          </div>
      </div>

      {/* SECONDARY INFO: THROUGHPUT & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Throughput Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-slate-900">Global Data Throughput</h3>
                        <p className="text-sm text-slate-500">Records processed per hour across all nodes.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-100">
                        <Activity className="w-3 h-3" /> Live
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={throughputData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[350px]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Live Activity Feed</h3>
                    <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    {activities.map(activity => (
                        <div key={activity.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <div className="flex gap-3">
                                <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                                    activity.status === 'success' ? 'bg-green-500' :
                                    activity.status === 'warning' ? 'bg-amber-500' :
                                    'bg-red-500'
                                }`}></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800 leading-snug">{activity.message}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-xs text-slate-500">{activity.timestamp}</span>
                                        <span className="text-xs text-slate-300">•</span>
                                        <span className="text-xs text-slate-500 font-medium">{activity.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 text-center border-t border-slate-100 bg-slate-50/30">
                    <button className="text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors uppercase tracking-wide">View Full Audit Log</button>
                </div>
            </div>
      </div>

      {/* ADD CONNECTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Add New Connection</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleAddSystem} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">System Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            placeholder="e.g. Westside Clinic"
                            value={newSystem.name}
                            onChange={(e) => setNewSystem({...newSystem, name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Node Type</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            value={newSystem.type}
                            onChange={(e) => setNewSystem({...newSystem, type: e.target.value as any})}
                        >
                            <option value="clinic">Clinic / Hospital</option>
                            <option value="lab">Laboratory</option>
                            <option value="pharmacy">Pharmacy</option>
                            <option value="telemedicine">Telemedicine Provider</option>
                            <option value="identity">Identity Provider</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Region</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            value={newSystem.region}
                            onChange={(e) => setNewSystem({...newSystem, region: e.target.value})}
                        >
                            <option value="NA">North America</option>
                            <option value="EU">Europe</option>
                            <option value="AF">Africa</option>
                            <option value="AP">Asia Pacific</option>
                            <option value="Global">Global</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
                        >
                            Connect Node
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

// --- SUB-COMPONENTS ---

const OperationalMetricCard: React.FC<{ label: string; value: number | string; status: 'good' | 'warning' | 'critical'; subtext: string; icon: any }> = ({ label, value, status, subtext, icon: Icon }) => {
    const styles = {
        good: 'bg-white border-slate-200 text-slate-900',
        warning: 'bg-amber-50 border-amber-200 text-amber-900',
        critical: 'bg-red-50 border-red-200 text-red-900'
    };
    
    const iconColors = {
        good: 'bg-green-100 text-green-600',
        warning: 'bg-amber-100 text-amber-600',
        critical: 'bg-red-100 text-red-600'
    };

    return (
        <div className={`p-5 rounded-xl border shadow-sm flex items-start justify-between ${styles[status]}`}>
            <div>
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="font-bold text-sm opacity-90">{label}</div>
                <div className="text-xs opacity-70 mt-1">{subtext}</div>
            </div>
            <div className={`p-3 rounded-lg ${iconColors[status]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
};

const DashboardSystemCard: React.FC<{ system: DashboardSystemNode }> = ({ system }) => {
    const isCritical = system.status === 'error' || system.status === 'offline';
    const isWarning = system.status === 'syncing' || (system.status === 'connected' && system.healthScore < 95);

    return (
        <div className={`bg-white rounded-xl shadow-sm border transition-all flex flex-col h-full ${
            isCritical ? 'border-red-300 ring-4 ring-red-50' : 
            isWarning ? 'border-amber-300' : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
        }`}>
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-start ${isCritical ? 'bg-red-50/50 border-red-100' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                        isCritical ? 'bg-red-100 text-red-600' : 
                        isWarning ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                        {system.type === 'clinic' ? <Activity className="w-4 h-4" /> : 
                         system.type === 'lab' ? <Server className="w-4 h-4" /> :
                         <Globe className="w-4 h-4" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">{system.name}</h4>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{system.region} • {system.type}</div>
                    </div>
                </div>
                {isCritical ? (
                    <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                ) : (
                    <div className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                )}
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                
                {/* Metrics Row */}
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Health Score</div>
                        <div className={`text-3xl font-bold ${
                            system.healthScore >= 95 ? 'text-green-600' :
                            system.healthScore >= 90 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                            {system.healthScore}%
                        </div>
                    </div>
                    
                    {/* Sparkline Container */}
                    <div className="w-24 h-12">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={system.latencyHistory}>
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#0d9488'} 
                                    strokeWidth={2} 
                                    dot={false} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Message */}
                {system.errorMessage ? (
                    <div className="bg-red-50 text-red-700 text-xs font-bold px-3 py-2 rounded mb-4 flex items-center gap-2 border border-red-100">
                        <XCircle className="w-3 h-3" /> {system.errorMessage}
                    </div>
                ) : (
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-medium">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {system.latency}ms</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {system.lastSync}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <button className="flex-1 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                        <Terminal className="w-3 h-3" /> Logs
                    </button>
                    <button className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                        isCritical 
                        ? 'bg-red-600 border-red-600 text-white hover:bg-red-700 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
                    }`}>
                        <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

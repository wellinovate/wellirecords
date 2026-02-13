
import React from 'react';
import { SystemNode } from '../types';
import { Activity, Pill, Stethoscope, Microscope, UserCheck, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface SystemCardProps {
  system: SystemNode;
  onClick?: (system: SystemNode) => void;
}

const SystemCard: React.FC<SystemCardProps> = ({ system, onClick }) => {
  const getIcon = (type: SystemNode['type']) => {
    switch (type) {
      case 'clinic': return <Stethoscope className="w-5 h-5" />;
      case 'lab': return <Microscope className="w-5 h-5" />;
      case 'pharmacy': return <Pill className="w-5 h-5" />;
      case 'telemedicine': return <Activity className="w-5 h-5" />;
      case 'identity': return <UserCheck className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: SystemNode['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500 text-green-700';
      case 'syncing': return 'bg-blue-500 text-blue-700';
      case 'error': return 'bg-red-500 text-red-700';
      case 'offline': return 'bg-slate-400 text-slate-600';
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(system)}
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${onClick ? 'cursor-pointer hover:border-teal-300' : ''}`}
    >
      {/* Top Status Bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        system.status === 'connected' ? 'bg-green-500' : 
        system.status === 'syncing' ? 'bg-blue-500' :
        system.status === 'error' ? 'bg-red-500' : 'bg-slate-300'
      }`}></div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            system.type === 'identity' ? 'bg-purple-100 text-purple-600' :
            system.type === 'clinic' ? 'bg-blue-100 text-blue-600' :
            'bg-teal-50 text-teal-600'
          }`}>
            {getIcon(system.type)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{system.name}</h3>
            <p className="text-xs text-slate-500 capitalize">{system.type} • {system.region}</p>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
            system.status === 'connected' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-100 text-slate-600'
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(system.status).split(' ')[0]}`}></span>
            {system.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 p-2 rounded border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Latency</span>
            <span className="text-sm font-mono text-slate-700">{system.latency || '24'}ms</span>
        </div>
        <div className="bg-slate-50 p-2 rounded border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Uptime</span>
            <span className="text-sm font-mono text-slate-700">99.9%</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${system.healthScore}%` }}></div>
            </div>
            <span className="text-xs text-slate-400 font-medium">{system.healthScore}% Health</span>
        </div>
        <button className="text-slate-400 hover:text-teal-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SystemCard;

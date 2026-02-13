
import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Map as MapIcon, 
  Grid, 
  Search, 
  Filter, 
  Plus, 
  Globe2, 
  Server, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle2,
  Settings,
  Terminal,
  Download,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';
import { SystemNode } from '../types';
import SystemCard from './SystemCard';

const SystemsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSystem, setNewSystem] = useState({
    name: '',
    type: 'clinic' as SystemNode['type'],
    region: 'NA'
  });

  // Expanded Mock Data with Coordinates
  const [nodes, setNodes] = useState<SystemNode[]>([
    { id: '1', name: 'Metro General Clinic', type: 'clinic', status: 'connected', lastSync: '2 min ago', healthScore: 98, region: 'North America', coordinates: { x: 25, y: 35 }, ipAddress: '10.0.4.12', version: 'v2.4.1', latency: 45 },
    { id: '2', name: 'BioCore Labs', type: 'lab', status: 'syncing', lastSync: 'Running...', healthScore: 92, region: 'Europe', coordinates: { x: 52, y: 28 }, ipAddress: '192.168.1.5', version: 'v2.3.0', latency: 120 },
    { id: '3', name: 'GlobalID Verify', type: 'identity', status: 'connected', lastSync: '1 min ago', healthScore: 100, region: 'Global', coordinates: { x: 48, y: 45 }, ipAddress: '172.16.0.9', version: 'v3.0.0', latency: 15 },
    { id: '4', name: 'TeleHealth Connect', type: 'telemedicine', status: 'error', lastSync: '4 hr ago', healthScore: 45, region: 'Asia Pacific', coordinates: { x: 75, y: 55 }, ipAddress: '10.2.0.100', version: 'v2.1.0', latency: 400 },
    { id: '5', name: 'Priestley Pharmacy', type: 'pharmacy', status: 'connected', lastSync: '10 min ago', healthScore: 96, region: 'Africa', coordinates: { x: 50, y: 55 }, ipAddress: '10.5.1.20', version: 'v2.4.1', latency: 180 },
    { id: '6', name: 'Lagos City Hospital', type: 'clinic', status: 'connected', lastSync: '5 min ago', healthScore: 94, region: 'Africa', coordinates: { x: 49, y: 53 }, ipAddress: '10.5.1.22', version: 'v2.4.1', latency: 165 },
    { id: '7', name: 'Nairobi Research Center', type: 'lab', status: 'offline', lastSync: '2 days ago', healthScore: 20, region: 'Africa', coordinates: { x: 55, y: 60 }, ipAddress: '10.5.2.5', version: 'v2.0.0', latency: 0 },
  ]);

  const filteredNodes = nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || node.type === filterType;
      return matchesSearch && matchesFilter;
  });

  const handleScanNetwork = () => {
      setIsScanning(true);
      setTimeout(() => {
          setIsScanning(false);
      }, 2000);
  };

  const handleSyncNode = (id: string) => {
      setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'syncing' } : n));
      setTimeout(() => {
          setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'connected', lastSync: 'Just now' } : n));
      }, 2500);
  };

  const handleAddSystem = (e: React.FormEvent) => {
    e.preventDefault();
    const systemId = (nodes.length + 1).toString();
    const newSystemNode: SystemNode = {
        id: systemId,
        name: newSystem.name,
        type: newSystem.type,
        region: newSystem.region,
        status: 'syncing',
        lastSync: 'Connecting...',
        healthScore: 100,
        latency: 0,
        coordinates: { x: 50, y: 50 }, // Default center, would be draggable in a real app
        ipAddress: '10.0.0.' + Math.floor(Math.random() * 255),
        version: 'v1.0.0'
    };
    
    setNodes([...nodes, newSystemNode]);
    setIsAddModalOpen(false);
    setNewSystem({ name: '', type: 'clinic', region: 'NA' });
    
    // Simulate connection established
    setTimeout(() => {
        setNodes(prev => prev.map(s => s.id === systemId ? {
            ...s,
            status: 'connected',
            lastSync: 'Just now',
            latency: Math.floor(Math.random() * 50) + 20
        } : s));
    }, 2000);
  };

  const statusCounts = {
      connected: nodes.filter(n => n.status === 'connected').length,
      warning: nodes.filter(n => n.status === 'syncing').length,
      error: nodes.filter(n => n.status === 'error' || n.status === 'offline').length
  };

  // Simple World Map Component (Interactive)
  const WorldMap = () => (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
        {/* Abstract Map Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
                 backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
             }}>
        </div>
        
        {/* World Map Outline (Simplified SVG) */}
        <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full opacity-30 text-slate-500 fill-current pointer-events-none">
             <path d="M20,30 Q25,20 40,25 T50,40 T60,20 T80,30 T90,50 T70,55 T50,60 T30,55 T20,40 Z" /> {/* Very abstract continent shapes for effect */}
             <path d="M25,35 L30,32 L35,38 Z" opacity="0.5" />
             <path d="M50,25 L55,22 L60,28 Z" opacity="0.5" />
             <path d="M70,50 L75,48 L80,55 Z" opacity="0.5" />
        </svg>

        {/* Connections Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map((node, i) => (
                nodes.slice(i + 1).map(target => (
                    <line 
                        key={`${node.id}-${target.id}`}
                        x1={`${node.coordinates?.x}%`} 
                        y1={`${node.coordinates?.y}%`} 
                        x2={`${target.coordinates?.x}%`} 
                        y2={`${target.coordinates?.y}%`} 
                        stroke={node.status === 'connected' && target.status === 'connected' ? "#0f766e" : "#334155"} 
                        strokeWidth="0.5"
                        strokeOpacity="0.4"
                    />
                ))
            ))}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
            <div 
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${node.coordinates?.x}%`, top: `${node.coordinates?.y}%` }}
            >
                {/* Ping Effect */}
                {node.status === 'connected' && (
                    <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-75"></div>
                )}
                
                {/* Node Dot */}
                <div className={`relative w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg transition-all transform group-hover:scale-125 ${
                    node.status === 'connected' ? 'bg-teal-500' :
                    node.status === 'syncing' ? 'bg-blue-500' :
                    node.status === 'error' ? 'bg-red-500' : 'bg-slate-500'
                }`}>
                     {/* Tooltip */}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap z-20">
                         <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-700">
                             <div className="font-bold">{node.name}</div>
                             <div className="text-slate-400 capitalize">{node.status} • {node.latency}ms</div>
                         </div>
                         <div className="w-2 h-2 bg-slate-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700"></div>
                     </div>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col relative overflow-hidden">
      
      {/* Header & Stats */}
      <div className="flex flex-col gap-6 mb-6 flex-shrink-0">
          <div className="flex justify-between items-end">
              <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Network className="w-6 h-6 text-teal-600" />
                    Connected Ecosystem
                  </h2>
                  <p className="text-slate-500 mt-1">Manage network topology, node health, and data synchronization.</p>
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={handleScanNetwork}
                    className={`px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-all ${isScanning ? 'animate-pulse' : ''}`}
                  >
                      <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} /> 
                      {isScanning ? 'Scanning...' : 'Scan Network'}
                  </button>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 shadow-sm flex items-center gap-2"
                  >
                      <Plus className="w-4 h-4" /> Add Node
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-lg"><Server className="w-5 h-5" /></div>
                  <div>
                      <div className="text-2xl font-bold text-slate-900">{nodes.length}</div>
                      <div className="text-xs text-slate-500">Total Nodes</div>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                  <div>
                      <div className="text-2xl font-bold text-slate-900">{statusCounts.connected}</div>
                      <div className="text-xs text-slate-500">Healthy</div>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><RefreshCw className="w-5 h-5" /></div>
                  <div>
                      <div className="text-2xl font-bold text-slate-900">{statusCounts.warning}</div>
                      <div className="text-xs text-slate-500">Syncing</div>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                  <div>
                      <div className="text-2xl font-bold text-slate-900">{statusCounts.error}</div>
                      <div className="text-xs text-slate-500">Issues Detected</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content: Toolbar + View */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 p-1 bg-slate-200/50 rounded-lg">
                  <button 
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <Globe2 className="w-4 h-4" /> Map View
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <Grid className="w-4 h-4" /> List View
                  </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Filter nodes..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                  </div>
                  <div className="relative">
                      <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none cursor-pointer"
                      >
                          <option value="all">All Types</option>
                          <option value="clinic">Clinics</option>
                          <option value="lab">Labs</option>
                          <option value="pharmacy">Pharmacies</option>
                          <option value="identity">Identity</option>
                      </select>
                      <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
              </div>
          </div>

          {/* View Area */}
          <div className="flex-1 overflow-hidden relative">
              {viewMode === 'map' ? (
                  <div className="w-full h-full p-4 bg-slate-900">
                      <WorldMap />
                  </div>
              ) : (
                  <div className="h-full overflow-y-auto p-6 bg-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredNodes.map(node => (
                              <SystemCard 
                                key={node.id} 
                                system={node} 
                                onClick={() => setSelectedNode(node)} 
                              />
                          ))}
                      </div>
                      {filteredNodes.length === 0 && (
                          <div className="text-center py-12 text-slate-400">
                              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                              <p>No nodes found matching your filters.</p>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* Node Details Slide-over / Modal */}
      {selectedNode && (
          <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform z-30 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                  <div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedNode.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <span className="capitalize">{selectedNode.type}</span> • {selectedNode.region}
                      </p>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                      <X className="w-6 h-6" />
                  </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Status Card */}
                  <div className={`p-4 rounded-xl border ${
                      selectedNode.status === 'connected' ? 'bg-green-50 border-green-100' :
                      selectedNode.status === 'error' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                      <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-full ${
                              selectedNode.status === 'connected' ? 'bg-green-100 text-green-600' :
                              selectedNode.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                          }`}>
                              {selectedNode.status === 'connected' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 capitalize">{selectedNode.status}</div>
                              <div className="text-xs opacity-75">Last heartbeat: {selectedNode.latency}ms ago</div>
                          </div>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${selectedNode.healthScore > 90 ? 'bg-green-500' : 'bg-amber-500'}`} 
                            style={{ width: `${selectedNode.healthScore}%` }}
                          ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs font-medium opacity-75">
                          <span>System Health</span>
                          <span>{selectedNode.healthScore}%</span>
                      </div>
                  </div>

                  {/* Tech Specs */}
                  <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Technical Details</h4>
                      <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <span className="text-sm text-slate-600 flex items-center gap-2"><MapIcon className="w-4 h-4 text-slate-400" /> IP Address</span>
                              <span className="text-sm font-mono text-slate-900">{selectedNode.ipAddress}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <span className="text-sm text-slate-600 flex items-center gap-2"><Server className="w-4 h-4 text-slate-400" /> Version</span>
                              <span className="text-sm font-mono text-slate-900">{selectedNode.version}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <span className="text-sm text-slate-600 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-400" /> Last Sync</span>
                              <span className="text-sm text-slate-900">{selectedNode.lastSync}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <span className="text-sm text-slate-600 flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400" /> Latency</span>
                              <span className="text-sm text-slate-900">{selectedNode.latency}ms</span>
                          </div>
                      </div>
                  </div>

                  {/* Actions */}
                  <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Management</h4>
                      <div className="space-y-2">
                          <button 
                            onClick={() => handleSyncNode(selectedNode.id)}
                            className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                              <RefreshCw className="w-4 h-4" /> Force Sync
                          </button>
                          <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                              <Terminal className="w-4 h-4" /> View Logs
                          </button>
                          <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                              <Download className="w-4 h-4" /> Export Config
                          </button>
                          <button className="w-full py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors mt-4">
                              <WifiOff className="w-4 h-4" /> Disconnect Node
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

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

export default SystemsModule;


import React, { useState } from 'react';
import { 
  Terminal, 
  Key, 
  Webhook, 
  BookOpen, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Plus, 
  Trash2, 
  AlertCircle,
  Activity,
  Server,
  Code,
  Box
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DeveloperConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'webhooks' | 'docs'>('overview');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  // Mock API Keys
  const [apiKeys, setApiKeys] = useState([
    { id: 'key_1', name: 'Default Public Key', type: 'publishable', key: 'pk_test_51Mz...', created: '2023-10-01' },
    { id: 'key_2', name: 'Backend Service', type: 'secret', key: 'sk_test_4eC3...', created: '2023-10-05', lastUsed: '2 mins ago' },
  ]);

  // Mock Webhooks
  const [webhooks, setWebhooks] = useState([
    { id: 'wh_1', url: 'https://api.clinic-partners.com/webhooks/wellirecord', events: ['patient.created', 'lab_result.verified'], status: 'active', lastDelivery: 'Success (200 OK)' },
    { id: 'wh_2', url: 'https://staging-api.biocore.io/events', events: ['*'], status: 'failed', lastDelivery: 'Failed (500 Server Error)' },
  ]);

  // Usage Data
  const usageData = [
    { time: '00:00', requests: 120 },
    { time: '04:00', requests: 180 },
    { time: '08:00', requests: 450 },
    { time: '12:00', requests: 800 },
    { time: '16:00', requests: 600 },
    { time: '20:00', requests: 350 },
    { time: '23:59', requests: 200 },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSecret = (id: string) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const CodeBlock = ({ language, code }: { language: string, code: string }) => (
    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 font-mono text-sm shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="text-slate-400 text-xs uppercase font-bold">{language}</span>
            <button 
                onClick={() => handleCopy(code, 'code-block')}
                className="text-slate-400 hover:text-white transition-colors"
            >
                {copied === 'code-block' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
        </div>
        <div className="p-4 overflow-x-auto text-slate-300">
            <pre>{code}</pre>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-teal-600" />
              Developer Platform
           </h1>
           <p className="text-sm text-slate-500 mt-1">Manage API keys, webhooks, and integrations.</p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Environment Toggle */}
             <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
                <button 
                    onClick={() => setEnvironment('sandbox')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${environment === 'sandbox' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Box className="w-3 h-3" /> Sandbox
                </button>
                <button 
                    onClick={() => setEnvironment('production')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${environment === 'production' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Server className="w-3 h-3" /> Production
                </button>
             </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* Side Nav */}
         <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-1">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Activity className="w-4 h-4" /> Overview
            </button>
            <button 
                onClick={() => setActiveTab('keys')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'keys' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Key className="w-4 h-4" /> API Keys
            </button>
            <button 
                onClick={() => setActiveTab('webhooks')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'webhooks' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Webhook className="w-4 h-4" /> Webhooks
            </button>
            <button 
                onClick={() => setActiveTab('docs')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'docs' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <BookOpen className="w-4 h-4" /> Docs & SDKs
            </button>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">API Requests (24h)</h3>
                            <div className="text-3xl font-bold text-slate-900">48.2k</div>
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> +12% from yesterday
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Avg. Latency</h3>
                            <div className="text-3xl font-bold text-slate-900">142ms</div>
                            <div className="text-xs text-slate-400 mt-1">Global P95</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Error Rate</h3>
                            <div className="text-3xl font-bold text-slate-900">0.02%</div>
                            <div className="text-xs text-green-600 mt-1">Operational status: Healthy</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Traffic Volume</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={usageData}>
                                    <defs>
                                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                        itemStyle={{ color: '#2dd4bf' }}
                                    />
                                    <Area type="monotone" dataKey="requests" stroke="#0d9488" fillOpacity={1} fill="url(#colorRequests)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'keys' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">API Keys</h2>
                            <p className="text-sm text-slate-500">Manage credentials for the {environment} environment.</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create new key
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Token</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Last Used</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {apiKeys.map(key => (
                                    <tr key={key.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {key.name}
                                            <div className={`mt-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${key.type === 'secret' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {key.type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    {key.type === 'secret' && !showSecret[key.id] 
                                                        ? 'sk_test_••••••••••••••••' 
                                                        : key.key}
                                                </span>
                                                <button 
                                                    onClick={() => handleCopy(key.key, key.id)}
                                                    className="text-slate-400 hover:text-teal-600"
                                                >
                                                    {copied === key.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                                {key.type === 'secret' && (
                                                    <button 
                                                        onClick={() => toggleSecret(key.id)}
                                                        className="text-slate-400 hover:text-teal-600"
                                                    >
                                                        {showSecret[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{key.created}</td>
                                        <td className="px-6 py-4 text-slate-500">{key.lastUsed || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'webhooks' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Webhooks</h2>
                            <p className="text-sm text-slate-500">Listen for events on your server.</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add endpoint
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {webhooks.map(hook => (
                            <div key={hook.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                            hook.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {hook.status}
                                        </span>
                                        <h3 className="font-mono text-sm font-medium text-slate-900">{hook.url}</h3>
                                    </div>
                                    <div className="flex gap-2 mb-3">
                                        {hook.events.map(event => (
                                            <span key={event} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                                                {event}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        Last delivery: <span className={hook.lastDelivery.includes('Success') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{hook.lastDelivery}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-400 hover:text-teal-600 border border-transparent hover:bg-teal-50 rounded-lg transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-600 border border-transparent hover:bg-slate-50 rounded-lg transition-colors">
                                        <Code className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'docs' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                             <BookOpen className="w-6 h-6 text-blue-600" />
                             <div>
                                 <h3 className="text-blue-900 font-bold">Quick Start Guide</h3>
                                 <p className="text-sm text-blue-700 mt-1 max-w-2xl">
                                     The WelliRecord API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes.
                                 </p>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4">Authentication</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Authenticate your account when using the API by including your secret API key in the request.
                            </p>
                            <CodeBlock 
                                language="bash" 
                                code={`curl https://api.wellirecord.com/v1/patients \\
  -u sk_test_4eC3...:`} 
                            />
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-900 mb-4">Get Patient Record</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Retrieves the details of an existing patient. You need only supply the unique patient identifier.
                            </p>
                            <CodeBlock 
                                language="javascript" 
                                code={`const welli = require('wellirecord')('sk_test_...');

const patient = await welli.patients.retrieve(
  'pat_123456789'
);`} 
                            />
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default DeveloperConsole;

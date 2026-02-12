import React from 'react';
import { Icons } from '../layout/Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WalletTransaction } from '../../types';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const transactions: WalletTransaction[] = [
  { id: '1', type: 'earn', amount: 50, description: 'Daily Step Goal (WelliBit)', date: 'Today, 10:23 AM' },
  { id: '2', type: 'spend', amount: 1200, description: 'Pharmacy - WelliMarket', date: 'Yesterday, 4:15 PM' },
  { id: '3', type: 'earn', amount: 25, description: 'Health Survey Reward', date: 'Yesterday, 8:00 PM' },
  { id: '4', type: 'spend', amount: 500, description: 'Telemedicine Consult (WelliCare)', date: 'Oct 24, 2:30 PM' },
];

export const WalletComponent: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-800">WelliWallet™</h2>
         <span className="text-sm text-slate-500">Connected to: <span className="font-semibold text-slate-900">Mainnet</span></span>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-700">
          {/* Abstract Pattern */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-welli-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 bg-welli-500/20 rounded border border-welli-500/50">
                    <Icons.Coins className="w-4 h-4 text-welli-400" />
                 </div>
                 <p className="text-slate-300 text-sm font-medium tracking-wide uppercase">Total Balance</p>
              </div>
              <h1 className="text-5xl font-bold tracking-tight mb-2">4,250.00</h1>
              <span className="text-lg font-medium text-welli-400 bg-welli-400/10 px-3 py-1 rounded-lg border border-welli-400/20">$WELLI TOKEN</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <Icons.Wallet className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <button className="flex-1 bg-white text-slate-900 py-3 px-4 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
              <Icons.TrendingUp className="w-4 h-4" /> Top Up
            </button>
            <button className="flex-1 bg-welli-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-welli-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-welli-600/20">
              <Icons.ArrowRight className="w-4 h-4" /> Transfer
            </button>
             <button className="flex-none bg-slate-800 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-700">
              <Icons.Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">WelliCoin Earnings (7 Days)</h3>
            <div className="h-28">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm bg-green-50 p-3 rounded-xl">
            <span className="text-green-800 font-medium">Earned this week</span>
            <span className="text-green-600 font-bold">+240 $WELLI</span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          <button className="text-welli-600 text-sm font-bold hover:text-welli-700">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${tx.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                  {tx.type === 'earn' ? <Icons.TrendingUp className="w-5 h-5" /> : <Icons.ShoppingBag className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                  <p className="text-xs text-slate-500">{tx.date}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${tx.type === 'earn' ? 'text-green-600' : 'text-slate-900'}`}>
                {tx.type === 'earn' ? '+' : '-'}{tx.amount} <span className="text-[10px] text-slate-400 font-normal">WELLI</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { billingApi } from '@/shared/api/billingApi';
import { CheckCircle, Users, Database, CreditCard } from 'lucide-react';

function fmt(kobo: number) {
    return `₦${(kobo / 100).toLocaleString('en-NG')}`;
}

export function SubscriptionPlansPage() {
    const [target, setTarget] = useState<'all' | 'patient' | 'facility'>('all');
    const plans = target === 'all' ? billingApi.getPlans() : billingApi.getPlans(target);

    const accent = (t: string) => t === 'patient' ? '#38bdf8' : '#a78bfa';

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Subscription Plans</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Manage patient and facility pricing tiers. All prices in Nigerian Naira.</p>
            </div>

            {/* Toggle */}
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#111827' }}>
                {(['all', 'patient', 'facility'] as const).map(t => (
                    <button key={t} onClick={() => setTarget(t)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                        style={{
                            background: target === t ? 'rgba(245,158,11,0.15)' : 'transparent',
                            color: target === t ? '#f59e0b' : '#6b7280',
                        }}>
                        {t === 'all' ? 'All Plans' : `${t} Plans`}
                    </button>
                ))}
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {plans.map(plan => {
                    const color = accent(plan.target);
                    const isTop = plan.name.toLowerCase().includes('enterprise');
                    return (
                        <div key={plan.id} className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
                            style={{ background: '#111827', border: `1px solid ${color}${isTop ? '40' : '18'}` }}>
                            {isTop && (
                                <div className="absolute top-0 right-0 text-[9px] font-black px-3 py-1 rounded-bl-xl"
                                    style={{ background: color, color: '#000' }}>ENTERPRISE</div>
                            )}
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest mb-1 capitalize" style={{ color }}>{plan.target}</div>
                                <div className="text-lg font-black" style={{ color: '#e5e7eb' }}>{plan.name}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black" style={{ color }}>
                                    {plan.priceMonthly === 0 ? 'Free' : fmt(plan.priceMonthly)}
                                    {plan.priceMonthly > 0 && <span className="text-sm font-normal text-gray-500"> / mo</span>}
                                </div>
                                {plan.priceAnnual > 0 && (
                                    <div className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                                        {fmt(plan.priceAnnual)} / year (save {Math.round((1 - plan.priceAnnual / (plan.priceMonthly * 12)) * 100)}%)
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1" style={{ color: '#6b7280' }}>
                                    <Users size={11} /> {plan.maxSeats === null ? 'Unlimited' : `${plan.maxSeats}`} seats
                                </div>
                                <div className="flex items-center gap-1" style={{ color: '#6b7280' }}>
                                    <Database size={11} /> {plan.maxStorageGB}GB
                                </div>
                            </div>
                            <ul className="space-y-1.5">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: '#9ca3af' }}>
                                        <CheckCircle size={12} className="mt-0.5 flex-shrink-0" style={{ color }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                <span className="text-xs" style={{ color: plan.isActive ? '#10b981' : '#6b7280' }}>
                                    {plan.isActive ? '● Active' : '● Inactive'}
                                </span>
                                <button className="text-xs font-bold px-3 py-1 rounded-lg transition-all hover:-translate-y-0.5"
                                    style={{ background: `${color}18`, color }}>
                                    Edit Plan
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

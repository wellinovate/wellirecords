import React, { useState } from 'react';
import { Search, MapPin, Activity, Clock, Navigation, Star, Zap, Phone, ShieldCheck, Map, ArrowRight, Ambulance, Map as MapIcon, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingModal, BookingProvider } from './BookingModal';

const CATEGORIES = ['All', 'Hospitals', 'Urgent Care', 'Clinics', 'Pharmacy', 'Labs'];

// Mock provider data — in production this comes from an API
const MERCY_PROVIDER: BookingProvider = {
    name: 'Mercy Outpatient Clinic',
    specialty: 'General Practice & Outpatient Care',
    rating: '4.9',
    distance: '1.2 km away',
    estimatedCost: '₦15,000',
    availability: {},
};

export function FindCarePage() {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [bookingProvider, setBookingProvider] = useState<BookingProvider | null>(null);
    const [showMap, setShowMap] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in space-y-0 pb-10 max-w-6xl mx-auto">

            {/* ─── Emergency Status — Persistent Top Banner ─── */}
            <div
                className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 rounded-2xl mb-6 flex-shrink-0"
                style={{
                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    boxShadow: '0 4px 24px rgba(220,38,38,0.4)',
                }}
            >
                {/* Left: Label + ER info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Activity size={20} className="text-white animate-pulse" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white text-sm uppercase tracking-widest">Emergency Status</span>
                            <span className="text-[10px] bg-white/25 text-white px-2 py-0.5 rounded font-black tracking-widest animate-pulse">LIVE</span>
                        </div>
                        <div className="text-white/80 text-xs mt-0.5 truncate">
                            Nearest ER: <span className="font-bold text-white">City General ER</span> · 0.8 km away
                        </div>
                    </div>
                </div>

                {/* Centre: Wait time */}
                <div className="flex items-center gap-2 flex-shrink-0 bg-white/15 px-4 py-2 rounded-xl">
                    <Clock size={14} className="text-white/80" />
                    <div>
                        <div className="font-black text-white font-mono text-xl leading-none">12m</div>
                        <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Wait Time</div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 bg-white text-red-700 font-bold text-xs px-4 py-2 rounded-xl transition-opacity hover:opacity-90">
                        <Ambulance size={14} /> Call 112
                    </button>
                    <button
                        onClick={() => setFilter('Urgent Care')}
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors border border-white/30"
                    >
                        Find Urgent Care
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* ─── Header & Search ─── */}
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="section-header font-display" style={{ color: 'var(--pat-text)' }}>Find Care</h1>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors"
                            style={{
                                background: showMap ? 'var(--pat-primary)' : 'var(--pat-surface)',
                                color: showMap ? '#fff' : 'var(--pat-primary)',
                                borderColor: 'var(--pat-primary)'
                            }}
                        >
                            {showMap ? <List size={16} /> : <MapIcon size={16} />}
                            {showMap ? 'List View' : 'Map Locator'}
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium mb-5" style={{ color: 'var(--pat-muted)' }}>
                        <MapPin size={16} /> Current Location: <span className="font-bold" style={{ color: 'var(--pat-text)' }}>Lagos, Nigeria</span> (Simulated)
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search size={20} style={{ color: 'var(--pat-muted)' }} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-12 pr-32 py-4 rounded-xl shadow-sm text-lg outline-none transition-shadow focus:shadow-md border"
                            style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-surface)', color: 'var(--pat-text)' }}
                            placeholder="Search providers, conditions, or locations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="absolute right-2 top-2 bottom-2 btn btn-patient px-6 text-sm">
                            Search
                        </button>
                    </div>

                    {/* Filter Pills — using navy brand color */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {CATEGORIES.map(c => (
                            <button
                                key={c}
                                onClick={() => setFilter(c)}
                                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all border"
                                style={{
                                    background: filter === c ? 'var(--pat-primary)' : 'rgba(4,30,66,0.07)',
                                    color: filter === c ? '#fff' : 'var(--pat-primary)',
                                    borderColor: filter === c ? 'var(--pat-primary)' : 'rgba(4,30,66,0.15)',
                                }}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* ─── Main Content (Left 2/3) ─── */}
                    <div className="lg:col-span-2 space-y-6">

                        {showMap ? (
                            <div className="w-full h-[600px] rounded-2xl border-2 overflow-hidden relative flex flex-col items-center justify-center bg-gray-100" style={{ borderColor: 'var(--pat-border)' }}>
                                <MapIcon size={64} className="text-gray-300 mb-4" />
                                <div className="text-gray-500 font-bold">Interactive Map View</div>
                                <div className="text-gray-400 text-sm mt-2">Showing {filter === 'All' ? 'all providers' : filter.toLowerCase()} near you</div>

                                {/* Mock Map Pins */}
                                <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)] animate-pulse"></div>
                                <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
                                <div className="absolute bottom-1/3 left-1/2 w-4 h-4 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--pat-border)' }}>
                                    <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--pat-text)' }}>
                                        <Star className="text-amber-500" size={18} /> Recommended Near You
                                    </h2>
                                    <span className="text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"
                                        style={{ color: 'var(--pat-primary)', background: 'rgba(4,30,66,0.07)' }}>
                                        <Zap size={12} fill="currentColor" /> AI Best Match
                                    </span>
                                </div>

                                {/* Highly Recommended AI Match */}
                                <div className="card-patient p-5 border-2 relative" style={{ borderColor: 'var(--pat-primary)' }}>
                                    <div className="absolute -top-3 right-4 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-1"
                                        style={{ background: 'var(--pat-primary)' }}>
                                        <Zap size={10} fill="#fff" /> Ranked #1 for your profile
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-5">
                                        <div className="w-full sm:w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center border"
                                            style={{ background: 'var(--pat-surface2)', borderColor: 'var(--pat-border)' }}>
                                            <Map size={32} style={{ color: 'var(--pat-muted)', opacity: 0.5 }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--pat-text)' }}>Mercy Outpatient Clinic</h3>
                                                    <p className="text-sm flex items-center gap-1" style={{ color: 'var(--pat-muted)' }}>
                                                        <Star size={12} className="text-amber-400" fill="currentColor" /> 4.9 (1.2k reviews) · 1.2 km away
                                                    </p>
                                                </div>
                                                <div className="text-emerald-600 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Open Now</div>
                                            </div>

                                            {/* Stat Pills */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                                                <div className="p-2 rounded-lg border text-center"
                                                    style={{ background: 'rgba(4,30,66,0.06)', borderColor: 'rgba(4,30,66,0.12)' }}>
                                                    <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--pat-muted)' }}>Est. Cost</div>
                                                    <div className="font-semibold text-sm" style={{ color: 'var(--pat-text)' }}>₦15k</div>
                                                </div>
                                                <div className="p-2 rounded-lg border text-center"
                                                    style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.18)' }}>
                                                    <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600">HMO Match</div>
                                                    <div className="font-semibold text-sm flex items-center justify-center gap-1 text-blue-600">
                                                        <ShieldCheck size={12} /> 100%
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-lg border text-center"
                                                    style={{ background: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.18)' }}>
                                                    <div className="text-[10px] uppercase font-bold tracking-wider text-orange-500">Wait Time</div>
                                                    <div className="font-semibold text-sm flex items-center justify-center gap-1 text-orange-500">
                                                        <Clock size={12} /> 25m
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-lg border text-center"
                                                    style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.18)' }}>
                                                    <div className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Power</div>
                                                    <div className="font-semibold text-sm flex items-center justify-center gap-1 text-amber-500">
                                                        <Zap size={12} /> 24h Gen
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--pat-border)' }}>
                                                {/* ✅ Now opens the BookingModal */}
                                                <button
                                                    className="btn btn-patient flex-1 justify-center rounded-lg text-sm"
                                                    onClick={() => setBookingProvider(MERCY_PROVIDER)}
                                                >
                                                    Book Appointment
                                                </button>
                                                <button
                                                    onClick={() => window.open('https://api.whatsapp.com/send?phone=2348000000000&text=Hello,%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment.', '_blank')}
                                                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"
                                                >
                                                    <Phone size={16} /> WhatsApp
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Standard List Items */}
                                {[
                                    { name: 'Downtown Urgent Care', dist: '2.4', rating: '4.5', wait: '45m', cap: '70% Bed Cap', img: 'UC' },
                                    { name: 'WelliPharm 24h', dist: '3.1', rating: '4.2', wait: '10m', cap: 'High Stock', img: 'PH' },
                                ].map((item, i) => (
                                    <div key={i} className="card-patient p-4 flex flex-col sm:flex-row gap-4">
                                        <div className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center font-bold border"
                                            style={{ background: 'var(--pat-surface2)', color: 'var(--pat-muted)', borderColor: 'var(--pat-border)' }}>
                                            {item.img}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold" style={{ color: 'var(--pat-text)' }}>{item.name}</h3>
                                                    <p className="text-xs flex items-center gap-1" style={{ color: 'var(--pat-muted)' }}>
                                                        <Star size={10} className="text-amber-400" fill="currentColor" /> {item.rating} · {item.dist} km away
                                                    </p>
                                                </div>
                                                <div className="text-emerald-600 font-semibold text-xs border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">Open</div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--pat-muted)' }}><Clock size={12} /> {item.wait} wait</span>
                                                <span className="text-xs font-medium text-blue-600 flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded"><Activity size={10} /> {item.cap}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                    </div>

                    {/* ─── Sidebar (Right 1/3) ─── */}
                    <div className="space-y-6">

                        <div className="card-patient p-5">
                            <h3 className="font-bold text-sm mb-4 border-b pb-2" style={{ color: 'var(--pat-text)', borderColor: 'var(--pat-border)' }}>Recently Visited</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[var(--pat-border)]"
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--pat-surface2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>Dr. Sarah Chen</div>
                                        <div className="text-xs mb-1" style={{ color: 'var(--pat-muted)' }}>Primary Care · Sep 14</div>
                                        <div className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block font-semibold border border-emerald-500/20">Records Synced</div>
                                    </div>
                                    <ArrowRight size={14} style={{ color: 'var(--pat-muted)' }} />
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[var(--pat-border)]"
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--pat-surface2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>Valley Imaging</div>
                                        <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>Radiology · Aug 02</div>
                                    </div>
                                    <Navigation size={14} style={{ color: 'var(--pat-muted)' }} />
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/patient/vault')}
                                className="w-full text-center text-xs font-bold mt-4 hover:underline transition-colors p-2 rounded-lg hover:bg-blue-50"
                                style={{ color: 'var(--pat-primary)' }}
                            >
                                View All History
                            </button>
                        </div>

                        <div className="card-patient p-5 border-2" style={{ borderColor: 'var(--pat-border)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                                style={{ background: 'rgba(4,30,66,0.1)' }}>
                                <ShieldCheck size={20} style={{ color: 'var(--pat-primary)' }} />
                            </div>
                            <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--pat-text)' }}>Hospital Directory</h3>
                            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--pat-muted)' }}>
                                Browse the full directory of accredited medical centers, pharmacies, and labs in the WelliRecord network.
                            </p>
                            <button className="btn btn-patient-outline w-full justify-center text-sm">
                                Browse Directory
                            </button>
                        </div>

                    </div>

                </div>
            </div>

            {/* ─── Booking Modal ─── */}
            {bookingProvider && (
                <BookingModal
                    provider={bookingProvider}
                    onClose={() => setBookingProvider(null)}
                />
            )}
        </div>
    );
}

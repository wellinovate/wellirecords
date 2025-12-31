import React, { useState, useEffect } from 'react';
import { findMedicalPlaces } from '../services/geminiService';
import { MapPlace } from '../types';
import { 
  MapPin, Search, Navigation, Star, Building2, 
  Stethoscope, Pill, Ambulance, Phone, ArrowRight,
  Clock, Map as MapIcon, Loader2, Microscope, Filter, X, List, Layers, MousePointer2,
  ChevronDown, History, Zap, AlertCircle, Heart, User
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'hospital', label: 'Hospitals', icon: Building2, query: 'Hospitals and medical centers' },
  { id: 'urgent', label: 'Urgent Care', icon: Ambulance, query: 'Urgent care centers open now' },
  { id: 'clinic', label: 'Clinics', icon: Stethoscope, query: 'Family practice doctors' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, query: 'Pharmacies' },
  { id: 'lab', label: 'Labs', icon: Microscope, query: 'Diagnostic laboratories' },
];

// Mock data to pre-populate the "Discovery" view
const NEARBY_HIGHLIGHTS: MapPlace[] = [
    { title: "City General Hospital", uri: "#", rating: 4.8, snippet: "24/7 Emergency Room • Level 1 Trauma Center", location: { latitude: 37.7749, longitude: -122.4194 } },
    { title: "Downtown Urgent Care", uri: "#", rating: 4.5, snippet: "Walk-ins welcome • 15 min wait time", location: { latitude: 37.7849, longitude: -122.4094 } },
    { title: "WelliPharm 24h", uri: "#", rating: 4.2, snippet: "Pharmacy & Compounding", location: { latitude: 37.7649, longitude: -122.4294 } },
];

const RECENT_VISITS = [
    { name: "Dr. Sarah Chen", type: "Primary Care", date: "May 12", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100" },
    { name: "Valley Imaging", type: "Radiology", date: "Apr 28", image: "https://images.unsplash.com/photo-1516574187841-693083f7e496?auto=format&fit=crop&q=80&w=100&h=100" }
];

export const ProviderFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<MapPlace[]>(NEARBY_HIGHLIGHTS); // Pre-populate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseText, setResponseText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>({ lat: 37.7749, lng: -122.4194 }); // Default mock loc
  const [locationName, setLocationName] = useState("San Francisco, CA");
  const [hasSearched, setHasSearched] = useState(false);

  // Initial load effect to get real location
  useEffect(() => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
              setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
              });
              // In a real app, reverse geocode here to get city name
          });
      }
  }, []);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setPlaces([]); // Clear pre-populated data on actual search
    setResponseText('');
    setHasSearched(true);

    try {
      // Use current location or fallback
      const lat = userLocation?.lat || 37.7749;
      const lng = userLocation?.lng || -122.4194;

      const result = await findMedicalPlaces(searchQuery, lat, lng);
      setPlaces(result.places);
      setResponseText(result.text);
      if (result.places.length > 0) {
         // Optionally switch to map, but list is often better for details
      }
    } catch (err) {
      setError('Unable to retrieve providers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleCategorySelect = (categoryId: string) => {
      setActiveCategory(categoryId);
      const category = CATEGORIES.find(c => c.id === categoryId);
      if (category && category.query) {
          setQuery(category.query); // Update input for visibility
          executeSearch(category.query);
      } else if (categoryId === 'all') {
          setQuery('');
          setPlaces(NEARBY_HIGHLIGHTS); // Reset to default
          setHasSearched(false);
      }
  };

  // --- Map Visualization ---
  const renderMap = () => {
    // In a real app, this would be a Google Maps / Leaflet component
    // We keep the simulated radar viz but make it fuller size
    const CONTAINER_WIDTH = 800;
    const CONTAINER_HEIGHT = 500;
    const CENTER_X = CONTAINER_WIDTH / 2;
    const CENTER_Y = CONTAINER_HEIGHT / 2;
    const SCALE = 3000;

    return (
        <div className="relative w-full h-[500px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group animate-in fade-in duration-700">
            {/* Map Styles */}
            <div className="absolute inset-0 bg-[#0f172a] opacity-100"></div>
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px]"></div>
            
            {/* Streets (Abstract) */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                <path d="M0 100 H800 M0 250 H800 M0 400 H800 M200 0 V500 M400 0 V500 M600 0 V500" stroke="white" strokeWidth="1" />
                <path d="M0 0 L800 500 M800 0 L0 500" stroke="white" strokeWidth="0.5" />
            </svg>

            {/* Radar Pulse */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                 <div className="w-[600px] h-[600px] border border-blue-500/5 rounded-full absolute -translate-x-1/2 -translate-y-1/2"></div>
                 <div className="w-[400px] h-[400px] border border-blue-500/10 rounded-full absolute -translate-x-1/2 -translate-y-1/2"></div>
                 <div className="w-24 h-24 bg-blue-500/10 rounded-full absolute -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
            </div>
            
            {/* You Are Here */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group/me cursor-help">
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)] border-2 border-white"></div>
                 <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover/me:opacity-100 transition-opacity">
                    Current Location
                </div>
            </div>

            {/* Places Markers */}
            {places.map((place, idx) => {
                let lat = place.location?.latitude;
                let lng = place.location?.longitude;
                
                // Fallback simulation
                if (!lat || !lng || !userLocation) {
                   const angle = (idx / places.length) * 2 * Math.PI;
                   const dist = 0.002 + (idx * 0.001); 
                   lat = (userLocation?.lat || 37.7749) + (dist * Math.cos(angle));
                   lng = (userLocation?.lng || -122.4194) + (dist * Math.sin(angle));
                }

                // Calculate Position relative to center
                const dx = (lng - (userLocation?.lng || 0)) * SCALE * 5; // Zoom factor
                const dy = -(lat - (userLocation?.lat || 0)) * SCALE * 5;
                
                // Clamp
                const x = Math.max(30, Math.min(CONTAINER_WIDTH - 30, CENTER_X + dx));
                const y = Math.max(30, Math.min(CONTAINER_HEIGHT - 30, CENTER_Y + dy));

                return (
                    <div 
                        key={idx}
                        className="absolute group/pin cursor-pointer transition-all hover:z-50"
                        style={{ left: `${x}px`, top: `${y}px` }}
                    >
                        <MapPin 
                             size={28} 
                             className="text-red-500 drop-shadow-xl -translate-x-1/2 -translate-y-full hover:scale-125 transition-transform" 
                             fill="#ef4444"
                        />
                        
                        {/* Tooltip Card */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-slate-900/95 backdrop-blur-md text-slate-100 rounded-xl p-3 shadow-2xl border border-slate-700 opacity-0 group-hover/pin:opacity-100 transition-all scale-95 group-hover/pin:scale-100 origin-bottom pointer-events-none z-50">
                            <div className="font-bold text-sm mb-0.5 truncate">{place.title}</div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5">
                                    <Star size={10} fill="currentColor" /> {place.rating || 'N/A'}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-medium">Open Now</span>
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{place.snippet || "Medical Provider"}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* --- Top Bar: Location & Search --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-800/50">
          {/* Location Selector */}
          <button className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:border-blue-500/50 px-4 py-2.5 rounded-xl transition-all group">
              <div className="p-1.5 bg-blue-500/10 rounded-full text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <MapPin size={16} />
              </div>
              <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Location</div>
                  <div className="text-sm font-bold flex items-center gap-1">
                      {locationName} <ChevronDown size={14} />
                  </div>
              </div>
          </button>

          {/* Search Bar */}
          <form onSubmit={handleFormSubmit} className="flex-1 w-full max-w-2xl relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search providers, conditions, or locations..."
                    className="block w-full pl-11 pr-32 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
                <div className="absolute inset-y-1 right-1">
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-full px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Search'}
                    </button>
                </div>
          </form>

          {/* View Toggle (Map/List) - Only show if not empty */}
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex items-center shrink-0">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <List size={14} /> List
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <MapIcon size={14} /> Map
                </button>
          </div>
      </div>

      {/* --- Unified Categories --- */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => (
              <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                      ${activeCategory === cat.id 
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40' 
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'
                      }
                  `}
              >
                  <cat.icon size={16} />
                  {cat.label}
              </button>
          ))}
      </div>

      {/* --- Main Content Area --- */}
      {viewMode === 'map' ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
              {renderMap()}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-2">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Live Updates Active
                  </div>
                  <div className="flex items-center gap-1">
                      <MousePointer2 size={12} /> Hover pins for details
                  </div>
              </div>
          </div>
      ) : (
          <div className="space-y-8">
              
              {/* === Discovery Dashboard (Visible when no specific search active) === */}
              {!hasSearched && activeCategory === 'all' && (
                  <div className="grid lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                      
                      {/* 1. Urgent Care Widget */}
                      <div className="bg-gradient-to-br from-red-950 to-slate-900 rounded-2xl border border-red-900/30 p-5 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-3 bg-red-500 text-white rounded-bl-2xl text-xs font-bold flex items-center gap-1 shadow-lg">
                               <Zap size={12} fill="currentColor" /> LIVE
                           </div>
                           <h3 className="text-red-100 font-bold text-lg mb-1 flex items-center gap-2">
                               <Ambulance size={20} className="text-red-500" /> Emergency Status
                           </h3>
                           <p className="text-red-200/60 text-xs mb-6">Nearby ER & Urgent Care wait times</p>
                           
                           <div className="space-y-3">
                               <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-red-500/10">
                                   <div>
                                       <div className="text-sm font-bold text-slate-200">City General ER</div>
                                       <div className="text-xs text-slate-500">0.8 miles away</div>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-lg font-bold text-emerald-400">12m</div>
                                       <div className="text-[10px] text-slate-500 uppercase">Wait Time</div>
                                   </div>
                               </div>
                               <button 
                                 onClick={() => handleCategorySelect('urgent')}
                                 className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-900/20"
                               >
                                   Find Urgent Care
                               </button>
                           </div>
                      </div>

                      {/* 2. Hospital Directory Search Card */}
                      <div 
                        onClick={() => handleCategorySelect('hospital')} 
                        className="bg-blue-900/20 rounded-2xl border border-blue-900/30 p-5 relative overflow-hidden group cursor-pointer hover:bg-blue-900/30 transition-all"
                      >
                           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                               <Building2 size={80} />
                           </div>
                           <h3 className="text-blue-100 font-bold text-lg mb-1 flex items-center gap-2 relative z-10">
                               <Building2 size={20} className="text-blue-400" /> Hospital Directory
                           </h3>
                           <p className="text-blue-200/60 text-xs mb-6 relative z-10">Browse accredited medical centers and hospitals.</p>
                           <div className="mt-auto relative z-10">
                               <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                   <Search size={14} /> Find Hospitals
                               </button>
                           </div>
                      </div>

                      {/* 3. Recent Visits */}
                      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                          <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                              <History size={18} className="text-blue-500" /> Recently Visited
                          </h3>
                          <div className="space-y-3">
                              {RECENT_VISITS.map((visit, i) => (
                                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group">
                                      <img src={visit.image} alt={visit.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                                      <div className="flex-1">
                                          <div className="font-bold text-slate-200 text-sm group-hover:text-blue-400 transition-colors">{visit.name}</div>
                                          <div className="text-xs text-slate-500">{visit.type}</div>
                                      </div>
                                      <div className="text-[10px] font-medium text-slate-600 bg-slate-950 px-2 py-1 rounded">
                                          {visit.date}
                                      </div>
                                  </div>
                              ))}
                              <button className="w-full text-center text-xs text-blue-400 font-bold mt-2 hover:underline">View All History</button>
                          </div>
                      </div>
                  </div>
              )}

              {/* === Search Results List === */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                       <h3 className="font-bold text-slate-200 text-lg">
                           {hasSearched ? `Results for "${query}"` : "Recommended Near You"}
                       </h3>
                       {places.length > 0 && (
                           <span className="text-xs font-medium text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                               {places.length} Providers Found
                           </span>
                       )}
                  </div>

                  {loading ? (
                       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {[1, 2, 3].map((i) => (
                               <div key={i} className="h-48 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse"></div>
                           ))}
                       </div>
                  ) : places.length > 0 ? (
                       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {places.map((place, index) => (
                               <div key={index} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 group flex flex-col">
                                   <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Building2 size={24} />
                                            </div>
                                            <div className="text-right">
                                                {place.rating && (
                                                    <div className="flex items-center justify-end gap-1 text-amber-400 text-sm font-bold mb-1">
                                                        <Star size={14} fill="currentColor" /> {place.rating}
                                                    </div>
                                                )}
                                                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-900/30 inline-block">
                                                    OPEN NOW
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-lg text-slate-100 mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                            {place.title}
                                        </h4>
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">
                                            {place.snippet || "Medical facility offering comprehensive care services."}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-slate-800 pt-3">
                                            <div className="flex items-center gap-1.5">
                                                <Navigation size={12} /> 1.2 mi
                                            </div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <Clock size={12} /> ~15 min wait
                                            </div>
                                        </div>
                                   </div>

                                   <div className="bg-slate-950 p-3 flex gap-3 border-t border-slate-800">
                                       <a 
                                          href={place.uri} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                                       >
                                           <Navigation size={16} /> Directions
                                       </a>
                                       <button className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                                           <Phone size={18} />
                                       </button>
                                   </div>
                               </div>
                           ))}
                       </div>
                  ) : (
                       <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                           <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                               <Search size={32} className="text-slate-500" />
                           </div>
                           <h3 className="text-lg font-bold text-slate-300">No Providers Found</h3>
                           <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Try adjusting your search query or location area.</p>
                       </div>
                  )}
              </div>
          </div>
      )}

      {/* AI Context Snippet (Only shows when response text exists) */}
      {responseText && !loading && (
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm animate-in slide-in-from-bottom-2">
           <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
               <Zap size={18} fill="currentColor" />
           </div>
           <div className="prose prose-sm prose-invert text-slate-300 max-w-none">
               <p className="m-0 text-sm leading-relaxed">{responseText}</p>
           </div>
        </div>
      )}
    </div>
  );
};
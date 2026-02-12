import { Provider, PROVIDERS, SPECIALTIES } from "@/utils/data";
import {
  AlertTriangle,
  Aperture,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  FileCheck,
  Filter,
  Info,
  Loader2,
  Lock,
  MessageSquareQuote,
  Mic,
  MicOff,
  PhoneOff,
  Search,
  Shield,
  ShieldCheck,
  Signal,
  Sparkles,
  Star,
  Sun,
  User,
  Video,
  VideoOff,
  Wallet,
  Wifi,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const RECENT_CONSULTS = [
  {
    name: "Dr. Sarah Chen",
    date: "May 12",
    type: "Follow-up",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=50&h=50",
  },
  {
    name: "Linda Miles",
    date: "Apr 28",
    type: "Medication",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=50&h=50",
  },
];

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
  "04:00 PM",
];

type ViewState = "list" | "booking" | "payment" | "confirmation" | "call";

export const Telemed: React.FC = () => {
  const [view, setView] = useState<ViewState>("list");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("general");

  // Insurance Verification State
  const [insuranceProviderName, setInsuranceProviderName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [insuranceStatus, setInsuranceStatus] = useState<
    "idle" | "verifying" | "verified" | "out-of-network" | "pre-auth"
  >("idle");

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Call Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Visual Effects State
  const [showEffectsMenu, setShowEffectsMenu] = useState(false);
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const [isLightCorrectionEnabled, setIsLightCorrectionEnabled] =
    useState(false);

  // Timer for call duration
  useEffect(() => {
    let interval: any;
    if (view === "call") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [view]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBookClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setView("booking");
    setDate("");
    setTime("");
    // Reset Insurance State
    setInsuranceStatus("idle");
    setInsuranceProviderName("");
    setMemberId("");
  };

  const handleBookingSubmit = () => {
    if (date && time) {
      setView("payment");
    }
  };

  const handleVerifyInsurance = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!insuranceProviderName || !memberId) return;
    setInsuranceStatus("verifying");

    // Simulate API call
    setTimeout(() => {
      const id = memberId.toUpperCase();
      if (id.endsWith("OUT")) {
        setInsuranceStatus("out-of-network");
      } else if (id.endsWith("AUTH")) {
        setInsuranceStatus("pre-auth");
      } else {
        setInsuranceStatus("verified");
      }
    }, 1500);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessingPayment(false);
      setView("confirmation");
    }, 2000);
  };

  const handleJoinCall = () => {
    setView("call");
  };

  const handleEndCall = () => {
    setView("list");
    setSelectedProvider(null);
    setDate("");
    setTime("");
    // Reset call states
    setIsMuted(false);
    setIsVideoOff(false);
    setShowEffectsMenu(false);
  };

  // --- Calendar Helpers ---
  const getDaysArray = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

    const days = [];
    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (d1: Date, d2Str: string) => {
    return formatDateStr(d1) === d2Str;
  };

  const getAvailability = (day: Date) => {
    const dayNum = day.getDate();
    const weekDay = day.getDay();

    if (weekDay === 0) return 0;
    if (dayNum === 15 || dayNum === 28) return 0;
    if (weekDay === 6) return 2;

    return 5 + (dayNum % 3);
  };

  // --- Render Views ---

  const renderList = () => {
    const specialtyMatch = (provider: Provider) => {
      if (selectedSpecialty === "general") return true;

      switch (selectedSpecialty) {
        case "cardio":
          return provider.specialty.toLowerCase().includes("cardio");

        case "mental":
          return (
            provider.specialty.toLowerCase().includes("mental") ||
            provider.role.toLowerCase().includes("therapist")
          );

        case "peds":
          return provider.specialty.toLowerCase().includes("pedi");

        case "derm":
          return provider.specialty.toLowerCase().includes("derm");

        default:
          return true;
      }
    };

    const filteredProviders = PROVIDERS.filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = specialtyMatch(provider);

      return matchesSearch && matchesSpecialty;
    });

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Video className="text-blue-500" /> WelliCare Telehealth
            </h2>
            <p className="text-slate-500 mt-1 max-w-xl">
              Connect with verified specialists in minutes. Insurance accepted.
              Secure, private, and convenient.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Categories & Recent */}
          <div className="lg:col-span-1 space-y-6">
            {/* Popular Specialties */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Browse Specialties
              </h3>
              <div className="space-y-2">
                {SPECIALTIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSpecialty(cat.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left
      ${
        selectedSpecialty === cat.id
          ? "bg-slate-800 border border-blue-500/40"
          : "hover:bg-slate-800"
      }`}
                  >
                    <div className={`p-2 rounded-lg ${cat.bg} ${cat.color}`}>
                      <cat.icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Consultations */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Recently Consulted
              </h3>
              <div className="space-y-3">
                {RECENT_CONSULTS.map((consult, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-950/50 border border-slate-800"
                  >
                    <img
                      src={consult.img}
                      alt={consult.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-200">
                        {consult.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {consult.type} • {consult.date}
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full text-center text-xs text-blue-400 font-medium hover:underline pt-2">
                  View All History
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Providers */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-200">Top Rated Providers</h3>
              <span className="text-xs text-slate-500">
                Showing {filteredProviders.length} results
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-blue-500/30 transition-all group flex flex-col h-full shadow-sm hover:shadow-xl relative"
                >
                  {/* Online Badge */}
                  {provider.isOnline && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      ONLINE
                    </div>
                  )}

                  <div className="p-5 flex gap-4">
                    {/* Avatar Section */}
                    <div className="shrink-0">
                      <div className="relative">
                        <img
                          src={provider.image}
                          alt={provider.name}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-700 group-hover:border-blue-500/50 transition-colors shadow-lg"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1 rounded-lg">
                          <div className="bg-slate-800 border border-slate-700 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star size={10} fill="currentColor" />{" "}
                            {provider.rating}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium mb-1">
                        {provider.credentials}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] font-medium bg-blue-900/20 text-blue-300 px-2 py-0.5 rounded border border-blue-900/30">
                          {provider.specialty}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                          {provider.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Snippet */}
                  <div className="px-5 py-3 bg-slate-950/50 border-y border-slate-800/50">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-2 text-slate-500 italic text-xs leading-relaxed flex-1">
                        <MessageSquareQuote
                          size={14}
                          className="shrink-0 text-slate-600"
                        />
                        <span className="line-clamp-2">
                          "{provider.reviewSnippet}"
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedProvider(
                            expandedProvider === provider.id
                              ? null
                              : provider.id,
                          )
                        }
                        className="text-slate-500 hover:text-blue-400 transition-colors shrink-0"
                      >
                        {expandedProvider === provider.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Reviews & Insurance Section */}
                  {expandedProvider === provider.id && (
                    <div className="border-b border-slate-800 bg-slate-950/50 p-5 space-y-5 animate-in slide-in-from-top-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Star size={12} className="text-amber-400" /> Top
                          Patient Reviews
                        </h4>
                        <div className="space-y-3">
                          {provider.reviews.map((review, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-bold text-slate-300 text-xs">
                                  {review.author}
                                </span>
                                <div className="flex flex-col items-end">
                                  <div className="flex text-amber-400 text-[10px] gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={8}
                                        fill={
                                          i < review.rating
                                            ? "currentColor"
                                            : "none"
                                        }
                                        className={
                                          i >= review.rating
                                            ? "text-slate-700"
                                            : ""
                                        }
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[9px] text-slate-600 mt-0.5">
                                    {review.date}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed italic">
                                "{review.comment}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <BadgeCheck size={12} className="text-blue-400" />{" "}
                          Accepted Insurance
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {provider.insurance.map((ins) => (
                            <span
                              key={ins}
                              className="px-2.5 py-1 bg-slate-900 text-slate-300 text-xs font-medium rounded-lg border border-slate-700"
                            >
                              {ins}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto p-5 space-y-4">
                    {/* Availability & Insurance Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                        <Clock size={14} />
                        <span>
                          Next Available:{" "}
                          <span className="text-emerald-300 font-bold">
                            {provider.nextAvailable}
                          </span>
                        </span>
                      </div>
                      {expandedProvider !== provider.id && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <BadgeCheck size={12} />
                          <span>Accepts: {provider.insurance.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-lg font-bold text-white">
                          ${provider.price}
                        </span>
                        <span className="text-xs text-slate-500">
                          {" "}
                          / session
                        </span>
                      </div>
                      <button
                        onClick={() => handleBookClick(provider)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                      >
                        Book Appointment <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBooking = () => {
    const days = getDaysArray(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-500">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Providers
        </button>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={selectedProvider?.image}
                alt={selectedProvider?.name}
                className="w-12 h-12 rounded-full border border-slate-700"
              />
              <div>
                <h3 className="font-bold text-xl text-slate-100">
                  Schedule Appointment
                </h3>
                <p className="text-slate-500 text-sm">
                  with {selectedProvider?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Video size={16} className="text-blue-500" /> 30 min session
            </div>
          </div>

          <div className="p-6 grid lg:grid-cols-5 gap-8">
            {/* --- Calendar Section --- */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Select Date
                </h4>
                <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-slate-200 font-bold w-32 text-center text-sm">
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 mb-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] font-bold text-slate-500 uppercase py-2 tracking-widest"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((d, i) => {
                  if (!d)
                    return (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    );

                  const isSelected = isSameDay(d, date);
                  const isToday = isSameDay(d, formatDateStr(today));
                  const isPast = d < today;

                  // Availability Logic
                  const slots = getAvailability(d);
                  const isUnavailable = slots === 0;

                  return (
                    <button
                      key={i}
                      disabled={isPast || isUnavailable}
                      onClick={() => {
                        setDate(formatDateStr(d));
                        setTime(""); // Reset time when date changes
                      }}
                      className={`
                                       aspect-square rounded-xl text-sm font-medium transition-all relative group flex flex-col items-center justify-center gap-1
                                       ${
                                         isSelected
                                           ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 transform scale-105 z-10 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900"
                                           : isPast || isUnavailable
                                             ? "text-slate-700 cursor-not-allowed bg-slate-950/30 border border-transparent"
                                             : "text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-950 border border-slate-800"
                                       }
                                   `}
                    >
                      {d.getDate()}

                      {/* Today Marker */}
                      {isToday && !isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      )}

                      {/* Availability Indicators */}
                      {!isPast && !isUnavailable && !isSelected && (
                        <div className="flex gap-0.5">
                          <div
                            className={`w-1 h-1 rounded-full ${slots < 3 ? "bg-amber-500" : "bg-emerald-500"}`}
                          ></div>
                          {slots > 4 && (
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                          )}
                        </div>
                      )}

                      {/* Tooltip for availability */}
                      {!isPast && !isUnavailable && (
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 shadow-lg border border-slate-700">
                          {slots} slots left
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-6 text-xs text-slate-500 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
                  Good Availability
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>{" "}
                  Limited
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>{" "}
                  Unavailable
                </div>
              </div>
            </div>

            {/* --- Time Selection Section --- */}
            <div className="lg:col-span-2 flex flex-col h-full border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Available Slots
              </h4>

              {!date ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4 py-8 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                  <Calendar size={32} className="opacity-50" />
                  <p className="text-sm font-medium">
                    Select a date to view times
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-sm text-slate-300 mb-2 p-3 bg-blue-900/10 rounded-lg border border-blue-900/20 flex items-center gap-2">
                    <Calendar size={14} className="text-blue-400" />
                    <span className="font-medium">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                          time === slot
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50 scale-105"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        <Clock size={12} />
                        {slot}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Times shown in your local timezone.
                  </p>
                </div>
              )}

              <div className="mt-auto pt-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
                <div className="flex justify-between items-center mb-4 text-sm bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">
                    Estimated Total
                  </span>
                  <span className="text-white font-bold text-lg">
                    ${selectedProvider?.price}
                  </span>
                </div>

                {/* Cancellation Policy - Booking Step */}
                <div className="flex items-start gap-2 mb-4 px-1">
                  <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    <strong>Cancellation Policy:</strong> Free cancellation up
                    to 24 hours before your slot. Late cancellations are subject
                    to a $10 fee.
                  </p>
                </div>

                <button
                  onClick={handleBookingSubmit}
                  disabled={!date || !time}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                  Proceed to Payment{" "}
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPayment = () => {
    const basePrice = selectedProvider ? selectedProvider.price : 0;
    const platformFee = 2.0;
    const total =
      insuranceStatus === "verified" ? 25.0 : basePrice + platformFee;
    const isVerified = insuranceStatus === "verified";

    return (
      <div className="max-w-md mx-auto animate-in slide-in-from-right-4 duration-500">
        <button
          onClick={() => setView("booking")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Scheduling
        </button>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 relative z-10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-slate-100">
                Secure Payment
              </h3>
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-950/30 px-2 py-0.5 rounded text-xs font-bold border border-emerald-900/50">
                <Shield size={12} /> Encrypted
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Transaction secured via WelliPay Blockchain
            </p>
          </div>

          {/* Insurance Verification Section */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/30 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="text-blue-500" size={16} /> Insurance
                Eligibility
              </h4>
              {insuranceStatus === "verified" && (
                <span className="text-[10px] font-bold bg-emerald-900/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/30 flex items-center gap-1">
                  <Check size={10} /> VERIFIED
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={insuranceProviderName}
                    onChange={(e) => setInsuranceProviderName(e.target.value)}
                    placeholder="e.g. BlueCross"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Member ID
                  </label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="XX-0000-00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {insuranceStatus === "idle" && (
                <button
                  onClick={handleVerifyInsurance}
                  disabled={!insuranceProviderName || !memberId}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                >
                  Verify Coverage
                </button>
              )}

              {insuranceStatus === "verifying" && (
                <div className="w-full py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> Verifying...
                </div>
              )}

              {insuranceStatus === "verified" && (
                <div className="p-3 bg-emerald-900/10 border border-emerald-900/20 rounded-lg flex items-start gap-2">
                  <FileCheck
                    className="text-emerald-500 shrink-0 mt-0.5"
                    size={14}
                  />
                  <div>
                    <p className="text-xs text-emerald-400 font-bold">
                      In-Network Coverage Confirmed
                    </p>
                    <p className="text-[10px] text-emerald-300/70">
                      Copay Applied: $25.00
                    </p>
                  </div>
                </div>
              )}

              {insuranceStatus === "out-of-network" && (
                <div className="p-3 bg-amber-900/10 border border-amber-900/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle
                    className="text-amber-500 shrink-0 mt-0.5"
                    size={14}
                  />
                  <div>
                    <p className="text-xs text-amber-400 font-bold">
                      Out-of-Network
                    </p>
                    <p className="text-[10px] text-amber-300/70">
                      Standard rates apply. You may file for reimbursement.
                    </p>
                  </div>
                </div>
              )}

              {insuranceStatus === "pre-auth" && (
                <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-lg flex items-start gap-2">
                  <Shield className="text-red-400 shrink-0 mt-0.5" size={14} />
                  <div>
                    <p className="text-xs text-red-400 font-bold">
                      Pre-Authorization Required
                    </p>
                    <p className="text-[10px] text-red-300/70">
                      Please contact your insurer before proceeding.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-950/50 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Consultation Fee</span>
              <span
                className={`text-sm font-bold ${isVerified ? "text-slate-500 line-through" : "text-slate-200"}`}
              >
                ${selectedProvider?.price.toFixed(2)}
              </span>
            </div>
            {isVerified && (
              <div className="flex justify-between items-center mb-2 animate-in fade-in">
                <span className="text-sm text-emerald-400">
                  Insurance Copay
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  $25.00
                </span>
              </div>
            )}
            {!isVerified && (
              <div className="flex justify-between items-center text-xs text-slate-500 pb-4 border-b border-slate-800">
                <span>Platform Fee</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 mb-4 border-t border-slate-800">
              <span className="font-bold text-slate-200">Total Due</span>
              <span className="font-bold text-xl text-blue-400">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Cancellation Policy - Payment Step */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 flex gap-2">
              <Info size={16} className="text-blue-500 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                By proceeding, you agree to the{" "}
                <strong>Cancellation Policy</strong>. You can cancel for free up
                to 24 hours before the appointment.
              </p>
            </div>
          </div>

          <form
            onSubmit={handlePaymentSubmit}
            className="p-6 space-y-4 relative z-10"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Card Number
              </label>
              <div className="relative group">
                <CreditCard
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                  size={16}
                />
                <input
                  required
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Expiry
                </label>
                <input
                  required
                  type="text"
                  placeholder="MM/YY"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  CVC
                </label>
                <input
                  required
                  type="text"
                  placeholder="123"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Cardholder Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                  size={16}
                />
                <input
                  required
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingPayment}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessingPayment ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wallet size={18} />
              )}
              {isProcessingPayment
                ? "Processing Transaction..."
                : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => (
    <div className="max-w-xl mx-auto text-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/50 animate-bounce">
        <CheckCircle size={40} className="text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
      <p className="text-slate-400 mb-8">
        Your appointment has been secured on the WelliChain.
      </p>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-left mb-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Provider
            </label>
            <div className="font-bold text-slate-200 text-lg group-hover:text-blue-400 transition-colors">
              {selectedProvider?.name}
            </div>
            <div className="text-blue-400 text-sm">
              {selectedProvider?.specialty}
            </div>
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Time
            </label>
            <div className="font-bold text-slate-200 text-lg">{time}</div>
            <div className="text-slate-400 text-sm">
              {new Date(date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleJoinCall}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-900/30 flex items-center gap-2 mx-auto transition-transform hover:scale-105"
      >
        <Video size={20} /> Join Waiting Room
      </button>
      <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-2">
        <Lock size={12} /> End-to-End Encrypted Session
      </p>
    </div>
  );

  const renderCall = () => (
    <div className="h-[calc(100vh-140px)] bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 animate-in fade-in duration-500 flex flex-col shadow-2xl">
      {/* Status Bar Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-slate-200 text-sm font-medium">
            <Lock size={12} className="text-emerald-400" />
            Encrypted
          </div>
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-200 text-sm font-mono">
            {formatDuration(callDuration)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10">
            <Signal size={14} className="text-emerald-400" />
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10">
            <Wifi size={14} className="text-slate-200" />
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="text-center p-8 relative z-10">
          <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700 relative overflow-hidden">
            <img
              src={selectedProvider?.image}
              alt={selectedProvider?.name}
              className="w-full h-full object-cover opacity-50"
            />
            {/* Pulsing Ring Animation */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            Connecting to {selectedProvider?.name}...
          </h3>
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Establishing secure
            channel
          </p>
        </div>

        {/* Self View Picture-in-Picture */}
        <div
          className={`absolute bottom-24 right-6 w-48 h-36 bg-black rounded-xl border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden z-20 hover:scale-105 transition-transform cursor-move ${isLightCorrectionEnabled ? "brightness-110 contrast-110" : ""}`}
        >
          {isVideoOff ? (
            <div className="text-slate-600 flex flex-col items-center gap-2">
              <VideoOff size={24} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                Camera Off
              </span>
            </div>
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              {/* Simulated Video Feed Background */}
              <div
                className={`absolute inset-0 bg-slate-800 flex items-center justify-center transition-all duration-500 ${isBlurEnabled ? "blur-sm scale-110" : ""}`}
              >
                {/* Abstract shapes to show blur effect */}
                <div className="w-20 h-20 bg-slate-700 rounded-full absolute -top-4 -left-4"></div>
                <div className="w-16 h-16 bg-slate-700 rounded-full absolute bottom-2 right-2"></div>
              </div>

              {/* Foreground User (simulated segmentation) */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <User size={32} className="text-slate-400" />
              </div>

              {/* Status Indicators */}
              <div className="absolute bottom-2 right-2 flex gap-1 z-20">
                {isBlurEnabled && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm"></div>
                )}
                {isLightCorrectionEnabled && (
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-sm"></div>
                )}
                <div className="w-2 h-2 bg-emerald-500 rounded-full border border-black"></div>
              </div>
            </div>
          )}
          {isMuted && (
            <div className="absolute top-3 right-3 bg-red-500 p-1.5 rounded-full shadow-md z-30">
              <MicOff size={12} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Call Controls Bar */}
      <div className="h-24 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-6 relative z-30">
        {/* Effects Menu Popup */}
        {showEffectsMenu && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-40 w-72 animate-in slide-in-from-bottom-4 zoom-in-95">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-500" /> Visual
                Effects
              </h4>
              <button
                onClick={() => setShowEffectsMenu(false)}
                className="text-slate-500 hover:text-white"
              >
                <ArrowLeft size={14} className="rotate-[-90deg]" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setIsBlurEnabled(!isBlurEnabled)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isBlurEnabled ? "bg-blue-900/20 border-blue-500/50 text-blue-400" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isBlurEnabled ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"}`}
                  >
                    <Aperture size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">Blur Background</div>
                    <div className="text-[10px] opacity-70">Focus on you</div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isBlurEnabled ? "border-blue-500 bg-blue-500" : "border-slate-600 bg-slate-900"}`}
                >
                  {isBlurEnabled && <Check size={12} className="text-white" />}
                </div>
              </button>

              <button
                onClick={() =>
                  setIsLightCorrectionEnabled(!isLightCorrectionEnabled)
                }
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isLightCorrectionEnabled ? "bg-amber-900/20 border-amber-500/50 text-amber-400" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isLightCorrectionEnabled ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-500"}`}
                  >
                    <Sun size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">Low Light Mode</div>
                    <div className="text-[10px] opacity-70">
                      Auto-enhance brightness
                    </div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isLightCorrectionEnabled ? "border-amber-500 bg-amber-500" : "border-slate-600 bg-slate-900"}`}
                >
                  {isLightCorrectionEnabled && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all duration-300 ${isMuted ? "bg-red-500 text-white shadow-lg shadow-red-900/50 hover:bg-red-600" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-all duration-300 ${isVideoOff ? "bg-red-500 text-white shadow-lg shadow-red-900/50 hover:bg-red-600" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"}`}
          title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button
          onClick={() => setShowEffectsMenu(!showEffectsMenu)}
          className={`p-4 rounded-full transition-all duration-300 ${showEffectsMenu ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"}`}
          title="Visual Effects"
        >
          <Sparkles size={24} />
        </button>

        <div className="w-px h-10 bg-slate-800 mx-2"></div>

        <button
          onClick={handleEndCall}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <PhoneOff size={24} />{" "}
          <span className="hidden sm:inline">End Call</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto h-full pb-8">
      {view === "list" && renderList()}
      {view === "booking" && renderBooking()}
      {view === "payment" && renderPayment()}
      {view === "confirmation" && renderConfirmation()}
      {view === "call" && renderCall()}
    </div>
  );
};

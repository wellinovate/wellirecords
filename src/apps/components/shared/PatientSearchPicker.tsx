import React, { useState, useEffect } from "react";
import { usePatientSearch } from "@/shared/hooks/usePatientSearch";
import { getLocalCustomers, sendInvitation, type LocalCustomer } from "@/shared/api/localCustomersApi";
import { CheckCircle2, User, Phone, Mail, Sparkles, Send, Check, Copy } from "lucide-react";

type Props = {
  open?: boolean;
  enabled?: boolean;
  searchPatientRequest: (
    value: string,
    identifierType: "wrId" | "email" | "phone",
    signal?: AbortSignal
  ) => Promise<any>;
  onSelect: (patient: {
    id: string;
    name: string;
    avatar?: string;
    raw: any;
  }) => void;
};

export const PatientSearchPicker = ({
  open = true,
  enabled = true,
  searchPatientRequest,
  onSelect,
}: Props) => {
  const {
    query,
    setQuery,
    searchLoading,
    searchError,
    searchResult,
    selectedPatient,
  } = usePatientSearch({
    open,
    enabled,
    searchPatientRequest,
  });

  const [localCustomers, setLocalCustomers] = useState<LocalCustomer[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [invitedId, setInvitedId] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setLocalCustomers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLocalLoading(true);
      try {
        const res = await getLocalCustomers(1, 5, { search: trimmed });
        setLocalCustomers(res.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLocalLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleQuickInvite = async (e: React.MouseEvent, customer: LocalCustomer) => {
    e.stopPropagation();
    try {
      const res = await sendInvitation(customer._id);
      setInvitedId(customer._id);
      const fullUrl = `${window.location.origin}/join/${res.token}`;
      navigator.clipboard.writeText(fullUrl);
      setTimeout(() => setInvitedId(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const hasAnyResult = Boolean(searchResult) || localCustomers.length > 0;
  const isSearching = searchLoading || localLoading;

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, email, or WelliRecord ID..."
          className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
        />
        {isSearching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 animate-pulse font-medium">
            Searching...
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-[#29527f] p-3.5 bg-[#061730]/60 space-y-3">
        {!isSearching && !query.trim() && (
          <p className="text-xs text-[#8fb0d5] text-center py-2">
            Enter a WelliRecord ID, phone number, email, or patient name to search.
          </p>
        )}

        {!isSearching && query.trim() && !hasAnyResult && (
          <div className="py-3 text-center space-y-1">
            <p className="text-xs text-slate-300 font-semibold">No existing record found</p>
            <p className="text-[11px] text-[#8fb0d5]">
              You can complete order details as a walk-in patient.
            </p>
          </div>
        )}

        {/* 1. Verified WelliRecord Account */}
        {searchResult && (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={searchResult.avatar || "/avatar.png"}
                    alt={searchResult.fullName}
                    className="h-10 w-10 rounded-full object-cover border border-emerald-500/50"
                  />
                  <CheckCircle2 size={14} className="absolute -bottom-1 -right-1 text-emerald-400 fill-emerald-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white">{searchResult.fullName}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ WelliRecord Verified
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400/80 font-mono mt-0.5">
                    {searchResult.wrId || "WR-ID Active"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onSelect({
                    id: searchResult.patientIdentityId || searchResult._id,
                    name: searchResult.fullName,
                    avatar: searchResult.avatar,
                    raw: searchResult,
                  })
                }
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-600/20"
              >
                Select
              </button>
            </div>
          </div>
        )}

        {/* 2. Local Imported Customers */}
        {localCustomers.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Local Customer Records ({localCustomers.length})
            </p>
            {localCustomers.map((c) => (
              <div
                key={c._id}
                className="rounded-xl bg-[#0d284f] border border-slate-700/60 p-3 flex items-center justify-between gap-3 hover:border-slate-500 transition"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs text-white truncate">{c.fullName}</p>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex-shrink-0">
                        {c.matchStatus === "matched" ? "Linked" : "Local Record"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#8fb0d5] mt-0.5">
                      {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                      {c.email && <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {c.matchStatus !== "matched" && (
                    <button
                      type="button"
                      onClick={(e) => handleQuickInvite(e, c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition flex items-center gap-1 border border-blue-500/30"
                      title="Generate invitation & copy link"
                    >
                      {invitedId === c._id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Send size={11} />
                          <span>Invite</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onSelect({
                        id: c._id,
                        name: c.fullName,
                        avatar: undefined,
                        raw: c,
                      })
                    }
                    className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500 transition"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
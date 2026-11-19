import { useEffect, useState } from "react";
import { getMySubscription, startSubscriptionCheckout, verifySubscriptionPayment, type SubscriptionStatus } from "@/shared/api/subscriptionApi";

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

// Shown at the top of the provider area only while the subscription is in its grace period or suspended.
export function SubscriptionBanner() {
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = () => getMySubscription().then((s) => { if (!cancelled) setSub(s); }).catch(() => {});
    // Coming back from Paystack: confirm the payment, then reload the status.
    const url = new URL(window.location.href);
    const reference = url.searchParams.get("reference");
    if (reference) {
      url.searchParams.delete("reference");
      url.searchParams.delete("trxref");
      window.history.replaceState({}, "", url.pathname + url.search);
      verifySubscriptionPayment(reference)
        .then((r) => { if (!cancelled) setMessage(r.success ? "Payment received. Your subscription is active." : "We could not confirm the payment yet. If you were charged, it will be applied within a few minutes."); })
        .catch(() => { if (!cancelled) setMessage("We could not confirm the payment yet. If you were charged, it will be applied within a few minutes."); })
        .finally(load);
    } else {
      load();
    }
    return () => { cancelled = true; };
  }, []);

  const pay = async () => {
    setPaying(true);
    setMessage("");
    try {
      const { authorizationUrl } = await startSubscriptionCheckout();
      window.location.href = authorizationUrl;
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Could not start the payment. Try again or contact support@wellirecord.com.");
      setPaying(false);
    }
  };

  if (!sub || (sub.state !== "grace" && sub.state !== "suspended")) {
    return message ? <div role="status" className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null;
  }
  const suspended = sub.state === "suspended";

  return (
    <div
      role="alert"
      className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
        suspended ? "border-rose-500/40 bg-rose-500/10 text-rose-200" : "border-amber-500/40 bg-amber-500/10 text-amber-200"
      }`}
    >
      {suspended ? (
        <>
          <b>Your provider profile is suspended.</b> The subscription was not paid within the grace period. It resumes
          automatically once payment is received. Contact support@wellirecord.com if you have already paid.
        </>
      ) : (
        <>
          <b>Your subscription ended on {fmt(sub.periodEnd)}.</b> Renew by {fmt(sub.graceEndsAt)}
          {sub.daysLeft != null ? ` (${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left)` : ""} to avoid suspension.
        </>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" onClick={pay} disabled={paying} className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-900 disabled:opacity-60">
          {paying ? "Opening payment..." : "Pay now"}
        </button>
        {message && <span>{message}</span>}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getMySubscription, type SubscriptionStatus } from "@/shared/api/subscriptionApi";

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

// Shown at the top of the provider area only while the subscription is in its grace period or suspended.
export function SubscriptionBanner() {
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMySubscription().then((s) => { if (!cancelled) setSub(s); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!sub || (sub.state !== "grace" && sub.state !== "suspended")) return null;
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
    </div>
  );
}

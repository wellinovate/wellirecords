import { useEffect, useMemo, useState } from "react";

const TRIAL_DAYS = 21;

type AccessState = {
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  daysRemaining: number;
  hasAccess: boolean;
};

export function useAccess(): AccessState {
  const [isPremium, setIsPremium] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const onboardStatus = localStorage.getItem("welli_onboarded");

    const storedStart = localStorage.getItem("welli_trial_start");
    let startDate: Date;

    if (!storedStart) {
      startDate = new Date();
      if (onboardStatus === "true") {
        localStorage.setItem("welli_trial_start", startDate.toISOString());
      }
    } else {
      startDate = new Date(storedStart);
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const remaining = TRIAL_DAYS - diffDays;

    const safeRemaining = Math.max(0, remaining);
    setDaysRemaining(safeRemaining);
    setHasAccess(isPremium || safeRemaining > 0);
  }, [isPremium]);

  return useMemo(
    () => ({ isPremium, setIsPremium, daysRemaining, hasAccess }),
    [isPremium, daysRemaining, hasAccess]
  );
}

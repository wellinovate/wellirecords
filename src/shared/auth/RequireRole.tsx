import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import { UserRole } from "@/shared/types/types";
import { getCurrentUser } from "../utils/utilityFunction";

const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "support_agent",
  "verification_officer",
  "security_admin",
  "finance_admin",
  "data_governance",
  "admin",
];

interface RequireRoleProps {
  children: React.ReactNode;
  allow:
    | UserRole[]
    | "user"
    | "organization"
    | "provider"
    | "admin"
    | "super_admin"
    | "any";
}

type CurrentUser = {
  accountType: "user" | "organization";
  roles?: UserRole[];
};

export function RequireRole({ children, allow }: RequireRoleProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  //   if (isLoading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center bg-slate-950">
  //         <div className="flex flex-col items-center gap-4">
  //           <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  //           <p className="text-slate-400 text-sm">Loading…</p>
  //         </div>
  //       </div>
  //     );
  //   }

  const userstored = localStorage.getItem("ui_user");
  // console.log("🚀 ~ RequireRole ~ userstored:", userstored)
  const storedUser = userstored ? JSON.parse(userstored) : null;

  if (!user || !storedUser) {
    return <Navigate to="/auth/pre-login" state={{ from: location }} replace />;
  }

  function isPermitted(
    user: CurrentUser | null | undefined,
    allow: "user" | "organization" | "super_admin" | "admin" | UserRole[],
  ): boolean {
    if (!user) return false;

    const role = (user as any).role as UserRole | undefined;

    if (allow === "user") {
      return user.accountType === "user";
    }

    if (allow === "organization") {
      return user.accountType === "organization";
    }

    if (allow === "super_admin") {
      return role === "super_admin" || role === "admin";
    }

    if (allow === "admin") {
      return !!role && ADMIN_ROLES.includes(role);
    }

    if (Array.isArray(allow)) {
      return !!role && allow.includes(role);
    }

    return false;
  }

  const permitted = isPermitted(user, allow);

  if (!permitted) {
    const dest =
      user?.accountType === "organization"
        ? "/provider/overview"
        : "/patient/overview";

    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}





export function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const userstored = localStorage.getItem("ui_user");
  const storedUser = userstored ? JSON.parse(userstored) : null;
  console.log("🚀 ~ PublicOnlyRoute ~ storedUser:", storedUser)
  
  const isAuthenticated = !!user && !!storedUser;
  console.log("🚀 ~ PublicOnlyRoute ~ isAuthenticated:", isAuthenticated)

  if (isAuthenticated) {
    const destination =
      user.accountType === "organization"
        ? "/provider/overview"
        : "/patient/overview";

    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}
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
  console.log("🚀 ~ RequireRole ~ userstored:", userstored)

  if (!user || !userstored) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  function isPermitted(
    user: CurrentUser | null | undefined,
    allow: "user" | "organization" | "super_admin" | "admin" | UserRole[],
  ): boolean {
    if (!user) return false;

    const roles = user.roles ?? user.accountType;

    if (allow === "user") {
      return user.accountType === "user";
    }

    if (allow === "organization") {
      return user.accountType === "organization";
    }

    if (allow === "super_admin") {
      return roles.includes("super_admin");
    }

    if (allow === "admin") {
      return roles.some((role) => ADMIN_ROLES.includes(role));
    }

    if (Array.isArray(allow)) {
      return roles.some((role) => allow.includes(role));
    }

    return false;
  }

  const permitted = isPermitted(user, allow);

  if (!permitted) {
    const roles = user?.roles ?? user.accountType;

    // if (roles.includes("super_admin")) {
    //   return <Navigate to="/super-admin/dashboard" replace />;
    // }

    // if (roles.some((role) => ADMIN_ROLES.includes(role))) {
    //   return <Navigate to="/admin/dashboard" replace />;
    // }

    const dest =
      user?.accountType === "organization"
        ? "/provider/overview"
        : "/patient/overview";

    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}

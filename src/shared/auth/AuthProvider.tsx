import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthUser, UserRole } from "@/shared/types/types";
import { authApi, SearchPatientResponse } from "@/shared/api/authApi";
import axios from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isPatient: boolean;
  isProvider: boolean;
  searchPatientRequest: (
    identifier: string,
    identifierType: IdentifierType,
    signal?: AbortSignal,
  ) => Promise<SearchPatientResponse>;
  linkPatientRequest: (
    patientIdentityId: string,
    id: string,
  ) => Promise<SearchPatientResponse>;
  registerNewPatient: (newPatientForm: any) => string;
  createVitalRecord: (payload: any) => any;
  createMedication: (payload: any) => any;
  signIn: (email: string, password: string) => AuthUser | null;
  signInAsRole: (role: UserRole) => AuthUser;
  signUpPatient: (
    profileType: string,
    fullName: string,
    email: string,
    password: string,
  ) => string | null;
  signUpProvider: (
    profileType: string,
    organizationName: string,
    email: string,
    phone: string,
    country: string,
    password: string,
  ) => string | null;
  signOut: () => void;
};

type IdentifierType = "wrId" | "email" | "phone" | "qr";

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = authApi.getCurrentUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await authApi.signIn(email, password);
    console.log("🚀 ~ signIn ~ u:", res.data.account);
    setUser(res);
    localStorage.setItem(
      "ui_user",
      JSON.stringify({
        id: res.data.account.id,
        accountType: res.data.account.accountType,
      }),
    );
    return res;
  };

  const searchPatientRequest = async (
    identifier: string,
    identifierType: IdentifierType,
    id: string,
    signal?: AbortSignal,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.searchPatientRequest(
      identifier,
      identifierType,
      id,
      signal,
    );
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const linkPatientRequest = async (
    patientIdentityId: string,
    id: string,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.linkPatientRequest(patientIdentityId, id);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const registerNewPatient = async (
    newPatientForm: any,
    id: string,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.registerNewPatient(newPatientForm);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const createVitalRecord = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.createVitalRecord(payload);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };
  const createMedication = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.createMedication(payload);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const signInAsRole = (role: UserRole): AuthUser => {
    const u = authApi.signInAsRole(role);
    setUser(u);
    return u;
  };

  const signUpPatient = async (
    profileType: string,
    fullName: string,
    email: string,
    password: string,
  ) => {
    const u = await authApi.signUpPatient(
      profileType,
      fullName,
      email,
      password,
    );
    console.log("🚀 ~ signUpPatient ~ u:", u);
    return u;
  };

  const signUpProvider = async (
    profileType: string,
    organizationName: string,
    email: string,
    phone: string,
    country: string,
    password: string,
  ) => {
    console.log("🚀 ~ signUpProvider ~ profileType:", profileType);
    const u = await authApi.signUpProvider(
      profileType,
      organizationName,
      email,
      phone,
      country,
      password,
    );
    console.log("🚀 ~ signUpProvider ~ u:", u);
    return u;
  };

  const signOut = () => {
    authApi.signOut();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isPatient: user?.userType === "PATIENT",
      isProvider: user?.userType === "ORG_USER",
      signIn,
      searchPatientRequest,
      createMedication,
      createVitalRecord,
      registerNewPatient,
      linkPatientRequest,
      signInAsRole,
      signUpPatient,
      signUpProvider,
      signOut,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

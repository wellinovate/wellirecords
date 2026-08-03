import { authApi, SearchPatientResponse } from "@/shared/api/authApi";
import { AuthUser, UserRole } from "@/shared/types/types";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getAuthFromToken,
  getCurrentUser,
  logOut,
  fetchProfile,
} from "../utils/utilityFunction";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthContextValue = {
  user: AuthUser | null;
  setUser: AuthUser | null;
  isLoading: boolean;
  isPatient: boolean;
  isProvider: boolean;
  searchPatientRequest: (
    identifier: string,
    identifierType: IdentifierType,
    signal?: AbortSignal,
  ) => Promise<SearchPatientResponse>;
  searchDoctorRequest: (
    identifier: string,
    identifierType: IdentifierType,
    signal?: AbortSignal,
  ) => Promise<SearchPatientResponse>;
  linkPatientRequest: (
    patientIdentityId: string,
    id: string,
  ) => Promise<SearchPatientResponse>;
  addDoctorRequest: (
    doctorIdentityId: string,
  ) => Promise<SearchPatientResponse>;
  registerNewPatient: (newPatientForm: any) => string;
  createVitalRecord: (payload: any) => any;
  createMedication: (payload: any) => any;
  updateProfile: (payload: any) => any;
  uploadAvatar: (file: File) => any;
  createAllergy: (payload: any) => any;
  createDiagnosis: (payload: any) => any;
  createLabResult: (payload: any) => any;
  createEncounter: (payload: any) => any;
  createProcedure: (payload: any) => any;
  signIn: (email: string, password: string) => AuthUser | null;
  verifyLoginCodeApi: (challengeToken: string, code: string) => AuthUser | null;
  resendVerifyLoginCodeApi: (tokenOrEmail: string, email?: string) => any;
  handleGoogleCredentials: (
    response: GoogleCredentialResponse,
  ) => AuthUser | null;
  signInAsRole: (role: UserRole) => AuthUser;
  signUpPatient: (payload: any) => string | null;
  signUpProvider: (payload: any) => string | null;
  signOut: () => void;
};

type IdentifierType = "wrId" | "email" | "phone" | "qr";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // const [user, setUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("ui_user");
    return stored ? JSON.parse(stored) : null;
  });
  // console.log("🚀 ~ AuthProvider ~ user:", user);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const users = getCurrentUser();
    setUser(users);

    if (users) {
      fetchProfile()
        .then((profile) => {
          setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev };
            if (typeof profile?.isVerified !== "undefined") {
              next.isVerified = profile.isVerified;
            }
            // Without this, a page refresh re-derives `user` from the
            // stale name captured at login (see getCurrentUser/ui_user),
            // undoing the updateProfile fix above the moment the tab
            // reloads.
            if (profile?.fullName) {
              next.fullName = profile.fullName;
            }
            return next;
          });
        })
        .catch((err) => {
          console.error("Failed to refresh verification status", err);
        });
    }
    // console.log("🚀 ~ AuthProvider ~ users:", users)
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await authApi.signIn(email, password);

    return res;
  };
  const verifyLoginCodeApi = async (challengeToken: string, code: string) => {
    const res = await authApi.verifyLoginCodeApi(challengeToken, code);

    // setUser(res.data.account + " " + res.data.profile.fullName);
    const { account, profile } = res.data;
    console.log("🚀 ~ signIn ~ account:", account)
    console.log("🚀 ~ signIn ~ profile:", profile)

    // console.log("🚀 ~ verifyLoginCodeApi ~ profile?.fullName:", profile?.fullName)
    setUser({
      ...account,
      fullName: profile?.fullName,
      isVerified: Boolean(account?.isVerified),
      sub: account._id || account.id,
      wrId: profile?.wrId || "",
      wrOrgId: profile?.wrOrgId,
      roles: account?.role ? [account.role] : [],
    });
    localStorage.setItem(
      "ui_user",
      JSON.stringify({
        id: res.data.account.id,
        accountType: res.data.account.accountType,
        role: res.data.account.role,
        roles: res.data.account.role ? [res.data.account.role] : [],
      }),
    );
    const auth = getAuthFromToken(res.data.accessToken);
    return res;
  };

  const resendVerifyLoginCodeApi = async (tokenOrEmail: string, email?: string) => {
    const res = await authApi.resendVerifyLoginCodeApi(tokenOrEmail, email);
    return res;
  };

  const handleGoogleCredentials = async (
    response: GoogleCredentialResponse,
    profileType: string,
  ) => {
    console.log("🚀 ~ handleGoogleCredentials ~ response:", response);
    const res = await authApi.handleGoogleCredentials(response);
    // console.log("🚀 ~ signIn ~ u:", res.data.account);
    setUser({
      ...res.data.account,
      isVerified: Boolean(res.data.account?.isVerified),
      roles: res.data.account?.role ? [res.data.account.role] : [],
    });
    localStorage.setItem(
      "ui_user",
      JSON.stringify({
        id: res.data.account.id,
        accountType: res.data.account.accountType,
        role: res.data.account.role,
        roles: res.data.account.role ? [res.data.account.role] : [],
      }),
    );
    getAuthFromToken(res.data.accessToken);
    return res;
  };

  const searchPatientRequest = async (
    identifier: string,
    identifierType: IdentifierType,
    signal?: AbortSignal,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.searchPatientRequest(
      identifier,
      identifierType,
      signal,
    );
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const searchDoctorRequest = async (
    identifier: string,
    identifierType: IdentifierType,
    signal?: AbortSignal,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.searchDoctorRequest(
      identifier,
      identifierType,
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
    // console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const addDoctorRequest = async (
    doctorIdentityId: string,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.addDoctorRequest(doctorIdentityId);
    // console.log("🚀 ~ signIn ~ u:", res);
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

  const updateProfile = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.updateProfile(payload);
    console.log("🚀 ~ signIn ~ u:", res);

    // Keep the in-memory user (and therefore the "Hello, {name}" greeting
    // in PatientLayout) in sync with whatever the patient just saved.
    // Previously this only updated PatientSettingsPage's local `profile`
    // state, so the greeting stayed stuck on the fullName captured at
    // login until the next sign-in.
    const updatedProfile = res?.data;
    if (updatedProfile?.fullName) {
      setUser((prev) =>
        prev ? { ...prev, fullName: updatedProfile.fullName } : prev,
      );
    }

    return res;
  };

  const uploadAvatar = async (file: File): Promise<SearchPatientResponse> => {
    const res = await authApi.uploadAvatar(file);

    const updatedProfile = res?.data;
    if (updatedProfile?.avatar) {
      setUser((prev) =>
        prev ? { ...prev, avatar: updatedProfile.avatar } : prev,
      );
    }

    return res;
  };

  const createAllergy = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.createAllergy(payload);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const createDiagnosis = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.createDiagnosis(payload);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };
  const createLabResult = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.createLabResult(payload);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const createEncounter = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.createEncounter(payload);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const createProcedure = async (
    payload: any,
  ): Promise<SearchPatientResponse> => {
    const res = await authApi.createProcedure(payload);
    console.log("🚀 ~ signIn ~ u:", res);
    return res;
  };

  const signInAsRole = (role: UserRole): AuthUser => {
    if (!import.meta.env.DEV) {
      throw new Error(
        "signInAsRole is a development-only shortcut and is disabled in production.",
      );
    }
    const u = authApi.signInAsRole(role);
    const verifiedUser = { ...u, isVerified: true };
    setUser(verifiedUser);
    localStorage.setItem(
      "ui_user",
      JSON.stringify({
        id: u.userId,
        accountType: role === "patient" ? "user" : "organization",
        ...verifiedUser,
      }),
    );
    return verifiedUser;
  };

  const signUpPatient = async (payload: any) => {
    const u = await authApi.signUpPatient(payload);
    console.log("🚀 ~ signUpPatient ~ u:", u);
    return u;
  };

  const signUpProvider = async (payload: any) => {
    const u = await authApi.signUpProvider(payload);
    console.log("🚀 ~ signUpProvider ~ u:", u);
    return u;
  };

  const signOut = () => {
    authApi.signOut();
    localStorage.removeItem("ui_user");
    logOut();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setUser,
      isLoading,
      isPatient: user?.userType === "PATIENT",
      isProvider: user?.userType === "ORG_USER",
      signIn,
      verifyLoginCodeApi,
      resendVerifyLoginCodeApi,
      handleGoogleCredentials,
      searchPatientRequest,
      searchDoctorRequest,
      createMedication,
      updateProfile,
      uploadAvatar,
      createAllergy,
      createDiagnosis,
      createLabResult,
      createEncounter,
      createProcedure,
      createVitalRecord,
      registerNewPatient,
      linkPatientRequest,
      addDoctorRequest,
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


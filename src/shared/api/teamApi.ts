import apiClient from './apiClient';

export type MembershipRole =
  | 'provider_admin'
  | 'doctor'
  | 'clinician'
  | 'nurse'
  | 'lab_tech'
  | 'pharmacist'
  | 'frontdesk'
  | 'insurer_agent'
  | 'support_staff';

export interface TeamMember {
  userId: string;
  membershipId: string | null;
  inviteId?: string;
  name: string;
  email: string;
  role: MembershipRole;
  permissions: string[];
  permissionOverrides?: { granted: string[]; revoked: string[] };
  status: 'active' | 'suspended' | 'invited';
  lastActive: string | null;
}

export interface MyMembership {
  membershipId: string;
  organizationId: string;
  role: MembershipRole;
  permissions: string[];
  permissionOverrides: { granted: string[]; revoked: string[] };
}

export interface InviteMemberPayload {
  email: string;
  fullName: string;
  membershipRole: MembershipRole;
}

export interface InviteInfo {
  email: string;
  fullName: string;
  membershipRole: MembershipRole;
}

export interface RoleCatalog {
  organizationType: string | null;
  clinicalScope: string;
  roles: MembershipRole[];
  labelOverrides: Partial<Record<MembershipRole, string>>;
}

export interface PermissionInfo {
  label: string;
  category: string;
}

export interface PermissionCategory {
  key: string;
  label: string;
}

export interface PermissionRegistry {
  categories: PermissionCategory[];
  permissions: Record<string, PermissionInfo>;
  roleDefaults: Record<string, string[]>;
}

export const teamApi = {
  // Which roles this facility can invite, based on its organization
  // type (and clinical scope, for eye-care-only facilities). Drives
  // the role picker in the invite modal and the role filter chips —
  // a diagnostic lab shouldn't see "Nurse" as an option.
  getRoleCatalog: async (): Promise<RoleCatalog> => {
    const res: any = await apiClient.get('/team/role-catalog');
    return res?.data;
  },

  // The full permission key catalog, grouped by category, with
  // labels — used to render the "Access" panel on each member row.
  getPermissionRegistry: async (): Promise<PermissionRegistry> => {
    const res: any = await apiClient.get('/team/permissions');
    return res?.data;
  },

  // Grant or revoke individual permissions for one member, on top of
  // their role's default set. Sending the full desired granted/revoked
  // arrays each time (not a single toggle) keeps the client and server
  // in sync without needing a diff.
  updateMemberPermissions: async (membershipId: string, granted: string[], revoked: string[]) => {
    const res: any = await apiClient.patch(`/team/members/${membershipId}/permissions`, { granted, revoked });
    return res?.data;
  },

  listMembers: async (): Promise<TeamMember[]> => {
    const res: any = await apiClient.get('/team/members');
    return res?.data || [];
  },

  // For a staff member checking their own role/permissions — not
  // admin-only like listMembers, which only returns useful data when
  // the caller owns the organization. Returns null if the caller has
  // no active membership (e.g. they're the org owner, not staff).
  getMyMembership: async (): Promise<MyMembership | null> => {
    const res: any = await apiClient.get('/team/my-membership');
    return res?.data ?? null;
  },

  invite: async (payload: InviteMemberPayload) => {
    const res: any = await apiClient.post('/team/invite', payload);
    return res?.data;
  },

  suspend: async (membershipId: string) => {
    const res: any = await apiClient.patch(`/team/members/${membershipId}/suspend`);
    return res?.data;
  },

  reactivate: async (membershipId: string) => {
    const res: any = await apiClient.patch(`/team/members/${membershipId}/reactivate`);
    return res?.data;
  },

  getInviteByToken: async (token: string): Promise<InviteInfo> => {
    const res: any = await apiClient.get(`/team/invite/${token}`);
    return res?.data;
  },

  acceptInvite: async (token: string, password: string) => {
    const res: any = await apiClient.post(`/team/invite/${token}/accept`, { password });
    return res?.data;
  },
};

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
  status: 'active' | 'suspended' | 'invited';
  lastActive: string | null;
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

export const teamApi = {
  // Which roles this facility can invite, based on its organization
  // type (and clinical scope, for eye-care-only facilities). Drives
  // the role picker in the invite modal and the role filter chips —
  // a diagnostic lab shouldn't see "Nurse" as an option.
  getRoleCatalog: async (): Promise<RoleCatalog> => {
    const res: any = await apiClient.get('/team/role-catalog');
    return res?.data;
  },

  listMembers: async (): Promise<TeamMember[]> => {
    const res: any = await apiClient.get('/team/members');
    return res?.data || [];
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

import apiClient from './apiClient';

export type WaitlistFeature = 'reports' | 'public-health';

export interface JoinWaitlistPayload {
  feature: WaitlistFeature;
  email: string;
}

export interface JoinWaitlistResponse {
  alreadyOnList: boolean;
  joinedAt: string | null;
}

export const waitlistApi = {
  join: async (payload: JoinWaitlistPayload): Promise<JoinWaitlistResponse> => {
    const res: any = await apiClient.post('/waitlist', payload);
    return res?.data;
  },
};

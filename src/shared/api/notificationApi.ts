import apiClient from './apiClient';

export interface AppNotification {
  _id: string;
  type: 'appointment' | 'consent_request' | 'lab_result' | 'team_invite_accepted' | 'critical_alert' | 'system';
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResult {
  items: AppNotification[];
  unreadCount: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface NotificationTemplate {
  _id: string;
  name: string;
  channel: 'sms' | 'email' | 'whatsapp' | 'in_app';
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryChannelStats {
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number | null;
}

export interface DeliverySummary {
  sms: DeliveryChannelStats;
  email: DeliveryChannelStats;
  whatsapp: DeliveryChannelStats;
  in_app: DeliveryChannelStats;
  note: string;
}

export const notificationApi = {
  list: async (page = 1, limit = 20): Promise<NotificationListResult> => {
    const res: any = await apiClient.get('/notifications', { params: { page, limit } });
    return res?.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res: any = await apiClient.get('/notifications/unread-count');
    return res?.data?.unreadCount ?? 0;
  },

  markAsRead: async (notificationId: string) => {
    const res: any = await apiClient.patch(`/notifications/${notificationId}/read`);
    return res?.data;
  },

  markAllAsRead: async () => {
    const res: any = await apiClient.patch('/notifications/read-all');
    return res?.data;
  },

  // ─── Admin: templates ───────────────────────────────────────────────────
  getTemplates: async (channel?: NotificationTemplate['channel']): Promise<NotificationTemplate[]> => {
    const res: any = await apiClient.get('/notifications/templates', { params: channel ? { channel } : {} });
    return res?.data || [];
  },

  toggleTemplate: async (templateId: string): Promise<NotificationTemplate> => {
    const res: any = await apiClient.patch(`/notifications/templates/${templateId}/toggle`);
    return res?.data;
  },

  getDeliverySummary: async (): Promise<DeliverySummary> => {
    const res: any = await apiClient.get('/notifications/delivery-summary');
    // Backend nests real numbers under last30Days; flattened here since
    // that's the shape NotificationTemplatesPage.tsx already reads
    // (delivery[channel].deliveryRate, not delivery.last30Days[channel]...).
    const data = res?.data;
    return { ...data?.last30Days, note: data?.note };
  },
};

export async function sendCriticalAlertSms(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post('/notifications/critical-alert-sms', { phoneNumber, message });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.response?.data?.message || err?.message || 'SMS send failed' };
  }
}

// NotificationBell.tsx imports this exact name (plural) with these
// exact method names — kept separate from notificationApi (singular,
// used by the admin templates page) rather than forcing one shape to
// serve two different, already-written consumers.
export const notificationsApi = {
  unreadCount: async (): Promise<number> => notificationApi.getUnreadCount(),
  list: (page = 1, limit = 20) => notificationApi.list(page, limit),
  markAsRead: (notificationId: string) => notificationApi.markAsRead(notificationId),
  markAllAsRead: () => notificationApi.markAllAsRead(),
};

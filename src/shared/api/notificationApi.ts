import { NotificationTemplate } from '@/shared/types/types';

// ─── Templates ────────────────────────────────────────────────────────────────

export const MOCK_TEMPLATES: NotificationTemplate[] = [
    {
        id: 'tmpl_001', name: 'OTP Verification', channel: 'sms',
        body: 'Your WelliRecord verification code is {{otp}}. Valid for 10 minutes. Do not share with anyone.',
        variables: ['otp'], isActive: true,
        lastModifiedAt: '2026-01-15T10:00:00Z', lastModifiedBy: 'admin_001',
    },
    {
        id: 'tmpl_002', name: 'Consent Request Notification', channel: 'sms',
        body: '{{provider_name}} from {{org_name}} has requested access to your WelliRecord. Log in to approve or decline: {{link}}',
        variables: ['provider_name', 'org_name', 'link'], isActive: true,
        lastModifiedAt: '2026-01-20T10:00:00Z', lastModifiedBy: 'admin_001',
    },
    {
        id: 'tmpl_003', name: 'Welcome Email', channel: 'email',
        subject: 'Welcome to WelliRecord — Your Health Vault is Ready',
        body: 'Hi {{name}},\n\nWelcome to WelliRecord. Your secure personal health vault has been created.\n\nYou can now start uploading records, granting provider access, and viewing your health history — all in one place.\n\n{{cta_link}}\n\nYour health, secured. Everywhere.\nThe WelliRecord Team',
        variables: ['name', 'cta_link'], isActive: true,
        lastModifiedAt: '2026-01-10T10:00:00Z', lastModifiedBy: 'admin_001',
    },
    {
        id: 'tmpl_004', name: 'Appointment Reminder', channel: 'whatsapp',
        body: '👋 Hi {{patient_name}}, this is a reminder that you have an appointment with *{{provider_name}}* at *{{org_name}}* on *{{date}}* at *{{time}}*.\n\nReply CONFIRM to confirm or CANCEL to cancel.',
        variables: ['patient_name', 'provider_name', 'org_name', 'date', 'time'], isActive: true,
        lastModifiedAt: '2026-02-01T10:00:00Z', lastModifiedBy: 'admin_001',
    },
    {
        id: 'tmpl_005', name: 'Lab Result Ready', channel: 'sms',
        body: 'Your lab results from {{org_name}} are now available in your WelliRecord. Log in to view: {{link}}',
        variables: ['org_name', 'link'], isActive: true,
        lastModifiedAt: '2026-02-05T10:00:00Z', lastModifiedBy: 'admin_001',
    },
    {
        id: 'tmpl_006', name: 'Invoice Due Reminder', channel: 'email',
        subject: 'WelliRecord Invoice {{invoice_id}} is Due',
        body: 'Hi {{name}},\n\nYour invoice for *{{plan_name}}* ({{invoice_id}}) of ₦{{amount}} is due by {{due_date}}.\n\nPay now: {{payment_link}}\n\nQuestions? Reply to this email.',
        variables: ['name', 'plan_name', 'invoice_id', 'amount', 'due_date', 'payment_link'], isActive: true,
        lastModifiedAt: '2026-02-10T10:00:00Z', lastModifiedBy: 'admin_001',
    },
    {
        id: 'tmpl_007', name: 'System Maintenance Broadcast', channel: 'in_app',
        body: '🔧 WelliRecord will undergo scheduled maintenance on {{date}} from {{start_time}} to {{end_time}} WAT. Services may be briefly unavailable during this window.',
        variables: ['date', 'start_time', 'end_time'], isActive: false,
        lastModifiedAt: '2026-02-15T10:00:00Z', lastModifiedBy: 'admin_001',
    },
];

// ─── Delivery reports (mock) ──────────────────────────────────────────────────

export const MOCK_DELIVERY_SUMMARY = {
    last30Days: {
        sms: { sent: 14820, delivered: 14231, failed: 589, deliveryRate: 96.0 },
        email: { sent: 3241, delivered: 3108, failed: 133, deliveryRate: 95.9 },
        whatsapp: { sent: 2190, delivered: 2144, failed: 46, deliveryRate: 97.9 },
        in_app: { sent: 8870, delivered: 8870, failed: 0, deliveryRate: 100 },
    },
    optOutCount: 312,
};

// ─── notificationApi ──────────────────────────────────────────────────────────

export const notificationApi = {
    getTemplates(channel?: NotificationTemplate['channel']): NotificationTemplate[] {
        if (channel) return MOCK_TEMPLATES.filter(t => t.channel === channel);
        return MOCK_TEMPLATES;
    },
    getTemplateById(id: string): NotificationTemplate | undefined {
        return MOCK_TEMPLATES.find(t => t.id === id);
    },
    toggleTemplate(id: string): NotificationTemplate | undefined {
        const t = MOCK_TEMPLATES.find(t => t.id === id);
        if (t) t.isActive = !t.isActive;
        return t;
    },
    getDeliverySummary() {
        return MOCK_DELIVERY_SUMMARY;
    },
};

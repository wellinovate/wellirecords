export type TicketPriority = 'P1' | 'P2' | 'P3';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
export type TicketCategory = 'records_issue' | 'access_issue' | 'billing' | 'sync_issue' | 'integration' | 'other';

export interface SupportTicket {
    id: string;
    ref: string;
    priority: TicketPriority;
    status: TicketStatus;
    category: TicketCategory;
    userType: 'patient' | 'provider';
    submittedBy: string;
    facility?: string;
    subject: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    assignee?: string;
    slaDeadline: string;
    messages: TicketMessage[];
    internalNotes: string[];
}

export interface TicketMessage {
    id: string;
    sender: 'user' | 'support';
    senderName: string;
    body: string;
    sentAt: string;
}

export interface TroubleshootingData {
    userActivity: { action: string; at: string; detail: string }[];
    consentLogs: { event: string; at: string; provider: string }[];
    syncStatus: { category: string; lastSync: string; status: 'ok' | 'stale' | 'error' }[];
    deviceHistory: { device: string; location: string; lastSeen: string; current: boolean }[];
}

const SLA_HOURS: Record<TicketPriority, number> = { P1: 4, P2: 24, P3: 72 };

function makeDeadline(createdAt: string, priority: TicketPriority): string {
    const d = new Date(createdAt);
    d.setHours(d.getHours() + SLA_HOURS[priority]);
    return d.toISOString();
}

const MOCK_TICKETS: SupportTicket[] = [
    {
        id: 't001', ref: 'WR-T-001', priority: 'P1', status: 'open', category: 'access_issue',
        userType: 'patient', submittedBy: 'Amara Okafor', subject: "Can't access my health vault",
        description: "I logged in but my records tab shows 'No records found'. I had 14 records last week.",
        createdAt: '2026-03-03T14:00:00Z', updatedAt: '2026-03-03T14:00:00Z',
        slaDeadline: makeDeadline('2026-03-03T14:00:00Z', 'P1'),
        assignee: 'Chidi (Support)',
        messages: [
            { id: 'm001', sender: 'user', senderName: 'Amara Okafor', body: "I logged in but my records tab shows 'No records found'. I had 14 records last week.", sentAt: '2026-03-03T14:00:00Z' },
            { id: 'm002', sender: 'support', senderName: 'Chidi (Support)', body: "Thanks Amara. We can see your account. Can you confirm if you recently changed devices or updated your browser?", sentAt: '2026-03-03T14:15:00Z' },
        ],
        internalNotes: ['WelliChain sync shows records present but consent token may be expired. Check last sync timestamp.'],
    },
    {
        id: 't002', ref: 'WR-T-002', priority: 'P2', status: 'in_progress', category: 'sync_issue',
        userType: 'provider', submittedBy: 'Dr. Emeka Okonkwo', facility: 'Reddington Hospital',
        subject: 'Lab results not syncing from CityLab',
        description: "Ordered labs on 28 Feb. Patient came for follow-up today and results still not visible in EHR.",
        createdAt: '2026-03-03T10:30:00Z', updatedAt: '2026-03-03T12:00:00Z',
        slaDeadline: makeDeadline('2026-03-03T10:30:00Z', 'P2'),
        assignee: 'Fatima (Support)',
        messages: [
            { id: 'm003', sender: 'user', senderName: 'Dr. Emeka Okonkwo', body: "Lab results still not showing after 3 days.", sentAt: '2026-03-03T10:30:00Z' },
            { id: 'm004', sender: 'support', senderName: 'Fatima (Support)', body: "Hi Dr. Okonkwo. We're looking into the CityLab sync pipeline now. We'll update you within the hour.", sentAt: '2026-03-03T11:00:00Z' },
        ],
        internalNotes: ['Sync job for CityLab partition failed at 01:44 UTC. Queued for re-run. Escalate to infra if not resolved in 2h.'],
    },
    {
        id: 't003', ref: 'WR-T-003', priority: 'P3', status: 'open', category: 'billing',
        userType: 'patient', submittedBy: 'Ibrahim Musa',
        subject: 'Charged twice for premium plan',
        description: "I see two debit alerts of ₦5,000 from 1st March. Need a refund for one.",
        createdAt: '2026-03-02T09:00:00Z', updatedAt: '2026-03-02T09:00:00Z',
        slaDeadline: makeDeadline('2026-03-02T09:00:00Z', 'P3'),
        messages: [
            { id: 'm005', sender: 'user', senderName: 'Ibrahim Musa', body: "I see two debit alerts of ₦5,000 from 1st March. Need a refund.", sentAt: '2026-03-02T09:00:00Z' },
        ],
        internalNotes: [],
    },
    {
        id: 't004', ref: 'WR-T-004', priority: 'P2', status: 'escalated', category: 'records_issue',
        userType: 'patient', submittedBy: 'Ngozi Adewale',
        subject: 'Wrong blood type on emergency card',
        description: "My emergency card shows B+ but I am O+. This is dangerous. Please fix immediately.",
        createdAt: '2026-03-01T16:20:00Z', updatedAt: '2026-03-03T08:45:00Z',
        slaDeadline: makeDeadline('2026-03-01T16:20:00Z', 'P2'),
        assignee: 'Chidi (Support)',
        messages: [
            { id: 'm006', sender: 'user', senderName: 'Ngozi Adewale', body: "My emergency card shows B+ but I am O+. This is dangerous.", sentAt: '2026-03-01T16:20:00Z' },
            { id: 'm007', sender: 'support', senderName: 'Chidi (Support)', body: "Ngozi this is very important. We are escalating this to our clinical data team right now.", sentAt: '2026-03-01T16:30:00Z' },
        ],
        internalNotes: ['Escalated to clinical governance. Source record from Lagos General shows B+. Patient needs to confirm with lab.'],
    },
    {
        id: 't005', ref: 'WR-T-005', priority: 'P3', status: 'resolved', category: 'integration',
        userType: 'provider', submittedBy: 'CityLab Admin', facility: 'CityLab Diagnostics',
        subject: 'API key expired — results not uploading',
        description: "Our integration stopped working on Feb 28. API responds 401.",
        createdAt: '2026-02-28T07:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
        slaDeadline: makeDeadline('2026-02-28T07:00:00Z', 'P3'),
        assignee: 'Fatima (Support)',
        messages: [
            { id: 'm008', sender: 'user', senderName: 'CityLab Admin', body: "API key expired. Can we get a new one?", sentAt: '2026-02-28T07:00:00Z' },
            { id: 'm009', sender: 'support', senderName: 'Fatima (Support)', body: "New API key generated and sent to your registered email. Please test and confirm.", sentAt: '2026-03-01T10:00:00Z' },
        ],
        internalNotes: ['API key rotation completed. Updated key expiry to 12 months.'],
    },
];

const MOCK_TROUBLESHOOTING: Record<string, TroubleshootingData> = {
    t001: {
        userActivity: [
            { action: 'Login', at: '2026-03-03T14:02:00Z', detail: 'Via web · Chrome 121 · Lagos, Nigeria' },
            { action: 'Viewed Vault', at: '2026-03-03T14:03:00Z', detail: 'No records returned — token validation failed' },
            { action: 'Refreshed page', at: '2026-03-03T14:04:00Z', detail: '' },
            { action: 'Submitted support ticket', at: '2026-03-03T14:00:00Z', detail: 'Ticket WR-T-001 created' },
        ],
        consentLogs: [
            { event: 'Consent revoked', at: '2026-03-01T09:00:00Z', provider: 'Lagos General Hospital' },
            { event: 'Consent granted', at: '2026-02-15T10:30:00Z', provider: 'CityLab Diagnostics' },
        ],
        syncStatus: [
            { category: 'Lab Results', lastSync: '2026-03-03T01:44:00Z', status: 'error' },
            { category: 'Prescriptions', lastSync: '2026-03-03T06:00:00Z', status: 'ok' },
            { category: 'Appointments', lastSync: '2026-03-03T07:00:00Z', status: 'ok' },
            { category: 'Vitals', lastSync: '2026-03-01T12:00:00Z', status: 'stale' },
        ],
        deviceHistory: [
            { device: 'Chrome — MacOS', location: 'Lagos, Nigeria', lastSeen: '2026-03-03T14:02:00Z', current: true },
            { device: 'WelliRecord iOS App', location: 'Lagos, Nigeria', lastSeen: '2026-03-02T20:00:00Z', current: false },
        ],
    },
};

const RESOLUTION_TEMPLATES = [
    { id: 'rt1', name: 'Record Access Restored', body: "Hi {{name}}, we've resolved the access issue with your health vault. Please refresh and log in again. Your records should be fully visible now." },
    { id: 'rt2', name: 'Billing Refund Initiated', body: "Hi {{name}}, we've confirmed the duplicate charge. A refund of ₦{{amount}} has been initiated and should appear within 3-5 business days." },
    { id: 'rt3', name: 'Sync Issue Resolved', body: "Hi {{name}}, the sync issue between your provider and WelliRecord has been resolved. All records should now be up to date." },
    { id: 'rt4', name: 'API Key Regenerated', body: "Hi, your new API credentials have been sent to your registered email. Please update your integration and test. Let us know if you need any help." },
    { id: 'rt5', name: 'Escalate to Clinical Team', body: "Hi {{name}}, we've escalated your case to our clinical data governance team. They will contact you within 24 hours." },
];

export const supportApi = {
    getTickets: (filter?: { status?: TicketStatus; userType?: 'patient' | 'provider' }) => {
        return MOCK_TICKETS.filter(t =>
            (!filter?.status || t.status === filter.status) &&
            (!filter?.userType || t.userType === filter.userType)
        );
    },
    getTicketById: (id: string) => MOCK_TICKETS.find(t => t.id === id) ?? null,
    getTroubleshootingData: (ticketId: string): TroubleshootingData => {
        return MOCK_TROUBLESHOOTING[ticketId] ?? {
            userActivity: [],
            consentLogs: [],
            syncStatus: [],
            deviceHistory: [],
        };
    },
    getResolutionTemplates: () => RESOLUTION_TEMPLATES,
    getSLAHours: () => SLA_HOURS,
};

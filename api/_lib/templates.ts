export interface EmailTemplate {
  subject: string;
  html: string;
}

function getBaseLayout(title: string, category: string, bodyContent: string, footerLinks: string = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F6F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9; padding:32px 0;">
<tr>
<td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-radius:8px; overflow:hidden; border:1px solid #E2E6EC;">

<!-- Header -->
<tr>
<td style="background-color:#0A1F44; padding:28px 32px;">
<span style="color:#FFFFFF; font-size:20px; font-weight:600; letter-spacing:0.3px;">WelliRecord™</span>
</td>
</tr>

<!-- Category tag -->
<tr>
<td style="padding:24px 32px 0 32px;">
<span style="display:inline-block; background-color:#EAF0FB; color:#0A1F44; font-size:13px; font-weight:600; padding:6px 12px; border-radius:4px;">${category}</span>
</td>
</tr>

<!-- Body and Content -->
<tr>
<td style="padding:16px 32px 28px 32px;">
${bodyContent}
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 32px;">
<div style="border-top:1px solid #E2E6EC;"></div>
</td>
</tr>

<!-- Global Email Footer -->
<tr>
<td style="padding:24px 32px 8px 32px;">
<p style="margin:0; font-size:13px; font-weight:600; color:#0A1F44;">WelliRecord™</p>
<p style="margin:4px 0 0 0; font-size:12px; color:#6B7280;">One patient. One trusted record. Accessible when it matters.</p>
</td>
</tr>
<tr>
<td style="padding:8px 32px 0 32px;">
<p style="margin:0; font-size:11px; color:#8A93A3; line-height:1.7;">
Secure &nbsp;·&nbsp; Patient-Owned &nbsp;·&nbsp; Consent-Driven &nbsp;·&nbsp; Interoperable
</p>
</td>
</tr>
<tr>
<td style="padding:16px 32px 28px 32px;">
${footerLinks}
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function getStandardFooterLinks(vars: Record<string, string>) {
  return `
<a href="${vars.dashboardUrl || 'https://www.wellirecord.com/dashboard'}" style="color:#0A1F44; font-size:12px; text-decoration:underline; margin-right:16px;">View Dashboard</a>
<a href="${vars.privacyPolicyUrl || 'https://www.wellirecord.com/privacy'}" style="color:#0A1F44; font-size:12px; text-decoration:underline; margin-right:16px;">Privacy Policy</a>
<a href="${vars.contactSupportUrl || 'https://www.wellirecord.com/support'}" style="color:#0A1F44; font-size:12px; text-decoration:underline;">Contact Support</a>
`;
}

export const TEMPLATES: Record<string, (vars: Record<string, string>) => EmailTemplate> = {
  'record-accessed': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Your health record was accessed</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hi ${vars.patientName || 'there'}, this is a record of who accessed your WelliRecord health information and why.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Facility</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.facilityName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Provider</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.providerName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Provider role</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.providerRole || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Record accessed</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.recordType || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Date and time</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accessDateTime || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Reason for access</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accessReason || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Access duration</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accessDuration || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Access location</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accessLocation || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Consent reference</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">${vars.consentReferenceId || ''}</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="padding-right:12px;">
<a href="${vars.viewAccessLogUrl || 'https://www.wellirecord.com/security'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">View access log</a>
</td>
<td>
<a href="${vars.reportUnauthorizedUrl || 'https://www.wellirecord.com/security#report'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Report unauthorized access</a>
</td>
</tr>
</table>
`;
    return {
      subject: '🔐 Your WelliRecord™ Health Record Was Accessed',
      html: getBaseLayout('Your health record was accessed', 'RECORD ACCESSED', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'patient-welcome': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Welcome to WelliRecord™</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hi ${vars.patientName || 'there'}, thank you for signing up. Your secure personal health vault is officially ready.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Patient ID</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.patientId || 'Pending'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Account Created</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accountCreationDate || new Date().toLocaleDateString()}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Security Level</td>
<td style="padding:12px 16px; font-size:13px; color:#10B981; font-weight:600;">AES-256 Encrypted</td>
</tr>
</table>
<p style="margin:0 0 12px 0; font-size:13px; font-weight:600; color:#0A1F44;">Finish setting up your account</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td style="padding-right:12px; padding-bottom:12px;">
<a href="${vars.verifyEmailUrl || 'https://www.wellirecord.com/verify'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">Verify Email</a>
</td>
<td style="padding-bottom:12px;">
<a href="${vars.completeProfileUrl || 'https://www.wellirecord.com/profile'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Complete Profile</a>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td style="padding-right:12px; padding-bottom:12px;">
<a href="${vars.addEmergencyContactUrl || 'https://www.wellirecord.com/profile/emergency-contact'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Add Emergency Contact</a>
</td>
<td style="padding-bottom:12px;">
<a href="${vars.uploadRecordsUrl || 'https://www.wellirecord.com/records/upload'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Upload Existing Records</a>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="padding-right:12px;">
<a href="${vars.downloadAppUrl || 'https://www.wellirecord.com/app'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Download Mobile App</a>
</td>
<td>
<a href="${vars.securityOverviewUrl || 'https://www.wellirecord.com/security'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Security & Privacy Overview</a>
</td>
</tr>
</table>
`;
    return {
      subject: 'Welcome to WelliRecord™ — Own Your Complete Medical History',
      html: getBaseLayout('Welcome to WelliRecord™', 'WELCOME PATIENT', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'provider-welcome': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Welcome to the Provider Network</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hi ${vars.providerName || 'Doctor'}, you have been registered as an authorized healthcare practitioner for ${vars.facilityName || 'your facility'}.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Organization ID</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.organizationId || 'Pending'}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Verification Status</td>
<td style="padding:12px 16px; font-size:13px; color:#F59E0B; font-weight:600;">Pending Credentials Review</td>
</tr>
</table>
<p style="margin:0 0 12px 0; font-size:13px; font-weight:600; color:#0A1F44;">Set up your practice</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td style="padding-right:12px; padding-bottom:12px;">
<a href="${vars.completeOrgProfileUrl || 'https://www.wellirecord.com/provider/organization'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">Complete Organization Profile</a>
</td>
<td style="padding-bottom:12px;">
<a href="${vars.inviteTeamUrl || 'https://www.wellirecord.com/provider/team/invite'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Invite Team Members</a>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td style="padding-right:12px; padding-bottom:12px;">
<a href="${vars.configurePermissionsUrl || 'https://www.wellirecord.com/provider/permissions'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Configure Permissions</a>
</td>
<td style="padding-bottom:12px;">
<a href="${vars.connectEmrUrl || 'https://www.wellirecord.com/provider/integrations'}" style="display:inline-block; background-color:#FFFFFF; color:#0A1F44; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #0A1F44;">Connect Existing EMR</a>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td>
<a href="${vars.providerDashboardUrl || 'https://www.wellirecord.com/provider/dashboard'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">Access Provider Dashboard</a>
</td>
</tr>
</table>
`;
    return {
      subject: 'Welcome to WelliRecord™ Provider Network',
      html: getBaseLayout('Welcome to WelliRecord™ Provider Network', 'WELCOME PROVIDER', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'patient-activity-summary': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Your Health Vault Activity Summary</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hi ${vars.patientName || 'there'}, here is the recent activity summary for your WelliRecord vault.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:56%;">New Records Added</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.newRecordsCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">New Lab Results</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.newLabsCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Prescriptions Updated</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.prescriptionsUpdatedCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Immunizations Added</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.immunizationsAddedCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Upcoming Appointments</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.upcomingAppointmentsCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Recently Accessed Facilities</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.recentFacilitiesAccessed || 'None'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Pending Access Requests</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#EF4444; font-weight:600;">${vars.pendingRequestsCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Security Alerts</td>
<td style="padding:12px 16px; font-size:13px; color:#EF4444; font-weight:600;">${vars.securityAlertsCount || '0'}</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td>
<a href="${vars.dashboardUrl || 'https://www.wellirecord.com/dashboard'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">View Dashboard</a>
</td>
</tr>
</table>
`;
    return {
      subject: 'Your Health Activity Summary on WelliRecord™',
      html: getBaseLayout('Your Health Activity Summary', 'PATIENT ACTIVITY', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'provider-activity-summary': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Practice Summary Report</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hi ${vars.providerName || 'Doctor'}, here is your practice snapshot for ${vars.facilityName || 'your facility'}.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:56%;">New Patients Added</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.newPatientsCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Records Updated</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.recordsUpdatedCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Pending Consent Requests</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#EF4444; font-weight:600;">${vars.pendingConsentRequestsCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Appointments Managed</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.appointmentsManagedCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Outstanding Tasks</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#F59E0B; font-weight:600;">${vars.outstandingTasksCount || '0'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Team Activity</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.teamActivitySummary || 'No new activity'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Integration Status</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.integrationStatus || 'Not Connected'}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Billing / Subscription Status</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">${vars.billingStatus || 'Active'}</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td>
<a href="${vars.providerDashboardUrl || 'https://www.wellirecord.com/provider/dashboard'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">View Dashboard</a>
</td>
</tr>
</table>
`;
    return {
      subject: 'Your WelliRecord™ Practice Summary',
      html: getBaseLayout('Practice Summary', 'PROVIDER ACTIVITY', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'consent-request': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Access Request Pending Approval</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hello ${vars.patientName || 'there'},<br/><br/>
${vars.providerName || 'A provider'} from ${vars.facilityName || 'a healthcare facility'} has requested access to portions of your WelliRecord™ health record.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Provider</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.providerName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Facility</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.facilityName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Role</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.providerRole || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Purpose</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accessPurpose || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Records Requested</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.recordCategories || 'All Records'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Requested Duration</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.duration || 'Temporary'}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Request Date</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">${vars.requestDate || ''}</td>
</tr>
</table>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
You remain in full control of your medical information. Please review this request and choose whether to grant or deny access.
</p>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td>
<a href="${vars.reviewRequestUrl || 'https://www.wellirecord.com/consent'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">Review Request</a>
</td>
</tr>
</table>
<p style="margin:20px 0 0 0; font-size:13px; color:#6B7280;">
If you do not recognize this request, no action is required.
</p>
`;
    return {
      subject: '🔒 Action Required: Access Request for Your Health Records',
      html: getBaseLayout('Access Request Pending', 'CONSENT REQUEST', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'provider-access-revoked': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Access Authorization Revoked</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hello ${vars.patientName || 'there'},<br/><br/>
This is a confirmation that access previously granted to ${vars.providerName || ''} at ${vars.facilityName || ''} has been successfully revoked.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Provider</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.providerName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Facility</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.facilityName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Access Type</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accessType || 'Health Record Access'}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Revoked On</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.revokedDate || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Revoked By</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">You</td>
</tr>
</table>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
The provider will no longer be able to access the records covered under this consent authorization. You can review all active and historical permissions from your Data Sovereignty Center.
</p>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td>
<a href="${vars.viewAccessHistoryUrl || 'https://www.wellirecord.com/security'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">View Access History</a>
</td>
</tr>
</table>
`;
    return {
      subject: '🛡️ Access to Your Records Has Been Revoked',
      html: getBaseLayout('Access Authorization Revoked', 'ACCESS REVOKED', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'provider-access-revoked-provider': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Access Authorization Revoked</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hello ${vars.providerName || 'Doctor'},<br/><br/>
Please note that patient ${vars.patientName || 'a patient'} has revoked your authorization to access their WelliRecord™ health records.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Patient</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.patientName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Facility</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.facilityName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Revoked On</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">${vars.revokedDate || ''}</td>
</tr>
</table>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Future access requests must be approved directly by the patient. Thank you for respecting patient privacy and consent.
</p>
`;
    return {
      subject: 'Access Authorization Revoked',
      html: getBaseLayout('Access Authorization Revoked', 'ACCESS REVOKED', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'lab-result-available': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">New Lab Results Are Available</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hello ${vars.patientName || 'there'},<br/><br/>
New laboratory results have been added to your WelliRecord™ account.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Facility</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.facilityName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Test Name</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.testName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Ordered By</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.providerName || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Result Date</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">${vars.resultDate || ''}</td>
</tr>
</table>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
You may securely review your results and share them with healthcare providers as needed.
</p>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td>
<a href="${vars.viewResultsUrl || 'https://www.wellirecord.com/dashboard/lab-results'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">View Results</a>
</td>
</tr>
</table>
<p style="margin:20px 0 0 0; font-size:13px; color:#6B7280;">
If you have questions regarding these findings, please contact your healthcare provider.
</p>
`;
    return {
      subject: '🧪 New Lab Results Are Available',
      html: getBaseLayout('New Lab Results', 'LAB RESULTS', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'travelpass-access': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Your TravelPass™ Has Been Created</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hello ${vars.patientName || 'there'},<br/><br/>
Your WelliRecord™ TravelPass™ has been successfully generated.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">TravelPass ID</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.travelPassId || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Generated On</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.generatedDate || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Expires On</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#EF4444; font-weight:600;">${vars.expiryDate || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Shared Records</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.sharedCategories || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Access Scope</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">${vars.accessScope || ''}</td>
</tr>
</table>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
The QR code and secure access link are now available in your WelliRecord™ account. Only authorized individuals can access the information included in this TravelPass™ during its active period.
</p>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="padding-right:12px;">
<a href="${vars.viewPassUrl || 'https://www.wellirecord.com/travelpass'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">View TravelPass</a>
</td>
<td>
<a href="${vars.revokePassUrl || 'https://www.wellirecord.com/travelpass/revoke'}" style="display:inline-block; background-color:#FFFFFF; color:#EF4444; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #EF4444;">Revoke TravelPass</a>
</td>
</tr>
</table>
`;
    return {
      subject: '✈️ Your TravelPass™ Has Been Created',
      html: getBaseLayout('TravelPass Generated', 'TRAVELPASS CREATED', bodyContent, getStandardFooterLinks(vars))
    };
  },
  'security-alert': (vars) => {
    const bodyContent = `
<h1 style="margin:0 0 12px 0; font-size:20px; color:#0A1F44;">Security Settings Updated</h1>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
Hello ${vars.patientName || 'there'},<br/><br/>
A security-related change was made to your WelliRecord™ account.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E6EC; border-radius:6px; margin-bottom:24px;">
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280; width:44%;">Security Event</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.eventType || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Date & Time</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.eventDate || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#6B7280;">Device</td>
<td style="padding:12px 16px; border-bottom:1px solid #E2E6EC; font-size:13px; color:#0A1F44; font-weight:600;">${vars.deviceInfo || ''}</td>
</tr>
<tr>
<td style="padding:12px 16px; font-size:13px; color:#6B7280;">Location</td>
<td style="padding:12px 16px; font-size:13px; color:#0A1F44; font-weight:600;">${vars.location || ''}</td>
</tr>
</table>
<p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#3A3F4B;">
If you made this change, no action is required.<br/><br/>
If you do not recognize this activity, please secure your account immediately.
</p>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="padding-right:12px;">
<a href="${vars.reviewActivityUrl || 'https://www.wellirecord.com/security'}" style="display:inline-block; background-color:#0A1F44; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px;">Review Security Activity</a>
</td>
<td>
<a href="${vars.secureAccountUrl || 'https://www.wellirecord.com/security'}" style="display:inline-block; background-color:#FFFFFF; color:#EF4444; font-size:14px; font-weight:600; text-decoration:none; padding:12px 20px; border-radius:6px; border:1px solid #EF4444;">Secure My Account</a>
</td>
</tr>
</table>
`;
    return {
      subject: '🚨 Security Settings Updated',
      html: getBaseLayout('Security Settings Updated', 'SECURITY ALERT', bodyContent, getStandardFooterLinks(vars))
    };
  }
};

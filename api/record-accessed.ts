import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, patientName, facilityName, recordType } = req.body;

  try {
    await resend.emails.send({
      from: 'WelliRecord Alerts <alerts@send.wellirecord.com>',
      to,
      subject: 'Your health record was accessed',
      html: `
        <p>Hi ${patientName},</p>
        <p><strong>${facilityName}</strong> accessed your <strong>${recordType}</strong> record.</p>
        <p>If you did not authorize this, <a href="https://www.wellirecord.com/security">review your access log here</a>.</p>
        <p>— WelliRecord</p>
      `,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email', detail: String(error) });
  }
}

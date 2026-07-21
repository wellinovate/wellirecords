import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { TEMPLATES } from './_lib/templates.js';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, templateId, variables } = req.body;

  if (!to || !templateId) {
    return res.status(400).json({ error: 'Missing required parameters: to, templateId' });
  }

  const templateFn = TEMPLATES[templateId];
  if (!templateFn) {
    return res.status(400).json({ error: `Template not found: ${templateId}` });
  }

  try {
    const { subject, html } = templateFn(variables || {});

    const response = await resend.emails.send({
      from: 'WelliRecord Alerts <alerts@send.wellirecord.com>',
      to,
      subject,
      html,
    });

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email', detail: String(error) });
  }
}

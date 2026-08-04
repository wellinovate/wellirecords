import type { VercelRequest, VercelResponse } from '@vercel/node';

const TERMII_BASE_URL = 'https://api.ng.termii.com/api/sms/send';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, ''); // strip spaces, dashes, etc.
  if (digits.startsWith('0')) {
    return '234' + digits.slice(1); // 0802... -> 234802...
  }
  if (digits.startsWith('234')) {
    return digits;
  }
  return digits;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { to, message, type } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, error: 'Missing "to" or "message"' });
  }

  const normalizedTo = normalizePhone(to);

  try {
    const response = await fetch(TERMII_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: normalizedTo,
        from: 'N-Alert',
        sms: message,
        type: 'plain',
        channel: 'dnd',
        api_key: process.env.TERMII_API_KEY,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 'ok') {
      console.error('Termii send failed:', data);
      return res.status(502).json({
        success: false,
        error: data.message || 'SMS provider rejected the request',
        details: data,
      });
    }

    return res.status(200).json({ success: true, messageId: data.message_id });
  } catch (err: any) {
    console.error('SMS send error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send SMS' });
  }
}

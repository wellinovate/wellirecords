import express from 'express';
import ChatIntent from '../models/chatIntent.model.js';

const router = express.Router();

function resolveAudience(req) {
  if (req.user?.role === 'staff') return 'provider';
  return 'patient';
}

router.post('/chatbot/open', async (req, res) => {
  const audience = resolveAudience(req);
  const rootKey = audience === 'provider' ? 'provider_start_over' : 'start_over';

  try {
    const root = await ChatIntent.findOne({ intentKey: rootKey, audience });
    if (root) {
      return res.json({ message: root.message, options: root.options, audience: root.audience });
    }
  } catch (err) {
    console.error('[Chatbot Open Error]', err);
  }

  return res.status(503).json({
    message: "I'm having trouble connecting right now. Please try again shortly.",
    options: [],
    audience,
  });
});

router.post('/chatbot/respond', async (req, res) => {
  const { intentKey } = req.body || {};
  const audience = resolveAudience(req);
  const rootKey = audience === 'provider' ? 'provider_start_over' : 'start_over';

  try {
    const flow = await ChatIntent.findOne({ intentKey: intentKey || rootKey });
    if (flow) {
      return res.json({ message: flow.message, options: flow.options, audience: flow.audience });
    }
    const root = await ChatIntent.findOne({ intentKey: rootKey, audience });
    if (root) {
      return res.json({ message: "I did not quite catch that. Here's what I can help with:", options: root.options, audience });
    }
  } catch (err) {
    console.error('[Chatbot Respond Error]', err);
  }

  return res.status(503).json({
    message: "I'm having trouble connecting right now. Please try again shortly.",
    options: [],
    audience,
  });
});

export default router;

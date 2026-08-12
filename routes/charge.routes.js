import express from 'express';
import Charge from '../models/charge.model.js';
import {
  requireSelfPatient,
  requireFacilityStaff,
  requireFacilityStaffForBody,
  requireFacilityStaffForVoid,
} from '../middleware/charge.auth.js';

const router = express.Router();

// Record a charge — payment is implied by the act of recording it.
// payer_type defaults to 'patient'; hmo_id is ignored until HMO work ships.
router.post('/charges', requireFacilityStaffForBody, async (req, res) => {
  try {
    const { patient_id, facility_id, department, amount_minor, recorded_by } = req.body;

    if (!patient_id || !facility_id || !department || !amount_minor || !recorded_by) {
      return res.status(400).json({ error: 'Missing required field.' });
    }
    if (!Number.isInteger(amount_minor) || amount_minor <= 0) {
      return res.status(400).json({ error: 'amount_minor must be a positive integer (kobo).' });
    }

    const charge = await Charge.create({
      patient_id,
      facility_id,
      department,
      amount_minor,
      recorded_by,
    });

    res.status(201).json(charge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record charge.' });
  }
});

// A patient's own billing history — spans every facility they've visited.
router.get('/patients/:id/charges', requireSelfPatient, async (req, res) => {
  try {
    const charges = await Charge.find({ patient_id: req.params.id, voided: false })
      .sort({ recorded_at: -1 })
      .populate('facility_id', 'name');

    res.json(charges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient charges.' });
  }
});

// A facility's billing console — scoped to that facility only.
router.get('/facilities/:id/charges', requireFacilityStaff, async (req, res) => {
  try {
    const charges = await Charge.find({ facility_id: req.params.id, voided: false })
      .sort({ recorded_at: -1 })
      .populate('patient_id', 'name');

    res.json(charges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch facility charges.' });
  }
});

// Void a charge — reversing entry, never a delete.
router.post('/charges/:id/void', requireFacilityStaffForVoid, async (req, res) => {
  try {
    const { reason, voided_by } = req.body;
    if (!reason || !voided_by) {
      return res.status(400).json({ error: 'reason and voided_by are required.' });
    }

    const charge = await Charge.findByIdAndUpdate(
      req.params.id,
      { voided: true, void_reason: reason, voided_by, voided_at: new Date() },
      { new: true }
    );

    if (!charge) return res.status(404).json({ error: 'Charge not found.' });
    res.json(charge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to void charge.' });
  }
});

export default router;

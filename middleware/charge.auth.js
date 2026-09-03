import Charge from '../models/charge.model.js';
import AccessGrant from '../models/accessGrant.model.js';

// Assumes your existing login flow already populates req.user after
// verifying a token — e.g. { id, role: 'patient' | 'staff', facility_id }.
// If your auth middleware attaches something differently shaped,
// adjust the field names below to match — the logic doesn't change.

export function requireSelfPatient(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Patient access only.' });
  }
  if (String(req.user.id) !== String(req.params.id)) {
    return res.status(403).json({ error: "Cannot access another patient's billing." });
  }
  next();
}

export function requireFacilityStaff(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Facility staff access only.' });
  }
  if (String(req.user.facility_id) !== String(req.params.id)) {
    return res.status(403).json({ error: "Cannot access another facility's billing." });
  }
  next();
}

// For POST /charges — staff can only record a charge at their own facility,
// and only for a patient who has an active AccessGrant authorizing that
// facility (or the specific treating clinician) to see/bill their record.
export async function requireFacilityStaffForBody(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Facility staff access only.' });
  }
  if (String(req.user.facility_id) !== String(req.body.facility_id)) {
    return res.status(403).json({ error: 'Cannot record a charge for another facility.' });
  }

  const { patient_id, facility_id } = req.body;
  if (!patient_id) {
    return res.status(400).json({ error: 'patient_id is required.' });
  }

  try {
    const now = new Date();
    const activeConsent = await AccessGrant.exists({
      patientId: patient_id,
      status: 'active',
      startsAt: { $lte: now },
      $and: [
        {
          $or: [
            { granteeOrganizationId: facility_id },
            { granteeUserId: req.user.id },
          ],
        },
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: now } },
          ],
        },
      ],
    });

    if (!activeConsent) {
      return res.status(403).json({
        error: 'Patient has not granted this facility active access. Cannot record a charge.',
      });
    }

    next();
  } catch (err) {
    console.error('[charge.auth] Consent verification error:', err);
    return res.status(500).json({ error: 'Failed to verify patient consent.' });
  }
}

// For POST /charges/:id/void — looks up the charge first to verify staff belongs to the charge's facility_id
export async function requireFacilityStaffForVoid(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Facility staff access only.' });
  }

  try {
    const charge = await Charge.findById(req.params.id);
    if (!charge) {
      return res.status(404).json({ error: 'Charge not found.' });
    }
    if (String(req.user.facility_id) !== String(charge.facility_id)) {
      return res.status(403).json({ error: 'Cannot void a charge for another facility.' });
    }
    req.targetCharge = charge;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify charge for voiding.' });
  }
}

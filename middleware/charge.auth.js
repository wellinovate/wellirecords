import Charge from '../models/charge.model.js';

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
// and only for a patient who has consented to that facility seeing their record.
// The consent check calls out to whatever your existing "My Consents" logic
// already enforces elsewhere in the app (per WelliRecord's consent-based model).
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
  // TODO: call your existing consent-check here, e.g.
  // const consented = await Consent.exists({ patient_id: req.body.patient_id, facility_id: req.body.facility_id });
  // if (!consented) return res.status(403).json({ error: 'Patient has not consented to this facility.' });
  next();
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

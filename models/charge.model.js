import mongoose from 'mongoose';
const { Schema } = mongoose;

const chargeSchema = new Schema({
  patient_id: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  facility_id: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },

  department: {
    type: String,
    enum: ['consultation', 'laboratory', 'pharmacy', 'imaging', 'other'],
    required: true
  },

  amount_minor: { type: Number, required: true, min: 1 }, // kobo, integer — never a float

  // Payer split. Only 'patient' is used until HMO work ships.
  payer_type: { type: String, enum: ['patient', 'hmo'], default: 'patient', required: true },
  hmo_id: { type: Schema.Types.ObjectId, ref: 'Hmo', default: null },

  // Payment is captured at creation, not as a separate lifecycle step.
  recorded_by: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  recorded_at: { type: Date, default: Date.now },

  // Reversing-entry correction model — never hard delete a charge.
  voided: { type: Boolean, default: false },
  void_reason: { type: String, default: null },
  voided_by: { type: Schema.Types.ObjectId, ref: 'Staff', default: null },
  voided_at: { type: Date, default: null }
}, { timestamps: true });

export const Charge = mongoose.model('Charge', chargeSchema);
export default Charge;

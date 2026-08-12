import mongoose from 'mongoose';
import fs from 'fs';
import Charge from '../models/charge.model.js';

// TODO: Replace with your actual OldInvoice model / schema when connecting to your legacy database
const invoiceSchema = new mongoose.Schema({}, { strict: false });
const OldInvoice = mongoose.models.OldInvoice || mongoose.model('OldInvoice', invoiceSchema, 'invoices');

const SYSTEM_MIGRATION_STAFF_ID = process.env.MIGRATION_STAFF_ID; // TODO: a real Staff _id to attribute these to

async function migrate() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI environment variable is required.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const oldInvoices = await OldInvoice.find({});
  const toMigrate = [];
  const needsReview = [];

  for (const inv of oldInvoices) {
    // Platform invoices (subscriptions) are a different stream entirely —
    // skip them here, they don't belong in the Charge collection at all.
    if (inv.category === 'platform_subscription') continue;

    if (inv.status === 'paid') {
      toMigrate.push({
        patient_id: inv.patientId,
        facility_id: inv.facilityId,
        department: mapDepartment(inv.serviceType), // map old free-text service names to the new enum
        amount_minor: Math.round(inv.amount * 100),
        payer_type: 'patient',
        recorded_by: SYSTEM_MIGRATION_STAFF_ID,
        recorded_at: inv.paidAt || inv.createdAt,
      });
    } else {
      needsReview.push({
        old_invoice_id: inv._id,
        patient_id: inv.patientId,
        facility_id: inv.facilityId,
        amount: inv.amount,
        status: inv.status,
        created_at: inv.createdAt,
      });
    }
  }

  if (toMigrate.length) {
    await Charge.insertMany(toMigrate);
  }

  fs.writeFileSync(
    './migration-needs-review.json',
    JSON.stringify(needsReview, null, 2)
  );

  console.log(`Migrated ${toMigrate.length} paid invoices into Charge.`);
  console.log(`${needsReview.length} unpaid invoices written to migration-needs-review.json — decide manually before this data is dropped.`);

  await mongoose.disconnect();
}

function mapDepartment(oldServiceType) {
  const map = {
    'Outpatient Consultation': 'consultation',
    'Full Blood Count + Lipid Panel': 'laboratory',
    'Chest X-ray': 'imaging',
    // extend this map to cover every distinct serviceType string
    // currently in production — anything unmapped falls through to 'other'.
  };
  return map[oldServiceType] || 'other';
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

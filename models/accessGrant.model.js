import mongoose from 'mongoose';

const { Schema } = mongoose;

const accessGrantSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
      index: true,
    },
    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizationProfile',
      default: null,
      index: true,
    },
    granteeType: {
      type: String,
      enum: ['provider', 'organization', 'caregiver', 'payer', 'other', 'link'],
      required: true,
      index: true,
    },
    shareToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    granteeUserId: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizationProfile',
      default: null,
      index: true,
    },
    granteeOrganizationId: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizationProfile',
      default: null,
      index: true,
    },
    accessScope: {
      type: String,
      enum: ['single-record', 'category', 'encounter', 'full-record', 'custom'],
      default: 'full-record',
    },
    startsAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'revoked', 'expired', 'rejected'],
      default: 'active',
      index: true,
    },
    permissions: {
      view: { type: Boolean, default: true },
      download: { type: Boolean, default: false },
      reshare: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

accessGrantSchema.index({
  patientId: 1,
  granteeOrganizationId: 1,
  status: 1,
  startsAt: 1,
  expiresAt: 1,
});

export const AccessGrant = mongoose.models.AccessGrant || mongoose.model('AccessGrant', accessGrantSchema);
export default AccessGrant;

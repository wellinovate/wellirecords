import mongoose from 'mongoose';

const chatIntentSchema = new mongoose.Schema(
  {
    intentKey: { type: String, required: true, unique: true },
    audience: { type: String, enum: ['patient', 'provider'], required: true, default: 'patient' },
    message: { type: String, required: true },
    options: [
      {
        label: { type: String, required: true },
        nextIntentKey: { type: String, required: true },
      },
    ],
    isRoot: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'chatintents' }
);

const ChatIntent = mongoose.models.ChatIntent || mongoose.model('ChatIntent', chatIntentSchema);
export default ChatIntent;

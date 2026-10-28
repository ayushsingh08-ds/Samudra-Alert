import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceToken extends Document {
  token: string;
  platform: 'android' | 'ios' | 'web';
  user: mongoose.Types.ObjectId;
  region: string;
  lastSeen: Date;
  createdAt: Date;
}

const DeviceTokenSchema: Schema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['android', 'ios', 'web'], required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    region: { type: String, default: 'Unknown' },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

DeviceTokenSchema.index({ region: 1 });
DeviceTokenSchema.index({ user: 1 });

export default mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema);

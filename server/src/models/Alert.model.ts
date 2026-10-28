import mongoose, { Schema, Document } from 'mongoose';
import { AlertSeverity, EventCategory } from '@samudra/shared';

export interface IAlert extends Document {
  title: string;
  message: string;
  severity: AlertSeverity;
  category: EventCategory;
  targetArea: {
    center: { type: 'Point'; coordinates: number[] };
    radiusKm: number;
  } | null;
  channels: ('inapp' | 'push')[];
  status: 'draft' | 'sent';
  sentBy: mongoose.Types.ObjectId;
  deliveryStats: {
    pushSent: number;
    pushFailed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema: Schema = new Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 1000 },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    category: { type: String, required: true },
    targetArea: {
      type: {
        center: {
          type: {
            type: String,
            enum: ['Point'],
            required: true,
          },
          coordinates: { type: [Number], required: true },
        },
        radiusKm: { type: Number, required: true },
      },
      default: null,
    },
    channels: { type: [String], enum: ['inapp', 'push'], default: ['inapp'] },
    status: { type: String, enum: ['draft', 'sent'], default: 'sent' },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryStats: {
      pushSent: { type: Number, default: 0 },
      pushFailed: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ severity: 1, createdAt: -1 });

export default mongoose.model<IAlert>('Alert', AlertSchema);

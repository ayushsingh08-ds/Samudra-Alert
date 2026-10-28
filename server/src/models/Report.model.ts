import mongoose, { Schema, Document } from 'mongoose';
import { ReportStatus } from '@samudra/shared';

export interface IReport extends Document {
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  region: string;
  category: string;
  severity: number;
  status: ReportStatus;
  images: string[];
  location: {
    type: string;
    coordinates: number[];
  };
  statusHistory: {
    status: ReportStatus;
    reason?: string;
    updatedBy: mongoose.Types.ObjectId;
    updatedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    region: { type: String, default: 'Unknown', index: true },
    category: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 10 },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'resolved'],
      default: 'pending',
    },
    images: { type: [String], default: [] },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    statusHistory: [
      {
        status: String,
        reason: String,
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Indexes
ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ region: 1, status: 1, createdAt: -1 });

export default mongoose.model<IReport>('Report', ReportSchema);

import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@samudra/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['citizen', 'moderator', 'admin'],
      default: 'citizen',
    },
    region: { type: String, default: 'Unknown' },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>('User', UserSchema);

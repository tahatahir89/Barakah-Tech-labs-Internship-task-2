import { HydratedDocument, Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  profileImage?: { url?: string; publicId?: string };
  status: 'active' | 'offline';
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 24 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    profileImage: { url: String, publicId: String },
    status: { type: String, enum: ['active', 'offline'], default: 'active' },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type UserDoc = HydratedDocument<IUser>;
export const User = model<IUser>('User', userSchema);

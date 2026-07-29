import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'student' | 'faculty_jury' | 'alumni_jury' | 'industry_jury' | 'admin';

export interface IUser extends Document {
  name?: string;
  email?: string;
  juryId?: string; // For jury login
  password?: string;
  role: UserRole;
  rollNumber?: string;
  year?: string;
  department?: string;
  section?: string;
  teamId?: mongoose.Types.ObjectId;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { 
      type: String, 
      unique: true, 
      sparse: true, 
      trim: true,
      lowercase: true
    },
    juryId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['student', 'faculty_jury', 'alumni_jury', 'industry_jury', 'admin'], 
      required: true 
    },
    rollNumber: { type: String, trim: true },
    year: { type: String },
    department: { type: String },
    section: { type: String },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ teamId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  leaderId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  department: string;
  section?: string;
  year?: string;
  joinCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    department: { type: String, required: true },
    section: { type: String },
    year: { type: String },
    joinCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

teamSchema.index({ department: 1 });

export const Team = mongoose.model<ITeam>('Team', teamSchema);

import mongoose, { Document, Schema } from 'mongoose';

export type JuryType = 'faculty_jury' | 'alumni_jury' | 'industry_jury';

export interface IJuryScore extends Document {
  juryId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  juryType: JuryType;
  score: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const juryScoreSchema = new Schema<IJuryScore>(
  {
    juryId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    juryType: { 
      type: String, 
      enum: ['faculty_jury', 'alumni_jury', 'industry_jury'], 
      required: true 
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    remarks: { type: String },
  },
  { timestamps: true }
);

// One score per jury per team
juryScoreSchema.index({ juryId: 1, teamId: 1 }, { unique: true });
juryScoreSchema.index({ teamId: 1 });

export const JuryScore = mongoose.model<IJuryScore>('JuryScore', juryScoreSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  startDate: Date;
  endDate: Date;
  isStarted: boolean;
  startedAt?: Date;
  targetAgents: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isStarted: { type: Boolean, default: false },
    startedAt: { type: Date },
    targetAgents: { type: Number, default: 3000 },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);

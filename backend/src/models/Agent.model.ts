import mongoose, { Document, Schema } from 'mongoose';

export type AgentStatus = 'submitted' | 'approved' | 'rejected';

export interface IAgent extends Document {
  teamId: mongoose.Types.ObjectId;
  teamName: string;
  submittedBy: mongoose.Types.ObjectId;
  agentName: string;
  theme: string;
  facultyMentor?: string;
  llmUsed?: string;
  framework?: string;
  techStack: string[];
  githubUrl: string;
  liveDemoUrl?: string;
  videoDemoUrl?: string;
  documentationUrl?: string;
  shortDescription: string;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    teamName: { type: String, required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agentName: { type: String, required: true, trim: true },
    theme: { type: String, required: true },
    facultyMentor: { type: String },
    llmUsed: { type: String },
    framework: { type: String },
    techStack: [{ type: String }],
    githubUrl: { type: String, required: true },
    liveDemoUrl: { type: String },
    videoDemoUrl: { type: String },
    documentationUrl: { type: String },
    shortDescription: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['submitted', 'approved', 'rejected'], 
      default: 'submitted' 
    },
  },
  { timestamps: true }
);

// Indexes for performance
agentSchema.index({ status: 1 });
agentSchema.index({ teamId: 1 });

export const Agent = mongoose.model<IAgent>('Agent', agentSchema);

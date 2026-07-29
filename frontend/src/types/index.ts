export type Role = 'student' | 'faculty_jury' | 'alumni_jury' | 'industry_jury' | 'admin';
export type AgentStatus = 'submitted' | 'approved' | 'rejected';

export interface User {
  _id: string;
  name: string;
  email?: string;
  juryId?: string;
  role: Role;
  teamId?: string;
  department?: string;
  section?: string;
  year?: string;
  rollNumber?: string;
}

export interface Team {
  _id: string;
  name: string;
  department: string;
  section?: string;
  year?: string;
  joinCode: string;
  leaderId: string;
  members: any[]; 
}

export interface Agent {
  _id: string;
  teamId: any;
  teamName: string;
  submittedBy: any;
  agentName: string;
  theme: string;
  status: AgentStatus;
  department?: string; 
  githubUrl: string;
  liveDemoUrl?: string;
  videoDemoUrl?: string;
  documentationUrl?: string;
  shortDescription: string;
  techStack: string[];
  llmUsed?: string;
  framework?: string;
  facultyMentor?: string;
}

export interface EventState {
  _id: string;
  startDate: string;
  endDate: string;
  isStarted: boolean;
}

export interface JuryScoreRecord {
  _id: string;
  juryId: string;
  teamId: string;
  juryType: Role;
  score: number;
  remarks?: string;
}

import { z } from 'zod';

export const updateAgentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['submitted', 'approved', 'rejected']),
  }),
});

export const eventSchema = z.object({
  body: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});

export const moveStudentSchema = z.object({
  body: z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Student ID format'),
    newTeamId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Target Team ID format'),
  }),
});

export const createJurySchema = z.object({
  body: z.object({
    juryId: z.string().min(1, 'Jury ID is required'),
    password: z.string().min(6, 'Password is required'),
    role: z.enum(['faculty_jury', 'alumni_jury', 'industry_jury']),
    name: z.string().optional(),
  }),
});

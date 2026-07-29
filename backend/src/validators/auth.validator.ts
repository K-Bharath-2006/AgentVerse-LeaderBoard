import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email().refine((val) => val.endsWith('@sece.ac.in'), {
      message: 'Email must be a @sece.ac.in domain',
    }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rollNumber: z.string().min(3, 'Roll number is required'),
    year: z.string().min(1, 'Year is required'),
    department: z.string().min(1, 'Department is required'),
    section: z.string().optional().or(z.literal('')),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(), // For student/admin
    juryId: z.string().optional(), // For jury
    password: z.string().min(1, 'Password is required'),
  }).refine((data) => data.email || data.juryId, {
    message: 'Either email or juryId must be provided',
    path: ['email'],
  }),
});

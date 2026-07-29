import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters').trim(),
  }),
});

export const joinTeamSchema = z.object({
  body: z.object({
    joinCode: z.string().min(6, 'Join code is required'),
  }),
});

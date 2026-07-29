import { z } from 'zod';

export const scoreTeamSchema = z.object({
  body: z.object({
    teamId: z.string().min(1, 'Team ID is required'),
    score: z.number().min(0).max(100),
    remarks: z.string().optional(),
  }),
});

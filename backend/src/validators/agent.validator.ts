import { z } from 'zod';

const THEMES = [
  'Smart Campus',
  'CyberSecurity',
  'Data intelligence',
  'AI productivity',
  'Smart manufacturing',
  'Smart energy',
  'Smart mobility',
  'Digital health',
  'Social impact',
  'Digital governance'
] as const;
const LLMS = ['OpenAI', 'Claude', 'Gemini', 'Llama', 'DeepSeek', 'Other'] as const;
const FRAMEWORKS = ['LangChain', 'CrewAI', 'AutoGen', 'Vercel AI SDK', 'Custom', 'None'] as const;

export const submitAgentSchema = z.object({
  body: z.object({
    agentName: z.string().min(2, 'Agent name is required').trim(),
    theme: z.enum(THEMES),
    facultyMentor: z.string().min(2, 'Faculty mentor is required').trim(),
    llmUsed: z.enum(LLMS),
    framework: z.enum(FRAMEWORKS),
    techStack: z.array(z.string()).min(1, 'At least one tech stack item is required'),
    githubUrl: z.string().url('Must be a valid GitHub URL'),
    liveDemoUrl: z.string().url('Must be a valid Live Demo URL').optional().or(z.literal('')),
    videoDemoUrl: z.string().url('Must be a valid Video Demo URL'),
    documentationUrl: z.string().url('Must be a valid Documentation URL'),
    shortDescription: z.string()
      .max(200, 'Short description must be at most 200 characters')
      .optional()
      .or(z.literal(''))
      .refine(val => !val || val.length >= 50, {
        message: 'If provided, short description must be at least 50 characters'
      }),
  }),
});


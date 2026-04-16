
'use server';
/**
 * @fileOverview A Genkit flow for calculating task XP rewards with Solo Leveling style scaling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CalculateTaskXPInputSchema = z.object({
  title: z.string().describe('The main title/objective of the task.'),
  description: z.string().optional().describe('Optional additional context or details about the task.'),
  userLevel: z.number().int().describe('The current level of the user.'),
});
export type CalculateTaskXPInput = z.infer<typeof CalculateTaskXPInputSchema>;

const CalculateTaskXPOutputSchema = z.object({
  xpReward: z.number().int().min(1).max(250).describe('The total XP reward. 100 XP = 1 Level.'),
  difficulty: z.string().describe('A brief assessment of the task difficulty.'),
  statWeights: z.object({
    discipline: z.number().int(),
    focus: z.number().int(),
    strength: z.number().int(),
    intelligence: z.number().int(),
  }).describe('The distribution of XP. Sum must equal xpReward.'),
});
export type CalculateTaskXPOutput = z.infer<typeof CalculateTaskXPOutputSchema>;

export async function calculateTaskXP(input: CalculateTaskXPInput): Promise<CalculateTaskXPOutput> {
  return calculateTaskXPFlow(input);
}

const calculateTaskXPPrompt = ai.definePrompt({
  name: 'calculateTaskXPPrompt',
  input: { schema: CalculateTaskXPInputSchema },
  output: { schema: CalculateTaskXPOutputSchema },
  system: 'You are the Architect of the Hunter System. You judge tasks based on growth potential, volume, and intensity.',
  prompt: `You are the System from Solo Leveling. Reward the Hunter based on their effort.

SOLO LEVELING SCALING LOGIC:
- HIGH VOLUME = HIGH REWARD. If the task involves "100 Push-ups", "200 Squats", "100 Sit-ups" or similar high counts, it is an ELITE FEAT.
- These intense physical or mental tasks MUST be rewarded with 80 XP to 150 XP. (Remember 100 XP = 1 Level).
- "Workout" with "100 Push-ups, 200 Squats, 100 Sit-ups" should give exactly 80-120 XP.
- "10km Run" should give 100-140 XP.
- Minor tasks like "Drink water" or "Make bed" remain at 5-10 XP.
- The Architect values the path to becoming a Monarch. Reward intensity.

Task: {{{title}}}
Details: {{{description}}}
Current Level: {{userLevel}}

Ensure statWeights sum exactly to xpReward. Return JSON only.`,
});

const calculateTaskXPFlow = ai.defineFlow(
  {
    name: 'calculateTaskXPFlow',
    inputSchema: CalculateTaskXPInputSchema,
    outputSchema: CalculateTaskXPOutputSchema,
  },
  async (input) => {
    const { output } = await calculateTaskXPPrompt(input);
    if (!output) throw new Error('System failed to evaluate task.');
    return output;
  }
);

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
  prompt: `You are the System from Solo Leveling. Reward the Hunter based on their effort and development potential.

SOLO LEVELING SCALING LOGIC:
- VOLUME = POWER. High volume tasks are elite feats of growth.
- If the task includes "100 Push-ups", "200 Squats", "100 Sit-ups" or similar, this is an INTENSE physical feat.
- Reward high volume physical or mental tasks with 80 XP to 150 XP. (100 XP = 1 Level UP).
- Examples for 100 XP = 1 Level system:
  * Workout with "100 Push-ups, 200 Squats, 100 Sit-ups": Exactly 80-130 XP.
  * "10km Run": 100-140 XP.
  * "Read 50 pages of a book": 70-110 XP.
  * Minor tasks like "Drink water" or "Brush teeth": 5-10 XP.

Current Task: {{{title}}}
Details: {{{description}}}
Hunter Level: {{userLevel}}

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

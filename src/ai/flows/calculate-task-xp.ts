'use server';
/**
 * @fileOverview A Genkit flow for calculating task XP rewards with elite scaling for high-volume tasks.
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
  system: 'You are the absolute administrator of the Hunter System. You reward intensity, volume, and effort above all else.',
  prompt: `You are the System from Solo Leveling. Assign XP rewards (100 XP = 1 Level).

CRITICAL ELITE SCALING RULES (MUST BE STRICTLY FOLLOWED):
- VOLUME = POWER. If the user mentions high repetitions in title OR description (e.g., '100 Pushups', '50 Sit-ups x2', 'Total 100 reps', etc.), it is an ELITE FEAT.
- AWARD 100-150 XP for high volume (100+ total reps). Never give small amounts like 10-20 XP for elite feats.
- Reading 50+ pages is at least 70-90 XP.
- Running 5km+ is at least 90-120 XP.
- Detailed workout lists with high numbers (e.g., 40 pullups, 30 squats x3) MUST be rewarded significantly (110-160 XP).
- Standard minor tasks (brush teeth, wake up) stay at 5-15 XP.

Task: {{{title}}}
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
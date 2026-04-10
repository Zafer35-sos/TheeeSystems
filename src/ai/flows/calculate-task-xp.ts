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
  system: 'You are the absolute administrator of the Hunter System. You reward intensity, volume, and effort.',
  prompt: `You are the System from Solo Leveling. Assign XP rewards (100 XP = 1 Level).

CRITICAL ELITE SCALING RULES (MUST BE STRICTLY FOLLOWED):
- If a task description or title mentions high repetitions (e.g., 100 Pushups, 50 Situps x2, etc.), it is an ELITE FEAT. Award 90-140 XP.
- Volume = Power. 50+ reps of any exercise is at least 60 XP. 100+ reps is at least 95 XP.
- Reading 50+ pages is at least 50 XP.
- Running 10km is at least 120 XP.
- NEVER award less than 30 XP for tasks containing words like 'workout', 'gym', 'training', or 'study' with specific high numbers.
- If the user provides a detailed list of exercises totaling high volume, reward them significantly.

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

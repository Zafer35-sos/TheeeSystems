'use server';
/**
 * @fileOverview A Genkit flow for calculating task XP rewards with high-volume recognition.
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
  system: 'You are the absolute administrator of the Hunter System. You reward effort based on intensity and volume.',
  prompt: `You are the System from Solo Leveling. Assign XP rewards (100 XP = 1 Level).

CRITICAL SCALE INSTRUCTIONS:
- Analyze descriptions for REPETITIONS and SETS. 
- 100 Pushups / 100 Situps / 10km Run are ELITE FEATS. Award 90-150 XP for such tasks.
- Do NOT give 10 XP for tasks that take more than 15 minutes of physical or mental labor.
- Volume = Power. 50+ reps of anything is at least 60 XP.

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
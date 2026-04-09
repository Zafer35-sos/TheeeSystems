'use server';
/**
 * @fileOverview A Genkit flow for calculating task XP rewards and distributing them across stats.
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
  xpReward: z.number().int().min(1).max(200).describe('The total XP reward for the task. 100 XP = 1 Level.'),
  difficulty: z.string().describe('A brief assessment of the task difficulty.'),
  statWeights: z.object({
    discipline: z.number().int().describe('XP allocated to Discipline.'),
    focus: z.number().int().describe('XP allocated to Focus.'),
    strength: z.number().int().describe('XP allocated to Strength.'),
    intelligence: z.number().int().describe('XP allocated to Intelligence.'),
  }).describe('The distribution of XP across stats. The sum of these values must equal xpReward.'),
});
export type CalculateTaskXPOutput = z.infer<typeof CalculateTaskXPOutputSchema>;

export async function calculateTaskXP(input: CalculateTaskXPInput): Promise<CalculateTaskXPOutput> {
  return calculateTaskXPFlow(input);
}

const calculateTaskXPPrompt = ai.definePrompt({
  name: 'calculateTaskXPPrompt',
  input: { schema: CalculateTaskXPInputSchema },
  output: { schema: CalculateTaskXPOutputSchema },
  system: 'You are the absolute administrator of the Hunter System. Efficient and precise. You evaluate effort with high sensitivity to volume and intensity.',
  prompt: `You are the System from Solo Leveling. Assign XP rewards (100 XP = 1 Level) based on the Hunter's effort.

CRITICAL INSTRUCTION: Analyze the 'description' field carefully for volume (reps, sets, duration).
- If description contains high numbers like "100 Pushups", "50 Pullups", "10km Run", award AT LEAST 80-150 XP.
- Do NOT default to low XP (like 10 or 20) for intense physical or mental labor. 
- High volume = High reward. 100 Pushups is a significant feat and deserves nearly a full level (80-100 XP).

SCALING GUIDELINES:
- Basic/Short acts: 10-20 XP.
- Standard workout (moderate effort): 40-70 XP.
- Elite workout (100+ reps or 1hr+ intensity): 100-150 XP.
- Extreme mental milestone: 80-120 XP.

Task: {{{title}}}
Description Details: {{{description}}}
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
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const { output } = await calculateTaskXPPrompt(input);
        if (!output) throw new Error('Empty output');
        return output;
      } catch (error: any) {
        attempts++;
        const isQuotaError = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
        
        if (attempts >= maxAttempts || !isQuotaError) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      }
    }
    throw new Error('System failed to synchronize XP after multiple attempts.');
  }
);
'use server';
/**
 * @fileOverview A Genkit flow for generating an "Elite" weekly challenge based on daily habits.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWeeklyChallengeInputSchema = z.object({
  userLevel: z.number().int(),
  currentDailyTasks: z.array(z.string()).describe('A list of the user\'s typical daily tasks.'),
});

const GenerateWeeklyChallengeOutputSchema = z.object({
  title: z.string().describe('The title of the elite weekly challenge.'),
  description: z.string().describe('A detailed and demanding description of the task.'),
  xpReward: z.number().int().min(50).max(150).describe('XP reward for the challenge (100 XP = 1 Level).'),
  statWeights: z.object({
    discipline: z.number().int(),
    focus: z.number().int(),
    strength: z.number().int(),
    intelligence: z.number().int(),
  }).describe('The distribution of XP across stats. Sum must equal xpReward.'),
});

export type WeeklyChallengeOutput = z.infer<typeof GenerateWeeklyChallengeOutputSchema>;

export async function generateWeeklyChallenge(input: z.infer<typeof GenerateWeeklyChallengeInputSchema>): Promise<WeeklyChallengeOutput> {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    system: `You are the System Architect. Generate a WEEKLY CHALLENGE for the Hunter.

Scaling Guidelines:
- Look at the Hunter's current daily tasks.
- The Weekly Challenge MUST be a significantly scaled-up version of these activities.
- If they read 20 pages a day, the weekly challenge should be "Complete 150 pages this week" or "Finish a whole book in one sitting".
- If they do 50 pushups, the weekly challenge should be "Complete 400 total pushups this week".
- It must be 2-3x harder than their daily average but HUMANLY ACHIEVABLE.
- Make it sound epic and majestic.

XP Rewards (100 XP = 1 Level):
- Standard Weekly Reward: 70-120 XP.
- Maximum Elite Reward: 150 XP.`,
    prompt: `Hunter Level: ${input.userLevel}. Daily habits: ${input.currentDailyTasks.join(', ')}. 
Generate a majestic and difficult weekly challenge. 
The title should be imposing. The XP reward should be balanced (50-150 XP).
Distribute the XP reward into statWeights. Ensure statWeights sum to xpReward. Return JSON.`,
    output: { schema: GenerateWeeklyChallengeOutputSchema }
  });

  if (!response.output) throw new Error('Failed to generate elite challenge.');
  return response.output;
}

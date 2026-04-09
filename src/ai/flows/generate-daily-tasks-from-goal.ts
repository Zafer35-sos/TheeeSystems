'use server';
/**
 * @fileOverview A Genkit flow for generating daily tasks and XP rewards based on a user's high-level goal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDailyTasksFromGoalInputSchema = z.object({
  goal: z
    .string()
    .describe('The user\'s high-level goal for which daily tasks should be generated.'),
});
export type GenerateDailyTasksFromGoalInput = z.infer<typeof GenerateDailyTasksFromGoalInputSchema>;

const GenerateDailyTasksFromGoalOutputSchema = z.object({
  tasks: z.array(
    z.object({
      description: z.string().describe('The description of the daily task.'),
      xpReward: z.number().int().min(5).max(100).describe('The experience points (XP) awarded.'),
    })
  ).describe('A list of daily tasks with their corresponding XP rewards.'),
});
export type GenerateDailyTasksFromGoalOutput = z.infer<typeof GenerateDailyTasksFromGoalOutputSchema>;

export async function generateDailyTasksFromGoal(
  input: GenerateDailyTasksFromGoalInput
): Promise<GenerateDailyTasksFromGoalOutput> {
  return generateDailyTasksFlow(input);
}

const generateDailyTasksPrompt = ai.definePrompt({
  name: 'generateDailyTasksPrompt',
  input: { schema: GenerateDailyTasksFromGoalInputSchema },
  output: { schema: GenerateDailyTasksFromGoalOutputSchema },
  prompt: `You are a system similar to the one in Solo Leveling.
Break the user's goal into 5 distinct daily tasks.

Reward Reference (100 XP = 1 Level):
- Major task (1hr+): 30-50 XP.
- Moderate task: 15-25 XP.
- Minor task: 5-10 XP.

Goal: {{{goal}}}

Generate the tasks in JSON format.`,
});

const generateDailyTasksFlow = ai.defineFlow(
  {
    name: 'generateDailyTasksFlow',
    inputSchema: GenerateDailyTasksFromGoalInputSchema,
    outputSchema: GenerateDailyTasksFromGoalOutputSchema,
  },
  async (input) => {
    const { output } = await generateDailyTasksPrompt(input);
    if (!output) {
      throw new Error('Failed to generate tasks.');
    }
    return output;
  }
);

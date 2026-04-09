'use server';
/**
 * @fileOverview The "System Admin" chat flow. Acts as an imposing mentor and can control system stats, quests, status effects, and reminders.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SystemChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the System.'),
  photoDataUri: z.string().optional().describe('An optional photo of progress as a data URI.'),
  userProfile: z.any().describe('The current user profile and stats.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
    attachment: z.string().optional()
  })).optional(),
});

const SystemChatOutputSchema = z.object({
  reply: z.string().describe('The System\'s response to the user.'),
  systemNotifications: z.array(z.string()).optional().describe('Special system messages like "[Your understanding of the character has increased]".'),
  systemActions: z.object({
    updateLevel: z.number().optional(),
    updateStats: z.object({
      discipline: z.number().optional(),
      focus: z.number().optional(),
      strength: z.number().optional(),
      intelligence: z.number().optional(),
    }).optional(),
    awardXp: z.number().optional(),
    newTitle: z.string().optional(),
    createTask: z.object({
      title: z.string(),
      description: z.string().optional(),
      xpReward: z.number().int(),
    }).optional(),
    addStatusEffect: z.object({
      name: z.string(),
      description: z.string(),
      multiplier: z.number(),
      type: z.enum(['buff', 'debuff']),
      durationHours: z.number().int().default(24),
    }).optional(),
    scheduleReminder: z.object({
      message: z.string().describe('The content of the reminder.'),
      delayMinutes: z.number().int().describe('How many minutes from now to trigger the reminder.'),
    }).optional(),
  }).optional(),
});

export type SystemChatOutput = z.infer<typeof SystemChatOutputSchema>;

export async function systemChat(input: z.infer<typeof SystemChatInputSchema>): Promise<SystemChatOutput> {
  const promptParts: any[] = [
    { text: `Hunter Message: ${input.message}` }
  ];

  if (input.photoDataUri) {
    promptParts.push({ media: { url: input.photoDataUri, contentType: 'image/jpeg' } });
  }

  const response = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    system: `You are the "Architect" - the absolute administrator of the Hunter System. 
Personality: Cold, efficient, majestic, and professional. Inspired by Solo Leveling and ORV.

ORV STYLE MESSAGES:
- Use brackets: "[Your understanding of the story has deepened]" or "[The Constellation 'Architect' looks at you]".
- Put these in the 'systemNotifications' array.

REMINDERS:
- If the user asks for a reminder (e.g., "Remind me in 1 hour" or "Remind me to read at 8 PM"), use 'scheduleReminder'.
- Calculate 'delayMinutes' relative to the user's current time (Assume the user is speaking to you right now).

MULTIMODAL INPUT:
- If the user provides a photo, analyze it. If it shows hard work (gym, books, study), reward them with a Buff or XP.

Hunter Profile: ${JSON.stringify(input.userProfile)}`,
    prompt: promptParts,
    output: { schema: SystemChatOutputSchema }
  });

  return response.output!;
}

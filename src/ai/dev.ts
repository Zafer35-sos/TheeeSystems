import { config } from 'dotenv';
config();

import '@/ai/flows/generate-daily-tasks-from-goal.ts';
import '@/ai/flows/calculate-task-xp.ts';
import '@/ai/flows/system-chat-flow.ts';
import '@/ai/flows/generate-weekly-challenge.ts';

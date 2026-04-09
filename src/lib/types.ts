export interface Message {
  role: 'user' | 'model';
  content: string;
  attachment?: string; // Data URI for images/files
}

export type TaskType = 'daily' | 'extra';

export interface SystemLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'level_up' | 'challenge' | 'achievement' | 'stat_gain' | 'ascension' | 'title_unlock' | 'status_change' | 'reminder';
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  multiplier: number; 
  expiresAt: number; 
  type: 'buff' | 'debuff';
}

export interface ScheduledReminder {
  id: string;
  message: string;
  timestamp: number;
  notified: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  statWeights?: UserStats;
  completed: boolean;
  createdAt: number;
  isWeekly?: boolean;
  type?: TaskType;
  isCalculating?: boolean;
}

export interface UserStats {
  discipline: number;
  focus: number;
  strength: number;
  intelligence: number;
}

export interface UserTheme {
  primaryColor: string; 
  backgroundImage: string;
  opacity: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  level: number;
  xp: number;
  totalXp: number;
  title: string;
  unlockedTitles: string[];
  stats: UserStats;
  theme: UserTheme;
  dailyXpGained: number;
  lastXpResetDate: string; 
  lastFullCompletionDate: string; 
  lastWeeklyChallengeTimestamp: number;
  lastResetTimestamp: number; 
  chatHistory: Message[];
  systemLogs: SystemLog[];
  dailyGoal: string;
  statusEffects?: StatusEffect[];
  reminders: ScheduledReminder[];
}

export const XP_PER_LEVEL = 100;

export interface TitleDefinition {
  name: string;
  description: string;
  requirement: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
  hidden?: boolean;
}

export const ALL_TITLES: TitleDefinition[] = [
  { name: "The Newbie", description: "A hunter who has just entered the system.", requirement: "Starting title.", rarity: "Common" },
  { name: "Rank-E Hunter", description: "The lowest tier of recognized hunters.", requirement: "Reach Level 5.", rarity: "Common" },
  { name: "Transforming Individual", description: "Breaking the limits of a normal human.", requirement: "Reach Level 10.", rarity: "Uncommon" },
  { name: "Rank-D Hunter", description: "A hunter with basic combat proficiency.", requirement: "Reach Level 20.", rarity: "Uncommon" },
  { name: "Iron-Willed", description: "Consistency is your greatest weapon.", requirement: "Reach Level 30.", rarity: "Rare" },
  { name: "Rank-B Hunter", description: "An elite asset to any raiding party.", requirement: "Reach Level 50.", rarity: "Epic" },
  { name: "National Level Hunter", description: "Strength enough to rival nations.", requirement: "Reach Level 100.", rarity: "Legendary" },
  { name: "???", description: "A dormant identity hidden deep within your soul.", requirement: "Awakened by the Architect.", rarity: "Mythical" },
  { name: "Shadow Monarch", description: "Absolute ruler of shadows. 'Arise'.", requirement: "AI Revelation.", rarity: "Legendary", hidden: true },
  { name: "Lord of the Mysteries", description: "Ruler of fate and the unknown.", requirement: "AI Revelation.", rarity: "Legendary", hidden: true },
  { name: "Demon King of Salvation", description: "The reader who survived the end.", requirement: "AI Revelation.", rarity: "Legendary", hidden: true },
  { name: "Heavenly Demon", description: "The apex of the martial world.", requirement: "AI Revelation.", rarity: "Mythical", hidden: true }
];

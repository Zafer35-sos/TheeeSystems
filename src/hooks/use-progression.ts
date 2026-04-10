"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, UserProfile, XP_PER_LEVEL, UserStats, Message, TaskType, StatusEffect } from "@/lib/types";
import { calculateTaskXP } from "@/ai/flows/calculate-task-xp";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "system_hunter_data_v3";

const INITIAL_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  level: 1,
  xp: 0,
  totalXp: 0,
  title: "The Newbie",
  unlockedTitles: ["The Newbie"],
  stats: {
    discipline: 0,
    focus: 0,
    strength: 0,
    intelligence: 0,
  },
  theme: {
    primaryColor: "260 72% 58%",
    backgroundImage: "",
    opacity: 0.8,
  },
  dailyXpGained: 0,
  lastXpResetDate: "",
  lastFullCompletionDate: "",
  lastWeeklyChallengeTimestamp: 0,
  lastResetTimestamp: 0,
  chatHistory: [{ role: 'model', content: "Welcome Hunter. I am the System Admin. Identify yourself." }],
  systemLogs: [],
  dailyGoal: "",
  statusEffects: [],
  reminders: [],
};

export function useProgression() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingWeeklyChallenge, setPendingWeeklyChallenge] = useState<Task | null>(null);

  const showSystemNotification = useCallback((message: string) => {
    const formatted = message.startsWith('[') ? message : `[${message}]`;
    toast({
      title: "[SYSTEM MESSAGE]",
      description: formatted,
    });
    
    setProfile(prev => ({
      ...prev,
      systemLogs: [
        { id: 'log-' + Date.now() + Math.random(), timestamp: Date.now(), message: formatted, type: 'achievement' },
        ...prev.systemLogs
      ].slice(0, 50)
    }));
  }, [toast]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loadedProfile = parsed.profile || {};
        let loadedTasks = parsed.tasks || [];
        
        const mergedProfile = {
          ...INITIAL_PROFILE,
          ...loadedProfile,
          reminders: Array.isArray(loadedProfile.reminders) ? loadedProfile.reminders : [],
          statusEffects: Array.isArray(loadedProfile.statusEffects) ? loadedProfile.statusEffects : [],
        };

        if (mergedProfile.lastXpResetDate !== today) {
          mergedProfile.dailyXpGained = 0;
          mergedProfile.lastXpResetDate = today;
          loadedTasks = loadedTasks
            .filter((t: Task) => t.type === 'daily' || t.isWeekly)
            .map((t: Task) => ({ ...t, completed: false }));
        }

        setProfile(mergedProfile);
        setTasks(loadedTasks);
      } catch (e) {
        console.error("Hydration error:", e);
      }
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, tasks }));
      document.documentElement.style.setProperty('--primary', profile.theme.primaryColor);
    }
  }, [profile, tasks, hasHydrated]);

  const addXp = useCallback((amount: number, statWeights?: Partial<UserStats>) => {
    setProfile((prev) => {
      const multiplier = (prev.statusEffects || []).reduce((acc, e) => acc * e.multiplier, 1);
      const modifiedAmount = Math.round(amount * multiplier);

      let newXp = prev.xp + modifiedAmount;
      let newLevel = prev.level;
      while (newXp >= XP_PER_LEVEL) {
        newXp -= XP_PER_LEVEL;
        newLevel += 1;
      }
      const updatedStats = { ...prev.stats };
      if (statWeights) {
        Object.entries(statWeights).forEach(([key, val]) => {
          updatedStats[key as keyof UserStats] += (val as number);
        });
      }
      return { 
        ...prev, 
        level: newLevel, 
        xp: newXp, 
        dailyXpGained: prev.dailyXpGained + modifiedAmount, 
        stats: updatedStats 
      };
    });
  }, []);

  const addTask = async (title: string, description?: string, type: TaskType = 'daily') => {
    const id = 'task-' + Date.now();
    const newTask: Task = {
      id,
      title,
      description,
      type,
      xpReward: 0,
      completed: false,
      createdAt: Date.now(),
      isCalculating: true
    };

    setTasks(prev => [newTask, ...prev]);

    try {
      const result = await calculateTaskXP({
        title,
        description: description || "",
        userLevel: profile.level
      });

      setTasks(prev => prev.map(t => 
        t.id === id 
          ? { ...t, xpReward: result.xpReward, statWeights: result.statWeights, isCalculating: false } 
          : t
      ));
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === id 
          ? { ...t, xpReward: 15, isCalculating: false } 
          : t
      ));
      showSystemNotification("[The Architect is synchronizing. Standard reward assigned.]");
    }
  };

  const completeTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task && !task.completed && !task.isCalculating) {
        addXp(task.xpReward, task.statWeights);
        showSystemNotification(`[Quest Completed: ${task.title}. +${task.xpReward} XP]`);
        return prev.map(t => t.id === id ? { ...t, completed: true } : t);
      }
      return prev;
    });
  };

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const updateSystem = (updates: Partial<UserProfile>) => setProfile(prev => ({ ...prev, ...updates }));
  const setOnboardingData = (firstName: string, lastName: string) => setProfile(prev => ({ ...prev, firstName, lastName }));
  const addChatMessage = (message: Message) => setProfile(prev => ({ ...prev, chatHistory: [...(prev.chatHistory || []), message] }));
  
  const acceptWeeklyChallenge = () => {
    if (pendingWeeklyChallenge) {
      setTasks(prev => [pendingWeeklyChallenge!, ...prev]);
      setProfile(prev => ({ ...prev, lastWeeklyChallengeTimestamp: Date.now() }));
      setPendingWeeklyChallenge(null);
    }
  };

  const performAscensionReset = () => {
    if (profile.level < 50) return;
    setProfile(prev => ({ ...prev, level: Math.floor(prev.level * 1.2), xp: 0 }));
    setTasks([]);
    showSystemNotification("[ASCENSION COMPLETE. Your soul has been refined.]");
  };

  const addStatusEffect = (effect: Omit<StatusEffect, 'id'>) => {
    setProfile(prev => ({
      ...prev,
      statusEffects: [...(prev.statusEffects || []), { ...effect, id: 'eff-' + Date.now() }]
    }));
    showSystemNotification(`[Status Applied: ${effect.name}]`);
  };

  const addSystemTask = (title: string, xpReward: number, description?: string) => {
    setTasks(prev => [{ 
      id: 'sys-' + Date.now(), 
      title, 
      description, 
      type: 'extra', 
      xpReward, 
      completed: false, 
      createdAt: Date.now() 
    }, ...prev]);
  };

  const scheduleReminder = (message: string, delayMinutes: number) => {
    const timestamp = Date.now() + (delayMinutes * 60 * 1000);
    setProfile(prev => ({
      ...prev,
      reminders: [...(prev.reminders || []), { id: 'rem-' + Date.now(), message, timestamp, notified: false }]
    }));
    showSystemNotification(`[REMINDER SET: ${message} in ${delayMinutes} minutes]`);
  };

  return {
    profile, 
    tasks, 
    hasHydrated, 
    isProcessing, 
    pendingWeeklyChallenge,
    addTask,
    updateSystem,
    completeTask,
    removeTask,
    setOnboardingData,
    addXp,
    addChatMessage,
    acceptWeeklyChallenge,
    performAscensionReset,
    showSystemNotification,
    addStatusEffect,
    addSystemTask,
    scheduleReminder
  };
}
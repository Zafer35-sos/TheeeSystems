"use client";

import { UserProfile, Task } from "@/lib/types";
import { Target, Activity, Zap, History } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StatusDashboardProps {
  profile: UserProfile;
  tasks: Task[];
  onSetGoal: (goal: string) => void;
}

export function StatusDashboard({ profile, tasks, onSetGoal }: StatusDashboardProps) {
  const completedToday = tasks.filter(t => t.completed).length;
  const xpGainedToday = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.xpReward, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="system-card flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded border border-primary/20">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Tasks Done</p>
          <p className="text-2xl font-bold font-code">{completedToday}</p>
        </div>
      </div>

      <div className="system-card flex items-center gap-4">
        <div className="p-3 bg-secondary/10 rounded border border-secondary/20">
          <Activity className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">XP Gained</p>
          <p className="text-2xl font-bold font-code">{xpGainedToday}</p>
        </div>
      </div>

      <div className="system-card flex items-center gap-4">
        <div className="p-3 bg-muted rounded border border-muted-foreground/10">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Remaining</p>
          <p className="text-2xl font-bold font-code">{tasks.length - completedToday}</p>
        </div>
      </div>

      <div className="system-card md:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Master Objective</h3>
        </div>
        <Input 
          value={profile.dailyGoal}
          onChange={(e) => onSetGoal(e.target.value)}
          className="bg-transparent border-none p-0 text-lg font-medium italic text-muted-foreground focus-visible:ring-0 focus-visible:text-foreground transition-all h-auto"
          placeholder="Define your ultimate path..."
        />
        <p className="text-[10px] text-muted-foreground/50 italic">"The AI will generate daily quests based on this master objective."</p>
      </div>
    </div>
  );
}

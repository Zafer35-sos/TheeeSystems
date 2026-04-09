"use client";

import { UserProfile, ALL_TITLES } from "@/lib/types";
import { Shield, Eye, Dumbbell, Lightbulb, Info, Trophy, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatsSectionProps {
  profile: UserProfile;
}

export function StatsSection({ profile }: StatsSectionProps) {
  const statList = [
    { name: "Discipline", value: profile.stats.discipline, icon: Shield, color: "text-blue-400" },
    { name: "Focus", value: profile.stats.focus, icon: Eye, color: "text-cyan-400" },
    { name: "Strength", value: profile.stats.strength, icon: Dumbbell, color: "text-orange-400" },
    { name: "Intelligence", value: profile.stats.intelligence, icon: Lightbulb, color: "text-purple-400" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right duration-500 pb-10">
      {/* Stats Card */}
      <div className="system-card space-y-8">
        <h3 className="text-center text-sm font-black uppercase tracking-[0.2em] glow-text-primary">
          Character Attributes
        </h3>

        <div className="space-y-6">
          {statList.map((stat) => (
            <div key={stat.name} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-muted/20 flex items-center justify-center border border-primary/10">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.name}</span>
                  <span className="text-lg font-black italic text-foreground">{stat.value}</span>
                </div>
                <Progress value={Math.min(100, (stat.value % 100))} className="h-1 bg-muted/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card: Focus XP */}
      <div className="system-card border-blue-500/20 bg-blue-500/5 space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Info className="h-4 w-4" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">How to Earn Focus XP?</h4>
        </div>
        <ul className="text-[10px] space-y-2 text-muted-foreground font-medium">
          <li className="flex justify-between">• 40+ XP/day <span>+10 Focus</span></li>
          <li className="flex justify-between">• 30-40 XP/day <span>+5 Focus</span></li>
          <li className="flex justify-between">• &lt;30 XP/day <span>+0 Focus</span></li>
        </ul>
        <div className="pt-2 border-t border-blue-500/10">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            Today: {profile.dailyXpGained} XP
          </p>
        </div>
      </div>

      {/* Title Status Summary */}
      <div className="system-card space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Title Progress</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_TITLES.map((title) => {
            const isUnlocked = profile.unlockedTitles.includes(title.name);
            return (
              <div 
                key={title.name} 
                className={`p-2 rounded border flex items-center gap-2 ${isUnlocked ? 'border-primary/30 bg-primary/5' : 'border-white/5 opacity-30'}`}
              >
                {isUnlocked ? <Trophy className="h-3 w-3 text-yellow-500" /> : <Lock className="h-3 w-3" />}
                <span className="text-[8px] font-bold uppercase truncate">{title.name}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[8px] text-muted-foreground italic text-center pt-2">
          "Click on your profile title to change equipped titles."
        </p>
      </div>
    </div>
  );
}

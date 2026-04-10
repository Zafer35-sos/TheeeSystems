
"use client";

import { UserProfile, XP_PER_LEVEL, ALL_TITLES } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Flame, Calendar, ChevronRight, Trophy, Lock, Check, Sparkles, Zap, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfileSectionProps {
  profile: UserProfile;
  onUpdateTitle: (title: string) => void;
}

export function ProfileSection({ profile, onUpdateTitle }: ProfileSectionProps) {
  const [open, setOpen] = useState(false);
  const progress = (profile.xp / XP_PER_LEVEL) * 100;

  const handleEquip = (titleName: string) => {
    onUpdateTitle(titleName);
    setOpen(false);
  };

  const activeEffects = (profile.statusEffects || []).filter(e => e.expiresAt > Date.now());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full border-2 border-primary bg-background flex flex-col items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
            <span className="text-[8px] uppercase font-bold text-muted-foreground leading-none">LV</span>
            <span className="text-xl font-black italic leading-none">{profile.level}</span>
          </div>
          
          {activeEffects.length > 0 && (
            <div className="absolute -bottom-1 -right-1 flex -space-x-1">
              {activeEffects.some(e => e.type === 'buff') && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 border border-background flex items-center justify-center animate-pulse">
                  <Zap className="h-2.5 w-2.5 text-white fill-white" />
                </div>
              )}
              {activeEffects.some(e => e.type === 'debuff') && (
                <div className="w-5 h-5 rounded-full bg-destructive border border-background flex items-center justify-center">
                  <ShieldAlert className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="text-lg font-black uppercase italic glow-text-primary tracking-tight truncate leading-tight">
                {profile.firstName} {profile.lastName}
              </h2>
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 group text-left outline-none">
                    <span className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] whitespace-nowrap animate-in fade-in slide-in-from-left duration-1000 group-hover:text-primary transition-colors">
                      {profile.title}
                    </span>
                    <ChevronRight className="h-2 w-2 text-secondary group-hover:text-primary transition-colors" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/20 max-w-[90%] rounded-xl overflow-hidden max-h-[80vh] flex flex-col p-0">
                  <DialogHeader className="shrink-0 p-6 border-b border-white/5 bg-primary/5">
                    <DialogTitle className="text-lg font-black italic uppercase tracking-tighter glow-text-primary flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" /> TITLE COLLECTION
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Equip a title earned through your achievements in the System.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto space-y-4 p-6 hide-scrollbar">
                    {ALL_TITLES.map((titleDef) => {
                      const isUnlocked = profile.unlockedTitles.includes(titleDef.name);
                      const isEquipped = profile.title === titleDef.name;
                      const isHidden = titleDef.hidden && !isUnlocked;

                      return (
                        <div 
                          key={titleDef.name} 
                          className={`p-4 rounded-lg border flex items-center gap-4 transition-all duration-300 ${
                            isUnlocked 
                              ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
                              : 'bg-muted/10 border-white/5 opacity-50'
                          }`}
                        >
                          <div className="shrink-0">
                            {isUnlocked ? (
                              <div className="relative">
                                <Trophy className={`h-6 w-6 ${
                                  titleDef.rarity === 'Legendary' || titleDef.rarity === 'Mythical' ? 'text-primary animate-pulse' : 'text-yellow-500'
                                }`} />
                                {(titleDef.rarity === 'Legendary' || titleDef.rarity === 'Mythical') && <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />}
                              </div>
                            ) : (
                              <Lock className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                                {isHidden ? "???" : titleDef.name}
                              </h4>
                              {isUnlocked && <span className={`text-[7px] font-black uppercase px-1 rounded bg-muted/20 ${
                                titleDef.rarity === 'Legendary' ? 'text-primary' : 
                                titleDef.rarity === 'Mythical' ? 'text-yellow-500' : 'text-muted-foreground'
                              }`}>{titleDef.rarity}</span>}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight italic">
                              {isHidden ? "This legendary identity is currently hidden from your perception." : isUnlocked ? titleDef.description : titleDef.requirement}
                            </p>
                          </div>
                          {isUnlocked && (
                            <Button 
                              size="sm" 
                              variant={isEquipped ? "secondary" : "outline"} 
                              className={`h-7 text-[8px] uppercase font-black tracking-widest px-3 transition-all ${isEquipped ? 'bg-primary text-white pointer-events-none' : 'border-primary/40 hover:bg-primary/10'}`}
                              onClick={() => handleEquip(titleDef.name)}
                            >
                              {isEquipped ? <><Check className="h-2 w-2 mr-1" /> Equipped</> : "Equip"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <div className="flex flex-col items-center">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-[8px] font-bold">3</span>
              </div>
              <div className="flex flex-col items-center">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span className="text-[8px] font-bold">0</span>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
              <span>EXP Progress</span>
              <span className="text-primary">{Math.floor(profile.xp)} / {XP_PER_LEVEL}</span>
            </div>
            <Progress value={progress} className="h-1 bg-muted/30" />
          </div>
        </div>
      </div>

      {activeEffects.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in slide-in-from-top duration-500">
          <TooltipProvider>
            {activeEffects.map((effect) => (
              <Tooltip key={effect.id}>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-tighter cursor-help transition-all hover:scale-105 ${
                    effect.type === 'buff' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-destructive/10 border-destructive/30 text-destructive'
                  }`}>
                    {effect.type === 'buff' ? <Zap className="h-2.5 w-2.5 fill-current" /> : <ShieldAlert className="h-2.5 w-2.5" />}
                    {effect.name} (x{effect.multiplier})
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-background/95 backdrop-blur-xl border-primary/20 p-3 max-w-[200px]">
                  <p className="text-xs font-bold text-primary mb-1 uppercase">{effect.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{effect.description}</p>
                  <div className="h-px bg-white/5 mb-2" />
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground/60">
                    Expires: {new Date(effect.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

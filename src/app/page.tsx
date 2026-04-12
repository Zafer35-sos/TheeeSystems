"use client";

import { useProgression } from "@/hooks/use-progression";
import { ProfileSection } from "@/components/system/ProfileSection";
import { DailyQuest } from "@/components/system/DailyQuest";
import { StatsSection } from "@/components/system/StatsSection";
import { SystemChat } from "@/components/system/SystemChat";
import { SettingsSection } from "@/components/system/SettingsSection";
import { Onboarding } from "@/components/system/Onboarding";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, BarChart3, MessageSquare, Settings, Zap, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function MobileSystemPage() {
  const { 
    profile, 
    tasks, 
    hasHydrated, 
    isProcessing,
    pendingWeeklyChallenge,
    addTask, 
    addSystemTask,
    completeTask, 
    removeTask, 
    setOnboardingData,
    updateSystem,
    addXp,
    addChatMessage,
    acceptWeeklyChallenge,
    performAscensionReset
  } = useProgression();
  
  const [activeTab, setActiveTab] = useState("quests");

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, []);

  if (!hasHydrated) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-pulse text-[10px] uppercase tracking-[0.5em] text-primary/50">
          Loading System...
        </div>
      </div>
    );
  }

  if (!profile.firstName || !profile.lastName) {
    return (
      <>
        <Onboarding onComplete={setOnboardingData} />
        <Toaster />
      </>
    );
  }

  return (
    <div suppressHydrationWarning className="fixed inset-0 bg-black text-foreground flex justify-center selection:bg-primary/30 overflow-hidden">
      {profile.theme.backgroundImage && (
        <div 
          className="fixed inset-0 bg-cover bg-center pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${profile.theme.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
      )}
      
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1)_0%,transparent_100%)] pointer-events-none" />

      <main 
        className="w-full max-w-md relative z-10 flex flex-col h-full overflow-hidden border-x border-primary/5 transition-all duration-500 pb-safe"
        style={{ backgroundColor: `rgba(var(--background-rgb), ${profile.theme.opacity})` }}
      >
        <section className="px-6 pt-12 pb-4 shrink-0 relative">
          <ProfileSection 
            profile={profile} 
            onUpdateTitle={(title) => updateSystem({ title })} 
          />
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 mb-4 shrink-0">
            <TabsList className="w-full bg-muted/20 border border-primary/10 grid grid-cols-3 h-12 p-1">
              <TabsTrigger value="quests" className="data-[state=active]:bg-primary/20 gap-1.5 text-[10px] uppercase tracking-widest font-black">
                <ClipboardList className="h-4 w-4" /> Quests
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-primary/20 gap-1.5 text-[10px] uppercase tracking-widest font-black">
                <BarChart3 className="h-4 w-4" /> Stats
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-primary/20 gap-1.5 text-[10px] uppercase tracking-widest font-black">
                <MessageSquare className="h-4 w-4" /> Terminal
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 px-6 pb-20 overflow-hidden relative">
            <TabsContent 
              value="quests" 
              className="absolute inset-0 px-6 mt-0 outline-none overflow-y-auto hide-scrollbar data-[state=inactive]:hidden"
            >
              <DailyQuest 
                tasks={tasks} 
                onComplete={completeTask} 
                onRemove={removeTask}
                onAdd={addTask}
                isProcessing={isProcessing}
                profile={profile}
              />
            </TabsContent>

            <TabsContent 
              value="stats" 
              className="absolute inset-0 px-6 mt-0 outline-none overflow-y-auto hide-scrollbar data-[state=inactive]:hidden"
            >
              <StatsSection profile={profile} />
            </TabsContent>

            <TabsContent 
              value="system" 
              className="absolute inset-0 px-6 mt-0 outline-none flex flex-col data-[state=inactive]:hidden pb-10"
            >
              <SystemChat 
                profile={profile} 
                onUpdate={updateSystem} 
                onAddXp={addXp} 
                onAddSystemTask={addSystemTask}
                addChatMessage={addChatMessage} 
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="absolute right-6 bottom-6 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 text-primary hover:text-white transition-all bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                <Settings className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card/95 backdrop-blur-2xl border-primary/20 p-0 overflow-y-auto hide-scrollbar sm:max-w-sm">
              <SheetHeader className="p-6 border-b border-white/5">
                <SheetTitle className="text-lg font-black italic uppercase tracking-tighter glow-text-primary flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> System Control
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">Adjust system parameters and interface themes.</SheetDescription>
              </SheetHeader>
              <div className="p-6">
                <SettingsSection 
                  profile={profile} 
                  onUpdate={updateSystem} 
                  onAscension={performAscensionReset}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </main>

      <Dialog open={!!pendingWeeklyChallenge} onOpenChange={() => {}}>
        <DialogContent className="bg-card/90 backdrop-blur-2xl border-primary/50 max-w-[90%] rounded-xl p-8 flex flex-col items-center text-center">
          <DialogHeader className="space-y-2 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">System Message</div>
            <DialogTitle className="text-2xl font-black italic uppercase text-white tracking-tighter leading-tight">
              Weekly Challenge Has Arrived
            </DialogTitle>
            <DialogDescription className="text-lg font-bold text-primary italic">
              - {pendingWeeklyChallenge?.title} -
            </DialogDescription>
          </DialogHeader>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent my-4" />
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg my-6 w-full text-xs text-primary/90 leading-relaxed font-medium">
            {pendingWeeklyChallenge?.description}
            <div className="mt-4 flex items-center justify-center gap-2 text-primary font-code font-black text-sm">
              <Zap className="h-4 w-4 fill-primary" />
              <span>+{pendingWeeklyChallenge?.xpReward} XP REWARD</span>
            </div>
          </div>
          <Button 
            onClick={acceptWeeklyChallenge}
            className="w-full h-14 bg-primary hover:bg-primary/80 text-primary-foreground font-black uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
          >
            Accept Quest
          </Button>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

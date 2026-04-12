"use client";

import { Task, UserProfile, TaskType } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Target, Zap, X, Sparkles, LayoutList, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DailyQuestProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (title: string, description?: string, type?: TaskType) => void;
  isProcessing: boolean;
  profile: UserProfile;
}

export function DailyQuest({ 
  tasks, 
  onComplete, 
  onRemove, 
  onAdd,
  isProcessing,
  profile
}: DailyQuestProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("daily");

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.isWeekly && !b.isWeekly) return -1;
      if (!a.isWeekly && b.isWeekly) return 1;
      return 0;
    });
  }, [tasks]);

  const handleAddTask = () => {
    if (title.trim()) {
      onAdd(title, description, taskType);
      setTitle("");
      setDescription("");
      setTaskType("daily");
      setOpen(false);
    }
  };

  const completedToday = tasks.filter(t => t.completed).length;
  const totalToday = tasks.length;
  const xpGainedToday = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.xpReward, 0);
  const progressPercent = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left duration-500">
      <div className="system-card py-4 animate-in slide-in-from-top duration-500 delay-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Daily Progress</span>
            </div>
            <span className="text-[10px] font-code text-muted-foreground">{completedToday}/{totalToday} QUESTS</span>
          </div>
          
          <div className="space-y-1.5">
            <Progress value={progressPercent} className="h-1 bg-muted/30" />
            <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-medium text-muted-foreground/60">
              <div className="flex items-center gap-1">
                <Zap className="h-2 w-2 text-secondary" />
                <span>+{xpGainedToday} XP Gained</span>
              </div>
              <span>{Math.floor(progressPercent)}% Synergy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
          Quest Log
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 border-primary/30 text-[10px] uppercase tracking-widest gap-2 bg-primary/5 hover:bg-primary/10">
              <Plus className="h-3 w-3" /> New Objective
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1625] border-primary/20 max-w-[90%] rounded-xl p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                New Task
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add a new objective to your daily quest log. The system will evaluate the challenge level.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground">Quest Type</label>
                <RadioGroup 
                  value={taskType} 
                  onValueChange={(v) => setTaskType(v as TaskType)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 rounded-lg border border-primary/20 p-3 bg-primary/5 cursor-pointer has-[:checked]:border-primary transition-all">
                    <RadioGroupItem value="daily" id="daily" className="border-primary" />
                    <Label htmlFor="daily" className="flex flex-col gap-1 cursor-pointer">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Daily</span>
                      <span className="text-[9px] text-muted-foreground leading-none">Repeats every day</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-secondary/20 p-3 bg-secondary/5 cursor-pointer has-[:checked]:border-secondary transition-all">
                    <RadioGroupItem value="extra" id="extra" className="border-secondary" />
                    <Label htmlFor="extra" className="flex flex-col gap-1 cursor-pointer">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Extra</span>
                      <span className="text-[9px] text-muted-foreground leading-none">One-time objectives</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Objective Title *</label>
                <Input 
                  placeholder="e.g. 100 Pushups, Read 30 pages" 
                  className="bg-[#241d33] border-none h-12 text-sm text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Description (optional)</label>
                <Textarea 
                  placeholder="Include details like repetitions and duration for better XP assessment." 
                  className="bg-[#241d33] border-none min-h-[100px] text-sm text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 font-bold gap-2" 
                onClick={handleAddTask}
                disabled={!title.trim()}
              >
                <Zap className="h-4 w-4 fill-white" />
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 pb-10">
        {sortedTasks.length === 0 ? (
          <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-dashed border-primary flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em]">Awaiting Data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-start justify-between p-4 rounded-lg border transition-all duration-500 ${
                  task.completed 
                    ? 'bg-primary/5 border-primary/10 opacity-40 scale-[0.98]' 
                    : task.isWeekly
                      ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(115,42,255,0.2)]'
                      : 'bg-card border-primary/20 shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                } ${task.isCalculating ? 'animate-pulse border-dashed opacity-50' : ''}`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={() => !task.completed && !task.isCalculating && onComplete(task.id)}
                    disabled={task.completed || task.isCalculating}
                    className={`mt-1 h-5 w-5 ${task.isWeekly ? 'border-primary data-[state=checked]:bg-primary' : 'border-primary/50 data-[state=checked]:bg-primary'}`}
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold leading-tight ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </span>
                      {task.isWeekly && !task.completed && (
                        <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                      )}
                      {task.isCalculating && (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.isWeekly ? (
                         <div className="flex items-center gap-1 text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/20 px-1.5 py-0.5 rounded">
                          <Zap className="h-2 w-2" /> Elite Weekly
                        </div>
                      ) : task.type === 'daily' ? (
                        <div className="flex items-center gap-1 text-[8px] font-bold text-primary/70 uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded">
                          <LayoutList className="h-2 w-2" /> Daily
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[8px] font-bold text-secondary/70 uppercase tracking-widest bg-secondary/10 px-1.5 py-0.5 rounded">
                          <Star className="h-2 w-2" /> Extra
                        </div>
                      )}
                    </div>

                    {task.description && !task.completed && (
                      <span className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3 mt-1">
                        {task.description}
                      </span>
                    )}
                    
                    {!task.isCalculating && (
                      <span className={`text-[10px] font-code uppercase tracking-wider font-bold mt-1 ${task.isWeekly ? 'text-primary' : 'text-secondary'}`}>
                        + {task.xpReward} XP {task.isWeekly && '[ELITE]'}
                      </span>
                    )}
                    {task.isCalculating && (
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50 italic animate-pulse">
                        Synchronizing with System...
                      </span>
                    )}
                  </div>
                </div>
                {!task.completed && !task.isWeekly && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground/30 hover:text-destructive shrink-0" 
                    onClick={() => onRemove(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
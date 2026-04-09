"use client";

import { useState, useRef, useEffect } from "react";
import { UserProfile, Message, ScheduledReminder } from "@/lib/types";
import { systemChat } from "@/ai/flows/system-chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Terminal, History, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgression } from "@/hooks/use-progression";

interface SystemChatProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onAddXp: (amount: number, stats?: any) => void;
  onAddSystemTask: (title: string, xpReward: number, description?: string) => void;
  addChatMessage: (message: Message) => void;
}

export function SystemChat({ profile, onUpdate, onAddXp, onAddSystemTask, addChatMessage }: SystemChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("terminal");
  const [attachment, setAttachment] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSystemNotification, addStatusEffect, scheduleReminder } = useProgression();

  const history = profile.chatHistory || [];
  const logs = profile.systemLogs || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    const userMsg = input.trim();
    const currentAttachment = attachment;
    
    setInput("");
    setAttachment(null);
    
    addChatMessage({ role: 'user', content: userMsg, attachment: currentAttachment || undefined });
    setIsLoading(true);

    try {
      const result = await systemChat({
        message: userMsg,
        photoDataUri: currentAttachment || undefined,
        userProfile: profile,
        history: history
      });

      addChatMessage({ role: 'model', content: result.reply });

      if (result.systemNotifications) {
        result.systemNotifications.forEach((n, i) => {
          setTimeout(() => showSystemNotification(n), (i + 1) * 800);
        });
      }

      if (result.systemActions) {
        const a = result.systemActions;
        if (a.updateLevel !== undefined) onUpdate({ level: a.updateLevel });
        if (a.newTitle) onUpdate({ title: a.newTitle });
        if (a.awardXp) onAddXp(a.awardXp);
        if (a.updateStats) onUpdate({ stats: { ...profile.stats, ...a.updateStats } });
        if (a.createTask) onAddSystemTask(a.createTask.title, a.createTask.xpReward, a.createTask.description);
        if (a.addStatusEffect) {
          addStatusEffect({
            name: a.addStatusEffect.name,
            description: a.addStatusEffect.description,
            multiplier: a.addStatusEffect.multiplier,
            type: a.addStatusEffect.type,
            expiresAt: Date.now() + (a.addStatusEffect.durationHours * 3600000)
          });
        }
        if (a.scheduleReminder) {
          scheduleReminder(a.scheduleReminder.message, a.scheduleReminder.delayMinutes);
        }
      }
    } catch (error) {
      addChatMessage({ role: 'model', content: "SYSTEM ERROR: Interface unstable." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="flex flex-col h-full bg-card/30 rounded-lg border border-primary/10 overflow-hidden">
      <div className="p-1 border-b border-primary/10 bg-primary/5 shrink-0">
        <TabsList className="w-full bg-transparent h-10 gap-2">
          <TabsTrigger value="terminal" className="flex-1 text-[9px] uppercase tracking-widest font-bold">Terminal</TabsTrigger>
          <TabsTrigger value="logs" className="flex-1 text-[9px] uppercase tracking-widest font-bold">Logs</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col">
        <TabsContent value="terminal" className="absolute inset-0 m-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {history.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2 rounded-lg text-xs leading-relaxed ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border border-primary/10'
                  }`}>
                    {m.attachment && (
                      <div className="mb-2 rounded overflow-hidden border border-white/10">
                        <img src={m.attachment} alt="Attachment" className="max-w-full h-auto" />
                      </div>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex justify-start animate-pulse p-4 text-[10px] uppercase opacity-50">Synchronizing...</div>}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-primary/10 bg-muted/10">
            {attachment && (
              <div className="mb-2 relative inline-block">
                <img src={attachment} className="h-20 w-20 object-cover rounded border border-primary/30" />
                <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"><X className="h-3 w-3" /></button>
              </div>
            )}
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Button size="icon" variant="ghost" className="shrink-0 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Input command..."
                className="bg-background/50 border-primary/20 text-xs h-10"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || (!input.trim() && !attachment)} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="absolute inset-0 m-0 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded border border-primary/10 bg-primary/5 space-y-1">
                <span className="text-[8px] font-black uppercase text-primary">[{log.type.toUpperCase()}]</span>
                <p className="text-[10px]">{log.message}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}

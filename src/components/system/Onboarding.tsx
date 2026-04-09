"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OnboardingProps {
  onComplete: (firstName: string, lastName: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onComplete(firstName, lastName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black italic uppercase glow-text-primary tracking-tighter">
            Identify Yourself
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">The system requires registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-primary/70 ml-1">First Name</label>
            <Input 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="E.g. Sung"
              className="bg-muted/20 border-primary/30 h-12 text-lg focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-primary/70 ml-1">Last Name</label>
            <Input 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="E.g. Jinwoo"
              className="bg-muted/20 border-primary/30 h-12 text-lg focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/80 text-lg font-bold uppercase tracking-widest">
            Enter System
          </Button>
        </form>
      </div>
    </div>
  );
}

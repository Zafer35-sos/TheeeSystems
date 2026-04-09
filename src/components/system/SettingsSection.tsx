
"use client";

import { UserProfile, UserTheme } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Palette, Image, User, Save, RefreshCw, Zap } from "lucide-react";
import { useState } from "react";

interface SettingsSectionProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onAscension: () => void;
}

const PRESET_COLORS = [
  { name: "System Blue", value: "260 72% 58%" },
  { name: "Shadow Purple", value: "280 80% 60%" },
  { name: "Blood Red", value: "0 80% 50%" },
  { name: "Gold Monarch", value: "45 100% 50%" },
  { name: "Frost Cyan", value: "190 90% 60%" },
  { name: "Beast Orange", value: "25 100% 50%" },
];

export function SettingsSection({ profile, onUpdate, onAscension }: SettingsSectionProps) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [bgImage, setBgImage] = useState(profile.theme.backgroundImage);
  const [opacity, setOpacity] = useState([profile.theme.opacity * 100]);

  const handleSaveProfile = () => {
    onUpdate({ firstName, lastName });
  };

  const handleUpdateTheme = (themeUpdates: Partial<UserTheme>) => {
    onUpdate({
      theme: {
        ...profile.theme,
        ...themeUpdates,
      }
    });
  };

  const isAscensionDisabled = profile.level <= 50;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left duration-500">
      {/* Profile Settings */}
      <div className="system-card space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Personal Data</h3>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground ml-1">First Name</Label>
            <Input 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-muted/10 border-primary/20 h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground ml-1">Last Name</Label>
            <Input 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)}
              className="bg-muted/10 border-primary/20 h-9 text-xs"
            />
          </div>
          <Button onClick={handleSaveProfile} className="w-full h-9 text-xs font-bold gap-2">
            <Save className="h-3.5 w-3.5" /> Update Profile
          </Button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="system-card space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Palette className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">System Interface</h3>
        </div>
        
        <div className="space-y-3">
          <Label className="text-[10px] uppercase text-muted-foreground">Accent Color</Label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleUpdateTheme({ primaryColor: color.value })}
                className={`h-8 rounded border transition-all text-[8px] font-bold uppercase ${
                  profile.theme.primaryColor === color.value 
                  ? 'border-white bg-primary text-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                  : 'border-white/10 bg-muted/20 text-muted-foreground hover:border-primary/50'
                }`}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-primary">
            <Image className="h-4 w-4" />
            <Label className="text-[10px] uppercase text-muted-foreground">Background URL</Label>
          </div>
          <Input 
            value={bgImage} 
            onChange={(e) => setBgImage(e.target.value)}
            placeholder="https://..."
            className="bg-muted/10 border-primary/20 h-9 text-xs"
          />
          <Button 
            onClick={() => handleUpdateTheme({ backgroundImage: bgImage })}
            variant="outline"
            className="w-full h-9 text-xs font-bold gap-2 border-primary/30"
          >
            Apply
          </Button>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] uppercase text-muted-foreground">Panel Opacity</Label>
            <span className="text-[10px] font-bold text-primary">{opacity}%</span>
          </div>
          <Slider 
            value={opacity} 
            onValueChange={(val) => {
              setOpacity(val);
              handleUpdateTheme({ opacity: val[0] / 100 });
            }} 
            max={100} 
            step={1} 
          />
        </div>
      </div>

      {/* Ascension Section */}
      <div className="system-card border-primary/20 bg-primary/5 space-y-4 mb-10">
        <div className="flex items-center gap-2 text-primary">
          <Zap className="h-4 w-4" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Ascension Protocol</h4>
        </div>
        <p className="text-[9px] text-muted-foreground leading-relaxed italic">
          "Reach Level 51 to authorize the Ascension Reset. Your level will be reborn at 1.2x your current level, but current XP will be purged. Cooldown: 30 days."
        </p>
        <Button 
          variant="outline" 
          disabled={isAscensionDisabled}
          className={`w-full h-10 text-xs font-bold gap-2 border-primary/40 hover:bg-primary/10 ${isAscensionDisabled ? 'opacity-30' : 'animate-pulse'}`}
          onClick={() => {
            if(confirm("Ascension Protocol initiated. Your current level will be multiplied by 1.2 and tasks will be reset. Proceed?")) {
              onAscension();
            }
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Ascension Reset
        </Button>
      </div>
    </div>
  );
}

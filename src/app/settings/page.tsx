'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import { useTheme } from 'next-themes';
import { themes } from '@/components/ThemeProvider';
import { Switch } from "@/components/ui/switch";

const REGIONS = [
  { value: 'BR1', label: 'Brazil', flag: '🇧🇷' },
  { value: 'EUN1', label: 'Europe Nordic & East', flag: '🇪🇺' },
  { value: 'EUW1', label: 'Europe West', flag: '🇪🇺' },
  { value: 'JP1', label: 'Japan', flag: '🇯🇵' },
  { value: 'KR', label: 'Korea', flag: '🇰🇷' },
  { value: 'LA1', label: 'Latin America North', flag: '🌎' },
  { value: 'LA2', label: 'Latin America South', flag: '🌎' },
  { value: 'NA1', label: 'North America', flag: '🇺🇸' },
  { value: 'OC1', label: 'Oceania', flag: '🇦🇺' },
  { value: 'PH2', label: 'Philippines', flag: '🇵🇭' },
  { value: 'RU', label: 'Russia', flag: '🇷🇺' },
  { value: 'SG2', label: 'Singapore', flag: '🇸🇬' },
  { value: 'TH2', label: 'Thailand', flag: '🇹🇭' },
  { value: 'TR1', label: 'Turkey', flag: '🇹🇷' },
  { value: 'TW2', label: 'Taiwan', flag: '🇹🇼' },
  { value: 'VN2', label: 'Vietnam', flag: '🇻🇳' },
];

function ThemePreview({ color, accentColor, label }: { color: string; accentColor: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="relative group">
        <div 
          className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ 
            background: `linear-gradient(45deg, ${color}, ${accentColor})` 
          }}
        />
        <div 
          className="relative text-lg font-bold"
          style={{ 
            background: `linear-gradient(45deg, ${color}, ${accentColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 20px ${color}33`
          }}
        >
          {label}
        </div>
      </div>
      <div 
        className="h-4 w-4 rounded-full"
        style={{
          background: `linear-gradient(45deg, ${color}, ${accentColor})`,
          boxShadow: `0 0 10px ${color}33`
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    region: 'NA1',
    summonerName: '',
    summonerTag: '',
    autoLoadHistory: true,
    showMatchIds: false,
    enableAnimations: true,
    enableSoundEffects: false,
  });

  // Initialize settings from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    router.back();
  };

  // Avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="summonerName">Default Summoner Name</Label>
                  <Input
                    id="summonerName"
                    value={settings.summonerName}
                    onChange={(e) => setSettings({ ...settings, summonerName: e.target.value })}
                    placeholder="Enter summoner name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summonerTag">Summoner Tag</Label>
                  <Input
                    id="summonerTag"
                    value={settings.summonerTag}
                    onChange={(e) => setSettings({ ...settings, summonerTag: e.target.value })}
                    placeholder="Enter tag (e.g., NA1)"
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Default Region</Label>
                <Select 
                  value={settings.region} 
                  onValueChange={(value) => setSettings({ ...settings, region: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {REGIONS.find(r => r.value === settings.region)?.flag} {REGIONS.find(r => r.value === settings.region)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem 
                        key={region.value} 
                        value={region.value}
                        className="flex items-center gap-2"
                      >
                        <span className="mr-2">{region.flag}</span>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Appearance</h3>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {theme && (
                          <ThemePreview 
                            color={themes.find(t => t.value === theme)?.color || themes[0].color}
                            accentColor={themes.find(t => t.value === theme)?.accentColor || themes[0].accentColor}
                            label={themes.find(t => t.value === theme)?.label || 'Select a theme'}
                          />
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {themes.map((t) => (
                      <SelectItem 
                        key={t.value} 
                        value={t.value}
                        className="flex items-center gap-2 py-2 hover:bg-accent/5 transition-colors"
                      >
                        <ThemePreview 
                          color={t.color} 
                          accentColor={t.accentColor}
                          label={t.label}
                        />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-load Match History</Label>
                    <p className="text-sm text-muted-foreground">Automatically load match history when visiting profile</p>
                  </div>
                  <Switch
                    checked={settings.autoLoadHistory}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoLoadHistory: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Match IDs</Label>
                    <p className="text-sm text-muted-foreground">Display match IDs in match history</p>
                  </div>
                  <Switch
                    checked={settings.showMatchIds}
                    onCheckedChange={(checked) => setSettings({ ...settings, showMatchIds: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
                  </div>
                  <Switch
                    checked={settings.enableAnimations}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableAnimations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Enable sound effects for interactions</p>
                  </div>
                  <Switch
                    checked={settings.enableSoundEffects}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableSoundEffects: checked })}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
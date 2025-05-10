import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_PROVIDERS, ChatSettings } from "@/lib/api-config";
import { FiSettings } from "react-icons/fi";

interface SettingsDialogProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function SettingsDialog({ settings, onSettingsChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setOpen(false);
  };

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      setLocalSettings({
        ...localSettings,
        provider: providerId,
        model: provider.models[0].id,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <FiSettings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">AI Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Configure your AI provider settings
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs defaultValue={localSettings.provider} onValueChange={handleProviderChange}>
            <TabsList className="grid grid-cols-2 mb-4">
              {AI_PROVIDERS.map(provider => (
                <TabsTrigger 
                  key={provider.id} 
                  value={provider.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {provider.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {AI_PROVIDERS.map(provider => (
              <TabsContent key={provider.id} value={provider.id}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      API Key
                    </label>
                    <Input
                      type="password"
                      placeholder={`Enter your ${provider.name} API Key`}
                      value={localSettings.apiKey}
                      onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
                      className="bg-muted border-input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your API key is stored locally in your browser and never sent to our servers.
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Model
                    </label>
                    <Select
                      value={localSettings.model}
                      onValueChange={(value) => setLocalSettings({...localSettings, model: value})}
                    >
                      <SelectTrigger className="bg-muted border-input">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {provider.models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border text-foreground"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
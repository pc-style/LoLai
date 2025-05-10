import { useState, useEffect, useRef, ReactNode, Children, cloneElement, isValidElement, ReactElement } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiPlus, FiLoader, FiChevronDown, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPlayerData, PlayerData } from "@/lib/riot-service";

interface PlayerDataFormProps {
  onPlayerDataFetched: (data: PlayerData) => void;
  children?: ReactNode;
}

const regions = [
  { id: "BR1", name: "Brazil", flag: "🇧🇷" },
  { id: "EUN1", name: "Europe Nordic & East", flag: "🇪🇺" },
  { id: "EUW1", name: "Europe West", flag: "🇪🇺" },
  { id: "JP1", name: "Japan", flag: "🇯🇵" },
  { id: "KR", name: "Korea", flag: "🇰🇷" },
  { id: "LA1", name: "Latin America North", flag: "🌎" },
  { id: "LA2", name: "Latin America South", flag: "🌎" },
  { id: "NA1", name: "North America", flag: "🇺🇸" },
  { id: "OC1", name: "Oceania", flag: "🇦🇺" },
  { id: "PH2", name: "Philippines", flag: "🇵🇭" },
  { id: "RU", name: "Russia", flag: "🇷🇺" },
  { id: "SG2", name: "Singapore", flag: "🇸🇬" },
  { id: "TH2", name: "Thailand", flag: "🇹🇭" },
  { id: "TR1", name: "Turkey", flag: "🇹🇷" },
  { id: "TW2", name: "Taiwan", flag: "🇹🇼" },
  { id: "VN2", name: "Vietnam", flag: "🇻🇳" }
];

export function PlayerDataForm({ onPlayerDataFetched, children }: PlayerDataFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [region, setRegion] = useState("NA1");
  const [regionName, setRegionName] = useState("North America");
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set mounted state and load settings after component mounts
  useEffect(() => {
    setIsMounted(true);
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const defaultRegion = settings.region || "NA1";
      const defaultRegionData = regions.find(r => r.id === defaultRegion);
      if (defaultRegionData) {
        setRegion(defaultRegionData.id);
        setRegionName(defaultRegionData.name);
      }
      if (settings.summonerName) {
        setGameName(settings.summonerName);
      }
      if (settings.summonerTag) {
        setTagLine(settings.summonerTag);
      }
    }
    return () => setIsMounted(false);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isRegionDropdownOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRegionDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRegionDropdownOpen]);

  const handleSubmit = async () => {
    if (!gameName || !tagLine) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const playerData = await fetchPlayerData(region, gameName, tagLine);
      onPlayerDataFetched(playerData);
      setIsOpen(false);
    } catch (err) {
      setError("Failed to fetch player data. Please check your inputs and try again.");
      console.error("Error fetching player data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionChange = (regionId: string) => {
    const selectedRegion = regions.find(r => r.id === regionId);
    if (selectedRegion) {
      setRegion(regionId);
      setRegionName(selectedRegion.name);
      setIsRegionDropdownOpen(false);
    }
  };

  const handleClick = () => setIsOpen(true);

  const renderTrigger = () => {
    if (!children) {
      return (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleClick}
          className="h-10 w-10 rounded-full"
        >
          <FiPlus className="h-4 w-4" />
          <span className="sr-only">Add player data</span>
        </Button>
      );
    }

    return Children.map(children, (child) => {
      if (isValidElement(child)) {
        const childElement = child as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
        return cloneElement(childElement, {
          onClick: (e: React.MouseEvent) => {
            childElement.props.onClick?.(e);
            handleClick();
          }
        });
      }
      return child;
    });
  };

  return (
    <div className="relative">
      {renderTrigger()}

      {/* Modal Portal */}
      {isMounted && isOpen && typeof document !== "undefined" && 
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"
                onClick={() => setIsOpen(false)}
              />
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-80 p-6 rounded-2xl border border-border bg-background/95 shadow-2xl flex flex-col"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        id="region"
                        onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                        className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs h-9"
                      >
                        <span>{regionName}</span>
                        <FiChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      
                      {isRegionDropdownOpen && (
                        <div className="absolute mt-1 w-full rounded-md border border-border bg-popover shadow-md z-[99999]">
                          <ul className="py-1 max-h-60 overflow-auto">
                            {regions.map((reg) => (
                              <li 
                                key={reg.id}
                                className={`px-2 py-1.5 text-sm cursor-pointer flex items-center justify-between hover:bg-accent hover:text-accent-foreground ${region === reg.id ? 'bg-accent/50' : ''}`}
                                onClick={() => handleRegionChange(reg.id)}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{reg.flag}</span>
                                  <span>{reg.name}</span>
                                </span>
                                {region === reg.id && <FiCheck className="h-4 w-4" />}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gameName">Game Name</Label>
                    <Input
                      id="gameName"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder="Enter game name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagLine">Tag Line</Label>
                    <Input
                      id="tagLine"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                      placeholder="Enter tag (e.g. NA1)"
                    />
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                        Fetching data...
                      </>
                    ) : (
                      "Add Your Data"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      }
    </div>
  );
} 
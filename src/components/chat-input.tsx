import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FiSend, FiLoader, FiPlus, FiCommand, FiSmile } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerDataForm } from "./player-data-form";
import { formatPlayerDataForAI, PlayerData } from "@/lib/riot-service";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [showPlayerDataBadge, setShowPlayerDataBadge] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (playerData) {
      setShowPlayerDataBadge(true);
    }
  }, [playerData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      let messageContent = input;
      
      if (playerData && showPlayerDataBadge) {
        const playerDataContext = formatPlayerDataForAI(playerData);
        messageContent = `${messageContent}\n\n[Player Context: ${playerDataContext}]`;
        setShowPlayerDataBadge(false);
      }
      
      onSendMessage(messageContent);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePlayerDataFetched = (data: PlayerData) => {
    setPlayerData(data);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`flex gap-2 items-end transition-all duration-300 ${
        isFocused ? "glass-effect-strong shadow-lg" : "glass-effect"
      } rounded-2xl p-2`}>
        {/* Player data form */}
        <div className="flex items-center">
          <PlayerDataForm onPlayerDataFetched={handlePlayerDataFetched}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`h-10 w-10 rounded-xl transition-colors button-3d flex items-center justify-center ${
                showPlayerDataBadge ? "text-primary bg-primary/10" : "hover:bg-muted/50"
              }`}
            >
              <FiPlus className="h-4 w-4" />
              <span className="sr-only">Add player data</span>
            </motion.button>
          </PlayerDataForm>
          
          <AnimatePresence>
            {isMounted && showPlayerDataBadge && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
              >
                Player data added
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask something about League of Legends..."
            className="min-h-[48px] max-h-[200px] bg-muted/30 resize-none rounded-xl border-none focus:ring-1 focus:ring-primary/20 transition-all flex-1 text-sm placeholder:text-muted-foreground/50 pr-10"
            disabled={isLoading}
          />
          
          {/* Character count */}
          {isMounted && input.length > 0 && (
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/70">
              {input.length}
            </div>
          )}
        </div>
        
        <div className="flex gap-1">
          {/* Additional buttons */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-xl bg-muted/30 hover:bg-muted/50 flex items-center justify-center text-muted-foreground transition-colors"
            disabled={isLoading}
          >
            <FiSmile className="h-4 w-4" />
            <span className="sr-only">Add emoji</span>
          </motion.button>
          
          {/* Send button */}
          <motion.button 
            type="submit" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isLoading}
            className={`h-10 w-10 rounded-xl glass-effect-strong button-3d hover:bg-primary/20 text-primary transition-colors flex items-center justify-center ${
              !input.trim() ? "opacity-50" : "opacity-100"
            }`}
          >
            {isLoading ? (
              <FiLoader className="h-4 w-4 animate-spin" />
            ) : (
              <FiSend className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </motion.button>
        </div>
      </div>

      {isMounted && (
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted/30">Enter</kbd>
              <span>send</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted/30">Shift + Enter</kbd>
              <span>new line</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted/30">
                <FiCommand className="inline-block h-2.5 w-2.5" />
                <span>K</span>
              </kbd>
              <span>commands</span>
            </div>
          </div>
        </div>
      )}
    </motion.form>
  );
} 
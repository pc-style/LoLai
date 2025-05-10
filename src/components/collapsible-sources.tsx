import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface CollapsibleSourcesProps {
  sources: string[];
}

export function CollapsibleSources({ sources }: CollapsibleSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="mt-4 border-t border-border/20 pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground/80 transition-colors p-2"
      >
        <span>{isExpanded ? "Hide Sources" : "Show Sources"}</span>
        {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </Button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-2 px-3 space-y-1 text-xs text-muted-foreground bg-background/30 backdrop-blur-sm rounded-md mt-2">
              {sources.map((source, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-primary/70">•</span>
                  <span className="truncate">{source}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onStartChatting: () => void;
}

export function HeroSection({ onStartChatting }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden py-10 w-full h-full flex flex-col justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjY1NyAwIDMgMS4zNDMgMyAzdjE4YzAgMS42NTctMS4zNDMgMy0zIDNIMThjLTEuNjU3IDAtMy0xLjM0My0zLTNWMjFjMC0xLjY1NyAxLjM0My0zIDMtM2gxOHptMCA0LjVIMTh2MTVoMTh2LTE1eiIgc3Ryb2tlPSJyZ2JhKDI1NSwxNzAsMCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTMwIDBoMzB2NjBIMzBWMHptMCAwSDBoMzB2NjBIMFYweiIgc3Ryb2tlPSJyZ2JhKDI1NSwxNzAsMCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-10"/>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full px-4 py-16 text-center flex-1 flex flex-col justify-center"
      >
        <div className="mb-6 inline-block">
          <motion.div 
            className="relative h-12 w-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/90 via-accent/80 to-secondary/90 p-0.5 shadow-lg shadow-primary/10 backdrop-blur-sm"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.02, 1, 1.02, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 10, 
              ease: "easeInOut" 
            }}
          >
            <div className="h-full w-full bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">LoL</span>
            </div>
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary via-accent to-secondary text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          LoL AI Assistant
        </motion.h1>
        
        <motion.p 
          className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Your personal League of Legends coach with matchup advice, builds, and strategies
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            onClick={onStartChatting} 
            size="lg" 
            className="text-sm sm:text-base px-5 py-3 bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
          >
            Start Chatting
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 
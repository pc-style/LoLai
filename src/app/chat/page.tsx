"use client";

import { ChatContainer } from "@/components/chat-container";
import { CoachingDashboard } from "@/components/coaching-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowLeft, FiCommand, FiGithub, FiZap, FiBarChart2 } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import SettingsButton from "@/components/SettingsButton";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // For glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elements = document.querySelectorAll('.glow-effect');
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      (element as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (element as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex min-h-screen h-screen flex-col bg-background relative w-full overflow-hidden noise-bg"
    >
      {/* Dynamic background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: [0, 10, 0, -10, 0],
              y: [0, -10, 0, 10, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -15, 0, 15, 0],
              y: [0, 15, 0, -15, 0],
              rotate: [0, -2, 0, 2, 0]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1, 0.9, 1],
              x: [0, 5, 0, -5, 0],
              y: [0, -5, 0, 5, 0]
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" 
          />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, hsl(var(--foreground)/0.15) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 glass-effect-strong"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ x: -5 }}
          >
            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-background/50 transition-all button-3d"
              >
                <FiArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back</span>
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/session-summaries">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-background/50 transition-all button-3d text-primary"
              >
                <FiBarChart2 className="h-4 w-4" />
                <span className="font-medium">Session Summaries</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <ThemeToggle />
        <SettingsButton />
      </motion.nav>

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex-1 flex flex-col relative z-10"
      >
        <div className="flex-1 flex flex-col w-full h-full max-w-6xl mx-auto px-4">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="coaching">Coaching</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex-1 flex flex-col glass-effect-strong rounded-xl border border-border/50 overflow-hidden shadow-lg glow-effect"
              >
                <ChatContainer />
              </motion.div>
            </TabsContent>
            <TabsContent value="coaching">
              <CoachingDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
      
      {/* Floating action button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="h-12 w-12 rounded-full glass-effect-strong flex items-center justify-center text-primary shadow-lg hover:shadow-primary/20"
        >
          <FiZap className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </main>
  );
} 
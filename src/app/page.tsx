"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiMessageSquare, FiZap, FiTarget } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import SettingsButton from "@/components/SettingsButton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // For glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.querySelectorAll('.glow-effect');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    });
  };

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="flex min-h-screen flex-col bg-background relative overflow-hidden noise-bg"
    >
      {/* Background effects */}
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
            className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px]" 
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
            className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-[100px]" 
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 dark:bg-accent/5 rounded-full blur-[100px]" 
          />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full border-b border-border/40 glass-effect-strong"
      >
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-gradient">LoL</span>
                </div>
                <span className="font-medium text-lg">AI Assistant</span>
              </motion.div>
            </div>
            <nav className="flex items-center space-x-4">
              <SettingsButton />
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg blur-xl opacity-70 -z-10"></div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mb-6">
            Your <span className="text-gradient shimmer font-extrabold">Intelligent</span> League of Legends Assistant
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mb-8"
        >
          Get instant answers about champions, items, strategies, and more. Powered by advanced AI for accurate and personalized insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/chat" className="inline-flex">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="glass-effect-strong hover-glow button-3d px-8 py-3 rounded-xl text-foreground font-medium transition-all duration-300 flex items-center gap-2"
            >
              Start Chatting
              <FiMessageSquare className="size-5" />
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-4 w-full max-w-7xl">
          {[
            {
              icon: <FiMessageSquare className="h-6 w-6 text-primary" />,
              title: "Smart Conversations",
              description: "Natural dialogue with context-aware responses about champions, items, and strategies.",
              color: "primary",
              hoverBorderColor: "border-primary/30",
              bgColor: "bg-primary/5 dark:bg-primary/10"
            },
            {
              icon: <FiZap className="h-6 w-6 text-secondary" />,
              title: "Advanced AI",
              description: "Powered by Google's Gemini 2.5 Flash for accurate and up-to-date gaming insights.",
              color: "secondary",
              hoverBorderColor: "border-secondary/30",
              bgColor: "bg-secondary/5 dark:bg-secondary/10"
            },
            {
              icon: <FiTarget className="h-6 w-6 text-accent" />,
              title: "Personalized Advice",
              description: "Get tailored recommendations based on your playstyle and match history.",
              color: "accent",
              hoverBorderColor: "border-accent/30",
              bgColor: "bg-accent/5 dark:bg-accent/10"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
              className={`glass-card glow-effect p-6 rounded-2xl text-left space-y-3 hover:${feature.hoverBorderColor} transition-colors`}
            >
              <div className={`h-12 w-12 rounded-xl ${feature.bgColor} flex items-center justify-center animate-pulse-slow`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Loading Overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => setIsLoading(false)}
        className={`fixed inset-0 z-50 bg-background flex items-center justify-center ${isLoading ? '' : 'pointer-events-none'}`}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-16 w-16 rounded-xl glass-effect-strong flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-gradient">LoL</span>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 w-full border-t border-border/40 glass-effect-strong py-6"
      >
        <div className="container flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with <span className="text-accent">❤️</span> for the League of Legends community
          </p>
        </div>
      </motion.footer>
    </main>
  );
}

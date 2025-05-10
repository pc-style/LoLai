import { useEffect, useRef, useState } from "react";
import { ChatMessages } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatMessage, ChatSettings, AI_MODELS } from "@/lib/api-config";
import { sendChatMessage } from "@/lib/chat-service";
import { motion, AnimatePresence } from "framer-motion";
import { getGeminiApiKey } from "@/lib/env";
import { FiCpu } from "react-icons/fi";

// Fixed settings for Gemini 2.5 Flash
const GEMINI_SETTINGS: ChatSettings = {
  provider: "gemini",
  model: AI_MODELS.GEMINI.GEMINI_FLASH,
  apiKey: "",
};

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<ChatSettings>(GEMINI_SETTINGS);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    const apiKey = getGeminiApiKey();
    setSettings({ ...GEMINI_SETTINGS, apiKey });
  }, []);

  useEffect(() => {
    if (isMounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMounted]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const hasPlayerContext = content.includes("[Player Context:");
    let userMessage = content;
    let playerContext = "";
    
    if (hasPlayerContext) {
      const parts = content.split("[Player Context:");
      userMessage = parts[0].trim();
      playerContext = parts[1].replace(/\]$/, "").trim();
    }

    const userMessageObj: ChatMessage = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMessageObj]);
    
    if (!settings.apiKey) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "API key not found. Please add your Gemini API key to the .env.local file."
        }
      ]);
      return;
    }

    setIsLoading(true);
    setTypingIndicator(true);
    
    try {
      const allMessages = [...messages, userMessageObj];
      let contextualMessages = allMessages;
      
      if (playerContext) {
        contextualMessages = [...messages];
        contextualMessages.push({ 
          role: "system", 
          content: `The user has provided their League of Legends player data. Use this information to personalize your response: ${playerContext}`
        });
        contextualMessages.push(userMessageObj);
      }
      
      const response = await sendChatMessage(contextualMessages, settings);
      
      // Small delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, 500));
      setTypingIndicator(false);
      
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setTypingIndicator(false);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please check your API key and try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/50">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <motion.div 
                className="w-20 h-20 mb-6 rounded-2xl glass-effect-strong flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <FiCpu className="w-10 h-10 text-gradient" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="heading-lg mb-3 text-gradient shimmer">Welcome to LoL AI</h2>
                <p className="body-base text-muted-foreground max-w-md">
                  Your personal League of Legends assistant powered by Gemini 2.5 Flash. Ask me anything about the game, strategies, or your gameplay!
                </p>
              </motion.div>
              
              {isMounted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg"
                >
                  {[
                    "What are the best champions for beginners?",
                    "How do I improve my CS score?",
                    "Explain the current meta",
                    "Best build for Yasuo?"
                  ].map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-3 text-sm text-left rounded-xl glass-effect hover:glass-effect-strong transition-all duration-300"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
              <ChatMessages messages={messages} />
              <div ref={messagesEndRef} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="relative border-t border-border/50 p-4 glass-effect-strong">
        {/* Typing indicator */}
        <AnimatePresence>
          {isMounted && typingIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2"
            >
              <div className="glass-effect-strong px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <div className="flex items-center">
                  <motion.span 
                    className="h-2 w-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
                  />
                  <motion.span 
                    className="h-2 w-2 bg-primary rounded-full mx-1"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, delay: 0.2, repeat: Infinity, repeatType: "loop" }}
                  />
                  <motion.span 
                    className="h-2 w-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, delay: 0.4, repeat: Infinity, repeatType: "loop" }}
                  />
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
} 
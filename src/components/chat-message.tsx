import { ChatMessage } from "@/lib/api-config";
import { FiUser, FiCopy, FiCheck, FiCode, FiExternalLink, FiChevronDown } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract sources from the message content if present
  const { content, sources } = extractSources(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group flex gap-4 px-4 py-6 hover:bg-muted/5 transition-colors rounded-xl ${isUser ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-10 h-10 rounded-xl glass-effect-strong flex items-center justify-center ${
            isUser ? "bg-primary/10" : "bg-secondary/10"
          }`}
        >
          {isUser ? (
            <FiUser className="w-5 h-5 text-primary" />
          ) : (
            <FaRobot className="w-5 h-5 text-secondary" />
          )}
        </motion.div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 space-y-2 ${isUser ? "text-right" : "text-left"}`}>
        <motion.div 
          layout
          className={`inline-block max-w-[85%] text-sm ${
            isUser ? "bg-primary text-primary-foreground" : "glass-effect-strong"
          } rounded-2xl px-4 py-3 shadow-sm`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-white">{content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none markdown-content">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ children, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/90 hover:scale-[1.01] underline underline-offset-4 transition-all inline-flex items-center gap-1"
                    >
                      {children}
                      <FiExternalLink className="w-3 h-3" />
                    </a>
                  ),
                  code: ({ className, children }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    
                    return isInline ? (
                      <code className="bg-muted/30 px-1.5 py-0.5 rounded text-foreground font-mono text-sm">
                        {children}
                      </code>
                    ) : (
                      <div className="relative group my-4">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigator.clipboard.writeText(String(children))}
                            className="p-1.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-1"
                          >
                            <FiCode className="w-3.5 h-3.5" />
                            <span className="text-xs">Copy</span>
                          </motion.button>
                        </div>
                        <motion.pre 
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="!mt-0 !bg-muted/30 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-border/50"
                        >
                          <code className={className}>{children}</code>
                        </motion.pre>
                      </div>
                    );
                  },
                  pre: ({ children }) => (
                    <div className="not-prose">{children}</div>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 space-y-2 my-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 space-y-2 my-4">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="marker:text-primary">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mt-6 mb-4 text-gradient-static">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mt-6 mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold mt-6 mb-3">{children}</h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary pl-4 italic my-4 py-1 bg-primary/5 rounded-r">{children}</blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-border/50 rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-muted/30 px-4 py-2 text-left font-semibold border border-border/50">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 border border-border/50">{children}</td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </motion.div>

        {/* Copy button */}
        <AnimatePresence>
          {isMounted && !isUser && isHovered && (
            <motion.button
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              onClick={handleCopy}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 glass-effect px-2 py-1 rounded-md shadow-sm"
            >
              {isCopied ? (
                <>
                  <FiCheck className="w-3 h-3 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-3 h-3" />
                  <span>Copy response</span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Sources */}
        {isMounted && !isUser && sources.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            <motion.button
              onClick={() => setIsSourcesOpen(!isSourcesOpen)}
              className="flex items-center gap-2 glass-effect px-3 py-2 rounded-lg w-full text-left"
            >
              <motion.span
                animate={{ rotate: isSourcesOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown className="w-4 h-4" />
              </motion.span>
              <span className="font-medium text-gradient-static">Sources ({sources.length})</span>
            </motion.button>
            
            <AnimatePresence>
              {isSourcesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="glass-effect mt-2 p-3 rounded-xl">
                    <ul className="space-y-1">
                      {sources.map((source, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Helper function to extract sources from message content
function extractSources(content: string): { content: string; sources: string[] } {
  const sourcesSeparator = "\n\nSources:";
  const parts = content.split(sourcesSeparator);
  
  if (parts.length === 1) {
    return { content, sources: [] };
  }
  
  const mainContent = parts[0];
  const sourcesText = parts[1];
  const sources = sourcesText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("- "))
    .map(line => line.substring(2));
  
  return { content: mainContent, sources };
}

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {messages.filter(msg => msg.role !== "system").map((message, index) => (
        <ChatMessageItem key={index} message={message} />
      ))}
    </motion.div>
  );
} 
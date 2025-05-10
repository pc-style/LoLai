import { motion } from "framer-motion";

export function LoadingAnimation() {
  return (
    <motion.div 
      className="flex items-center gap-2 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative h-8 flex items-center" style={{ width: '40px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80"
            animate={{
              x: [i * 10, i * 10 + 4, i * 10],
              y: [0, -6, 0],
              opacity: [0.7, 1, 0.7],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            style={{
              left: i * 10
            }}
          />
        ))}
      </div>
      <motion.span
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Searching and thinking...
      </motion.span>
    </motion.div>
  );
} 
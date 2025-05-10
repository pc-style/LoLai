import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { FiSun, FiMoon } from "react-icons/fi"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full relative overflow-hidden"
      >
        <div className="relative size-4 opacity-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full relative overflow-hidden"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <div className="relative size-4">
        <motion.div
          initial={{ scale: theme === "light" ? 1 : 0, opacity: theme === "light" ? 1 : 0 }}
          animate={{
            scale: theme === "light" ? 1 : 0,
            opacity: theme === "light" ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <FiSun className="size-4" />
        </motion.div>
        <motion.div
          initial={{ scale: theme === "dark" ? 1 : 0, opacity: theme === "dark" ? 1 : 0 }}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            opacity: theme === "dark" ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <FiMoon className="size-4" />
        </motion.div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 
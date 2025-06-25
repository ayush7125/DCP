import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Tooltip({ children, text }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 rounded bg-black/80 text-xs text-white whitespace-nowrap z-50 shadow-lg pointer-events-none"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
} 
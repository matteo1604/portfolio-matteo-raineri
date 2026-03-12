import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

interface SectionTransitionProps {
  variant?: "grid" | "gradient" | "particles";
}

export function SectionTransition({ variant = "grid" }: SectionTransitionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "0px" });

  if (variant === "gradient") {
    return (
      <div ref={ref} className="relative h-48 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      </div>
    );
  }

  if (variant === "particles") {
    return (
      <div ref={ref} className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500/40"
              initial={{ y: 0, opacity: 0 }}
              animate={isInView ? {
                y: [-50, 50],
                opacity: [0, 1, 0]
              } : {}}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div ref={ref} className="relative h-48 overflow-hidden">
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 h-px top-1/2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.5 }}
      />
    </div>
  );
}

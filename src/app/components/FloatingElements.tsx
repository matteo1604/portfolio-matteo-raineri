import { motion } from "motion/react";

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Geometric Shapes */}
      <motion.div
        className="absolute top-[20vh] left-[5vw] w-20 h-20 border border-blue-500/10 rounded-xl"
        animate={{
          y: [0, -100, 0],
          x: [0, 50, 0],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[60vh] right-[8vw] w-16 h-16 border border-blue-400/10 rounded-full"
        animate={{
          y: [0, 80, 0],
          x: [0, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[40vh] right-[15vw] w-12 h-12 border border-cyan-500/10 rounded-lg rotate-45"
        animate={{
          y: [0, -60, 0],
          rotate: [45, 135, 45],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[80vh] left-[12vw] w-24 h-24 border border-blue-300/10 rounded-2xl"
        animate={{
          y: [0, -90, 0],
          x: [0, 60, 0],
          rotate: [0, -45, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[35vh] left-[25vw] w-14 h-14 border border-blue-500/10 rounded-full"
        animate={{
          y: [0, 70, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle Gradient Orbs that float through */}
      <motion.div
        className="absolute top-[50vh] right-[20vw] w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"
        animate={{
          y: [0, -150, 0],
          x: [0, -80, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[70vh] left-[30vw] w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"
        animate={{
          y: [0, 120, 0],
          x: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

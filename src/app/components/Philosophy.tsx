import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

export function Philosophy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 py-48 bg-gradient-to-b from-[#000000] via-[#050510] to-[#000000]"
    >
      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Gradient Glows */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-24"
        >
          {/* Main Statement */}
          <h2 className="text-[clamp(2.5rem,7vw,7rem)] leading-[1.1] text-white max-w-5xl">
            Design, performance and interaction working together to create{" "}
            <span className="text-blue-400">meaningful digital experiences</span>.
          </h2>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="ml-auto max-w-2xl"
          >
            <p className="text-2xl md:text-3xl text-blue-100/70 leading-relaxed">
              I believe in building experiences that feel natural, perform flawlessly, 
              and leave a lasting impression. Every line of code is an opportunity to 
              craft something exceptional.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Decorative Elements */}
      <motion.div
        className="absolute top-1/4 right-[10%] w-72 h-72 border border-blue-500/10 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.8 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-[5%] w-48 h-48 border border-blue-500/10 rounded-2xl rotate-12"
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={isInView ? { scale: 1, opacity: 1, rotate: 12 } : {}}
        transition={{ duration: 1.5, delay: 1 }}
      />
    </section>
  );
}
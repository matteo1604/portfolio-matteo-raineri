import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Lightbulb, Palette, Code, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Concept",
    description: "Understanding goals and defining the vision",
    icon: Lightbulb,
  },
  {
    number: "02",
    title: "Design",
    description: "Crafting user experiences and visual identity",
    icon: Palette,
  },
  {
    number: "03",
    title: "Development",
    description: "Building with modern technologies and best practices",
    icon: Code,
  },
  {
    number: "04",
    title: "Launch",
    description: "Deploying and optimizing for performance",
    icon: Rocket,
  }
];

export function Process() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 py-48 bg-[#000000]"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-32 text-center"
        >
          <h2 className="text-[clamp(3rem,8vw,9rem)] leading-none text-white mb-8">
            Development
            <br />
            <span className="text-blue-400">Process</span>
          </h2>
          <p className="text-2xl text-blue-100/60 max-w-2xl mx-auto leading-relaxed">
            A systematic approach to creating exceptional digital products
          </p>
        </motion.div>

        {/* Horizontal Timeline - Desktop */}
        <div className="hidden lg:block relative">
          {/* Horizontal Connection Line */}
          <motion.div 
            className="absolute top-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          {/* Steps - Horizontal Layout */}
          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.15,
                  ease: "easeOut"
                }}
                className="relative"
              >
                {/* Connection Dot */}
                <div className="flex justify-center mb-8">
                  <motion.div 
                    className="relative w-8 h-8 rounded-full border-2 border-blue-500/50 bg-[#000000] group-hover:border-blue-400 transition-colors duration-500"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                  >
                    <div className="absolute inset-2 rounded-full bg-blue-500/60" />
                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                  </motion.div>
                </div>

                {/* Card */}
                <div className="relative p-8 border border-blue-500/30 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent backdrop-blur-sm group hover:border-blue-400/50 transition-all duration-500 min-h-[340px] flex flex-col">
                  {/* Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  <div className="relative z-10 space-y-6 flex-1 flex flex-col">
                    {/* Icon and Number */}
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-xl border border-blue-500/40 bg-blue-500/10 flex items-center justify-center group-hover:border-blue-400/60 group-hover:bg-blue-500/20 transition-all duration-500">
                        <step.icon className="w-8 h-8 text-blue-400" />
                      </div>
                      <span className="text-5xl font-light text-blue-500/20 group-hover:text-blue-500/30 transition-colors duration-500">
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <h3 className="text-3xl text-white">{step.title}</h3>
                      <p className="text-blue-100/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Decorative Corners */}
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400/20 rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400/20 rounded-bl-lg" />
                </div>

                {/* Arrow Connector (except last item) */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden xl:block absolute top-24 -right-4 w-8 h-px bg-blue-500/40"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r border-t border-blue-500/40" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Grid Fallback */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.2 + index * 0.15,
                ease: "easeOut"
              }}
              className="relative"
            >
              <div className="relative p-8 border border-blue-500/30 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent backdrop-blur-sm group hover:border-blue-400/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-xl border border-blue-500/40 bg-blue-500/10 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-blue-400" />
                    </div>
                    <span className="text-5xl font-light text-blue-500/20">
                      {step.number}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl text-white">{step.title}</h3>
                    <p className="text-blue-100/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Accent Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
          className="mt-24 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
        />
      </div>
    </section>
  );
}

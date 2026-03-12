import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

const skills = [
  { name: "HTML", color: "from-orange-500/20 to-red-500/20", position: { top: "15%", left: "10%" }, delay: 0.2, size: "large" },
  { name: "CSS", color: "from-blue-500/20 to-cyan-500/20", position: { top: "20%", right: "15%" }, delay: 0.3, size: "medium" },
  { name: "JavaScript", color: "from-yellow-500/20 to-orange-500/20", position: { top: "45%", left: "8%" }, delay: 0.4, size: "large" },
  { name: "React", color: "from-cyan-500/20 to-blue-500/20", position: { top: "10%", left: "45%" }, delay: 0.5, size: "xlarge" },
  { name: "UI/UX Design", color: "from-purple-500/20 to-pink-500/20", position: { top: "50%", right: "10%" }, delay: 0.6, size: "large" },
  { name: "Responsive Design", color: "from-blue-500/20 to-indigo-500/20", position: { bottom: "20%", left: "25%" }, delay: 0.7, size: "medium" },
  { name: "Web Performance", color: "from-green-500/20 to-emerald-500/20", position: { bottom: "25%", right: "20%" }, delay: 0.8, size: "large" }
];

const sizeClasses = {
  medium: "w-40 h-40 text-base",
  large: "w-48 h-48 text-lg",
  xlarge: "w-56 h-56 text-xl"
};

export function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-150px" });

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 py-48 bg-[#000000]"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-7xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-32 text-center"
        >
          <h2 className="text-[clamp(3rem,8vw,9rem)] leading-none text-white mb-8">
            Frontend
            <br />
            <span className="text-blue-400">Ecosystem</span>
          </h2>
          <p className="text-2xl text-blue-100/60 max-w-2xl mx-auto leading-relaxed">
            Technologies and skills that power modern web experiences
          </p>
        </motion.div>

        {/* Floating Skills Cluster - Desktop */}
        <div className="hidden lg:block relative h-[700px]">
          {skills.map((skill) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { 
                opacity: 1, 
                scale: 1,
                y: [0, -20, 0],
              } : {}}
              transition={{
                opacity: { duration: 0.8, delay: skill.delay },
                scale: { duration: 0.8, delay: skill.delay },
                y: {
                  duration: 5 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: skill.delay
                }
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3 }
              }}
              className={`absolute ${sizeClasses[skill.size]} cursor-pointer group`}
              style={skill.position}
            >
              <div className={`relative w-full h-full rounded-3xl border border-blue-500/30 bg-gradient-to-br ${skill.color} backdrop-blur-md overflow-hidden flex items-center justify-center`}>
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-20">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                </div>

                {/* Text */}
                <div className="relative z-10 text-center px-4">
                  <h3 className={`${sizeClasses[skill.size].split(' ')[2]} font-medium text-white group-hover:text-blue-200 transition-colors duration-300`}>
                    {skill.name}
                  </h3>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-blue-400/30 rounded-tr-xl" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-blue-400/30 rounded-bl-xl" />
              </div>
            </motion.div>
          ))}

          {/* Center Connecting Lines */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500/50 rounded-full">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping" />
          </div>
        </div>

        {/* Mobile Grid Fallback */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: skill.delay,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              <div className={`relative h-48 p-8 border border-blue-500/30 rounded-2xl bg-gradient-to-br ${skill.color} backdrop-blur-sm overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 text-center">
                  <h3 className="text-xl text-white group-hover:text-blue-200 transition-colors duration-300">
                    {skill.name}
                  </h3>
                </div>

                <div className="absolute bottom-0 right-0 w-20 h-20 border-t border-l border-blue-500/10 rounded-tl-2xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
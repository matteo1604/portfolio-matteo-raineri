import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Nexus Platform",
    description: "A comprehensive dashboard for real-time data visualization and analytics",
    tags: ["React", "TypeScript", "D3.js"],
    year: "2026",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Aurora Design System",
    description: "Component library and design system for enterprise applications",
    tags: ["React", "Storybook", "Tailwind"],
    year: "2025",
    color: "from-purple-500/20 to-blue-500/20"
  },
  {
    title: "Velocity Commerce",
    description: "High-performance e-commerce platform with seamless checkout experience",
    tags: ["Next.js", "React", "Stripe"],
    year: "2025",
    color: "from-blue-500/20 to-indigo-500/20"
  },
  {
    title: "Pulse Analytics",
    description: "Interactive data visualization dashboard for marketing insights",
    tags: ["React", "Recharts", "TypeScript"],
    year: "2024",
    color: "from-cyan-500/20 to-blue-500/20"
  }
];

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="relative min-h-screen px-6 md:px-12 lg:px-24 py-48 bg-gradient-to-b from-[#000000] via-[#050510] to-[#000000]"
    >
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

      {/* Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-40"
        >
          <h2 className="text-[clamp(3rem,8vw,9rem)] leading-none text-white mb-8">
            Selected
            <br />
            <span className="text-blue-400">Works</span>
          </h2>
          <p className="text-2xl text-blue-100/60 max-w-2xl leading-relaxed">
            Projects that showcase the intersection of design and technology
          </p>
        </motion.div>

        {/* Projects - Editorial Layout */}
        <div className="space-y-48">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 100 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 1.2,
                delay: index * 0.25,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="group cursor-pointer"
            >
              <div className={`grid md:grid-cols-12 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                {/* Project Visual - Larger and more prominent */}
                <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:col-start-6' : ''}`}>
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-blue-500/30 group-hover:border-blue-400/50 transition-all duration-700">
                    {/* Enhanced Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.color} group-hover:scale-110 transition-transform duration-1000`} />
                    
                    {/* Refined Grid Overlay */}
                    <div className="absolute inset-0 opacity-30">
                      <div 
                        className="w-full h-full"
                        style={{
                          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                                           linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
                          backgroundSize: '50px 50px'
                        }}
                      />
                    </div>

                    {/* Cinematic Center Element */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="w-48 h-48 border-2 border-blue-400/40 rounded-full"
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.8 }}
                      />
                      <div className="absolute w-24 h-24 border border-blue-300/30 rounded-full" />
                    </div>

                    {/* Hover Overlay with Arrow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end justify-end p-10">
                      <motion.div 
                        className="w-16 h-16 rounded-full border-2 border-white/60 flex items-center justify-center backdrop-blur-md bg-white/10"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowUpRight className="w-7 h-7 text-white" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Project Info - Enhanced Typography */}
                <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''} space-y-8`}>
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-blue-400 text-sm tracking-[0.3em] uppercase font-medium">{project.year}</span>
                      <div className="h-px flex-1 bg-blue-500/30" />
                    </div>
                    <h3 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6 group-hover:text-blue-300 transition-colors duration-500 leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-xl md:text-2xl text-blue-100/70 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-5 py-2.5 border border-blue-500/40 rounded-full text-sm text-blue-300 backdrop-blur-sm group-hover:border-blue-400/60 group-hover:bg-blue-500/10 transition-all duration-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Decorative Line */}
                  <motion.div 
                    className="h-px bg-gradient-to-r from-blue-500/50 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 1, delay: index * 0.25 + 0.5 }}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
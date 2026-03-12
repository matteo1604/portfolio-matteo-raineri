import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Mail, Github, Linkedin, Twitter } from "lucide-react";

const socials = [
  { name: "GitHub", icon: Github, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
];

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 py-48 bg-gradient-to-b from-[#000000] via-[#050510] to-[#000000]"
    >
      {/* Grid Background */}
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

      {/* Gradient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[160px]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-20">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="space-y-10"
        >
          <h2 className="text-[clamp(3rem,9vw,9rem)] leading-[1.05] text-white">
            Let's build
            <br />
            something{" "}
            <span className="text-blue-400">remarkable</span>
          </h2>
          
          <p className="text-2xl md:text-3xl text-blue-100/60 max-w-2xl mx-auto leading-relaxed">
            I'm always open to discussing new projects, creative ideas, 
            or opportunities to be part of your vision.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <a
            href="mailto:hello@matteoraineri.dev"
            className="group inline-flex items-center gap-4 px-12 py-6 border-2 border-blue-500 rounded-full text-xl text-white hover:bg-blue-500 hover:border-blue-400 transition-all duration-500 backdrop-blur-sm"
          >
            <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            <span>Get in touch</span>
            <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-white transition-colors duration-300" />
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center gap-6"
        >
          {socials.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.href}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="group w-16 h-16 rounded-full border border-blue-500/30 flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300"
              aria-label={social.name}
            >
              <social.icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300" />
            </motion.a>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="pt-24 space-y-8"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-100/40">
            <p>© 2026 Matteo Raineri. All rights reserved.</p>
            <p>Designed & developed with passion</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute bottom-20 left-[10%] w-40 h-40 border border-blue-500/10 rounded-2xl rotate-12"
        initial={{ opacity: 0, rotate: 0 }}
        animate={isInView ? { opacity: 1, rotate: 12 } : {}}
        transition={{ duration: 1.5, delay: 1 }}
      />
      <motion.div
        className="absolute top-32 right-[15%] w-32 h-32 border border-blue-500/10 rounded-full"
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.5, delay: 1.2 }}
      />
    </section>
  );
}
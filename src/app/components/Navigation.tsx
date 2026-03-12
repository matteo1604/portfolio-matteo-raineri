import { motion } from "motion/react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Home", id: "hero" },
  { name: "About", id: "philosophy" },
  { name: "Skills", id: "skills" },
  { name: "Work", id: "projects" },
  { name: "Contact", id: "contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 1.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-blue-500/10" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="text-xl text-white tracking-tight hover:text-blue-400 transition-colors duration-300">
            MR
          </a>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2 + index * 0.1 }}
                className="text-sm text-blue-100/70 hover:text-blue-400 transition-colors duration-300 tracking-wide uppercase"
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Contact Button */}
          <motion.a
            href="#contact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.5 }}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 border border-blue-500/40 rounded-full text-sm text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/60 transition-all duration-300"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Available for work</span>
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
}

import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLegalExpanded, setIsLegalExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateNavbar);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/archive", label: "Archive" },
    { href: "/now", label: "Now" },
    { href: "/about", label: "About" },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location === "/") {
      setLocation("/about");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary/20 selection:text-primary scroll-smooth">
      <div className="bg-noise" />
      
      <header 
        className={`sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border/50 transition-all duration-300 transform ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={handleLogoClick} className="group flex items-center gap-2 relative z-50">
            <span className="font-display text-2xl font-bold italic tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300">
              OC.YOUSEF
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-all duration-200 hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button 
            className="md:hidden relative z-50 p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-background pt-24 px-6 md:hidden flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-3xl font-display font-medium text-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex flex-col">
              <button 
                onClick={() => setIsLegalExpanded(!isLegalExpanded)}
                className="flex items-center justify-between text-3xl font-display font-medium text-foreground hover:text-primary text-left"
              >
                Legal
                <ChevronDown className={`w-8 h-8 transition-transform duration-300 ${isLegalExpanded ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {isLegalExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-4 pl-4 pt-4"
                  >
                    <Link href="/terms" className="text-xl font-display text-muted-foreground hover:text-primary">Terms of Service</Link>
                    <Link href="/disclaimers" className="text-xl font-display text-muted-foreground hover:text-primary">Disclaimers</Link>
                    <Link href="/privacy" className="text-xl font-display text-muted-foreground hover:text-primary">Privacy Policy</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/10 py-6 relative z-10 bg-background/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
            &copy; {new Date().getFullYear()} OC.YOUSEF
          </p>
          <div className="flex items-center gap-6">
            <Link href="/disclaimers" className="text-[10px] uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors duration-300">
              Disclaimers
            </Link>
            <span className="w-1 h-1 rounded-full bg-border/30" />
            <Link href="/privacy" className="text-[10px] uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors duration-300">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

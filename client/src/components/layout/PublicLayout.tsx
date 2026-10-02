import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Journal" },
    { href: "/archive", label: "Archive" },
    { href: "/about", label: "About" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary/20 selection:text-primary scroll-smooth">
      <div className="bg-noise" />

      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/88 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="group flex flex-col leading-none">
            <span className="font-display text-2xl font-bold italic tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300">
              ATLAS
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Yousef Ali
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            aria-label="Open menu"
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
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-0 z-30 bg-background pt-28 px-6 md:hidden flex flex-col gap-7"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-3xl font-display font-medium text-foreground hover:text-primary">
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 md:py-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/20 py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide">ATLAS · Yousef Ali</p>
            <p className="text-xs text-muted-foreground mt-1">A personal journal, built from scratch.</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/platform" className="hover:text-primary transition-colors">Under the hood</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

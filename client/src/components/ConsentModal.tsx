import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ConsentModal() {
  const [accepted, setAccepted] = useState(true);
  const [checked, setChecked] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem("user-consent");
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    if (checked) {
      localStorage.setItem("user-consent", "true");
      setAccepted(true);
    }
  };

  const isLegalPage = ["/terms", "/disclaimers", "/privacy"].includes(location);

  if (accepted || isLegalPage) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent"
      >
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox 
                id="consent" 
                checked={checked} 
                onCheckedChange={(val) => setChecked(!!val)}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-xs md:text-sm leading-relaxed text-muted-foreground">
                I certify that I am at least 18 years old, and I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>, 
                <Link href="/disclaimers" className="text-primary hover:underline font-medium ml-1">Legal Disclaimers</Link>, 
                and acknowledge the{" "}
                <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
              </label>
            </div>
            
            <Button 
              className="w-full md:w-auto px-8 rounded-xl h-10 text-sm font-medium transition-all"
              disabled={!checked}
              onClick={handleAccept}
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { Sparkles, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading: isAuthLoading } = useAuth();
  const login = useLogin();

  // Redirect if already logged in
  if (!isAuthLoading && user) {
    setLocation("/studio/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login.mutate({ username, password }, {
        onSuccess: (data) => {
          console.log("Login successful, redirecting...", data);
          setLocation("/studio/dashboard");
        },
        onError: (err: any) => {
          console.error("Login error:", err);
        }
      });
    } catch (err) {
      console.error("Frontend submit crash prevented:", err);
    }
  };

  if (isAuthLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <div className="bg-noise" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4 text-primary">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground">Creator Studio</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage your journal.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-2xl shadow-xl shadow-black/5">
          {login.error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
              {login.error.message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            
            <button 
              type="submit"
              disabled={login.isPending}
              className="w-full bg-foreground text-background font-medium py-3 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Back to public site</a>
        </div>
      </div>
    </div>
  );
}

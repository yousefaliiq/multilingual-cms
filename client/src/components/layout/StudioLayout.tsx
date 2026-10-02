import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenTool, LogOut } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function StudioLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useAuth();
  const logout = useLogout();

  if (isLoading) return <div className="h-screen bg-background text-foreground flex items-center justify-center">Loading Studio...</div>;
  if (!user) {
    window.location.href = "/studio";
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/studio/dashboard" },
    { icon: PenTool, label: "New Post", href: "/studio/editor" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-border/50 flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-border/50">
          <Link href="/" className="font-display text-xl font-bold italic text-foreground hover:text-primary">
            OC.YOUSEF Studio
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium">{user.username}</span>
            <Button variant="ghost" size="icon" onClick={() => logout.mutate()} title="Logout">
              <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-20 border-b border-border/50 flex items-center justify-between px-8 md:hidden shrink-0">
          <span className="font-display font-bold italic">OC.YOUSEF Studio</span>
          <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>Logout</Button>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "./pages/Home";
import PostReader from "./pages/PostReader";
import Archive from "./pages/Archive";
import TagView from "./pages/TagView";
import About from "./pages/About";
import Now from "./pages/Now";
import Colophon from "./pages/Colophon";
import Terms from "./pages/legal/Terms";
import Disclaimers from "./pages/legal/Disclaimers";
import Privacy from "./pages/legal/Privacy";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/studio/Dashboard";
import Editor from "./pages/studio/Editor";
import { ConsentModal } from "./components/ConsentModal";

function Router() {
  return (
    <Switch>
      {/* Public Site */}
      <Route path="/" component={Home} />
      <Route path="/post/:slug" component={PostReader} />
      <Route path="/archive" component={Archive} />
      <Route path="/tags/:tag" component={TagView} />
      <Route path="/about" component={About} />
      <Route path="/now" component={Now} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclaimers" component={Disclaimers} />
      <Route path="/privacy" component={Privacy} />

      {/* Admin / Studio */}
      <Route path="/studio" component={AdminLogin} />
      <Route path="/studio/dashboard" component={Dashboard} />
      <Route path="/studio/editor" component={Editor} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConsentModal />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

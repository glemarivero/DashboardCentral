import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DashboardDetail from "@/pages/dashboard-detail";
import Category from "@/pages/category";
import { DashboardProvider } from "@/context/dashboard-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard/:id" component={DashboardDetail} />
      <Route path="/category/:category" component={Category} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <Router />
        <Toaster />
      </DashboardProvider>
    </QueryClientProvider>
  );
}

export default App;

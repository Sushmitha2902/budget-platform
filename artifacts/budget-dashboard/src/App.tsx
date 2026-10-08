import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/dashboard";
import YearView from "@/pages/year-view";
import YearsView from "@/pages/years-view";
import SectorView from "@/pages/sector-view";
import AnomalyView from "@/pages/anomaly-view";
import CompareView from "@/pages/compare-view";
import SearchView from "@/pages/search-view";
import PipelineView from "@/pages/pipeline-view";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/years" component={YearsView} />
      <Route path="/year/:year" component={YearView} />
      <Route path="/sector/:sector" component={SectorView} />
      <Route path="/anomalies" component={AnomalyView} />
      <Route path="/compare" component={CompareView} />
      <Route path="/search" component={SearchView} />
      <Route path="/pipeline" component={PipelineView} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

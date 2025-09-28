
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Prospek from "./pages/Prospek";
import Laporan from "./pages/Laporan";
import ReportAds from "./pages/ReportAds";
import Master from "./pages/Master";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } />
            <Route path="/prospek" element={
              <AppLayout>
                <Prospek />
              </AppLayout>
            } />
            <Route path="/laporan" element={
              <AppLayout>
                <Laporan />
              </AppLayout>
            } />
            <Route path="/report-ads" element={
              <AppLayout>
                <ReportAds />
              </AppLayout>
            } />
            <Route path="/master" element={
              <AppLayout>
                <Master />
              </AppLayout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/Layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Prospek from "./pages/Prospek";
import Laporan from "./pages/Laporan";
import Master from "./pages/Master";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/prospek" element={
              <ProtectedRoute>
                <AppLayout>
                  <Prospek />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/laporan" element={
              <ProtectedRoute>
                <AppLayout>
                  <Laporan />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/master" element={
              <ProtectedRoute>
                <AppLayout>
                  <Master />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

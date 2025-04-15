
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public Pages
import Index from "@/pages/Index";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Main Pages
import Dashboard from "@/pages/Dashboard";
import Reports from "@/pages/Reports";
import DataUpload from "@/pages/DataUpload";
import Profile from "@/pages/Profile";
import Help from "@/pages/Help";

// Emissions Pages
import Scope1 from "@/pages/emissions/Scope1";
import Scope2 from "@/pages/emissions/Scope2";
import Scope3 from "@/pages/emissions/Scope3";

// Company Pages
import CompanySetup from "@/pages/company/CompanySetup";
import CompanyManage from "@/pages/company/CompanyManage";
import CompanyInfo from "@/pages/company/setup/CompanyInfo";
import CompanyTeam from "@/pages/company/setup/CompanyTeam";
import CompanyPreferences from "@/pages/company/setup/CompanyPreferences";

// User Pages
import Settings from "@/pages/Settings";

// Not Found
import NotFound from "@/pages/NotFound";

// Create React Query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CompanyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes - Public */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              
              {/* Company Setup - Protected but doesn't require company */}
              <Route
                path="/company/setup"
                element={
                  <ProtectedRoute requireCompany={false}>
                    <CompanySetup />
                  </ProtectedRoute>
                }
              />
              
              {/* Company Setup Flow */}
              <Route
                path="/company/setup/info"
                element={
                  <ProtectedRoute requireCompany={false}>
                    <CompanyInfo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/setup/team"
                element={
                  <ProtectedRoute>
                    <CompanyTeam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/setup/preferences"
                element={
                  <ProtectedRoute>
                    <CompanyPreferences />
                  </ProtectedRoute>
                }
              />
              
              {/* Help Page - Public */}
              <Route path="/help" element={<Help />} />
              
              {/* Protected Routes - Requires both authentication and company membership */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              
              {/* Emissions Routes */}
              <Route
                path="/emissions/scope1"
                element={
                  <ProtectedRoute>
                    <Scope1 />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/emissions/scope2"
                element={
                  <ProtectedRoute>
                    <Scope2 />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/emissions/scope3"
                element={
                  <ProtectedRoute>
                    <Scope3 />
                  </ProtectedRoute>
                }
              />
              
              {/* Company Management - Protected */}
              <Route
                path="/company/manage"
                element={
                  <ProtectedRoute>
                    <CompanyManage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/company/preferences"
                element={
                  <ProtectedRoute>
                    <CompanyPreferences />
                  </ProtectedRoute>
                }
              />
              
              {/* User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              
              {/* Data Upload Route */}
              <Route
                path="/data-upload"
                element={
                  <ProtectedRoute>
                    <DataUpload />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all route - 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
